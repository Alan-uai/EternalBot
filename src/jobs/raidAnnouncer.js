// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos

// Esta função gerencia o ciclo de vida de uma única raid
async function handleRaidLifecycle(container, raid, now) {
    const { client, config, logger, services } = container;
    const { firestore, assetService } = services.firebase; // Correção aqui
    const raidIdentifier = raid['Dificuldade'];
    const lifecycleRef = doc(firestore, 'bot_config/raid_lifecycles', raidIdentifier);

    // Calcula os tempos chave para a raid na hora atual ou na próxima hora
    const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
    const startOfHour = new Date(now);
    startOfHour.setUTCMinutes(0, 0, 0);
    let raidStartTime = new Date(startOfHour.getTime() + raidStartMinute * 60 * 1000);
    
    if (raidStartTime < now) {
        raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
    }
    
    const raidOpenTimeSeconds = raidStartTime.getTime() / 1000;
    const fiveMinuteWarningTime = raidOpenTimeSeconds - 5 * 60;
    const tenSecondWarningTime = raidOpenTimeSeconds + ANNOUNCEMENT_LIFETIME_MS / 1000 - 10;
    const portalCloseTime = raidOpenTimeSeconds + ANNOUNCEMENT_LIFETIME_MS / 1000;
    const nowSeconds = now.getTime() / 1000;

    const announcerDoc = await getDoc(doc(firestore, 'bot_config', 'raidAnnouncer'));
    const webhookUrl = announcerDoc.exists() ? announcerDoc.data().webhookUrl : null;
    if (!webhookUrl) {
        logger.error(`[raidAnnouncer] URL do webhook 'raidAnnouncer' não encontrada no Firestore.`);
        return;
    }
    const webhookClient = new WebhookClient({ url: webhookUrl });

    const lifecycleDoc = await getDoc(lifecycleRef);
    const state = lifecycleDoc.exists() ? lifecycleDoc.data().state : 'finished';

    // --- LÓGICA DE ESTADOS ---

    // 1. Inicia o ciclo: Próxima Raid
    if (state === 'finished' || (lifecycleDoc.exists() && lifecycleDoc.data().raidOpenTime !== raidOpenTimeSeconds)) {
        await webhookClient.edit({ name: `Próxima Raid: ${raidIdentifier}`, avatar: assetService.getAsset('BotAvatar') });
        const message = await webhookClient.send({ content: assetService.getAsset(`${raidIdentifier}PR`), username: `Anunciador de Raids`, wait: true });
        
        await setDoc(lifecycleRef, { state: 'next_up', messageId: message.id, raidOpenTime: raidOpenTimeSeconds });
        logger.info(`[${raidIdentifier}] Anunciado como PRÓXIMA RAID.`);
        return;
    }

    // 2. Aviso de 5 minutos
    if (state === 'next_up' && nowSeconds >= fiveMinuteWarningTime) {
        const { messageId } = lifecycleDoc.data();
        await webhookClient.edit({ name: `Atenção Raid ${raidIdentifier} Começando!` });
        await webhookClient.editMessage(messageId, { content: assetService.getAsset(`${raidIdentifier}5m`) });
        await updateDoc(lifecycleRef, { state: 'starting_soon' });
        logger.info(`[${raidIdentifier}] Anúncio de 5 MINUTOS enviado.`);
        return;
    }

    // 3. Raid Aberta
    if (state === 'starting_soon' && nowSeconds >= raidOpenTimeSeconds) {
        const { messageId } = lifecycleDoc.data();
        // Deleta a mensagem antiga do "Próxima Raid"
        try { await webhookClient.deleteMessage(messageId); } catch(e) { /* ignora */}

        // Cria um novo webhook temporário para o anúncio de abertura
        const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
        if(!raidChannel) return;

        const openWebhook = await raidChannel.createWebhook({ name: `🔥 A Raid Começou: ${raidIdentifier}!`, avatar: assetService.getAsset('BotAvatar') });
        
        const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';
        const embed = new EmbedBuilder()
            .setColor(0xFF4B4B)
            .setImage(assetService.getAsset(`${raidIdentifier}A`))
            .addFields(
                { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            )
            .setTimestamp()
            .setFooter({ text: 'O portal fechará em 2 minutos.' });

        const openMessage = await openWebhook.send({ content: roleMention, embeds: [embed], username: `Anunciador de Raids`, wait: true });
        
        // Guarda a referência da mensagem para poder deletá-la depois
        await addDoc(collection(firestore, 'bot_config/raid_announcements/messages'), {
            webhookUrl: openWebhook.url,
            messageId: openMessage.id,
            expiresAt: new Date(Date.now() + ANNOUNCEMENT_LIFETIME_MS + 30000) // 30s de margem
        });

        await updateDoc(lifecycleRef, { state: 'open', tempWebhookUrl: openWebhook.url, tempMessageId: openMessage.id });
        logger.info(`[${raidIdentifier}] Anúncio de RAID ABERTA enviado.`);
        
        // Apaga o webhook temporário após o portal fechar
        setTimeout(() => {
            new WebhookClient({url: openWebhook.url}).delete().catch(e => logger.warn(`Não foi possível deletar o webhook temporário da raid ${raidIdentifier}: ${e.message}`));
        }, ANNOUNCEMENT_LIFETIME_MS);
        
        return;
    }
    
    // 4. Finalizado
    if (state === 'open' && nowSeconds >= portalCloseTime) {
        await updateDoc(lifecycleRef, { state: 'finished', tempWebhookUrl: null, tempMessageId: null });
        logger.info(`[${raidIdentifier}] Ciclo da raid finalizado.`);
        return;
    }
}


export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const now = new Date();
    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    
    // Encontra a próxima raid a ser aberta
    let nextRaid = null;
    let minTimeDiff = Infinity;

    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        let raidStartTime = new Date(now);
        raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);
        
        if (raidStartTime.getTime() < now.getTime() - 60000) { // Se já passou há mais de 1 min
            raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
        }

        const timeDiff = raidStartTime.getTime() - now.getTime();
        if (timeDiff >= -60000 && timeDiff < minTimeDiff) { // Considera uma janela de 1 minuto
            minTimeDiff = timeDiff;
            nextRaid = raid;
        }
    }

    if (nextRaid) {
        await handleRaidLifecycle(container, nextRaid, now);
    }
}
