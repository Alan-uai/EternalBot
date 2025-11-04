// src/interactions/buttons/iniciar-perfil.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';
import { CUSTOM_ID_PREFIX, FORM_BUTTON_ID, IMPORT_BUTTON_ID, FORM_MODAL_ID, IMPORT_MODAL_ID } from '../../commands/utility/iniciar-perfil.js';

export const customIdPrefix = CUSTOM_ID_PREFIX;

async function handleOpenFormButton(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(FORM_MODAL_ID)
        .setTitle('Formulário de Perfil - Guia Eterno');

    const worldInput = new TextInputBuilder()
        .setCustomId('currentWorld')
        .setLabel("Mundo Atual")
        .setPlaceholder("Ex: 23")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.currentWorld || ''))
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId('rank')
        .setLabel("Seu Rank")
        .setPlaceholder("Ex: 115")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.rank || ''))
        .setRequired(true);
    
    const dpsInput = new TextInputBuilder()
        .setCustomId('dps')
        .setLabel("Dano Total (DPS)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.dps || '')
        .setRequired(true);

    const birthdayInput = new TextInputBuilder()
        .setCustomId('birthday')
        .setLabel("Aniversário (DD/MM)")
        .setPlaceholder("Ex: 25/12. Opcional.")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.birthday ? userData.birthday.split('-').reverse().join('/') : '')
        .setRequired(false);

    const energyInput = new TextInputBuilder()
        .setCustomId('totalEnergy')
        .setLabel("Energia Atual (Acumulada)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.totalEnergy || '')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(worldInput),
        new ActionRowBuilder().addComponents(rankInput),
        new ActionRowBuilder().addComponents(dpsInput),
        new ActionRowBuilder().addComponents(energyInput),
        new ActionRowBuilder().addComponents(birthdayInput)
    );

    await interaction.showModal(modal);
}

async function handleOpenImportModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId(IMPORT_MODAL_ID)
        .setTitle('Importar Perfil do Site');

    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel("E-mail da sua conta do site")
        .setPlaceholder("Ex: seuemail@gmail.com")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(emailInput));
    await interaction.showModal(modal);
}

async function handleFormSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const user = interaction.user;
    const userRef = doc(firestore, 'users', user.id);

    const profileData = {
        currentWorld: interaction.fields.getTextInputValue('currentWorld'),
        rank: interaction.fields.getTextInputValue('rank'),
        dps: interaction.fields.getTextInputValue('dps'),
        totalEnergy: interaction.fields.getTextInputValue('totalEnergy'),
        lastUpdated: serverTimestamp()
    };

    const birthdayValue = interaction.fields.getTextInputValue('birthday');
    if (birthdayValue) {
        const parts = birthdayValue.split(/[-/]/);
        if (parts.length === 2) {
            const [dia, mes] = parts;
            const date = new Date(2000, mes - 1, dia);
             if (date.getMonth() === parseInt(mes, 10) - 1 && date.getDate() === parseInt(dia, 10)) {
                profileData.birthday = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`; // MM-DD
             } else {
                 return interaction.editReply('A data de aniversário fornecida é inválida. Use o formato DD/MM.');
             }
        } else if (birthdayValue.trim() !== '') {
            return interaction.editReply('Formato de data de aniversário inválido. Use DD/MM.');
        }
    }
    
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        await updateDoc(userRef, profileData);
    } else {
        await setDoc(userRef, { 
            ...profileData, 
            id: user.id, 
            username: user.username, 
            createdAt: serverTimestamp(),
            reputationPoints: 0,
            credits: 0
        });
    }
    
    const updatedUserSnap = await getDoc(userRef);
    
    try {
        const profileImage = await createProfileImage(updatedUserSnap.data(), user);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        await interaction.editReply({ content: 'Seu perfil foi atualizado com sucesso!', files: [attachment] });
    } catch (e) {
        console.error("Erro ao criar imagem de perfil no /iniciar-perfil (submit):", e);
        await interaction.editReply('Seu perfil foi salvo, mas ocorreu um erro ao gerar a imagem de exibição.');
    }
}

async function handleImportSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const email = interaction.fields.getTextInputValue('email');
    const { firestore } = initializeFirebase();
    const discordUser = interaction.user;

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("email", "==", email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return interaction.editReply({ content: `Nenhum perfil encontrado no site com o e-mail \`${email}\`. Verifique o e-mail e tente novamente.`, ephemeral: true });
    }

    const webUserData = querySnapshot.docs[0].data();
    
    const discordUserRef = doc(firestore, 'users', discordUser.id);
    
    const profileDataToUpdate = {
        ...webUserData,
        id: discordUser.id, 
        username: discordUser.username,
        email: email,
    };

    const userSnap = await getDoc(discordUserRef);
    if(userSnap.exists()) {
        await updateDoc(discordUserRef, { ...profileDataToUpdate, lastUpdated: serverTimestamp() });
    } else {
        await setDoc(discordUserRef, { ...profileDataToUpdate, createdAt: serverTimestamp() }, { merge: true });
    }
    
    const updatedUserSnap = await getDoc(discordUserRef);

    try {
        const profileImage = await createProfileImage(updatedUserSnap.data(), discordUser);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        await interaction.editReply({ content: 'Seu perfil foi importado com sucesso!', files: [attachment] });
    } catch (e) {
        console.error("Erro ao criar imagem de perfil no /iniciar-perfil (import):", e);
        await interaction.editReply('Seu perfil foi importado, mas ocorreu um erro ao gerar a imagem de exibição.');
    }
}

export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === FORM_BUTTON_ID) {
            await handleOpenFormButton(interaction);
        } else if (interaction.customId === IMPORT_BUTTON_ID) {
            await handleOpenImportModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === FORM_MODAL_ID) {
            await handleFormSubmit(interaction);
        } else if (interaction.customId === IMPORT_MODAL_ID) {
            await handleImportSubmit(interaction);
        }
    }
}
