export const world14Data = {
    name: 'World 14',
    npcs: [
        { id: 'world14-e-rank', name: 'E Rank NPC', rank: 'E', exp: 77158 },
        { id: 'world14-d-rank', name: 'D Rank NPC', rank: 'D', exp: 84873 },
        { id: 'world14-c-rank', name: 'C Rank NPC', rank: 'C', exp: 93361 },
        { id: 'world14-b-rank', name: 'B Rank NPC', rank: 'B', exp: 102697 },
        { id: 'world14-a-rank', name: 'A Rank NPC', rank: 'A', exp: 112966 },
        { id: 'world14-s-rank', name: 'S Rank NPC', rank: 'S', exp: 124263 },
        { id: 'valzora-boss', name: 'Valzora', rank: 'SS', exp: 184320, drops: ['Shadow'] },
    ],
    shadows: [
        {
            id: 'valzora-shadow',
            name: 'Valzora',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '22.4% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '24% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    