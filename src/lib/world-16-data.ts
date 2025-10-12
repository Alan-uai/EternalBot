export const world16Data = {
    name: 'World 16',
    powers: [
        {
            id: 'stands',
            name: 'Stands',
            type: 'gacha',
            unlockCost: '900Qn',
            statType: 'energy'
        }
    ],
    npcs: [
        { id: 'world16-e-rank', name: 'E Rank NPC', rank: 'E', exp: 312698 },
        { id: 'world16-d-rank', name: 'D Rank NPC', rank: 'D', exp: 343968 },
        { id: 'world16-c-rank', name: 'C Rank NPC', rank: 'C', exp: 378365 },
        { id: 'world16-b-rank', name: 'B Rank NPC', rank: 'B', exp: 416201 },
        { id: 'world16-a-rank', name: 'A Rank NPC', rank: 'A', exp: 457821 },
        { id: 'world16-s-rank', name: 'S Rank NPC', rank: 'S', exp: 503603 },
        { id: 'dio-boss', name: 'Dio', rank: 'SS', exp: 737280, drops: ['Aura de Hamon', 'Shadow'] },
    ],
    shadows: [
        {
            id: 'dio-shadow',
            name: 'Dio',
            type: 'Damage',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '26.6% Damage',
                    cooldown: '2s',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '28.5% Damage',
                    cooldown: '2s',
                }
            ]
        }
    ]
};

    