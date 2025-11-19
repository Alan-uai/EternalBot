
export const runesGuideArticle = {
  id: 'runes-guide',
  title: 'Guia de Runas',
  summary: 'Um guia completo sobre o sistema de Runas, seus bônus de status e onde obtê-las nas dungeons do Lobby 2.',
  content: `As Runas são um novo sistema de upgrade que concede bônus permanentes para Energia, Dano, Moedas e Sorte. Elas são obtidas nas novas dungeons do Lobby 2.

### Onde Obter Runas
- **Runa I:** Obtida nas **Adventure Dungeons**.
- **Runa II:** Obtida nas **Torment Dungeons**.
- **Runa III:** Obtida no **Maze Level 1**.

As tabelas abaixo detalham os bônus para cada tier de Runa em suas respectivas raridades.`,
  tags: ['runas', 'guia', 'runes', 'lobby 2', 'adventure', 'torment', 'maze'],
  tables: {
    runeBonuses: {
      headers: ['Runa', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
      rows: [
        { Runa: 'Energy I', Common: '0.25x', Uncommon: '0.375x', Rare: '0.5x', Epic: '0.625x', Legendary: '0.75x', Mythic: '0.875x', Phantom: '1.25x', Supreme: '1.875x' },
        { Runa: 'Damage I', Common: '0.25x', Uncommon: '0.375x', Rare: '0.5x', Epic: '0.625x', Legendary: '0.75x', Mythic: '0.875x', Phantom: '1.25x', Supreme: '1.875x' },
        { Runa: 'Coin I', Common: '0.1x', Uncommon: '0.15x', Rare: '0.2x', Epic: '0.25x', Legendary: '0.3x', Mythic: '0.35x', Phantom: '0.5x', Supreme: '0.75x' },
        { Runa: 'Luck I', Common: '0.01x', Uncommon: '0.015x', Rare: '0.02x', Epic: '0.025x', Legendary: '0.03x', Mythic: '0.035x', Phantom: '0.05x', Supreme: '0.075x' },
      ]
    },
    rune2Bonuses: {
      headers: ['Runa', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
      rows: [
        { Runa: 'Energy II', Common: '0.5x', Uncommon: '0.75x', Rare: '1x', Epic: '1.25x', Legendary: '1.5x', Mythic: '1.75x', Phantom: '2.5x', Supreme: '3.75x' },
        { Runa: 'Damage II', Common: '0.5x', Uncommon: '0.75x', Rare: '1x', Epic: '1.25x', Legendary: '1.5x', Mythic: '1.75x', Phantom: '2.5x', Supreme: '3.75x' },
        { Runa: 'Coin II', Common: '0.2x', Uncommon: '0.3x', Rare: '0.4x', Epic: '0.5x', Legendary: '0.6x', Mythic: '0.7x', Phantom: '1x', Supreme: '1.5x' },
        { Runa: 'Luck II', Common: '0.02x', Uncommon: '0.03x', Rare: '0.04x', Epic: '0.05x', Legendary: '0.06x', Mythic: '0.07x', Phantom: '0.1x', Supreme: '0.15x' },
      ]
    }
  }
};
