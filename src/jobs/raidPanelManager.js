// src/jobs/raidPanelManager.js
import { EmbedBuilder } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const name = 'raidPanelManager';
export const intervalMs = 10000; // A cada 10 segundos

const PANEL_DOC_ID = 'raidStatusPanel';
const PORTAL_OPEN_DURATION_MINUTES = 2;

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

function getRaidStatus() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const totalSecondsInHour = currentMinute * 60 + currentSeconds;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];

    for (const raid of raids) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondsInHour = raidMinute * 60;
        let diffSeconds = raidStartSecondsInHour - totalSecondsInHour;

        if (diffSeconds < -(PORTAL_OPEN_DURATION_MINUTES * 60)) {
            diffSeconds += 3600; // It's for the next hour
        }
        
        let statusText;
        let details;

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
        } else {
            // Raid is closed
            statusText = '❌ Fechada';
            details = `Abre em: \`${diffMinutes}m ${diffSecondsPart.toString().padStart(2, '0')}s\``;
        }
        
        statuses.push({
            name: `> ${raid['Dificuldade']}`,
            value: `${statusText}\n> ${details}`,
            inline: true,
        });
    }
    
    return { statuses, primaryImage: null }; // primaryImage é sempre null agora
}


export async function run(container) {
    const { client, logger, services } = container;
    
    // Não executa se o serviço de assets estiver lá (para compatibilidade, caso seja reativado)
    // A verificação principal é que não há mais geração de assets
    if (!services.firebase) { 
        logger.debug('Serviço Firebase não encontrado. Pulando atualização do painel de raids.');
        return;
    }
    
    try {
        const panelMessage = await getOrCreatePanelMessage(client);
        if (!panelMessage) {
            logger.error('Não foi possível obter ou criar a mensagem do painel de raids.');
            return;
        }

        const { statuses } = getRaidStatus();

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('Painel de Status das Raids do Lobby')
            .setDescription('Este painel é atualizado automaticamente a cada 10 segundos.')
            .addFields(statuses)
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor.' });
            
        await panelMessage.edit({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
