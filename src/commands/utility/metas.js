// src/commands/utility/metas.js
import { SlashCommandBuilder } from 'discord.js';
import { handleInteraction as profileInteractionHandler, GOALS_PANEL_BUTTON_ID } from '../../interactions/buttons/iniciar-perfil.js';

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
        customId: `${GOALS_PANEL_BUTTON_ID}_${interaction.user.id}`,
        // Garante que o handler possa responder ou seguir
        reply: interaction.reply.bind(interaction),
        followUp: interaction.followUp.bind(interaction),
        deferReply: interaction.deferReply.bind(interaction),
        // Correção: Adiciona a propriedade message que faltava no objeto
        message: interaction.message || interaction, 
    };
    
    await profileInteractionHandler(fakeInteraction);
}
