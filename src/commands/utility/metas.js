// src/commands/utility/metas.js
import { SlashCommandBuilder } from 'discord.js';
import { handleInteraction as profileInteractionHandler } from '../../interactions/buttons/iniciar-perfil.js';

export const data = new SlashCommandBuilder()
    .setName('metas')
    .setDescription('Abre o painel para gerenciar suas metas de jogo.');

export async function execute(interaction) {
    // A interação de um comando de barra não tem uma "mensagem" da mesma forma que um botão.
    // O handler de perfil espera uma interação que possa ser "atualizada" (update).
    // Para contornar isso, primeiro fazemos um deferReply para ter algo para editar/seguir.
    await interaction.deferReply({ ephemeral: true });

    // Simulamos uma interação de botão para reutilizar a lógica.
    const fakeInteraction = {
        ...interaction,
        isButton: () => true,
        // Usamos um customId que o handler de perfil reconhece para abrir o painel de metas.
        customId: `perfil_goals_panel_${interaction.user.id}`, 
        // Fornecemos a capacidade de editar a resposta inicial em vez de criar uma nova.
        update: (options) => interaction.editReply(options),
        // Garantimos que o handler possa seguir se necessário, embora `update` seja o preferido.
        followUp: (options) => interaction.followUp(options),
        // Passamos a própria interação como `message` para consistência, caso alguma propriedade seja acessada.
        message: interaction,
    };
    
    // Chamamos o handler, que agora tem uma interação que pode ser atualizada.
    await profileInteractionHandler(fakeInteraction);
}
