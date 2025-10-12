export const world19Data = {
    name: 'World 19',
    npcs: [
      { id: 'world19-e-rank', name: 'E Rank NPC', rank: 'E', exp: 2551239 },
      { id: 'world19-d-rank', name: 'D Rank NPC', rank: 'D', exp: 2806363 },
      { id: 'world19-c-rank', name: 'C Rank NPC', rank: 'C', exp: 3086999 },
      { id: 'world19-b-rank', name: 'B Rank NPC', rank: 'B', exp: 3395699 },
      { id: 'world19-a-rank', name: 'A Rank NPC', rank: 'A', exp: 3735269 },
      { id: 'world19-s-rank', name: 'S Rank NPC', rank: 'S', exp: 4108796 },
      { id: 'hero-of-hell-boss', name: 'Hero of Hell', rank: 'SS', exp: 5135995, drops: [] },
      { id: 'leonardo-boss', name: 'Leonardo', rank: 'SS', exp: 5135995, drops: ['Aura do Capitão de Fogo', 'Shadow'] },
      { id: 'bansho-boss', name: 'Bansho', rank: 'SSS', exp: 6419993, drops: [] },
    ],
    shadows: [
        {
            id: 'leonardo-shadow',
            name: 'Leonardo',
            type: 'Energy',
            stats: [
                {
                    rank: 'Rank SS',
                    rarity: 'Phantom',
                    bonus: '30.8% Energy',
                },
                {
                    rank: 'Rank SSS',
                    rarity: 'Supremo',
                    bonus: '33% Energy',
                }
            ]
        }
    ]
};
