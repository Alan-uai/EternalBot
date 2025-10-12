export const world9Data = {
    name: 'World 9',
    npcs: [
        { id: 'world9-e-rank', name: 'E Rank NPC', rank: 'E', exp: 972 },
        { id: 'world9-d-rank', name: 'D Rank NPC', rank: 'D', exp: 1215 },
        { id: 'world9-c-rank', name: 'C Rank NPC', rank: 'C', exp: 1518 },
        { id: 'world9-b-rank', name: 'B Rank NPC', rank: 'B', exp: 1898 },
        { id: 'world9-a-rank', name: 'A Rank NPC', rank: 'A', exp: 2373 },
        { id: 'world9-s-rank', name: 'S Rank NPC', rank: 'S', exp: 3915 },
        { id: 'ken-turbo-boss', name: 'Ken Turbo', rank: 'SS', exp: 5760, drops: ['Aura Energética', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'ken-turbo-shadow',
            name: 'Ken Turbo',
            type: 'Energy',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '11.2% Energy',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '12% Energy',
                }
            ]
        }
    ]
};

    