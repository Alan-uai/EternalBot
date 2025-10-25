// src/commands/utility/farming.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const FARMING_ROLE_ID = 'YOUR_FARMING_ROLE_ID'; // Replace with the actual role ID that allows farming

export const data = new SlashCommandBuilder()
    .setName('farming')
    .setDescription('Abre o painel para criar ou editar seu plano de farm semanal.');

export async function execute(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().farming) {
        return interaction.reply({
            content: 'Você não tem permissão para acessar o sistema de farming.',
            ephemeral: true,
        });
    }

    const plansRef = doc(firestore, 'farm_plans', interaction.user.id);
    const plansSnap = await getDoc(plansRef);
    const userPlans = plansSnap.exists() ? plansSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId('farming_plan_modal')
        .setTitle('Plano de Farm Semanal');

    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

    days.forEach(day => {
        const dayInput = new TextInputBuilder()
            .setCustomId(`farm_plan_${day.toLowerCase()}`)
            .setLabel(`${day} (Atividade @ HH:MM)`)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Farm Tokens @ 20:30")
            .setValue(userPlans[day.toLowerCase()] || '')
            .setRequired(false);
        
        modal.addComponents(new ActionRowBuilder().addComponents(dayInput));
    });

    await interaction.showModal(modal);
}

async function handleInteraction(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'farming_plan_modal') return;

    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const plansRef = doc(firestore, 'farm_plans', interaction.user.id);
    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    const newPlans = {};

    let hasContent = false;
    days.forEach(day => {
        const planString = interaction.fields.getTextInputValue(`farm_plan_${day.toLowerCase()}`);
        if (planString) {
            const [activity, time] = planString.split('@').map(s => s.trim());
            if (activity && time && /^\d{2}:\d{2}$/.test(time)) {
                newPlans[day.toLowerCase()] = { activity, time };
                hasContent = true;
            }
        }
    });

    if (!hasContent) {
        return interaction.editReply({ content: 'Nenhum plano válido foi inserido. Use o formato "Atividade @ HH:MM".' });
    }

    try {
        await setDoc(plansRef, newPlans, { merge: true });
        await interaction.editReply({ content: 'Seu plano de farm semanal foi salvo com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar plano de farm:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao salvar seu plano.' });
    }
}


export { handleInteraction };

    