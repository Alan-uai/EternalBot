// src/commands/utility/aniversario.js
import { SlashCommandBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('aniversario')
    .setDescription('Gerencia seu aniversário no bot.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('registrar')
            .setDescription('Registra ou atualiza sua data de aniversário.')
            .addIntegerOption(option =>
                option.setName('dia')
                    .setDescription('O dia do seu nascimento (1-31).')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(31))
            .addIntegerOption(option =>
                option.setName('mes')
                    .setDescription('O mês do seu nascimento (1-12).')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(12))
    );

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.user;

    if (subcommand === 'registrar') {
        const dia = interaction.options.getInteger('dia');
        const mes = interaction.options.getInteger('mes');

        // Validação simples de data
        const date = new Date(2000, mes - 1, dia); // Ano bissexto para validar dia 29/fev
        if (date.getMonth() !== mes - 1 || date.getDate() !== dia) {
            return interaction.editReply('A data fornecida é inválida. Por favor, verifique o dia e o mês.');
        }
        
        const birthdayString = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`; // MM-DD

        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', user.id);

        try {
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
                 await updateDoc(userRef, { birthday: birthdayString });
            } else {
                // Se o usuário não tem perfil, cria um básico
                 await setDoc(userRef, { 
                    id: user.id, 
                    username: user.username,
                    birthday: birthdayString,
                    createdAt: serverTimestamp()
                });
            }
           
            await interaction.editReply(`Seu aniversário foi registrado para ${dia}/${mes}! 🎉`);

        } catch (error) {
            console.error('Erro ao registrar aniversário:', error);
            await interaction.editReply('Ocorreu um erro ao tentar registrar seu aniversário.');
        }
    }
}
