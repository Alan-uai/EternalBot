
export const damageSwordsArticle = {
  id: 'damage-swords',
  title: 'Espadas de Dano (Evolução)',
  summary: 'Um guia para as espadas de dano, seus multiplicadores, custos e locais de evolução (estrela).',
  content: `Espadas de dano aumentam seu poder de ataque e são obtidas inicialmente no gacha do **Mundo 2**. A cada evolução (nível de estrela), o multiplicador de dano aumenta significativamente.

### Evolução (Estrelas)
- **Evolução 1★:** Acontece no **Mundo 4**.
- **Evolução 2★ e 3★:** Acontecem no **Mundo 5**.

### Encantamentos (Breathings)
Para maximizar ainda mais o dano, as espadas podem ser aprimoradas com encantamentos como **Respirações (Breathings)**, que também possuem suas próprias raridades e bônus. Para roletar um encantamento:
1. Desequipe a arma que você deseja encantar e selecione-a na interface de encantamento.
2. Clique em "Roll" para tentar uma vez ou use o "Auto Roll" para tentar obter uma respiração específica.
3. Se não conseguir roletar, verifique se selecionou uma raridade que você pode obter.

**Nota Especial sobre a Golden Venom Strike:** A Golden Venom Strike foi uma espada de evento da atualização 17, que saiu na atualização 18 e não está mais disponível para obtenção. Ela era adquirida no Mundo 2 ao trocar uma Venomstrike de 3 estrelas (Phantom) por ela. A Golden Venom Strike possui um multiplicador de dano base de 38x e não possui estrelas ou passivas.`,
  tags: ['espadas', 'dano', 'arma', 'guia', 'geral', 'evolução', 'golden venom', 'respiração', 'runa', 'breathing'],
  imageUrl: 'wiki-9',
  tables: {
    damageSwords: {
      headers: ['name', 'rarity', 'type', 'probability', 'base_damage', 'one_star_damage', 'two_star_damage', 'three_star_damage'],
      rows: [
        { name: 'Bloodthorn', rarity: 'Comum', type: 'damage', probability: '40.53%', base_damage: '0.25x', one_star_damage: '0.5x', two_star_damage: '0.75x', three_star_damage: '1.25x' },
        { name: 'Eclipse Warden', rarity: 'Incomum', type: 'damage', probability: '33%', base_damage: '0.45x', one_star_damage: '0.9x', two_star_damage: '1.35x', three_star_damage: '2.25x' },
        { name: 'Obsidian Reaver', rarity: 'Raro', type: 'damage', probability: '19.9%', base_damage: '0.75x', one_star_damage: '1.5x', two_star_damage: '2.25x', three_star_damage: '3.75x' },
        { name: 'Aquarius Edge', rarity: 'Épico', type: 'damage', probability: '5%', base_damage: '1x', one_star_damage: '2x', two_star_damage: '3x', three_star_damage: '5x' },
        { name: 'Doomsoul', rarity: 'Lendário', type: 'damage', probability: '1%', base_damage: '1.25x', one_star_damage: '2.5x', two_star_damage: '3.75x', three_star_damage: '6.25x' },
        { name: 'Redmourne', rarity: 'Mítico', type: 'damage', probability: '0.5%', base_damage: '1.5x', one_star_damage: '3x', two_star_damage: '4.5x', three_star_damage: '7.5x' },
        { name: 'Venomstrike', rarity: 'Phantom', type: 'damage', probability: '0.075%', base_damage: '2x', one_star_damage: '4x', two_star_damage: '6x', three_star_damage: '10x' },
        { name: 'Golden Venom Strike', rarity: 'Evento', type: 'damage', probability: 'N/A', base_damage: '38x', one_star_damage: '38x', two_star_damage: '38x', three_star_damage: '38x' },
      ],
    },
    evolutionCosts: {
        headers: ['Evolução', 'Custo em Moedas', 'Custo em Cristais'],
        rows: [
            { 'Evolução': '1★', 'Custo em Moedas': '1B', 'Custo em Cristais': '1' },
            { 'Evolução': '2★', 'Custo em Moedas': '5B', 'Custo em Cristais': '3' },
            { 'Evolução': '3★', 'Custo em Moedas': '10B', 'Custo em Cristais': '5' },
        ]
    },
    breathingEnchantments: {
      headers: ['Encantamento', 'Raridade', 'Bônus de Dano', 'Chance'],
      rows: [
        { 'Encantamento': 'Flower Breathing', 'Raridade': 'Comum', 'Bônus de Dano': '+5%', 'Chance': '40.55%' },
        { 'Encantamento': 'Stone Breathing', 'Raridade': 'Incomum', 'Bônus de Dano': '+15%', 'Chance': '33%' },
        { 'Encantamento': 'Wind Breathing', 'Raridade': 'Raro', 'Bônus de Dano': '+25%', 'Chance': '19.9%' },
        { 'Encantamento': 'Love Breathing', 'Raridade': 'Épico', 'Bônus de Dano': '+35%', 'Chance': '5%' },
        { 'Encantamento': 'Insect Breathing', 'Raridade': 'Lendário', 'Bônus de Dano': '+50%', 'Chance': '1%' },
        { 'Encantamento': 'Water Breathing', 'Raridade': 'Mítico', 'Bônus de Dano': '+65%', 'Chance': '0.5%' },
        { 'Encantamento': 'Thunder Breathing', 'Raridade': 'Phantom', 'Bônus de Dano': '+80%', 'Chance': '0.05%' },
      ]
    }
  },
};
