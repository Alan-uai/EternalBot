// src/commands/utility/helpers.js
import { SlashCommandBuilder } from 'discord.js';
import { handleTypeSelection } from '../../interactions/buttons/helpers.js';

const ALLOWED_CHANNEL_ID = '1429260519151501483';

export const data = new SlashCommandBuilder()
    .setName('helpers')
    .setDescription('Procura ajuda para solar raids.');

export async function execute(interaction) {
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
        return interaction.reply({ content: `Este comando só pode ser usado no canal <#${ALLOWED_CHANNEL_ID}>.`, ephemeral: true });
    }
    
    try {
        // Pula a seleção de botão e vai direto para a seleção de raid
        await handleTypeSelection(interaction, 'help');
    } catch (error) {
        console.error('Erro no comando /helpers (execute):', error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.reply({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        }
    }
}
