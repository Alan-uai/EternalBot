// src/utils/raid-data.js
import { allWikiArticles } from '../data/wiki-data.js';

// Lista de raids que são estritamente solo e não devem aparecer em LFG
const SOLO_RAID_VALUES = [
    'gleam_raid',
    'raid_sins',
    'mundo_raid',
    'halloween_raid', // A raid de 1000 waves
    'tournament_raid', // A dungeon de 550 salas do Mundo 1
];

function getCategoryForWorld(worldId) {
    if (worldId === 'halloween') {
        return 'event';
    }
    const worldNum = parseInt(worldId, 10);
    if (worldNum >= 20) {
        return 'w20plus';
    }
    return 'w1-19';
}

export function getAvailableRaids() {
    const allRaidsMap = new Map();

    // Itera sobre todos os arquivos de dados (mundos e artigos)
    for (const article of allWikiArticles) {
        // Verifica se o artigo tem uma seção 'dungeons' ou 'raids'
        const dungeons = article.dungeons || article.raids;
        if (Array.isArray(dungeons)) {
            dungeons.forEach(dungeon => {
                const raidValue = dungeon.name.toLowerCase().replace(/ /g, '_');

                // Pula se for uma raid solo
                if (SOLO_RAID_VALUES.includes(raidValue)) {
                    return;
                }

                // Adiciona ao mapa se não existir, evitando duplicatas
                if (!allRaidsMap.has(raidValue)) {
                    allRaidsMap.set(raidValue, {
                        label: dungeon.name,
                        value: raidValue,
                        category: getCategoryForWorld(article.id.replace('world-', '')),
                    });
                }
            });
        }
    }
    
    // Adiciona raids que podem não estar nos arquivos de mundo (ex: lobby)
    const lobbyRaids = [
        { label: 'Easy', value: 'easy', category: 'w1-19' },
        { label: 'Medium', value: 'medium', category: 'w1-19' },
        { label: 'Hard', value: 'hard', category: 'w1-19' },
        { label: 'Insane', value: 'insane', category: 'w1-19' },
        { label: 'Crazy', value: 'crazy', category: 'w1-19' },
        { label: 'Nightmare', value: 'nightmare', category: 'w1-19' },
        { label: 'Leaf Raid', value: 'leaf_raid', category: 'w1-19' },
        { label: 'Restaurant Raid', value: 'restaurant_raid', category: 'w1-19' },
        { label: 'Cursed Raid', value: 'cursed_raid', category: 'w1-19' },
        { label: 'Progression Raid', value: 'progression_raid', category: 'w1-19' },
        { label: 'Progression 2', value: 'progression_2', category: 'w20plus' },
        { label: 'Ghoul Raid', value: 'ghoul_raid', category: 'w1-19' },
        { label: 'Green Planet Raid', value: 'green_planet_raid', category: 'w20plus' },
        { label: 'Hollow Raid', value: 'hollow_raid', category: 'w20plus' },
        { label: 'Tomb Raid', value: 'tomb_raid', category: 'w20plus' },
        { label: 'Adventure Raid', value: 'adventure_raid', category: 'w20plus' },
        { label: 'Mazel Raid', value: 'mazel_raid', category: 'w20plus' },
    ];
    
    lobbyRaids.forEach(raid => {
         if (!SOLO_RAID_VALUES.includes(raid.value) && !allRaidsMap.has(raid.value)) {
            allRaidsMap.set(raid.value, raid);
        }
    });


    const allRaids = Array.from(allRaidsMap.values());

    // Categoriza a lista final
    const categorizedRaids = {
        'w1-19': allRaids.filter(r => r.category === 'w1-19'),
        'w20plus': allRaids.filter(r => r.category === 'w20plus'),
        'event': allRaids.filter(r => r.category === 'event'),
    };
    
    // Ordena as raids dentro de cada categoria alfabeticamente
    for (const category in categorizedRaids) {
        categorizedRaids[category].sort((a, b) => a.label.localeCompare(b.label));
    }

    return categorizedRaids;
}
