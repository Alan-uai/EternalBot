export const world7Data = {
    name: 'World 7',
    npcs: [
        { id: 'world7-e-rank', name: 'E Rank NPC', rank: 'E', exp: 240 },
        { id: 'world7-d-rank', name: 'D Rank NPC', rank: 'D', exp: 264 },
        { id: 'world7-c-rank', name: 'C Rank NPC', rank: 'C', exp: 290 },
        { id: 'world7-b-rank', name: 'B Rank NPC', rank: 'B', exp: 319 },
        { id: 'world7-a-rank', name: 'A Rank NPC', rank: 'A', exp: 351 },
        { id: 'world7-s-rank', name: 'S Rank NPC', rank: 'S', exp: 386 },
        { id: 'novi-chrone-boss', name: 'Novi Chroni', rank: 'SS', exp: 960, drops: ['Clover Pendant', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'novi-chrone-shadow',
            name: 'Novi Chrone',
            type: 'Energy',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '7% Energy',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '7.5% Energy',
                }
            ]
        }
    ]
};

    