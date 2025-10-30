// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PANEL_DOC_ID = 'raidPanel';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

function getRaidStatus(assetService) {
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = [...lobbyDungeonsArticle.tables.lobbySchedule.rows].sort((a, b) => {
        return parseInt(a['Horário'].substring(3, 5), 10) - parseInt(b['Horário'].substring(3, 5), 10);
    });

    const statuses = [];
    
    let nextRaidFound = false;

    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < -PORTAL_OPEN_DURATION_SECONDS) { // Se já passou há muito tempo na hora atual
             secondsUntilOpen += 3600; // Adiciona uma hora
        }

        let statusText, details;
        const isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);

        if (isCurrentlyOpen) {
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
        } else {
            statusText = '❌ Fechada';
            
            if (secondsUntilOpen >= 0 && !nextRaidFound) {
                 const gifUrl = assetService.getAsset(`${raid['Dificuldade']}PR`);
                 statuses.push({ name: `⏳ Próxima Raid: ${raid['Dificuldade']}`, value: gifUrl, inline: false });
                 nextRaidFound = true;
            }

            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
        }
        
        const raidEmojis = {
            'Easy': '🟢', 'Medium': '🟡', 'Hard': '🔴', 'Insane': '⚔️', 'Crazy': '🔥', 'Nightmare': '💀', 'Leaf Raid (1800)': '🌿'
        };

        statuses.push({
            name: `${raidEmojis[raid['Dificuldade']] || '⚔️'} ${raid['Dificuldade']}`,
            value: `${statusText}\n${details}`,
            inline: true, 
        });
        statuses.push({ name: '\u200B', value: '\u200B', inline: true }); // Separador
    }
    
    // Remove o último separador
    if (statuses.length > 0 && statuses[statuses.length - 1].name === '\u200B') {
        statuses.pop();
    }
    
    return statuses;
}

export const name = 'raidPanelManager';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const { client, logger, services } = container;
    
    if (!services.firebase) { 
        logger.debug('[raidPanelManager] Serviços de Firebase não encontrados. Pulando atualização.');
        return;
    }
    
    const { firestore, assetService } = services;

    try {
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);

        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[raidPanelManager] Webhook '${PANEL_DOC_ID}' não encontrado. O painel não será atualizado.`);
            return;
        }
        
        const webhookUrl = docSnap.data().webhookUrl;
        const messageId = docSnap.data().messageId;
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const statuses = getRaidStatus(assetService);

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: '🗺️ Painel de Status das Raids do Lobby' })
            .setDescription(`*Atualizado <t:${Math.floor(Date.now() / 1000)}:R>*`)
            .addFields(statuses)
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        let sentMessage;
        if (messageId) {
            try {
                sentMessage = await webhookClient.editMessage(messageId, { embeds: [embed] });
            } catch(e) {
                 logger.warn(`[raidPanelManager] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                 sentMessage = await webhookClient.send({
                    username: 'Painel de Status das Raids',
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [embed],
                    wait: true
                });
                // Atualiza o doc com o novo ID
                await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
            }
        } else {
             sentMessage = await webhookClient.send({
                username: 'Painel de Status das Raids',
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
                wait: true,
            });
            await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
