
// src/commands/utility/soling.js
import { SlashCommandBuilder } from 'discord.js';
import { handleTypeSelection } from '../../interactions/buttons/helpers.js';

const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Oferece ajuda para solar raids (cria um anúncio de host).');

export async function execute(interaction) {
    if (!ALLOWED_CHANNEL_IDS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais designados de /soling, ajuda ou chat.`, ephemeral: true });
    }
    
    try {
        // Pula a seleção de botão e vai direto para a seleção de raid
        await handleTypeSelection(interaction, 'hosting');
    } catch (error) {
        console.error('Erro no comando /soling (execute):', error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.reply({ content: 'Ocorreu um erro ao iniciar o comando.', ephemeral: true }).catch(console.error);
        }
    }
}
