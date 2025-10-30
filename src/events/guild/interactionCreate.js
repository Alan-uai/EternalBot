// src/events/guild/interactionCreate.js
import { Events } from 'discord.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
    const { client, commands, interactions, logger } = interaction.client.container;
    
    // Roteamento para Comandos de Barra
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) {
            logger.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }
        try {
            if (command.execute) {
                await command.execute(interaction, { client });
            }
        } catch (error) {
            logger.error(`Erro ao executar o comando /${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true }).catch(e => logger.error("Falha ao enviar followUp de erro:", e));
            } else {
                await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true }).catch(e => logger.error("Falha ao enviar reply de erro:", e));
            }
        }
        return;
    }

    // Roteamento para outras interações (Botões, Menus, Modais)
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        
        // Tenta encontrar um manipulador que corresponda ao início do customId
        const handler = interactions.find((_, key) => customId.startsWith(key));
        
        if (handler) {
            try {
                await handler(interaction, { client });
            } catch (error) {
                logger.error(`Erro ao lidar com a interação ${customId}:`, error);
                const errorMessage = 'Ocorreu um erro ao processar sua ação.';
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(e => logger.error("Falha ao enviar followUp de erro de interação:", e));
                } else {
                    await interaction.reply({ content: errorMessage, ephemeral: true }).catch(e => logger.error("Falha ao enviar reply de erro de interação:", e));
                }
            }
        } else {
            logger.warn(`Nenhum manipulador de interação encontrado para o customId: ${customId}`);
        }
    }
}
