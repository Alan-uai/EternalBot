// src/commands/utility/painel.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRaidTimings } from '../../utils/raidTimings.js';
import { doc, getDoc } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '`N/D`';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
    return `\`${minutes}m ${seconds.toString().padStart(2, '0')}s ${milliseconds.toString().padStart(3, '0')}ms\``;
}

export const data = new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Exibe o painel de Raids atual.');

export async function execute(interaction) {
    const { client, config, services } = interaction;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    const announcerDoc = await getDoc(announcerRef);
    const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };

    const { currentRaid, nextRaid } = getRaidTimings();

    let desiredState = 'finished';
    let activeRaidDetails = null;

    if (currentRaid) {
        if (Date.now() >= currentRaid.tenSecondMark) {
            desiredState = 'closing_soon';
        } else {
            desiredState = 'open';
        }
        activeRaidDetails = currentRaid.raid;
    } else if (nextRaid) {
        if (Date.now() >= nextRaid.fiveMinuteMark) {
            desiredState = 'starting_soon';
        } else {
            desiredState = 'next_up';
        }
        activeRaidDetails = nextRaid.raid;
    }

    if (desiredState === 'finished') {
        return interaction.reply({ content: 'Nenhuma Raid ativa no momento.', ephemeral: true });
    }

    const newRaidId = activeRaidDetails?.Dificuldade || null;
    const raidAssets = assetService.raidAssets[newRaidId];
    if (!raidAssets) {
        return interaction.reply({ content: 'Não foi possível encontrar os assets para a Raid atual.', ephemeral: true });
    }

    const finalGifUrl = raidAssets.gifs.final[desiredState];

    const embed = new EmbedBuilder()
        .addFields(
            { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
            { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
            { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
            { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**`, inline: false }
        );

    if (newRaidId !== 'Nightmare' && newRaidId !== 'Leaf Raid') {
        const baseTimeSeconds = 72.025;
        const maxSpeed = 250;
        const mediumSpeed = 175;
        const minSpeed = 100;

        const maxTime = baseTimeSeconds * (maxSpeed / maxSpeed); // Base time
        const mediumTime = baseTimeSeconds * (maxSpeed / mediumSpeed);
        const minTime = baseTimeSeconds * (maxSpeed / minSpeed);

        const timeFieldValue = `> **Máximo (250%):** ${formatTime(maxTime)}\n` +
                               `> **Médio (175%):** ${formatTime(mediumTime)}\n` +
                               `> **Mínimo (100%):** ${formatTime(minTime)}`;

        embed.addFields({ name: 'Tempo Estimado de Conclusão', value: timeFieldValue, inline: false });
    }

    let stateColor;
    switch (desiredState) {
        case 'starting_soon': stateColor = 0xFFA500; break;
        case 'open': stateColor = 0x00FF00; break;
        case 'closing_soon': stateColor = 0xFF4B4B; break;
        default: stateColor = 0x2F3136; break;
    }
    embed.setColor(stateColor);

    if (finalGifUrl) {
        embed.setImage(finalGifUrl);
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
