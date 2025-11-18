// src/utils/raid-data.js
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../data/wiki-articles/raid-requirements.js';

// Mapeamento de nomes de raids para suas categorias, se precisarem de uma específica.
const RAID_CATEGORY_MAP = {
    'Gleam Raid': 'w1-19',
    'Raid Sins': 'w1-19',
    'Mundo Raid': 'w20plus',
    'Halloween Raid': 'event',
    'Graveyard Defense': 'event',
    // Adicione outros mapeamentos se necessário.
};

// Heurística para determinar categoria com base no nome da raid, se não estiver no mapa.
function getCategoryForRaid(raidName) {
    if (raidName.toLowerCase().includes('hollow') || raidName.toLowerCase().includes('torment')) {
        return 'w20plus';
    }
    return 'w1-19'; // Categoria padrão
}


export function getAvailableRaids() {
    // 1. Raids do Lobby Principal
    const lobbyRaids = lobbyDungeonsArticle.tables.lobbySchedule.rows.map(raid => ({
        label: raid.Dificuldade,
        value: raid.Dificuldade.toLowerCase().replace(/ /g, '_'),
        category: 'w1-19'
    }));

    // 2. Raids do artigo de requisitos
    const requirementRaids = raidRequirementsArticle.tables.requirements.headers
        .filter(header => header !== 'Wave') // Exclui a coluna 'Wave'
        .map(raidName => ({
            label: raidName,
            value: raidName.toLowerCase().replace(/ /g, '_'),
            category: RAID_CATEGORY_MAP[raidName] || getCategoryForRaid(raidName)
        }));

    // 3. Novas Raids do Lobby 2 (como solicitado)
    const newLobby2Raids = [
        { label: 'Adventure Raid', value: 'adventure_raid', category: 'w20plus' },
        { label: 'Mazel Raid', value: 'mazel_raid', category: 'w20plus' },
    ];
    
    // Combina todas as fontes e remove duplicatas
    const allRaidsMap = new Map();
    [...lobbyRaids, ...requirementRaids, ...newLobby2Raids].forEach(raid => {
        if (!allRaidsMap.has(raid.value)) { // Evita duplicatas pelo 'value'
            allRaidsMap.set(raid.value, raid);
        }
    });

    const allRaids = Array.from(allRaidsMap.values());
    
    // Categoriza a lista final
    const categorizedRaids = {
        'w1-19': allRaids.filter(r => r.category === 'w1-19'),
        'w20plus': allRaids.filter(r => r.category === 'w20plus'),
        'event': allRaids.filter(r => r.category === 'event')
    };

    return categorizedRaids;
}
