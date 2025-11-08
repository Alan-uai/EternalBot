
export const world25Data = {
  id: 'world-25',
  title: 'Mundo 25 - Ilha dos Mortos-Vivos',
  summary: 'Um mundo pós-apocalíptico onde os Damage Zombies foram introduzidos, junto com a evolução final da Demon Fruit.',
  content: 'Este mundo é o lar dos temíveis Damage Zombies, um novo tipo de lutador que aumenta seu poder de ataque.',
  tags: ['mundo 25', 'zumbis', 'dano', 'guia', 'demon fruit', 'supreme'],
  powers: [
    {
      name: "Supreme Fruit Crafting",
      type: "progression",
      statType: "mixed",
      description: "No Mundo 25, a Demon Fruit pode ser evoluída para sua forma Suprema. A receita é: Dough Fruit + Phoenix Fruit + 2 Zombie's Glue. A fruta suprema concede bônus de Dano, Energia e Moedas. Ela também possui um sistema de leveling (até o nível 4) que requer um recurso especial obtido ao encontrar uma fruta escondida no mapa em uma missão exclusiva.\n\n**Localização da fruta escondida:** https://cdn.discordapp.com/attachments/1383775973194993786/1433310438728142948/Roblox-2025-10-28T22_18_49.853Z.mp4?ex=690f6e9e&is=690e1d1e&hm=57a2d341f00d31a9a3544375f22275faa05b5cc8184f9691e78980a0cd241f39&",
      unlockCost: "Receita de Crafting",
      boosts: [
        { type: "damage", value: "Variável" },
        { type: "energy", value: "Variável" },
        { type: "coin", value: "Variável" },
      ],
    }
  ],
  accessories: [
    { 
      id: 'ghostling-crown', 
      name: 'Ghostling Crown', 
      slot: 'Head',
      world: '25', 
      npc: 'Desconhecido', 
      rank: 'D-Rank',
      bonuses: [
        {
          type: 'energy',
          valuesByRarity: [
            { rarity: 'Common', value: '0.133x' },
            { rarity: 'Uncommon', value: '0.2x' },
            { rarity: 'Rare', value: '0.266x' },
            { rarity: 'Epic', value: '0.333x' },
            { rarity: 'Legendary', value: '0.4x' },
            { rarity: 'Mythic', value: '0.466x' },
            { rarity: 'Phantom', value: '0.665x' },
            { rarity: 'Supreme', value: '1x' }
          ]
        },
        {
          type: 'coin',
          valuesByRarity: [
            { rarity: 'Common', value: '0.133x' },
            { rarity: 'Uncommon', value: '0.2x' },
            { rarity: 'Rare', value: '0.266x' },
            { rarity: 'Epic', value: '0.333x' },
            { rarity: 'Legendary', value: '0.4x' },
            { rarity: 'Mythic', value: '0.466x' },
            { rarity: 'Phantom', value: '0.665x' },
            { rarity: 'Supreme', value: '1x' }
          ]
        }
      ]
    }
  ],
  tables: {
    damageZombies: {
      headers: ['Name', 'Atk Spd', 'Stats'],
      rows: [
        { Name: 'Uncommon Zombie', 'Atk Spd': '2s', Stats: '250%' },
        { Name: 'Rare Zombie', 'Atk Spd': '2s', Stats: '300%' },
        { Name: 'Epic Zombie', 'Atk Spd': '2s', Stats: '350%' },
        { Name: 'Legendary Zombie', 'Atk Spd': '2s', Stats: '400%' },
        { Name: 'Mythical Zombie', 'Atk Spd': '2s', Stats: '500%' },
        { Name: 'Phantom Zombie', 'Atk Spd': '2s', Stats: '600%' },
        { Name: 'Supreme Zombie', 'Atk Spd': '2s', Stats: '700%' },
      ],
    },
  },
};

    