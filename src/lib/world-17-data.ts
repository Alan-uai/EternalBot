export const world17Data = {
    name: 'World 17',
    npcs: [
        { id: 'world17-e-rank', name: 'E Rank NPC', rank: 'E', exp: 629512 },
        { id: 'world17-d-rank', name: 'D Rank NPC', rank: 'D', exp: 692464 },
        { id: 'world17-c-rank', name: 'C Rank NPC', rank: 'C', exp: 761710 },
        { id: 'world17-b-rank', name: 'B Rank NPC', rank: 'B', exp: 837881 },
        { id: 'world17-a-rank', name: 'A Rank NPC', rank: 'A', exp: 921669 },
        { id: 'world17-s-rank', name: 'S Rank NPC', rank: 'S', exp: 1013836 },
        { id: 'arama-boss', name: 'Arama', rank: 'SS', exp: 1520754, drops: ['Aura de Ghoul', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'arama-shadow',
            name: 'Arama',
            type: 'Energy',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '26.6% Energy',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '28.5% Energy',
                }
            ]
        }
    ]
};
