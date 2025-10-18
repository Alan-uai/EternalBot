// src/commands/utility/chat.ts
import { SlashCommandBuilder } from 'discord.js';
import { generateSolution } from '../../ai/flows/generate-solution';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Converse com a IA sobre o Anime Eternal.')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('A pergunta que você quer fazer para a IA.')
        .setRequired(true)),
  async execute(interaction: any, { wikiContext }: { wikiContext: string }) {
    await interaction.deferReply();
    const question = interaction.options.getString('pergunta');

    try {
      const result = await generateSolution({
        problemDescription: question,
        wikiContext: wikiContext,
      });

      if (result && result.structuredResponse) {
        const parsedResponse = JSON.parse(result.structuredResponse);
        
        let replyContent = '';
        parsedResponse.forEach((section: any) => {
          replyContent += `**${section.titulo}**\n${section.conteudo}\n\n`;
        });
        
        // As respostas do Discord têm um limite de 2000 caracteres
        if (replyContent.length > 2000) {
            replyContent = replyContent.substring(0, 1997) + '...';
        }

        await interaction.editReply(replyContent);
      } else {
        await interaction.editReply('Desculpe, não consegui obter uma resposta.');
      }
    } catch (error) {
      console.error('Erro ao chamar o fluxo generateSolution:', error);
      await interaction.editReply('Ocorreu um erro ao processar sua pergunta.');
    }
  },
};
