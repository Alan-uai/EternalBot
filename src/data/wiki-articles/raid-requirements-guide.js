
export const raidRequirementsArticle = {
  id: 'raid-requirements',
  title: 'Guia de Requisitos para Raids e Dungeons',
  summary: 'Um guia completo com os requisitos de HP e DPS, mundo, limite de jogadores e waves para as principais raids e dungeons do jogo.',
  content: `Este guia consolida a energia e o dano necessários para progredir nas principais raids e dungeons do Anime Eternal. Compreender os limites e requisitos de cada uma é essencial para uma progressão eficiente.

### Tipos de Raids
As raids podem ser divididas em algumas categorias principais com base no número de jogadores permitidos:

- **Raids Solo (1 Jogador):** Gleam Raid, Raid Sins, Mundo Raid, Halloween Raid e Tournament Raid.
- **Raids de Esquadrão (Até 4 Jogadores):** A maioria das raids de evento e de mundo, como Restaurant, Cursed e Ghoul Raid.
- **Raids Massivas (Até 99 Jogadores):** Desafios especiais como a Suffering, Torment, Kaiju e Adventure Dungeons.

### Novos Avatares de Dano
Recentemente, as raids Gleam e Mundo foram estendidas e agora recompensam os jogadores com **avatares de dano exclusivos**, os únicos do tipo no jogo.

### Cálculo de HP Exponencial para Raids
Para raids como **Titan Defense** e **Progression Raid**, o HP dos inimigos aumenta exponencialmente a cada sala. Use a seguinte fórmula para estimar o HP: \`HP(sala) = HP_inicial * (HP_final / HP_inicial)^((sala - 1) / 999)\`.
`,
  tags: ['raid', 'dungeon', 'energia', 'dps', 'hp', 'guia', 'geral', 'solo', 'esquadrão', 'massiva', 'requisitos', 'mundo', 'limite'],
  imageUrl: 'wiki-11',
  progressionFormulas: {
      titanDefense: {
          type: 'exponential',
          initialHp: 7.62e51,
          finalHp: 1.63e93,
          initialWave: 1,
          finalWave: 1000,
          description: 'O HP da Titan Defense cresce exponencialmente. Use a fórmula: HP(sala) = HP_inicial * (HP_final / HP_inicial)^((sala - 1) / 999).'
      },
      progressionRaid: {
          type: 'exponential',
          initialHp: 5.72e40,
          finalHp: 1.23e82,
          initialWave: 1,
          finalWave: 1000,
          description: 'O HP da Progression Raid cresce exponencialmente. Use a fórmula: HP(sala) = HP_inicial * (HP_final / HP_inicial)^((sala - 1) / 999).'
      }
  },
  tables: {
    damageAvatars: {
        title: "Avatares de Dano Exclusivos",
        headers: ['Origem', 'Stats', 'Obtenção'],
        rows: [
            { 'Origem': 'Gleam Raid', 'Stats': '5x', 'Obtenção': 'Alcançar a Wave 25' },
            { 'Origem': 'Mundo Raid', 'Stats': '10x', 'Obtenção': 'Alcançar a Wave 20' },
            { 'Origem': 'Chefe Mundo 26 (Tagamura)', 'Stats': '15x', 'Obtenção': 'Drop do boss Tagamura / Takemoto (SSS-Rank)' }
        ]
    },
    gleamRaid: {
      title: "Gleam Raid (Mundo 15)",
      world: "Mundo 15",
      maxWave: 10,
      playerLimit: 1,
      headers: ['Wave', 'HP', 'DPS'],
      rows: [
        { 'Wave': 1, 'HP': '12.00 - QnV', 'DPS': '500 - QtV' },
        { 'Wave': 2, 'HP': '240.00 - QnV', 'DPS': '10 - QnV' },
        { 'Wave': 3, 'HP': '4.80 - SeV', 'DPS': '170 - QnV' },
        { 'Wave': 4, 'HP': '96.00 - SeV', 'DPS': '3.5 - SeV' },
        { 'Wave': 5, 'HP': '1.92 - SpG', 'DPS': '80 - SeV' },
        { 'Wave': 6, 'HP': '38.40 - SpG', 'DPS': '1.5 - SpG' },
        { 'Wave': 7, 'HP': '768.00 - SpG', 'DPS': '30 - SpG' },
        { 'Wave': 8, 'HP': '16.36 - OvG', 'DPS': '650 - SpG' },
        { 'Wave': 9, 'HP': '307.20 - OvG', 'DPS': '12 - OvG' },
        { 'Wave': 10, 'HP': '6.14 - NvG', 'DPS': '230 - OvG' }
      ]
    },
    mundoRaid: {
      title: "Mundo Raid (Lobby 2)",
      world: "Lobby 2 (desbloqueada no Mundo 21)",
      maxWave: 10,
      playerLimit: 1,
      headers: ['Wave', 'HP', 'DPS'],
      rows: [
        { 'Wave': 1, 'HP': '81 - NoTG', 'DPS': '8.1 - NoTG' },
        { 'Wave': 2, 'HP': '2.91 - QdDR', 'DPS': '700 - NoTG' },
        { 'Wave': 3, 'HP': '58 - QdDR', 'DPS': '5.8 - QdDR' },
        { 'Wave': 4, 'HP': '1.16 - uQDR', 'DPS': '600 - QdDR' },
        { 'Wave': 5, 'HP': '23.3 - uQDR', 'DPS': '2.33 - uQDR' },
        { 'Wave': 6, 'HP': '466 - uQDR', 'DPS': '46 - uQDR' },
        { 'Wave': 7, 'HP': '9.32 - dQDR', 'DPS': '932 - uQDR' },
        { 'Wave': 8, 'HP': '186 - dQDR', 'DPS': '18.6 - dQDR' },
        { 'Wave': 9, 'HP': '3.73 - tQDR', 'DPS': '373 - dQDR' },
        { 'Wave': 10, 'HP': '74.5 - tQDR', 'DPS': '7.45 - tQDR' }
      ]
    },
    kaijuDungeon: {
      title: "Kaiju Dungeon",
      world: "Desconhecido",
      maxWave: 50,
      playerLimit: 99,
      headers: ['Wave', 'HP'],
      rows: [
        { Wave: '50', HP: '500-UvG' }
      ]
    },
    sufferingDungeon: {
      title: "Suffering Dungeon",
      world: "Mundo 20",
      maxWave: 50,
      playerLimit: 99,
      headers: ['Wave', 'HP'],
      rows: [
        { Wave: 1, HP: '1-OcTG' },
        { Wave: 10, HP: '6-NoTG' },
        { Wave: 20, HP: '4.8-QdDR' },
        { Wave: 30, HP: '6.2-uQDR' },
        { Wave: 40, HP: '5.1-dQDR' },
        { Wave: 50, HP: '587-TqDR' },
      ]
    },
    restaurantRaid: {
      title: "Restaurant Raid",
      world: "Mundo 2",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '750 - T' },
        { 'Wave': 100, 'Requisito': '140 - QD' },
        { 'Wave': 200, 'Requisito': '2 - SX' },
        { 'Wave': 300, 'Requisito': '27,5 SP' },
        { 'Wave': 500, 'Requisito': '5 - DE' },
        { 'Wave': 750, 'Requisito': '110 - TDD' },
        { 'Wave': 1000, 'Requisito': '2,5 - SPD' },
      ]
    },
    cursedRaid: {
      title: "Cursed Raid",
      world: "Mundo 4",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '500 - QN' },
        { 'Wave': 100, 'Requisito': '63 - SX' },
        { 'Wave': 200, 'Requisito': '860 - SP' },
        { 'Wave': 300, 'Requisito': '12 - N' },
        { 'Wave': 500, 'Requisito': '2,25 - DD' },
        { 'Wave': 750, 'Requisito': '50 - QND' },
        { 'Wave': 1000, 'Requisito': '1,1 - NVD' },
      ]
    },
    leafRaid: {
      title: "Leaf Raid",
      world: "Lobby",
      maxWave: 2000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '500 - UD' },
        { 'Wave': 100, 'Requisito': '5 - DD' },
        { 'Wave': 200, 'Requisito': '75 - TDD' },
        { 'Wave': 300, 'Requisito': '1 - QND' },
        { 'Wave': 500, 'Requisito': '200 - SPD' },
        { 'Wave': 750, 'Requisito': '4,5 - UVG' },
        { 'Wave': 1000, 'Requisito': '95 - QTV' },
        { 'Wave': 1200, 'Requisito': '18 - SPG' },
        { 'Wave': 1400, 'Requisito': '3,5 - TGN' },
        { 'Wave': 1600, 'Requisito': '650 - DTG' },
        { 'Wave': 1800, 'Requisito': '125 - QNTG' },
        { 'Wave': 2000, 'Requisito': '50 - OCTG' },
      ]
    },
    progressionRaid: {
      title: "Progression Raid",
      world: "Lobby",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '500 - DD' },
        { 'Wave': 100, 'Requisito': '62 - TDD' },
        { 'Wave': 200, 'Requisito': '900 - QDD' },
        { 'Wave': 300, 'Requisito': '12 - SXD' },
        { 'Wave': 500, 'Requisito': '2,25 NVD' },
        { 'Wave': 750, 'Requisito': '50 - DVG' },
        { 'Wave': 1000, 'Requisito': '1 - SEV' },
      ]
    },
    progression2: {
      title: "Progression 2",
      world: "Lobby 2",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '200 - QNV' },
        { 'Wave': 100, 'Requisito': '24 - SEV' },
        { 'Wave': 200, 'Requisito': '333 - SPG' },
        { 'Wave': 300, 'Requisito': '5 - NVG' },
        { 'Wave': 500, 'Requisito': '900 - UTG' },
        { 'Wave': 750, 'Requisito': '20 - QNTG' },
        { 'Wave': 1000, 'Requisito': '430 - OCTG' },
      ]
    },
    ghoulRaid: {
      title: "Ghoul Raid",
      world: "Mundo 17",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '600 - SPG' },
        { 'Wave': 100, 'Requisito': '70 - OVG' },
        { 'Wave': 200, 'Requisito': '1 - TGN' },
        { 'Wave': 300, 'Requisito': '13 - UTG' },
        { 'Wave': 500, 'Requisito': '2,5 - QTTG' },
        { 'Wave': 750, 'Requisito': '55 - SPTG' },
        { 'Wave': 1000, 'Requisito': '1,25 - UQDR' },
      ]
    },
    greenPlanetRaid: {
      title: "Green Planet Raid",
      world: "Mundo 20",
      maxWave: 200,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 100, 'Requisito': '21.4 - ssTG' },
        { 'Wave': 200, 'Requisito': '35.9 - OcTG' },
      ]
    },
    hollowRaid: {
      title: "Hollow Raid",
      world: "Lobby 2",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '100 - uTG' },
        { 'Wave': 100, 'Requisito': '10 - SpTG' },
        { 'Wave': 200, 'Requisito': '542 - OcTG' },
        { 'Wave': 300, 'Requisito': '4.9 - QdDR' },
        { 'Wave': 500, 'Requisito': '870 - dQDR' },
        { 'Wave': 750, 'Requisito': '5 - SsQDR' },
        { 'Wave': 1000, 'Requisito': '80 - NqDDR' },
      ]
    },
    tombRaid: {
      title: "Tomb Raid",
      world: "Mundo 24",
      maxWave: 1000,
      playerLimit: 4,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '50 - QqDDR' },
        { 'Wave': 100, 'Requisito': '5 - NqQDR' },
        { 'Wave': 200, 'Requisito': '10 - QnQGNT' },
        { 'Wave': 300, 'Requisito': '150 - uQGNT' },
        { 'Wave': 500, 'Requisito': '50 - QxQGNT' },
        { 'Wave': 750, 'Requisito': '500 - SpQvGT' },
        { 'Wave': 1000, 'Requisito': '20 - UssQGNTL' },
      ]
    }
  }
};
