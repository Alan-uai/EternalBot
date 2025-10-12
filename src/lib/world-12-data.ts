export const world12Data = {
    name: 'World 12',
    npcs: [
        { id: 'world12-e-rank', name: 'E Rank NPC', rank: 'E', exp: 19083 },
        { id: 'world12-d-rank', name: 'D Rank NPC', rank: 'D', exp: 20942 },
        { id: 'world12-c-rank', name: 'C Rank NPC', rank: 'C', exp: 23037 },
        { id: 'world12-b-rank', name: 'B Rank NPC', rank: 'B', exp: 25340 },
        { id: 'world12-a-rank', name: 'A Rank NPC', rank: 'A', exp: 27874 },
        { id: 'world12-s-rank', name: 'S Rank NPC', rank: 'S', exp: 30662 },
        { id: 'escanor-boss', name: 'Esanor', rank: 'SS', exp: 46080, drops: ['Aura Monstruosa', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'escanor-shadow',
            name: 'Escanor',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '19.6% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '21% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    