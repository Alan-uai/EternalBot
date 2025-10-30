// src/interactions/buttons/mod-feedback.js
import { ActionRowBuilder, ButtonBuilder, ChannelType } from 'discord.js';

export const customIdPrefix = 'mod-feedback';

export async function handleInteraction(interaction, { client }) {
    const { logger } = client.container;
    const [_, status, userId] = interaction.customId.split('_');
    
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
        return interaction.reply({ content: 'Não foi possível encontrar o usuário original.', ephemeral: true });
    }

    const guild = interaction.guild;
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const userChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
         return interaction.reply({ content: `O canal de perfil para ${user.tag} não foi encontrado. Use /atualizar-perfil para criar.`, ephemeral: true });
    }
    
    const existingThreads = await userChannel.threads.fetch().catch(() => ({ threads: new Collection() }));
    let notificationThread = existingThreads.threads.find(t => t.name === 'notificações');

    if (!notificationThread) {
         try {
            notificationThread = await userChannel.threads.create({
                name: 'notificações',
                autoArchiveDuration: 10080,
                reason: `Tópico de notificações para ${user.tag}`
            });
         } catch(error) {
             logger.error(`Não foi possível criar o tópico de notificações para ${user.tag}:`, error);
             return interaction.reply({ content: 'Não foi possível criar o tópico de notificações no canal do usuário.', ephemeral: true });
         }
    }
    
    let message;
    switch(status) {
        case 'seen':
            message = 'Seu feedback foi visto por um moderador, obrigado!';
            break;
        case 'solving':
             message = 'Seu feedback foi visto por um moderador e está em desenvolvimento, obrigado!';
            break;
        case 'solved':
             message = 'Seu feedback ajudou a resolver um problema, obrigado! Você recebeu pontos de reputação.';
             // TODO: Lógica para dar pontos de reputação ao usuário aqui
            break;
        default:
            return;
    }

    try {
        await notificationThread.send(`<@${userId}>, ${message}`);
        await interaction.reply({ content: `Notificação de status '${status}' enviada para ${user.tag}.`, ephemeral: true });
        
        // Desabilitar botões na mensagem original do moderador
        const originalMessage = interaction.message;
        const disabledRow = new ActionRowBuilder();
        originalMessage.components[0].components.forEach(component => {
            disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
        });
        await originalMessage.edit({ components: [disabledRow] });

    } catch (error) {
        logger.error(`Falha ao enviar notificação ou editar mensagem do mod:`, error);
        await interaction.followUp({ content: 'Houve um erro ao processar a ação.', ephemeral: true });
    }
}
