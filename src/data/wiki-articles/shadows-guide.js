
export const shadowsGuideArticle = {
  id: 'shadows-guide',
  title: 'Guia de Bônus de Shadows (Dano e Energia)',
  summary: 'Um guia completo com todos os bônus de dano e energia das Shadows, por mundo e por raridade, tanto no nível base quanto no nível 100, e os encantamentos de velocidade.',
  content: `Shadows são lutadores poderosos que fornecem um bônus percentual ao seu dano ou energia. Este guia detalha os bônus para cada tipo, raridade e mundo disponível.

### Leveling de Shadows (Mundo 6)
No **Mundo 6**, você pode aumentar o nível de suas Shadows.
- **Custo:** 10 Shadow Souls por nível.
- **Taxa de Sucesso:** 100% (garantido).
- **Nível Máximo:** 100.
Levar uma Shadow ao nível 100 aumenta significativamente seu bônus de status, como mostrado nas tabelas abaixo.

### Encantamentos de Velocidade (Apenas para Shadows de Dano)
No Mundo 6, é possível roletar encantamentos para as **Shadows de Dano**, que aumentam sua velocidade de ataque.
- **Custo:** 10 Shadow Souls por tentativa.
- **Como Funciona:** Apenas as Shadows do tipo "Dano" podem receber este upgrade. O encantamento recebido é baseado em sorte, com diferentes raridades e bônus.`,
  tags: ['shadows', 'energia', 'dano', 'guia', 'bônus', 'nível 100', 'leveling', 'enchantment', 'encantamento', 'attack speed'],
  tables: {
    enchantments: {
      headers: ['Encantamento', 'Bônus de Velocidade', 'Chance'],
      rows: [
        { Encantamento: 'Shadeborn', 'Bônus de Velocidade': '+2.5%', Chance: '40.45%' },
        { Encantamento: 'Umbraling', 'Bônus de Velocidade': '+5%', Chance: '33%' },
        { Encantamento: 'Wraithguard', 'Bônus de Velocidade': '+10%', Chance: '19.9%' },
        { Encantamento: 'Graveknight', 'Bônus de Velocidade': '+15%', Chance: '5%' },
        { Encantamento: 'Dreadlord', 'Bônus de Velocidade': '+20%', Chance: '1%' },
        { Encantamento: 'Abyssal General', 'Bônus de Velocidade': '+30%', Chance: '0.5%' },
        { Encantamento: 'Death Sovereign', 'Bônus de Velocidade': '+40%', Chance: '0.1%' },
        { Encantamento: 'Eternal Shadow', 'Bônus de Velocidade': '+50%', Chance: '0.05%' }
      ]
    },
    damageShadows: {
      headers: ['World', 'Level', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
      rows: [
        { World: 6, Level: 'Base', Common: '5%', Uncommon: '5.25%', Rare: '5.5%', Epic: '5.75%', Legendary: '6.25%', Mythic: '6.5%', Phantom: '7%', Supreme: '7.5%' },
        { World: 6, Level: 100, Common: '15%', Uncommon: '15.75%', Rare: '16.5%', Epic: '17.25%', Legendary: '18.75%', Mythic: '19.5%', Phantom: '21%', Supreme: '22.5%' },
        { World: 8, Level: 'Base', Common: '8%', Uncommon: '8.4%', Rare: '8.8%', Epic: '9.2%', Legendary: '10%', Mythic: '10.4%', Phantom: '11.2%', Supreme: '12%' },
        { World: 8, Level: 100, Common: '24%', Uncommon: '25.2%', Rare: '26.4%', Epic: '27.6%', Legendary: '30%', Mythic: '31.2%', Phantom: '33.6%', Supreme: '36%' },
        { World: 10, Level: 'Base', Common: '11%', Uncommon: '11.55%', Rare: '12.1%', Epic: '12.65%', Legendary: '13.75%', Mythic: '14.3%', Phantom: '15.4%', Supreme: '16.5%' },
        { World: 10, Level: 100, Common: '33%', Uncommon: '34.65%', Rare: '36.3%', Epic: '37.95%', Legendary: '41.25%', Mythic: '42.9%', Phantom: '46.2%', Supreme: '49.5%' },
        { World: 12, Level: 'Base', Common: '14%', Uncommon: '14.7%', Rare: '15.4%', Epic: '16.1%', Legendary: '17.5%', Mythic: '18.2%', Phantom: '19.6%', Supreme: '21%' },
        { World: 12, Level: 100, Common: '42%', Uncommon: '44.1%', Rare: '46.2%', Epic: '48.3%', Legendary: '52.5%', Mythic: '54.6%', Phantom: '58.8%', Supreme: '63%' },
        { World: 14, Level: 'Base', Common: '16%', Uncommon: '16.8%', Rare: '17.6%', Epic: '18.4%', Legendary: '20%', Mythic: '20.8%', Phantom: '22.4%', Supreme: '24%' },
        { World: 14, Level: 100, Common: '48%', Uncommon: '50.4%', Rare: '52.8%', Epic: '55.2%', Legendary: '60%', Mythic: '62.4%', Phantom: '67.2%', Supreme: '72%' },
        { World: 16, Level: 'Base', Common: '19%', Uncommon: '19.95%', Rare: '20.9%', Epic: '21.85%', Legendary: '23.75%', Mythic: '24.7%', Phantom: '26.6%', Supreme: '28.5%' },
        { World: 16, Level: 100, Common: '57%', Uncommon: '59.85%', Rare: '62.7%', Epic: '65.55%', Legendary: '71.25%', Mythic: '74.1%', Phantom: '79.8%', Supreme: '85.5%' },
        { World: 18, Level: 'Base', Common: '22%', Uncommon: '23.1%', Rare: '24.2%', Epic: '25.3%', Legendary: '27.5%', Mythic: '28.6%', Phantom: '30.8%', Supreme: '33%' },
        { World: 18, Level: 100, Common: '66%', Uncommon: '69.3%', Rare: '72.6%', Epic: '75.9%', Legendary: '82.5%', Mythic: '85.8%', Phantom: '92.4%', Supreme: '99%' },
        { World: 20, Level: 'Base', Common: '25%', Uncommon: '26.25%', Rare: '27.5%', Epic: '28.75%', Legendary: '31.25%', Mythic: '32.5%', Phantom: '35%', Supreme: '37.5%' },
        { World: 20, Level: 100, Common: '75%', Uncommon: '78.75%', Rare: '82.5%', Epic: '86.25%', Legendary: '93.75%', Mythic: '97.5%', Phantom: '105%', Supreme: '112.5%' },
        { World: 22, Level: 'Base', Common: '28%', Uncommon: '29.4%', Rare: '30.8%', Epic: '32.2%', Legendary: '35%', Mythic: '36.4%', Phantom: '39.2%', Supreme: '42%' },
        { World: 22, Level: 100, Common: '84%', Uncommon: '88.2%', Rare: '92.4%', Epic: '96.6%', Legendary: '105%', Mythic: '109.2%', Phantom: '117.6%', Supreme: '126%' },
        { World: 24, Level: 'Base', Common: '31%', Uncommon: '32.5%', Rare: '34.1%', Epic: '35.6%', Legendary: '38.7%', Mythic: '40.3%', Phantom: '43.4%', Supreme: '46.5%' },
        { World: 24, Level: 100, Common: '93%', Uncommon: '97.5%', Rare: '102%', Epic: '106%', Legendary: '116%', Mythic: '120%', Phantom: '130%', Supreme: '139%' },
        { World: 26, Level: 'Base', Common: '32%', Uncommon: '33.6%', Rare: '35.2%', Epic: '36.8%', Legendary: '40%', Mythic: '41.6%', Phantom: '44.8%', Supreme: '48%' },
        { World: 26, Level: 100, Common: '96%', Uncommon: '100%', Rare: '105%', Epic: '110%', Legendary: '120%', Mythic: '124.80%', Phantom: '134%', Supreme: '144%' },
      ]
    },
    energyShadows: {
      headers: ['World', 'Level', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
      rows: [
        { World: 7, Level: 'Base', Common: '5%', Uncommon: '5.25%', Rare: '5.5%', Epic: '5.75%', Legendary: '6.25%', Mythic: '6.5%', Phantom: '7%', Supreme: '7.5%' },
        { World: 7, Level: 100, Common: '15%', Uncommon: '15.75%', Rare: '16.5%', Epic: '17.25%', Legendary: '18.75%', Mythic: '19.5%', Phantom: '21%', Supreme: '22.5%' },
        { World: 9, Level: 'Base', Common: '8%', Uncommon: '8.4%', Rare: '8.8%', Epic: '9.2%', Legendary: '10%', Mythic: '10.4%', Phantom: '11.2%', Supreme: '12%' },
        { World: 9, Level: 100, Common: '24%', Uncommon: '25.2%', Rare: '26.4%', Epic: '27.6%', Legendary: '30%', Mythic: '31.2%', Phantom: '33.6%', Supreme: '36%' },
        { World: 11, Level: 'Base', Common: '11%', Uncommon: '11.55%', Rare: '12.1%', Epic: '12.65%', Legendary: '13.75%', Mythic: '14.3%', Phantom: '15.4%', Supreme: '16.5%' },
        { World: 11, Level: 100, Common: '33%', Uncommon: '34.65%', Rare: '36.3%', Epic: '37.95%', Legendary: '41.25%', Mythic: '42.9%', Phantom: '46.2%', Supreme: '49.5%' },
        { World: 13, Level: 'Base', Common: '14%', Uncommon: '14.7%', Rare: '15.4%', Epic: '16.1%', Legendary: '17.5%', Mythic: '18.2%', Phantom: '19.6%', Supreme: '21%' },
        { World: 13, Level: 100, Common: '42%', Uncommon: '44.1%', Rare: '46.2%', Epic: '48.3%', Legendary: '52.5%', Mythic: '54.6%', Phantom: '58.8%', Supreme: '63%' },
        { World: 15, Level: 'Base', Common: '16%', Uncommon: '16.8%', Rare: '17.6%', Epic: '18.4%', Legendary: '20%', Mythic: '20.8%', Phantom: '22.4%', Supreme: '24%' },
        { World: 15, Level: 100, Common: '48%', Uncommon: '50.4%', Rare: '52.8%', Epic: '55.2%', Legendary: '60%', Mythic: '62.4%', Phantom: '67.2%', Supreme: '72%' },
        { World: 17, Level: 'Base', Common: '19%', Uncommon: '19.95%', Rare: '20.9%', Epic: '21.85%', Legendary: '23.75%', Mythic: '24.7%', Phantom: '26.6%', Supreme: '28.5%' },
        { World: 17, Level: 100, Common: '57%', Uncommon: '59.85%', Rare: '62.7%', Epic: '65.55%', Legendary: '71.25%', Mythic: '74.1%', Phantom: '79.8%', Supreme: '85.5%' },
        { World: 19, Level: 'Base', Common: '22%', Uncommon: '23.1%', Rare: '24.2%', Epic: '25.3%', Legendary: '27.5%', Mythic: '28.6%', Phantom: '30.8%', Supreme: '33%' },
        { World: 19, Level: 100, Common: '66%', uncommon: '69.3%', Rare: '72.6%', Epic: '75.9%', Legendary: '82.5%', Mythic: '85.8%', Phantom: '92.4%', Supreme: '99%' },
        { World: 21, Level: 'Base', Common: '25%', Uncommon: '26.25%', Rare: '27.5%', Epic: '28.75%', Legendary: '31.25%', Mythic: '32.5%', Phantom: '35%', Supreme: '37.5%' },
        { World: 21, Level: 100, Common: '75%', Uncommon: '78.75%', Rare: '82.5%', Epic: '86.25%', Legendary: '93.75%', Mythic: '97.5%', Phantom: '105%', Supreme: '112.5%' },
        { World: 23, Level: 'Base', Common: '28%', Uncommon: '29.4%', Rare: '30.8%', Epic: '32.2%', Legendary: '35%', Mythic: '36.4%', Phantom: '39.2%', Supreme: '42%' },
        { World: 23, Level: 100, Common: '84%', Uncommon: '88.2%', Rare: '92.4%', Epic: '96.6%', Legendary: '105%', Mythic: '109.2%', Phantom: '117.6%', Supreme: '126%' },
        { World: 25, Level: 'Base', Common: '31%', Uncommon: '32.5%', Rare: '34.1%', Epic: '35.6%', Legendary: '38.7%', Mythic: '40.3%', Phantom: '43.4%', Supreme: '46.5%' },
        { World: 25, Level: 100, Common: '93%', Uncommon: '97.5%', Rare: '102%', Epic: '106%', Legendary: '116%', Mythic: '120%', Phantom: '130%', Supreme: '139%' },
      ],
    },
  },
};
