// src/commands/utility/soling.js
import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';

const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Procura ou oferece ajuda para solar raids.');

export function getAvailableRaids() {
    const raids = new Set();
    
    lobbyDungeonsArticle.tables.lobbySchedule.rows.forEach(raid => {
        raids.add(raid['Dificuldade']);
    });

    raidRequirementsArticle.tables.requirements.rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== 'Wave' && row[key] && !raids.has(key)) {
                raids.add(key);
            }
        });
    });

    return Array.from(raids).map(raidName => ({
        label: raidName,
        value: raidName.toLowerCase().replace(/ /g, '_'),
    }));
}


export async function execute(interaction) {
    if (!ALLOWED_CHANNEL_IDS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais designados de /soling, ajuda ou chat.`, ephemeral: true });
    }
    
    try {
        const initialButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('soling_type_help')
                    .setLabel('Preciso de Ajuda')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🙋‍♂️'),
                new ButtonBuilder()
                    .setCustomId('soling_type_hosting')
                    .setLabel('Vou Solar (Hosting)')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👑')
            );

        await interaction.reply({
            content: 'O que você gostaria de fazer?',
            components: [initialButtons],
            ephemeral: true
        });

    } catch (error) {
        console.error('Erro no comando /soling (execute):', error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.reply({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        }
    }
}
