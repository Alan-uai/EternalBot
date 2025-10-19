// src/commands/utility/gerenciar.js
import { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { allWikiArticles } from '../../data/wiki-data.js';

// Comando "virtual" para centralizar a lógica de gerenciamento
export const data = {
    name: 'gerenciar',
    description: 'Comando interno para gerenciar interações de inventário.'
};

async function handleInteraction(interaction) {
    const { customId, user } = interaction;
    const parts = customId.split('_');
    const command = parts[0]; // 'gerenciar'
    const categoryId = parts[1];
    const action = parts[2];
    const actionData = parts.slice(3); // O resto dos dados, como ID do item

    if (action === 'equipar') {
        await handleEquipAction(interaction, categoryId);
    } else if (action === 'selectitem') {
        await handleSelectItemAction(interaction, categoryId, actionData[0]);
    } else if (action === 'selectlevel') {
        await handleSelectLevelAction(interaction, categoryId, actionData[0], actionData[1]);
    }
    // Adicionar lógica para desequipar e editar
}

function getItemsForCategory(categoryId) {
    let items = [];
    switch (categoryId) {
        case 'armas':
            const swordArticles = allWikiArticles.filter(a => a.id.includes('swords') || a.id.includes('scythes'));
            swordArticles.forEach(article => {
                if (article.tables) {
                    Object.values(article.tables).forEach(table => {
                        table.rows.forEach(row => {
                           if(row.name && row.type) items.push({ name: row.name, id: row.name.toLowerCase().replace(/ /g, '-'), type: row.type });
                        });
                    });
                }
            });
            break;
        case 'poderes':
            const powerArticles = allWikiArticles.filter(a => a.powers);
            powerArticles.forEach(article => {
                article.powers.forEach(power => {
                    items.push({ name: power.name, id: power.name.toLowerCase().replace(/ /g, '-') });
                });
            });
            break;
         case 'pets':
            const petArticles = allWikiArticles.filter(a => a.pets);
            petArticles.forEach(article => {
                article.pets.forEach(pet => {
                    items.push({ name: pet.name, id: pet.name.toLowerCase().replace(/ /g, '-') });
                });
            });
            break;
        // Adicionar outros casos para pets, acessorios, etc.
    }
    // Remover duplicados
    return items.filter((item, index, self) =>
        index === self.findIndex((t) => (t.id === item.id))
    );
}

function getItemDetails(categoryId, itemId) {
     let itemData = null;
     let articleSource = null;
    switch (categoryId) {
        case 'armas':
            const swordArticles = allWikiArticles.filter(a => a.id.includes('swords') || a.id.includes('scythes'));
            for (const article of swordArticles) {
                if (article.tables) {
                    for (const table of Object.values(article.tables)) {
                        const foundRow = table.rows.find(row => row.name.toLowerCase().replace(/ /g, '-') === itemId);
                        if (foundRow) {
                             itemData = { ...foundRow };
                             articleSource = article;
                             break;
                        }
                    }
                }
                if(itemData) break;
            }

            if(itemData && articleSource) {
                 const baseName = itemData.name.split(' (')[0];
                 const allLevels = [];
                  for (const table of Object.values(articleSource.tables)) {
                     table.rows.forEach(row => {
                         if(row.name.startsWith(baseName)) {
                             let levelName = row.name.includes('Estrela') ? row.name.split('(')[1].replace(')','') : `Base (${row.rarity})`;
                             let id = row.rarity.toLowerCase();
                             if(row.name.includes('1 Estrela')) id = '1-star';
                             if(row.name.includes('2 Estrelas')) id = '2-star';
                             if(row.name.includes('3 Estrelas')) id = '3-star';
                             allLevels.push({ name: levelName, id: id });
                         }
                     })
                  }
                  // Tratamento especial para Golden Venom Strike que não tem estrelas
                  if (baseName === 'Golden Venom Strike') {
                      return [{ name: `Evento (${itemData.rarity})`, id: 'evento' }];
                  }

                 return allLevels.filter((level, index, self) => index === self.findIndex(l => l.id === level.id));
            }
            break;
        case 'poderes':
             const powerArticles = allWikiArticles.filter(a => a.powers);
             for (const article of powerArticles) {
                 const foundPower = article.powers.find(p => p.name.toLowerCase().replace(/ /g, '-') === itemId);
                 if(foundPower && foundPower.stats) {
                     return foundPower.stats.map(stat => ({ name: `${stat.name} (${stat.rarity})`, id: stat.rarity.toLowerCase() }));
                 }
             }
            break;
         case 'pets':
            const petArticles = allWikiArticles.filter(a => a.pets);
             for (const article of petArticles) {
                 const foundPet = article.pets.find(p => p.name.toLowerCase().replace(/ /g, '-') === itemId);
                 if (foundPet) {
                     // Pets geralmente não têm múltiplos níveis da mesma forma, então retornamos a própria raridade
                     return [{ name: foundPet.rarity, id: foundPet.rarity.toLowerCase() }];
                 }
             }
            break;
    }
    return [];
}


async function handleEquipAction(interaction, categoryId) {
    const items = getItemsForCategory(categoryId);

    if (items.length === 0) {
        return interaction.reply({ content: `Nenhum item encontrando para a categoria \`${categoryId}\`.`, ephemeral: true });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`gerenciar_${categoryId}_selectitem`)
        .setPlaceholder('Selecione um item para equipar')
        .addOptions(
            items.slice(0, 25).map(item => ({ // Limite de 25 opções por menu
                label: item.name,
                value: item.id,
            }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: 'Escolha o item que você deseja equipar:',
        components: [row],
        ephemeral: true,
    });
}

async function handleSelectItemAction(interaction, categoryId, itemId) {
    const levels = getItemDetails(categoryId, itemId);

    if (levels.length === 0) {
        // Se não há níveis (ex: item de progressão ou sem variações), equipa direto
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', interaction.user.id);
        
        await updateDoc(userRef, {
            [`equipped.${categoryId}.${itemId}`]: { id: itemId, equippedAt: new Date() }
        });

        return interaction.update({ content: `Item \`${itemId}\` equipado com sucesso!`, components: [] });
    }
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`gerenciar_${categoryId}_selectlevel_${itemId}`)
        .setPlaceholder('Selecione o nível/raridade')
        .addOptions(
            levels.slice(0, 25).map(level => ({
                label: level.name,
                value: level.id,
            }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.update({
        content: 'Escolha o nível ou raridade do item:',
        components: [row],
        ephemeral: true,
    });
}

async function handleSelectLevelAction(interaction, categoryId, itemId, levelId) {
     const { firestore } = initializeFirebase();
     const userRef = doc(firestore, 'users', interaction.user.id);

     const equippedItemPath = `equipped.${categoryId}.${itemId.replace(/-/g, '_')}`;

     await updateDoc(userRef, {
        [equippedItemPath]: {
            id: itemId,
            level: levelId,
            equippedAt: new Date()
        }
     });

    await interaction.update({ content: `Item \`${itemId}\` (${levelId}) equipado com sucesso!`, components: [] });
}


export { handleInteraction };
