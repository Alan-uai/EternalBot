// src/jobs/raidPanelManager.js
import { EmbedBuilder } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const name = 'raidPanelManager';
export const intervalMs = 10000; // A cada 10 segundos

const PANEL_DOC_ID = 'raidStatusPanel';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos em segundos

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
        const embed = new EmbedBuilder().setTitle('Gerando informações sobre as Raids...').setDescription('O painel será atualizado em breve.');
        message = await channel.send({ embeds: [embed] });
        await message.pin().catch(err => logger.error("Não foi possível fixar a mensagem do painel de raid.", err));
        await setDoc(panelDocRef, { messageId: message.id });
    }

    return message;
}

function getRaidStatus() {
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    // Total de segundos passados na hora atual (em UTC)
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];

    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;

        // Calcula o tempo até a próxima abertura
        let secondsUntilNextOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilNextOpen < 0) {
            // Se já passou, calcula para a próxima hora
            secondsUntilNextOpen += 3600; 
        }

        let statusText, details;
        const minutesPart = Math.floor(secondsUntilNextOpen / 60);
        const secondsPart = secondsUntilNextOpen % 60;

        // Verifica se a raid está na janela de "ABERTA"
        // O portal abre em `raidStartMinute` e fecha em `raidStartMinute + 2`
        // Ex: Abre em :10, fecha em :12.
        // A conta precisa verificar se o tempo atual está *depois* da abertura mas *antes* do fechamento
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        // Ajuste para o caso da raid que começa no final da hora (ex: :50)
        let isCurrentlyOpen = false;
        if (raidStartSecondInHour > portalCloseSecondInHour) { // Ex: abre em 3540 (:59), fecha em 3660 (:01 da próx. hora)
             isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) || (totalSecondsInHour < (portalCloseSecondInHour - 3600));
        } else {
             isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);
        }

        if (isCurrentlyOpen) {
            statusText = '✅ **ABERTA**';
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
        } else {
            statusText = '❌ Fechada';
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
        }
        
        statuses.push({
            name: `> ${raid['Dificuldade']}`,
            value: `${statusText}\n> ${details}`,
            inline: true,
        });
    }
    
    return { statuses };
}

export async function run(container) {
    const { client, logger, services } = container;
    
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
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        await panelMessage.edit({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
