// src/commands/utility/gerenciar.js
import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('gerenciar')
    .setDescription('Posta ou atualiza o painel de suporte.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export const SUPPORT_BUTTON_IDS = {
    REPORT: 'support_open_report',
    TICKET: 'support_open_ticket',
    APPLY: 'support_open_application'
};

export async function execute(interaction) {
    const { config } = interaction.client.container;
    const channel = await interaction.client.channels.fetch(config.SUPPORT_PANEL_CHANNEL_ID).catch(() => null);

    if (!channel) {
        return interaction.reply({ content: 'O canal do painel de suporte não foi encontrado.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Central de Suporte e Gerenciamento')
        .setDescription('Utilize os botões abaixo para a ação desejada.')
        .addFields(
            { name: '🚨 Abrir Denúncia', value: 'Denuncie um jogador ou comportamento que quebra as regras do servidor. Um tópico privado será criado para você e a moderação.', inline: false },
            { name: '🎫 Abrir Ticket', value: 'Precisa de ajuda com o bot, tem uma dúvida geral ou quer falar com a staff? Abra um ticket.', inline: false },
            { name: '📝 Candidatar-se', value: 'Quer ajudar a comunidade? Candidate-se para uma de nossas equipes de suporte.', inline: false }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(SUPPORT_BUTTON_IDS.REPORT)
                .setLabel('Abrir Denúncia')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🚨'),
            new ButtonBuilder()
                .setCustomId(SUPPORT_BUTTON_IDS.TICKET)
                .setLabel('Abrir Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫'),
            new ButtonBuilder()
                .setCustomId(SUPPORT_BUTTON_IDS.APPLY)
                .setLabel('Candidatar-se')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝')
        );

    // O Job 'supportPanelManager' será responsável por postar/editar a mensagem.
    // Este comando serve apenas como um gatilho manual para o admin, caso necessário.
    // A lógica real está no job para garantir que o painel seja persistente.
    await interaction.reply({ content: 'O painel de suporte será postado/atualizado no canal designado em instantes pelo processo automático.', ephemeral: true });
    
    // Forçar a execução do job para refletir a mudança imediatamente
    const job = interaction.client.container.jobs.find(j => j.name === 'supportPanelManager');
    if(job) {
        await job.run(interaction.client.container);
    }
}
