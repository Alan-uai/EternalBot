// src/jobs/raidPanelManager.js
import { EmbedBuilder } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const name = 'raidPanelManager';
export const intervalMs = 10000; // A cada 10 segundos

const PANEL_DOC_ID = 'raidStatusPanel';
const PORTAL_OPEN_DURATION_MINUTES = 2;
const FIVE_MINUTE_WARNING_SECONDS = 5 * 60;
const TEN_SECOND_WARNING = 10;

async function getOrCreatePanelMessage(client) {
    const { config, logger, services } = client.container;
    const { firestore } = services.firebase;
    const channel = await client.channels.fetch(config.RAID_CHANNEL_ID);
    const panelDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
    const panelDocSnap = await getDoc(panelDocRef);
    let message;

    if (panelDocSnap.exists()) {
        try {
            message = await channel.messages.fetch(panelDocSnap.data().messageId);
        } catch (error) {
            logger.warn('Não foi possível encontrar a mensagem do painel de raid. Criando uma nova.');
        }
    }

    if (!message) {
        const embed = new EmbedBuilder().setTitle('Carregando status das raids...').setDescription('O painel será gerado em breve.');
        message = await channel.send({ embeds: [embed] });
        await message.pin().catch(err => logger.error("Não foi possível fixar a mensagem do painel de raid.", err));
        await setDoc(panelDocRef, { messageId: message.id });
    }

    return message;
}

function getRaidStatus(assetService) {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const totalSecondsInHour = currentMinute * 60 + currentSeconds;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];
    let nextRaid = null;
    let minDiff = Infinity;

    // First pass: determine next raid
    for (const raid of raids) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondsInHour = raidMinute * 60;
        let diffSeconds = raidStartSecondsInHour - totalSecondsInHour;
        
        if (diffSeconds < -(PORTAL_OPEN_DURATION_MINUTES * 60)) {
            diffSeconds += 3600; // It's for the next hour
        }
        
        if (diffSeconds >= 0 && diffSeconds < minDiff) {
            minDiff = diffSeconds;
            nextRaid = raid;
        }
    }

    // Second pass: build status and determine image
    for (const raid of raids) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondsInHour = raidMinute * 60;
        let diffSeconds = raidStartSecondsInHour - totalSecondsInHour;

        if (diffSeconds < -(PORTAL_OPEN_DURATION_MINUTES * 60)) {
            diffSeconds += 3600; // Next hour's raid
        }
        
        let statusText;
        let details;
        let imageAsset = null;

        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffSecondsPart = diffSeconds % 60;

        if (diffSeconds >= 0 && diffSeconds <= PORTAL_OPEN_DURATION_MINUTES * 60) {
            // Raid is open
            statusText = '✅ **ABERTA**';
            const closingTime = raidStartSecondsInHour + (PORTAL_OPEN_DURATION_MINUTES * 60);
            const remainingSeconds = Math.max(0, closingTime - totalSecondsInHour);
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const secondsPart = remainingSeconds % 60;
            details = `Fecha em: \`${remainingMinutes}m ${secondsPart.toString().padStart(2, '0')}s\``;
            
            if (remainingSeconds <= TEN_SECOND_WARNING) {
                imageAsset = assetService.getAsset(raid['Dificuldade'], 'closing');
            } else {
                imageAsset = assetService.getAsset(raid['Dificuldade'], 'open');
            }

        } else {
            // Raid is closed
            statusText = '❌ Fechada';
            details = `Abre em: \`${diffMinutes}m ${diffSecondsPart.toString().padStart(2, '0')}s\``;

             if (raid === nextRaid) {
                 if (diffSeconds <= FIVE_MINUTE_WARNING_SECONDS) {
                    imageAsset = assetService.getAsset(raid['Dificuldade'], 'warning');
                 } else {
                    imageAsset = assetService.getAsset(raid['Dificuldade'], 'next');
                 }
             }
        }
        
        statuses.push({
            name: `> ${raid['Dificuldade']}`,
            value: `${statusText}\n> ${details}`,
            inline: true,
            imageAsset: imageAsset // Store the chosen asset URL
        });
    }

    // Find the primary image to display (the one that is not null)
    const primaryImage = statuses.find(s => s.imageAsset)?.imageAsset || null;
    
    return { statuses: statuses.map(({name, value, inline}) => ({name, value, inline})), primaryImage };
}


export async function run(container) {
    const { client, logger, services } = container;
    
    if (!services.assetService || !services.assetService.isReady()) {
        logger.debug('Serviço de assets ainda não está pronto. Pulando atualização do painel de raids.');
        return;
    }
    
    try {
        const panelMessage = await getOrCreatePanelMessage(client);
        if (!panelMessage) {
            logger.error('Não foi possível obter ou criar a mensagem do painel de raids.');
            return;
        }

        const { statuses, primaryImage } = getRaidStatus(services.assetService);

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('Painel de Status das Raids do Lobby')
            .setDescription('Este painel é atualizado automaticamente a cada 10 segundos.')
            .addFields(statuses)
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor.' });
            
        if (primaryImage) {
            embed.setImage(primaryImage);
        } else {
            // Optional: set a default placeholder if no raid is in a special state
            // embed.setImage('attachment://default_placeholder.png');
        }

        await panelMessage.edit({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
