export const world6Data = {
    name: 'World 6',
    npcs: [
        { id: 'world6-e-rank', name: 'E Rank NPC', rank: 'E', exp: 119 },
        { id: 'world6-d-rank', name: 'D Rank NPC', rank: 'D', exp: 131 },
        { id: 'world6-c-rank', name: 'C Rank NPC', rank: 'C', exp: 144 },
        { id: 'world6-b-rank', name: 'B Rank NPC', rank: 'B', exp: 159 },
        { id: 'world6-a-rank', name: 'A Rank NPC', rank: 'A', exp: 174 },
        { id: 'world6-s-rank', name: 'S Rank NPC', rank: 'S', exp: 192 },
        { id: 'statue-of-god-boss', name: 'Statue of God', rank: 'SS', exp: 480, drops: ['Aura da Estátua', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'statue-of-god-shadow',
            name: 'Statue of God',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '7% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '7.5% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    