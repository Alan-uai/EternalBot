// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos

// Esta função gerencia o ciclo de vida de uma única raid
async function handleRaidLifecycle(container, raid, now) {
    const { client, config, logger, services } = container;
    const { firestore, assetService } = services;
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

    const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!raidChannel) {
        logger.error(`[raidAnnouncer] Canal de raid (ID: ${config.RAID_CHANNEL_ID}) não encontrado.`);
        return;
    }

    const lifecycleDoc = await getDoc(lifecycleRef);
    const state = lifecycleDoc.exists() ? lifecycleDoc.data().state : 'finished';

    // --- LÓGICA DE ESTADOS ---

    // 1. Inicia o ciclo: Próxima Raid
    if (state === 'finished' || (lifecycleDoc.exists() && lifecycleDoc.data().raidOpenTime !== raidOpenTimeSeconds)) {
        if (lifecycleDoc.exists() && lifecycleDoc.data().webhookUrl) {
            try { new WebhookClient({ url: lifecycleDoc.data().webhookUrl }).delete(); } catch (e) { /* ignore */ }
        }
        
        const webhook = await raidChannel.createWebhook({
            name: `Próxima Raid: ${raidIdentifier}`,
            avatar: assetService.getAsset('BotAvatar'),
            reason: `Anúncio de próxima raid: ${raidIdentifier}`
        });
        
        const message = await webhook.send({ content: assetService.getAsset(`${raidIdentifier}PR`), username: `Anunciador de Raids` });
        
        await setDoc(lifecycleRef, { state: 'next_up', webhookUrl: webhook.url, messageId: message.id, raidOpenTime: raidOpenTimeSeconds });
        logger.info(`[${raidIdentifier}] Anunciado como PRÓXIMA RAID.`);
        return;
    }

    // 2. Aviso de 5 minutos
    if (state === 'next_up' && nowSeconds >= fiveMinuteWarningTime) {
        const { webhookUrl, messageId } = lifecycleDoc.data();
        const webhook = new WebhookClient({ url: webhookUrl });
        await webhook.edit({ name: `Atenção Raid ${raidIdentifier} Começando!` });
        await webhook.editMessage(messageId, { content: assetService.getAsset(`${raidIdentifier}5m`) });
        await updateDoc(lifecycleRef, { state: 'starting_soon' });
        logger.info(`[${raidIdentifier}] Anúncio de 5 MINUTOS enviado.`);
        return;
    }

    // 3. Raid Aberta
    if (state === 'starting_soon' && nowSeconds >= raidOpenTimeSeconds) {
        const { webhookUrl } = lifecycleDoc.data();
        try { new WebhookClient({ url: webhookUrl }).delete(); } catch(e) {/* ignora */}
        
        const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';
        const openWebhook = await raidChannel.createWebhook({ name: `🔥 A Raid Começou: ${raidIdentifier}!`, avatar: assetService.getAsset('BotAvatar'), reason: `Abertura da raid ${raidIdentifier}`});
        
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

        const openMessage = await openWebhook.send({ content: roleMention, embeds: [embed], username: `Anunciador de Raids` });
        await updateDoc(lifecycleRef, { state: 'open', webhookUrl: openWebhook.url, messageId: openMessage.id });
        logger.info(`[${raidIdentifier}] Anúncio de RAID ABERTA enviado.`);
        return;
    }
    
    // 4. Aviso de 10 segundos
    if (state === 'open' && nowSeconds >= tenSecondWarningTime) {
         const { webhookUrl, messageId } = lifecycleDoc.data();
         const webhook = new WebhookClient({ url: webhookUrl });
         await webhook.edit({ name: `Raid ${raidIdentifier} fechando em 10s!` });
         await webhook.editMessage(messageId, { embeds: [new EmbedBuilder().setImage(assetService.getAsset(`${raidIdentifier}F`))] });
         await updateDoc(lifecycleRef, { state: 'closing_soon' });
         logger.info(`[${raidIdentifier}] Anúncio de FECHANDO EM 10S enviado.`);
         return;
    }
    
    // 5. Finalizado
    if ((state === 'closing_soon' || state === 'open') && nowSeconds >= portalCloseTime) {
        const { webhookUrl } = lifecycleDoc.data();
        try { new WebhookClient({ url: webhookUrl }).delete(); } catch (e) {/* ignora */}
        await updateDoc(lifecycleRef, { state: 'finished', webhookUrl: null, messageId: null });
        logger.info(`[${raidIdentifier}] Ciclo da raid finalizado e webhook deletado.`);
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
        
        if (raidStartTime < now) {
            raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
        }

        const timeDiff = raidStartTime.getTime() - now.getTime();
        if (timeDiff >= 0 && timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            nextRaid = raid;
        }
    }

    if (nextRaid) {
        await handleRaidLifecycle(container, nextRaid, now);
    }
}
