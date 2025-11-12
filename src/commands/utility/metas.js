// src/commands/utility/metas.js
import { SlashCommandBuilder } from 'discord.js';

// Este comando será um atalho para abrir o botão "Minhas Metas" no perfil.
// A lógica principal estará no manipulador de interação do perfil.
import { handleInteraction as profileInteractionHandler } from '../../interactions/buttons/iniciar-perfil.js';
import { CUSTOM_ID_PREFIX } from '../../interactions/buttons/iniciar-perfil.js';

export const data = new SlashCommandBuilder()
    .setName('metas')
    .setDescription('Abre o painel para gerenciar suas metas de jogo.');

export async function execute(interaction) {
    // Simula o clique no botão "Minhas Metas"
    // Criamos uma interação "falsa" que se parece com um clique de botão
    // para reutilizar a lógica já existente no handler de perfil.
    const fakeInteraction = {
        ...interaction,
        isButton: () => true,
        customId: `${CUSTOM_ID_PREFIX}_goals_panel_${interaction.user.id}`
    };
    
    await profileInteractionHandler(fakeInteraction);
}
