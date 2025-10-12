export const world18Data = {
    name: 'World 18',
    npcs: [
        { id: 'world18-e-rank', name: 'E Rank NPC', rank: 'E', exp: 1267295 },
        { id: 'world18-d-rank', name: 'D Rank NPC', rank: 'D', exp: 1394024 },
        { id: 'world18-c-rank', name: 'C Rank NPC', rank: 'C', exp: 1533427 },
        { id: 'world18-b-rank', name: 'B Rank NPC', rank: 'B', exp: 1686770 },
        { id: 'world18-a-rank', name: 'A Rank NPC', rank: 'A', exp: 1855446 },
        { id: 'world18-s-rank', name: 'S Rank NPC', rank: 'S', exp: 2040991 },
        { id: 'mr-chainsaw-boss', name: 'Mr Chainsaw', rank: 'SS', exp: 2551204, drops: ['Shadow'] },
        { id: 'world18-sss-rank', name: 'SSS Rank NPC', rank: 'SSS', exp: 3189005 },
    ],
    shadows: [
        {
            id: 'mr-chainsaw-shadow',
            name: 'Mr Chainsaw',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '30.8% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '33% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};
