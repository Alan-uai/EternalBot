// src/commands/utility/updlog.js
import { SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ai } from '../../ai/genkit.js';

const ADMIN_ROLE_ID = '1429318984716521483';
const UPDLOG_CHANNEL_ID = '1426958336057675857';
const FIRESTORE_DOC_ID = 'latestUpdateLog';

export const data = new SlashCommandBuilder()
    .setName('updlog')
    .setDescription('Lança um novo log de atualização para o jogo.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('updlog_modal')
        .setTitle('Novo Log de Atualização (Em Inglês)');

    const titleInput = new TextInputBuilder()
        .setCustomId('updlog_title')
        .setLabel("Título da Atualização (em Inglês)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Update 20, Part 3")
        .setRequired(true);

    const contentInput = new TextInputBuilder()
        .setCustomId('updlog_content')
        .setLabel("Conteúdo do Log (Markdown, em Inglês)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Cole o log de atualização aqui. Ele será traduzido.")
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
}

async function handleInteraction(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'updlog_modal') return;

    await interaction.deferReply({ ephemeral: true });

    const titleEn = interaction.fields.getTextInputValue('updlog_title');
    const contentEn = interaction.fields.getTextInputValue('updlog_content');

    const { firestore } = initializeFirebase();
    const updlogRef = doc(firestore, 'bot_config', FIRESTORE_DOC_ID);

    try {
        // Tradução com Genkit
        const { text: translatedTitle } = await ai.generate({
            prompt: `Traduza o seguinte título de log de atualização para Português-BR, mantendo a formatação e os números: "${titleEn}"`,
        });

        const { text: translatedContent } = await ai.generate({
            prompt: `Traduza o seguinte log de atualização para Português-BR. Mantenha toda a formatação original do Markdown (títulos, listas com marcadores como •, negrito, etc.), nomes próprios de itens, mundos e códigos. Traduza apenas as descrições e títulos de seção como 'NEW CONTENT', 'FIXES', 'NEW CODES', etc. Texto a ser traduzido:\n\n${contentEn}`,
        });


        const updlogChannel = await interaction.client.channels.fetch(UPDLOG_CHANNEL_ID);
        if (!updlogChannel) {
            return interaction.editReply('ERRO: Canal de logs de atualização não encontrado.');
        }

        // 1. Apagar a mensagem antiga
        const docSnap = await getDoc(updlogRef);
        if (docSnap.exists()) {
            const oldMessageId = docSnap.data().messageId;
            if (oldMessageId) {
                try {
                    const oldMessage = await updlogChannel.messages.fetch(oldMessageId);
                    await oldMessage.delete();
                } catch (error) {
                    console.warn(`Não foi possível apagar a mensagem antiga de log (ID: ${oldMessageId}):`, error.message);
                }
            }
        }

        // 2. Enviar a nova mensagem traduzida
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(translatedTitle)
            .setDescription(translatedContent)
            .setTimestamp()
            .setFooter({ text: `Lançado por: ${interaction.user.tag}` });

        const newMessage = await updlogChannel.send({ content: '@everyone', embeds: [embed] });

        // 3. Salvar a nova referência no Firestore (conteúdo traduzido)
        await setDoc(updlogRef, {
            title: translatedTitle,
            content: translatedContent,
            messageId: newMessage.id,
            channelId: newMessage.channel.id,
            updatedAt: new Date(),
        });

        await interaction.editReply('Log de atualização traduzido, lançado e salvo com sucesso!');

    } catch (error) {
        console.error('Erro ao processar o /updlog:', error);
        await interaction.editReply('Ocorreu um erro ao tentar traduzir e lançar o log de atualização.');
    }
}

export { handleInteraction };
