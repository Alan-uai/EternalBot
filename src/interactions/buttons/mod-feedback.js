// src/interactions/buttons/mod-feedback.js
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export const customIdPrefix = 'mod-feedback';

export async function handleInteraction(interaction, { client }) {
    const { logger } = client.container;
    const [_, status, userId] = interaction.customId.split('_');
    
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
        return interaction.reply({ content: 'Não foi possível encontrar o usuário original para notificar.', ephemeral: true });
    }
    
    let messageContent;
    switch(status) {
        case 'seen':
            messageContent = 'Seu feedback foi visto por um moderador, obrigado!';
            break;
        case 'solving':
             messageContent = 'Um moderador está trabalhando em uma correção para o seu feedback, obrigado!';
            break;
        case 'solved':
             messageContent = 'Seu feedback ajudou a resolver um problema, obrigado! Você recebeu pontos de reputação.';
             // TODO: Lógica para dar pontos de reputação ao usuário aqui
            break;
        default:
            return;
    }

    try {
        await user.send(messageContent);
        await interaction.reply({ content: `Notificação de status '${status}' enviada por DM para ${user.tag}.`, ephemeral: true });
        
        // Desabilitar botões na mensagem original do moderador
        const originalMessage = interaction.message;
        const disabledRow = new ActionRowBuilder();
        originalMessage.components[0].components.forEach(component => {
            disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
        });
        await originalMessage.edit({ components: [disabledRow] });

    } catch (error) {
        // Se a DM falhar
        logger.error(`Falha ao enviar notificação por DM para ${user.tag}:`, error);
        await interaction.reply({ 
            content: `Não foi possível enviar a DM para ${user.tag} (pode estar bloqueada). A ação foi registrada.`, 
            ephemeral: true 
        });

        // Mesmo com falha na DM, desabilita os botões para evitar re-cliques
        const originalMessage = interaction.message;
        if (!originalMessage.components[0].components[0].disabled) {
            const disabledRow = new ActionRowBuilder();
            originalMessage.components[0].components.forEach(component => {
                disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
            });
            await originalMessage.edit({ components: [disabledRow] });
        }
    }
}
