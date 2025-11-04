// src/commands/utility/soling.js
import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';
import { world1Data } from '../../data/worlds/world-1-data.js';
import { world24Data } from '../../data/worlds/world-24-data.js';


const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Procura ou oferece ajuda para solar raids.');

export function getAvailableRaids() {
    const allRaids = new Map();
    const soloRaids = ['Gleam Raid', 'Raid Sins', 'Mundo Raid', 'Mundo']; // Raids individuais a serem excluídas

    const categorizeRaid = (raidName) => {
        // Event Raids
        if (raidName.toLowerCase().includes('halloween') || raidName.toLowerCase().includes('graveyard')) {
            return 'event';
        }
        // Worlds 20+
        if (['Green Planet Raid', 'Suffering Raid', 'Mundo Raid', 'Mundo', 'Hollow Raid', 'Tomb Arena Raid'].includes(raidName)) {
            return 'w20plus';
        }
        // Default to Worlds 1-19
        return 'w1-19';
    };

    // Adiciona raids do Lobby 1
    lobbyDungeonsArticle.tables.lobbySchedule.rows.forEach(raid => {
        if (!soloRaids.includes(raid['Dificuldade'])) {
            allRaids.set(raid['Dificuldade'], {
                label: raid['Dificuldade'],
                value: raid['Dificuldade'].toLowerCase().replace(/ /g, '_'),
                category: categorizeRaid(raid['Dificuldade'])
            });
        }
    });
    
    // Adiciona raids do Halloween (Mundo 1)
    world1Data.dungeons.forEach(dungeon => {
        if (!soloRaids.includes(dungeon.name)) {
             allRaids.set(dungeon.name, {
                label: dungeon.name,
                value: dungeon.name.toLowerCase().replace(/ /g, '_'),
                category: categorizeRaid(dungeon.name)
            });
        }
    });

    // Adiciona raids do Mundo 24
     world24Data.dungeons.forEach(dungeon => {
        if (!soloRaids.includes(dungeon.name)) {
             allRaids.set(dungeon.name, {
                label: dungeon.name,
                value: dungeon.name.toLowerCase().replace(/ /g, '_'),
                category: categorizeRaid(dungeon.name)
            });
        }
    });


    // Adiciona raids do Lobby 2 (e outras) a partir dos requisitos
    raidRequirementsArticle.tables.requirements.rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== 'Wave' && row[key] && !allRaids.has(key) && !soloRaids.includes(key)) {
                allRaids.set(key, {
                    label: key,
                    value: key.toLowerCase().replace(/ /g, '_'),
                    category: categorizeRaid(key)
                });
            }
        });
    });

    const categorizedRaids = {
        'w1-19': [],
        'w20plus': [],
        'event': []
    };

    allRaids.forEach(raid => {
        categorizedRaids[raid.category].push(raid);
    });
    
    // Adiciona a Hollow Raid manualmente se não estiver lá
    const hollowRaidName = 'Hollow Raid';
    if (!allRaids.has(hollowRaidName)) {
        categorizedRaids['w20plus'].push({
            label: hollowRaidName,
            value: hollowRaidName.toLowerCase().replace(/ /g, '_'),
            category: 'w20plus'
        });
    }

    return categorizedRaids;
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
