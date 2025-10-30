// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PANEL_DOC_ID = 'raidPanel';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

function getRaidStatus(container) {
    const { client, logger, services } = container;
    const { firebase } = services;
    const { assetService } = firebase;

    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = [...lobbyDungeonsArticle.tables.lobbySchedule.rows].sort((a, b) => {
        return parseInt(a['Horário'].substring(3, 5), 10) - parseInt(b['Horário'].substring(3, 5), 10);
    });

    const statuses = [];
    
    let nextRaidForGif = null;
    let minTimeDiff = Infinity;

    // Primeiro, encontra qual é a próxima raid
    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        let raidStartTime = new Date(now);
        raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);
        if (raidStartTime.getTime() < now.getTime() - 60000) {
            raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
        }
        const timeDiff = raidStartTime.getTime() - now.getTime();
        if (timeDiff >= -60000 && timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            nextRaidForGif = raid;
        }
    }
    
    // Adiciona o GIF da próxima raid no topo, se existir
    if (nextRaidForGif && assetService) {
        const gifUrl = assetService.getAsset(`${nextRaidForGif['Dificuldade']}PR`);
        if (gifUrl) {
            statuses.push({ name: `⏳ Próxima Raid: ${nextRaidForGif['Dificuldade']}`, value: gifUrl, inline: false });
        }
    }

    for (let i = 0; i < raids.length; i++) {
        const raid = raids[i];
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < -PORTAL_OPEN_DURATION_SECONDS) {
             secondsUntilOpen += 3600; 
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
            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
        }
        
        const raidEmojis = {
            'Easy': '🟢', 'Medium': '🟡', 'Hard': '🔴', 'Insane': '⚔️', 'Crazy': '🔥', 'Nightmare': '💀', 'Leaf Raid (1800)': '🌿'
        };
        
        const separator = i > 0 ? '---------------------\n' : '';

        statuses.push({
            name: `${raidEmojis[raid['Dificuldade']] || '⚔️'} ${raid['Dificuldade']}`,
            value: `${separator}${statusText}\n${details}`,
            inline: true, 
        });
        
        // Adiciona as informações extras na mesma linha
         statuses.push({
            name: 'Dano Rec.',
            value: `${separator}\`${raid['Dano Recomendado']}\``,
            inline: true,
        });
         statuses.push({
            name: 'Tempo Otimizado',
            value: `${separator}\`${raid['Tempo Otimizado'] || 'N/A'}\``,
            inline: true,
        });
    }
    
    return statuses;
}

export const name = 'raidPanelManager';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const { client, logger, services } = container;
    const { firebase } = services;
    
    if (!firebase || !firebase.firestore) {
        logger.error('[raidPanelManager] Serviço Firestore não está inicializado.');
        return;
    }
    const { firestore, assetService } = firebase;

    try {
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);

        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[raidPanelManager] Webhook '${PANEL_DOC_ID}' não encontrado no Firestore. O painel não será atualizado.`);
            return;
        }
        
        const webhookUrl = docSnap.data().webhookUrl;
        const messageId = docSnap.data().messageId;
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const statuses = getRaidStatus(container);
        
        const avatarUrl = assetService ? assetService.getAsset('DungeonLobby') : client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: '🗺️ Painel de Status das Raids do Lobby' })
            .setDescription(`*Atualizado <t:${Math.floor(Date.now() / 1000)}:R>*`)
            .setFields(statuses)
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        let sentMessage;
        if (messageId) {
            try {
                sentMessage = await webhookClient.editMessage(messageId, { embeds: [embed] });
            } catch(e) {
                 logger.warn(`[raidPanelManager] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                 sentMessage = await webhookClient.send({
                    username: 'Painel de Status das Raids',
                    avatarURL: avatarUrl,
                    embeds: [embed],
                    wait: true
                });
                await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
            }
        } else {
             sentMessage = await webhookClient.send({
                username: 'Painel de Status das Raids',
                avatarURL: avatarUrl,
                embeds: [embed],
                wait: true,
            });
            await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
