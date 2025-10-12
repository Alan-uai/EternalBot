export const world10Data = {
    name: 'World 10',
    npcs: [
        { id: 'world10-e-rank', name: 'E Rank NPC', rank: 'E', exp: 4893 },
        { id: 'world10-d-rank', name: 'D Rank NPC', rank: 'D', exp: 5383 },
        { id: 'world10-c-rank', name: 'C Rank NPC', rank: 'C', exp: 5921 },
        { id: 'world10-b-rank', name: 'B Rank NPC', rank: 'B', exp: 6513 },
        { id: 'world10-a-rank', name: 'A Rank NPC', rank: 'A', exp: 7164 },
        { id: 'world10-s-rank', name: 'S Rank NPC', rank: 'S', exp: 7881 },
        { id: 'killas-godspeed-boss', name: 'Killas Godspeed', rank: 'SS', exp: 11520, drops: ['Hunter License', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'killas-godspeed-shadow',
            name: 'Killas Godspeed',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '15.4% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '16.5% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    