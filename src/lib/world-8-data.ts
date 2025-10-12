export const world8Data = {
    name: 'World 8',
    npcs: [
        { id: 'world8-e-rank', name: 'E Rank NPC', rank: 'E', exp: 483 },
        { id: 'world8-d-rank', name: 'D Rank NPC', rank: 'D', exp: 531 },
        { id: 'world8-c-rank', name: 'C Rank NPC', rank: 'C', exp: 584 },
        { id: 'world8-b-rank', name: 'B Rank NPC', rank: 'B', exp: 643 },
        { id: 'world8-a-rank', name: 'A Rank NPC', rank: 'A', exp: 707 },
        { id: 'world8-s-rank', name: 'S Rank NPC', rank: 'S', exp: 777 },
        { id: 'itechi-boss', name: 'Itechi', rank: 'SS', exp: 1920, drops: ['Aura da Folha', 'Akatsuki Cloak', 'Shadow'] },
        { id: 'madera-boss', name: 'Madera', rank: 'SS', exp: 2880, drops: ['Aura da Folha', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'madara-shadow',
            name: 'Madara',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '11.2% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '12% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    