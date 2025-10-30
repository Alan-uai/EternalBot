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

function getRaidStatus(config) {
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    // Total de segundos passados na hora atual (em UTC)
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];
    let nextRaidInfo = { raidName: null, secondsUntilNextOpen: Infinity };

    // Encontra a próxima raid a abrir
    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < 0) {
            secondsUntilOpen += 3600; 
        }
        if (secondsUntilOpen < nextRaidInfo.secondsUntilNextOpen) {
            nextRaidInfo = { raidName: raid['Dificuldade'], secondsUntilNextOpen };
        }
    }
    
    // Gera o status de cada raid
    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < 0) secondsUntilOpen += 3600;

        let statusText, details, gifId = null;

        const isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);

        if (isCurrentlyOpen) {
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
            gifId = (secondsUntilClose <= 10) ? 'EasyF' : 'EasyA';
        } else {
            statusText = '❌ Fechada';
            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
            if (raid['Dificuldade'] === nextRaidInfo.raidName) {
                gifId = (secondsUntilOpen <= 300) ? 'Easy5m' : 'EasyPR';
            }
        }
        
        let imageUrl = null;
        if (config.CLOUDINARY_URL && raid['Dificuldade'] === 'Easy' && gifId) {
             imageUrl = `${config.CLOUDINARY_URL}${gifId}.gif`;
        }
        
        statuses.push({
            name: `> ${raid['Dificuldade']}`,
            value: `${statusText}\n> ${details}`,
            inline: true,
            imageUrl: imageUrl // Passando a URL para ser usada depois
        });
    }

    const nextRaidImageUrl = statuses.find(s => s.imageUrl && (s.value.includes('Abre em') || s.value.includes('ABERTA')) )?.imageUrl || null;
    
    return { statuses, nextRaidImageUrl };
}

export async function run(container) {
    const { client, logger, services, config } = container;
    
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

        const { statuses, nextRaidImageUrl } = getRaidStatus(config);

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('Painel de Status das Raids do Lobby')
            .setDescription('Este painel é atualizado automaticamente a cada 10 segundos.')
            .addFields(statuses.map(s => ({ name: s.name, value: s.value, inline: s.inline }))) // Mapeia para remover a URL do campo de fields
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        // Define a imagem principal do embed como o GIF da próxima raid a abrir ou a que está aberta.
        if(nextRaidImageUrl) {
            embed.setImage(nextRaidImageUrl);
        }
            
        await panelMessage.edit({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
