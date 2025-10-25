// src/commands/utility/requestfarm.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { updateDoc, doc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const ADMIN_ROLE_ID = '1429318984716521483';
const PANEL_CHANNEL_ID = '1429260519151501483';
const MOD_CHANNEL_ID = '1426968477482225716';

export const data = new SlashCommandBuilder()
    .setName('requestfarm')
    .setDescription('Posta o painel para solicitar acesso ao sistema de Farming.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    if (interaction.channelId !== PANEL_CHANNEL_ID) {
        return interaction.reply({
            content: `Este comando só pode ser usado no canal <#${PANEL_CHANNEL_ID}>.`,
            ephemeral: true,
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('🚜 Acesso ao Sistema de Farming')
        .setDescription('Deseja se tornar um "Farming" e organizar seus próprios grupos e horários de farm?\n\nClique no botão abaixo para preencher o formulário de solicitação.')
        .setFooter({ text: 'Sua solicitação será analisada pela moderação.' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('requestfarm_open_modal')
                .setLabel('Solicitar Acesso ao Farming')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝')
        );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'Painel de solicitação de farming postado com sucesso!', ephemeral: true });
}

async function handleInteraction(interaction) {
    const [command, action, ...params] = interaction.customId.split('_');
    if (command !== 'requestfarm') return;

    if (interaction.isButton()) {
        if (action === 'open') {
            await openRequestModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (action === 'modal') {
            await handleModalSubmit(interaction);
        }
    }
}

async function openRequestModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('requestfarm_modal_submit')
        .setTitle('Solicitação de Acesso ao Farming');

    const reasonInput = new TextInputBuilder()
        .setCustomId('farming_reason')
        .setLabel('Por que você quer ser um "Farming"?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Ex: Quero organizar raids com meu grupo nos fins de semana, ajudar a comunidade a farmar tokens, etc.')
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    await interaction.showModal(modal);
}

async function handleModalSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const reason = interaction.fields.getTextInputValue('farming_reason');
    const user = interaction.user;

    const modChannel = await interaction.client.channels.fetch(MOD_CHANNEL_ID);
    if (!modChannel) {
        return interaction.editReply({ content: 'Não foi possível encontrar o canal de moderação. Contate um administrador.' });
    }

    const requestEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('🌾 Nova Solicitação de Acesso Farming')
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields(
            { name: 'Usuário', value: `<@${user.id}>` },
            { name: 'Motivo da Solicitação', value: `\`\`\`${reason}\`\`\`` }
        )
        .setTimestamp();

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`farmaccess_approve_${user.id}`)
                .setLabel('Aprovar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId(`farmaccess_reject_${user.id}`)
                .setLabel('Rejeitar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

    await modChannel.send({ embeds: [requestEmbed], components: [actionRow] });
    await interaction.editReply({ content: 'Sua solicitação foi enviada para análise. Você será notificado se for aprovado!' });
}

export { handleInteraction };

    