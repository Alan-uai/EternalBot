// src/jobs/birthdayAnnouncer.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AttachmentBuilder } from 'discord.js';
import { generateBirthdayWish } from '../ai/flows/generate-birthday-wish.js';
import { createBirthdayCard } from '../utils/createBirthdayCard.js';

export const name = 'birthdayAnnouncer';
export const schedule = '30 11 * * *'; // Todos os dias às 11:30

export async function run(container) {
    const { client, services, config, logger } = container;
    const { firestore } = services.firebase;
    
    logger.info('Verificando aniversários...');
    const today = new Date();
    const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; // MM-DD

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("birthday", "==", todayString));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            logger.info('Nenhum aniversário hoje.');
            return;
        }

        const birthdayUsers = querySnapshot.docs.map(doc => doc.data());
        const announcementChannel = await client.channels.fetch(config.BIRTHDAY_CHANNEL_ID);

        if (announcementChannel) {
            const userMentions = birthdayUsers.map(u => `<@${u.id}>`).join(', ');
            await announcementChannel.send(`🎉🎂 **Feliz Aniversário para:** ${userMentions}! 🎂🎉\n\nDesejamos a vocês um dia incrível! Fiquem de olho em suas DMs para uma surpresa especial do Gui!`);
        }

        for (const userData of birthdayUsers) {
            const user = await client.users.fetch(userData.id);
            if (user) {
                try {
                    const wish = await generateBirthdayWish({ userName: user.username });
                    const cardBuffer = await createBirthdayCard(user.username, wish.message);
                    const attachment = new AttachmentBuilder(cardBuffer, { name: 'birthday-card.png' });

                    await user.send({
                        content: `Opa, ${user.username}! A equipe do Guia Eterno e eu, o Gui, te desejamos um dia extraordinário!`,
                        files: [attachment]
                    });
                } catch (dmError) {
                    logger.error(`Não foi possível enviar DM de aniversário para ${user.tag}:`, dmError);
                }
            }
        }
    } catch (error) {
        logger.error('Erro ao verificar aniversários:', error);
    }
}
