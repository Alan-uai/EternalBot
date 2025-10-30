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
        const embed = new EmbedBuilder().setTitle('Carregando status das raids...');
        message = await channel.send({ embeds: [embed] });
        await message.pin().catch(err => logger.error("Não foi possível fixar a mensagem do painel de raid.", err));
        await setDoc(panelDocRef, { messageId: message.id });
    }

    return message;
}

function getRaidStatus() {
    const now = new Date();
    const currentMinute = now.getMinutes();

    return lobbyDungeonsArticle.tables.lobbySchedule.rows.map(raid => {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        let status;
        let details;

        // Calcula a diferença em minutos, tratando a virada da hora
        let diff = raidMinute - currentMinute;
        if (diff < -PORTAL_OPEN_DURATION_MINUTES) {
            diff += 60; // Raid já passou, calcula para a próxima hora
        }

        if (diff >= 0 && diff <= PORTAL_OPEN_DURATION_MINUTES) {
            // Raid está aberta
            const closeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), raidMinute + PORTAL_OPEN_DURATION_MINUTES, 0);
            const remainingSeconds = Math.max(0, Math.floor((closeTime - now) / 1000));
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const secondsPart = remainingSeconds % 60;
            status = '✅ **ABERTA**';
            details = `Fecha em: \`${remainingMinutes}m ${secondsPart.toString().padStart(2, '0')}s\``;
        } else {
            // Raid está fechada, calcula tempo para abrir
            status = '❌ Fechada';
            details = `Abre em: \`${diff}m\``;
        }
        
        return {
            name: `> ${raid['Dificuldade']}`,
            value: `${status}\n> ${details}`,
            inline: true,
        };
    });
}

export async function run(container) {
    const { client, logger } = container;
    
    try {
        const panelMessage = await getOrCreatePanelMessage(client);
        if (!panelMessage) {
            logger.error('Não foi possível obter ou criar a mensagem do painel de raids.');
            return;
        }

        const raidStatuses = getRaidStatus();

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('Painel de Status das Raids do Lobby')
            .setDescription('Este painel é atualizado automaticamente a cada 10 segundos.')
            .addFields(raidStatuses)
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor.' });

        await panelMessage.edit({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
