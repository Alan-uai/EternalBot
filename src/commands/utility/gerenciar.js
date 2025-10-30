// src/commands/utility/gerenciar.js
import { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { allWikiArticles } from '../../data/wiki-data.js';

// Comando "virtual" para centralizar a lógica de gerenciamento
export const data = {
    name: 'gerenciar',
    description: 'Comando interno para gerenciar interações de inventário.'
};

// Adicionando uma função execute vazia para passar na validação do loader
export async function execute(interaction) {
    // Este comando é acionado apenas por interações de componentes,
    // então a execução direta não faz nada.
    await interaction.reply({ content: 'Este comando é apenas para uso interno.', ephemeral: true });
}


// Dados estáticos para os encantamentos, pois não estão na wiki
const ENCHANTMENTS = {
    breathing: [
        { name: 'Respiração da Água (Comum)', id: 'water_common' },
        { name: 'Respiração do Trovão (Incomum)', id: 'thunder_uncommon' },
        { name: 'Respiração da Besta (Raro)', id: 'beast_rare' },
        { name: 'Respiração do Vento (Épico)', id: 'wind_epic' },
        { name: 'Respiração das Chamas (Lendário)', id: 'flame_legendary' },
        { name: 'Respiração da Lua (Mítico)', id: 'moon_mythic' },
        { name: 'Respiração do Sol (Phantom)', id: 'sun_phantom' },
    ],
    stone: [
        { name: 'Runa de Gelo (Comum)', id: 'ice_common' },
        { name: 'Runa de Veneno (Incomum)', id: 'poison_uncommon' },
        { name: 'Runa de Sangue (Raro)', id: 'blood_rare' },
        { name: 'Runa da Escuridão (Épico)', id: 'darkness_epic' },
        { name: 'Runa da Luz (Lendário)', id: 'light_legendary' },
        { name: 'Runa do Espaço (Mítico)', id: 'space_mythic' },
        { name: 'Runa do Tempo (Phantom)', id: 'time_phantom' },
    ],
    passiva: [
        { name: 'Passiva de Velocidade (Comum)', id: 'speed_common' },
        { name: 'Passiva de Alcance (Incomum)', id: 'range_uncommon' },
        { name: 'Passiva de Dano Crítico (Raro)', id: 'crit_rare' },
        { name: 'Passiva de Dano em Área (Épico)', id: 'aoe_epic' },
        { name: 'Passiva de Dreno de Vida (Lendário)', id: 'lifesteal_legendary' },
        { name: 'Passiva de Execução (Mítico)', id: 'execute_mythic' },
        { name: 'Passiva de Duplicação (Phantom)', id: 'duplication_phantom' },
    ]
};

async function handleInteraction(interaction) {
    const { customId, user } = interaction;
    const parts = customId.split('_');
    const command = parts[0]; // 'gerenciar'
    const categoryId = parts[1];
    const action = parts[2];
    const actionData = parts.slice(3); // O resto dos dados

    if (action === 'equipar') {
        await handleEquipAction(interaction, categoryId);
    } else if (action === 'desequipar') {
        await handleUnequipAction(interaction, categoryId);
    } else if (action === 'selectitem') {
        await handleSelectItemAction(interaction, categoryId, actionData[0]);
    } else if (action === 'selectlevel') {
        await handleSelectLevelAction(interaction, categoryId, actionData[0], actionData[1]);
    } else if (action === 'editar') {
        await handleEditAction(interaction, categoryId);
    } else if (action === 'selectweaponedit') {
        await handleSelectWeaponForEdit(interaction, categoryId, actionData[0]);
    } else if (action === 'edittype') { // ex: gerenciar_armas_edittype_bloodthorn_envolver
        const weaponId = actionData[0];
        const editType = actionData[1];
        await handleWeaponEditType(interaction, weaponId, editType);
    } else if (action === 'setstar') { // ex: gerenciar_armas_setstar_bloodthorn_2
        const weaponId = actionData[0];
        const starLevel = actionData[1];
        await handleSetStarLevel(interaction, weaponId, starLevel);
    } else if (action === 'setenchant') { // ex: gerenciar_armas_setenchant_bloodthorn_breathing_sun_phantom
        const weaponId = actionData[0];
        const enchantType = actionData[1];
        const enchantId = actionData[2];
        await handleSetEnchantment(interaction, weaponId, enchantType, enchantId);
    } else if (action === 'selectgamepass') {
        await handleSelectGamepassAction(interaction, categoryId);
    } else if (action === 'removegamepass') {
        await handleRemoveGamepassAction(interaction, categoryId);
    } else if (action === 'selectaura') {
        await handleSelectAuraAction(interaction, categoryId);
    } else if (action === 'removeaura') {
        await handleRemoveAuraAction(interaction, categoryId);
    }
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
                           if(row.name && row.type) {
                               const baseName = row.name.split(' (')[0];
                               items.push({ name: baseName, id: baseName.toLowerCase().replace(/ /g, '-'), type: row.type });
                           }
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
        case 'gamepasses':
            const gamepassArticles = allWikiArticles.filter(a => a.id === 'gamepass-tier-list');
            gamepassArticles.forEach(article => {
                if(article.tables) {
                    Object.values(article.tables).forEach(table => {
                        table.rows.forEach(row => {
                            if(row.Gamepass) items.push({ name: row.Gamepass, id: row.Gamepass.toLowerCase().replace(/ /g, '-') });
                        });
                    });
                }
            });
            break;
        case 'auras':
            const auraArticle = allWikiArticles.find(a => a.id === 'aura-system');
            if (auraArticle && auraArticle.content) {
                 // Extrair auras do conteúdo de texto
                 const auraRegex = /\*\s*\w+\s\d+\s\(.+\):\s*(Aura[^\(]+)/g;
                 let match;
                 while ((match = auraRegex.exec(auraArticle.content)) !== null) {
                    const auraName = match[1].trim();
                    items.push({ name: auraName, id: auraName.toLowerCase().replace(/ /g, '-') });
                 }
            }
            break;
        // Adicionar outros casos para acessorios, etc.
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
                        const foundRow = table.rows.find(row => row.name.toLowerCase().replace(/ \(.+\)/, '').replace(/ /g, '-') === itemId);
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
    if (categoryId === 'gamepasses') {
        const items = getItemsForCategory(categoryId);
        if (items.length === 0) {
            return interaction.reply({ content: 'Nenhuma gamepass encontrada.', ephemeral: true });
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`gerenciar_${categoryId}_selectgamepass`)
            .setPlaceholder('Selecione a gamepass para equipar')
            .addOptions(items.slice(0, 25).map(item => ({ label: item.name, value: item.id })));
        const row = new ActionRowBuilder().addComponents(selectMenu);
        return interaction.reply({ content: 'Escolha a gamepass:', components: [row], ephemeral: true });
    }
     if (categoryId === 'auras') {
        const items = getItemsForCategory(categoryId);
        if (items.length === 0) {
            return interaction.reply({ content: 'Nenhuma aura encontrada.', ephemeral: true });
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`gerenciar_${categoryId}_selectaura`)
            .setPlaceholder('Selecione a aura para equipar')
            .addOptions(items.slice(0, 25).map(item => ({ label: item.name, value: item.id })));
        const row = new ActionRowBuilder().addComponents(selectMenu);
        return interaction.reply({ content: 'Escolha a aura:', components: [row], ephemeral: true });
    }

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
    const selectedItemId = interaction.values[0];
    const levels = getItemDetails(categoryId, selectedItemId);

    if (levels.length === 0) {
        // Se não há níveis (ex: item de progressão ou sem variações), equipa direto
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', interaction.user.id);
        
        await updateDoc(userRef, {
            [`equipped.${categoryId}.${selectedItemId.replace(/-/g, '_')}`]: { id: selectedItemId, equippedAt: new Date() }
        }, { merge: true });

        return interaction.update({ content: `Item \`${selectedItemId}\` equipado com sucesso!`, components: [] });
    }
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`gerenciar_${categoryId}_selectlevel_${selectedItemId}`)
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
     const selectedLevelId = interaction.values[0];

     const equippedItemPath = `equipped.${categoryId}.${itemId.replace(/-/g, '_')}`;

     await updateDoc(userRef, {
        [equippedItemPath]: {
            id: itemId,
            level: selectedLevelId,
            equippedAt: new Date()
        }
     }, { merge: true });

    await interaction.update({ content: `Item \`${itemId}\` (${selectedLevelId}) equipado com sucesso!`, components: [] });
}

async function handleUnequipAction(interaction, categoryId) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return interaction.reply({ content: 'Perfil não encontrado.', ephemeral: true });
    }

    const userData = userSnap.data();
    let itemsToUnequip = [];
    let customIdPrefix = '';

    if (categoryId === 'gamepasses') {
        itemsToUnequip = userData.gamepasses || [];
        customIdPrefix = `gerenciar_gamepasses_removegamepass`;
    } else if (categoryId === 'auras') {
        itemsToUnequip = userData.auras || [];
        customIdPrefix = `gerenciar_auras_removeaura`;
    } else {
        const equippedInCategory = userData.equipped?.[categoryId] || {};
        // Convert object to array for menu
        itemsToUnequip = Object.keys(equippedInCategory).map(key => ({
            id: equippedInCategory[key].id,
            name: equippedInCategory[key].id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }));
        customIdPrefix = `gerenciar_${categoryId}_removeitem`;
    }


    if (itemsToUnequip.length === 0) {
        return interaction.reply({ content: `Você não tem nenhum item para desequipar em \`${categoryId}\`.`, ephemeral: true });
    }
    
    // Handle both array of strings (gamepasses, auras) and array of objects
    const options = itemsToUnequip.slice(0, 25).map(item => ({
        label: typeof item === 'string' ? item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : item.name,
        value: typeof item === 'string' ? item : item.id,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(customIdPrefix)
        .setPlaceholder(`Selecione um item para desequipar`)
        .addOptions(options);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ content: `Escolha o item para desequipar:`, components: [row], ephemeral: true });
}

