
export const world16Data = {
  id: 'world-16',
  title: 'Mundo 16 - Ilha Bizarra',
  summary: 'Introduz os Stands, um novo tipo de lutador focado em bônus de energia, e os Shadow Upgrades.',
  npcs: [
    { name: 'Usuário de Stand', rank: 'E', exp: 1.2e12, hp: '1tsTG' },
    { name: 'Vampiro', rank: 'D', exp: 1.8e12, hp: '10tsTG' },
    { name: 'Homem do Pilar', rank: 'C', exp: 2.6e12, hp: '100tsTG' },
    { name: 'Assassino', rank: 'B', exp: 3.8e12, hp: '1qTG' },
    { name: 'Mafioso', rank: 'A', exp: 5.5e12, hp: '10qTG' },
    { name: 'Jotaro', rank: 'S', exp: 8e12, hp: '97.5NVG' },
    { name: 'Dio', rank: 'SS', exp: 1.6e13, hp: '195NVG', drops: { aura: { name: 'Aura de Hamon', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338835434307604/ScreenRecording_10-21-2025_10-58-06_1.mov?ex=68fa1318&is=68f8c198&hm=5886dcf04075eb1e8fd3d755fa80bb154d71d1277dfc162040a705339c6d1fe5&' },
  ],
  pets: [
    { name: 'Iggy', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.16x' },
    { name: 'Tartaruga', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.32x' },
    { name: 'Hierophant Green Mini', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.48x' },
  ],
  stands: [
    { name: 'Door', 'atk_spd': '1s', 'base_damage': '15.1%', 'one_star_damage': '22.7%', 'two_star_damage': '30.2%', 'three_star_damage': '45.3%' },
    { name: 'Hand', 'atk_spd': '0.9s', 'base_damage': '15.2%', 'one_star_damage': '23%', 'two_star_damage': '30.4%', 'three_star_damage': '45.6%' },
    { name: 'Zipper Man', 'atk_spd': '0.8s', 'base_damage': '15.3%', 'one_star_damage': '23.0%', 'two_star_damage': '30.6%', 'three_star_damage': '45.9%' },
    { name: 'Deadly Queen', 'atk_spd': '0.7s', 'base_damage': '15.4%', 'one_star_damage': '23%', 'two_star_damage': '30.8%', 'three_star_damage': '46.2%' },
    { name: 'Pale Snake', 'atk_spd': '0.6s', 'base_damage': '15.5%', 'one_star_damage': '23.3%', 'two_star_damage': '31%', 'three_star_damage': '46.5%' },
    { name: 'Shining Diamond', 'atk_spd': '0.5s', 'base_damage': '15.6%', 'one_star_damage': '23%', 'two_star_damage': '31.2%', 'three_star_damage': '46.8%' },
    { name: 'Platinum', 'atk_spd': '0.35s', 'base_damage': '15.7%', 'one_star_damage': '24%', 'two_star_damage': '31.4%', 'three_star_damage': '47.1%' },
    { name: 'World', 'atk_spd': '0.2s', 'base_damage': '15.8%', 'one_star_damage': '24%', 'two_star_damage': '31.6%', 'three_star_damage': '47.4%' },
  ],
  powers: [
      {
          name: 'Stands',
          type: 'gacha',
          statType: 'damage',
          unlockCost: '900Qn',
      },
      {
          name: 'Ripple Energy',
          type: 'progression',
          statType: 'energy',
          unlockCost: '5sx',
      },
      {
          name: 'Onomatopoeia',
          type: 'progression',
          statType: 'mixed',
          unlockCost: '1sx',
      },
      {
          name: 'Stand Evolve',
          type: 'progression',
          statType: 'mixed',
          unlockCost: '2sx',
      },
      {
          name: 'Stand Evolve 2',
          type: 'progression',
          statType: 'mixed',
          unlockCost: '3sx',
      },
      {
          name: 'Stand Evolve 3',
          type: 'progression',
          statType: 'mixed',
          unlockCost: '4sx',
      },
      {
          name: 'Requiem Injection',
          type: 'progression',
          statType: 'mixed',
          unlockCost: '1sx',
      },
  ],
  accessories: [
    { 
      id: 'greenello-scarf', 
      name: 'Greenello Scarf', 
      slot: 'Neck',
      world: '16', 
      npc: 'Rei Mago', 
      rank: 'S-Rank', 
      bonuses: [
        { 
          type: 'coin', 
          valuesByRarity: [
            { rarity: "Common", value: "0.5x" },
            { rarity: "Uncommon", value: "0.75x" },
            { rarity: "Rare", value: "1.x" },
            { rarity: "Epic", value: "1.25x" },
            { rarity: "Legendary", value: "1.5x" },
            { rarity: "Mythic", value: "1.75x" },
            { rarity: "Phantom", value: "2.5x" },
            { rarity: "Supreme", value: "3.75x" }
          ] 
        },
        { 
          type: 'exp', 
          valuesByRarity: [
            { rarity: "Common", value: "1%" },
            { rarity: "Uncommon", value: "1.5%" },
            { rarity: "Rare", value: "2%" },
            { rarity: "Epic", value: "2.5%" },
            { rarity: "Legendary", value: "3%" },
            { rarity: "Mythic", value: "3.5%" },
            { rarity: "Phantom", value: "5%" },
            { rarity: "Supreme", value: "7.5%" }
          ]
        }
      ]
    }
  ],
  shadowUpgrades: {
    description: "No Mundo 16, os jogadores podem comprar upgrades permanentes para suas Shadows, incluindo bônus de status, slots de inventário e gamepasses.",
    upgrades: [
      { name: "Shadow Soul", description: "Aumenta o bônus de status de todas as Shadows equipadas.", maxLevel: 16, bonusPerLevel: "+0.05x", cost: "1.5k Exchange Tokens" },
      { name: "Shadow Extra Equip", description: "Permite equipar uma Shadow adicional.", maxLevel: 1, bonusPerLevel: "+1", costType: "Gamepass" },
      { name: "Shadows Inventory Slots", description: "Aumenta o espaço do inventário para Shadows.", maxLevel: 10, cost: "1k Exchange Tokens por slot" },
      { name: "x2 Shadow Soul", description: "Dobra a quantidade de Shadow Souls recebidas.", maxLevel: 1, costType: "Gamepass", cost: "700 Credits" }
    ]
  }
};
