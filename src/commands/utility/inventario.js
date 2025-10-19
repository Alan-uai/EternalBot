// src/commands/utility/inventario.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';

const CUSTOM_ID_PREFIX = 'inventario';

// Função para criar um botão
const createButton = (id, label, style, emoji) => 
    new ButtonBuilder()
        .setCustomId(`${CUSTOM_ID_PREFIX}_${id}`)
        .setLabel(label)
        .setStyle(style)
        .setEmoji(emoji);

export const data = new SlashCommandBuilder()
    .setName('inventario')
    .setDescription('Abre o painel de gerenciamento de inventário do seu perfil.');

export async function execute(interaction) {
    const user = interaction.user;
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (interaction.channel.name !== channelName) {
        return interaction.reply({ content: 'Este comando só pode ser usado no seu canal de perfil privado.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setColor(0x4BC5FF)
        .setTitle(`Painel de Inventário de ${user.username}`)
        .setDescription('Selecione uma categoria para gerenciar seus itens.')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    const row1 = new ActionRowBuilder().addComponents(
        createButton('poderes', 'Poderes', ButtonStyle.Primary, '⚡'),
        createButton('armas', 'Armas', ButtonStyle.Secondary, '⚔️'),
        createButton('pets', 'Pets', ButtonStyle.Primary, '🐾'),
        createButton('acessorios', 'Acessórios', ButtonStyle.Secondary, '🧢')
    );
    
    const row2 = new ActionRowBuilder().addComponents(
        createButton('gamepasses', 'Gamepasses', ButtonStyle.Success, '🎟️'),
        createButton('auras', 'Auras', ButtonStyle.Primary, '✨'),
        createButton('sombras', 'Sombras', ButtonStyle.Secondary, '👤'),
        createButton('stands', 'Stands', ButtonStyle.Primary, '🕺')
    );
     const row3 = new ActionRowBuilder().addComponents(
        createButton('importar_imagem', 'Importar por Imagem', ButtonStyle.Success, '☁️')
    );


    await interaction.reply({
        embeds: [embed],
        components: [row1, row2, row3],
        ephemeral: false // Mensagem visível no canal
    });
}

async function handleInteraction(interaction) {
    if (!interaction.isButton()) return;
    
    const [commandName, category] = interaction.customId.split('_');

    if (commandName !== CUSTOM_ID_PREFIX) return;

    if (category === 'importar_imagem') {
        await interaction.reply({ content: 'Funcionalidade de importar por imagem ainda não implementada.', ephemeral: true });
        return;
    }
    
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`gerenciar_${category}_equipar`)
                .setLabel('Equipar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕'),
            new ButtonBuilder()
                .setCustomId(`gerenciar_${category}_desequipar`)
                .setLabel('Desequipar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('➖'),
            new ButtonBuilder()
                .setCustomId(`gerenciar_${category}_editar`)
                .setLabel('Ver/Editar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️')
        );

    await interaction.reply({
        content: `Gerenciando a categoria: **${categoryName}**. Escolha uma ação.`,
        components: [actionRow],
        ephemeral: true
    });
}

export { handleInteraction };