async function handleSelectGamepassAction(interaction, categoryId) {
    const gamepassId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    try {
        await updateDoc(userRef, {
            gamepasses: arrayUnion(gamepassId)
        });
        await interaction.update({ content: `Gamepass \`${gamepassId}\` equipada com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao equipar gamepass:", error);
        await interaction.update({ content: 'Ocorreu um erro ao salvar sua gamepass.', components: [] });
    }
}

async function handleRemoveGamepassAction(interaction, categoryId) {
    const gamepassId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    try {
        await updateDoc(userRef, {
            gamepasses: arrayRemove(gamepassId)
        });
        await interaction.update({ content: `Gamepass \`${gamepassId}\` desequipada com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao desequipar gamepass:", error);
        await interaction.update({ content: 'Ocorreu um erro ao remover sua gamepass.', components: [] });
    }
}

async function handleSelectAuraAction(interaction, categoryId) {
    const auraId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    try {
        await updateDoc(userRef, {
            auras: arrayUnion(auraId)
        });
        await interaction.update({ content: `Aura \`${auraId}\` equipada com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao equipar aura:", error);
        await interaction.update({ content: 'Ocorreu um erro ao salvar sua aura.', components: [] });
    }
}

async function handleRemoveAuraAction(interaction, categoryId) {
    const auraId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    try {
        await updateDoc(userRef, {
            auras: arrayRemove(auraId)
        });
        await interaction.update({ content: `Aura \`${auraId}\` desequipada com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao desequipar aura:", error);
        await interaction.update({ content: 'Ocorreu um erro ao remover sua aura.', components: [] });
    }
}

async function handleEditAction(interaction, categoryId) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return interaction.reply({ content: "Você não tem um perfil. Use `/iniciar-perfil` primeiro.", ephemeral: true });
    }

    const userData = userSnap.data();
    const equippedItems = userData.equipped?.[categoryId];

    if (!equippedItems || Object.keys(equippedItems).length === 0) {
        return interaction.reply({ content: `Você não tem nenhum item equipado na categoria \`${categoryId}\`.`, ephemeral: true });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`gerenciar_${categoryId}_selectweaponedit`)
        .setPlaceholder('Selecione um item para editar')
        .addOptions(
            Object.values(equippedItems).map(item => ({
                label: item.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: item.id,
            }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: `Escolha o item de \`${categoryId}\` que deseja editar:`,
        components: [row],
        ephemeral: true
    });
}

function findWeaponType(weaponId) {
    const allArticles = allWikiArticles.filter(a => a.id.includes('swords') || a.id.includes('scythes'));
    for (const article of allArticles) {
        for (const table of Object.values(article.tables || {})) {
            const foundWeapon = table.rows.find(row => row.name.toLowerCase().replace(/ \(.+\)/, '').replace(/ /g, '-') === weaponId);
            if (foundWeapon) {
                return foundWeapon.type; // 'damage', 'energy', or 'scythe'
            }
        }
    }
    return null;
}


async function handleSelectWeaponForEdit(interaction, categoryId, weaponId) {
    // This is a menu selection, so we use interaction.values[0]
    const selectedWeaponId = interaction.values[0];

    if (categoryId !== 'armas') {
        // Fallback for other categories (future implementation)
        return interaction.update({ content: 'Edição para esta categoria ainda não implementada.', components: [] });
    }

    const weaponType = findWeaponType(selectedWeaponId);

    if (!weaponType) {
        return interaction.update({ content: `Não foi possível determinar o tipo da arma \`${selectedWeaponId}\`.`, components: [] });
    }

    let options = [];
    if (weaponType === 'energy') {
        options = [{ label: 'Envolver (Evoluir)', value: 'envolver' }];
    } else if (weaponType === 'damage') {
        options = [
            { label: 'Envolver (Evoluir)', value: 'envolver' },
            { label: 'Stone (Runa)', value: 'stone' },
            { label: 'Breathing (Respiração)', value: 'breathing' }
        ];
    } else if (weaponType === 'scythe') {
        options = [
            { label: 'Envolver (Evoluir)', value: 'envolver' },
            { label: 'Passiva', value: 'passiva' }
        ];
    } else {
        return interaction.update({ content: 'Tipo de arma desconhecido.', components: [] });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`gerenciar_armas_edittype_${selectedWeaponId}`)
        .setPlaceholder('O que você quer editar?')
        .addOptions(
             options.map(opt => ({
                label: opt.label,
                value: opt.value
             }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.update({
        content: `Você selecionou \`${selectedWeaponId.replace(/-/g, ' ')}\`. O que você deseja editar?`,
        components: [row]
    });
}

async function handleWeaponEditType(interaction, weaponId, editType) {
    const selectedEditType = interaction.values[0];
    let menuBuilder;

    if (selectedEditType === 'envolver') {
        menuBuilder = new StringSelectMenuBuilder()
            .setCustomId(`gerenciar_armas_setstar_${weaponId}`)
            .setPlaceholder('Selecione o nível da estrela')
            .addOptions([
                { label: '⭐ 1 Estrela', value: '1' },
                { label: '⭐⭐ 2 Estrelas', value: '2' },
                { label: '⭐⭐⭐ 3 Estrelas', value: '3' },
            ]);
    } else if (selectedEditType === 'breathing' || selectedEditType === 'stone' || selectedEditType === 'passiva') {
         const enchantments = ENCHANTMENTS[selectedEditType];
         menuBuilder = new StringSelectMenuBuilder()
            .setCustomId(`gerenciar_armas_setenchant_${weaponId}_${selectedEditType}`)
            .setPlaceholder(`Selecione o encantamento de ${selectedEditType}`)
            .addOptions(
                enchantments.map(ench => ({
                    label: ench.name,
                    value: ench.id
                }))
            );
    } else {
        return interaction.update({ content: 'Ação de edição inválida.', components: [] });
    }

    const row = new ActionRowBuilder().addComponents(menuBuilder);
    await interaction.update({
        content: `Editando ${selectedEditType.charAt(0).toUpperCase() + selectedEditType.slice(1)} para a arma \`${weaponId.replace(/-/g, ' ')}\`:`,
        components: [row]
    });
}

async function handleSetStarLevel(interaction, weaponId, starLevel) {
    const selectedStarLevel = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    const weaponPath = `equipped.armas.${weaponId.replace(/-/g, '_')}.evolutionLevel`;
    
    try {
        await updateDoc(userRef, { [weaponPath]: parseInt(selectedStarLevel, 10) }, { merge: true });
        await interaction.update({ content: `Arma \`${weaponId.replace(/-/g, ' ')}\` envolvida para ${selectedStarLevel} estrela(s) com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao atualizar o nível da estrela:", error);
        await interaction.update({ content: 'Ocorreu um erro ao salvar a evolução da sua arma.', components: [] });
    }
}

async function handleSetEnchantment(interaction, weaponId, enchantType, enchantId) {
    const selectedEnchantId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    const enchantName = ENCHANTMENTS[enchantType].find(e => e.id === selectedEnchantId)?.name || selectedEnchantId;

    const enchantFieldMap = {
        breathing: 'breathingEnchantment',
        stone: 'stoneEnchantment',
        passiva: 'passiveEnchantment'
    };

    const fieldToUpdate = enchantFieldMap[enchantType];
    if (!fieldToUpdate) {
        return interaction.update({ content: 'Tipo de encantamento inválido.', components: [] });
    }

    const weaponPath = `equipped.armas.${weaponId.replace(/-/g, '_')}.${fieldToUpdate}`;

    try {
        await updateDoc(userRef, { [weaponPath]: selectedEnchantId }, { merge: true });
        await interaction.update({ content: `Encantamento \`${enchantName}\` aplicado à arma \`${weaponId.replace(/-/g, ' ')}\` com sucesso!`, components: [] });
    } catch (error) {
        console.error("Erro ao definir encantamento:", error);
        await interaction.update({ content: 'Ocorreu um erro ao salvar o encantamento da sua arma.', components: [] });
    }
}


export { handleInteraction };
