
export const raidRequirementsArticle = {
  id: 'raid-requirements',
  title: 'Guia de Requisitos para Raids e Dungeons',
  summary: 'Um guia completo com os requisitos de HP e DPS, mundo, limite de jogadores e waves para as principais raids e dungeons do jogo.',
  content: `Este guia consolida a energia e o dano necessários para progredir nas principais raids e dungeons do Anime Eternal. Compreender os limites e requisitos de cada uma é essencial para uma progressão eficiente.

### Tipos de Raids
As raids podem ser divididas em algumas categorias principais com base no número de jogadores permitidos:

- **Raids Solo (1 Jogador):** Tournament Raid, Sin Raid, Dragon Raid, Gleam Raid, Mundo Raid, Halloween Raid.
- **Raids de Esquadrão (Até 4 Jogadores):** A maioria das raids de evento e de mundo, como Restaurant, Cursed e Ghoul Raid.
- **Raids Massivas (Até 99 Jogadores):** Desafios especiais como a Suffering, Torment, Kaiju e Adventure Dungeons.

### Novos Avatares de Dano
Recentemente, as raids Gleam e Mundo foram estendidas e agora recompensam os jogadores com **avataares de dano exclusivos**, os únicos do tipo no jogo.

### Cálculo de HP Exponencial para Raids
Para raids como **Titan Defense** e **Progression Raid**, o HP dos inimigos aumenta exponencialmente a cada sala. Use a seguinte fórmula para estimar o HP: \`HP(sala) = HP_inicial * (HP_final / HP_inicial)^((sala - 1) / 999)\`.
`,
  tags: ['raid', 'dungeon', 'energia', 'dps', 'hp', 'guia', 'geral', 'solo', 'esquadrão', 'massiva', 'requisitos', 'mundo', 'limite', 'tournament', 'sin', 'dragon'],
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
    tournamentRaid: {
      title: "Tournament Raid",
      world: "Mundo 1",
      maxWave: 500,
      playerLimit: 1,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '10 - QD' },
        { 'Wave': 100, 'Requisito': '11 - N' },
        { 'Wave': 200, 'Requisito': '14 - NVD' },
        { 'Wave': 300, 'Requisito': '17 - NVG' },
        { 'Wave': 500, 'Requisito': '45 - NoTG' },
      ]
    },
    sinRaid: {
      title: "Sin Raid",
      world: "Mundo 12",
      maxWave: 1000,
      playerLimit: 1,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '11 - OCD' },
        { 'Wave': 100, 'Requisito': '1.3 - NVD' },
        { 'Wave': 200, 'Requisito': '20 - VGN' },
        { 'Wave': 300, 'Requisito': '300 - UvG' },
        { 'Wave': 500, 'Requisito': '45 - QTV' },
        { 'Wave': 750, 'Requisito': '1 - OVG' },
        { 'Wave': 1000, 'Requisito': '20 - UTG' },
      ]
    },
     dragonRaid: {
      title: "Dragon Raid",
      world: "Mundo 14",
      maxWave: 1000,
      playerLimit: 1,
      headers: ['Wave', 'Requisito'],
      rows: [
        { 'Wave': 50, 'Requisito': '4.21 - TvG' },
        { 'Wave': 100, 'Requisito': '561 - TvG' },
        { 'Wave': 150, 'Requisito': '6.93 - QtV' },
        { 'Wave': 200, 'Requisito': '9.24 - QnV' },
        { 'Wave': 250, 'Requisito': '700 - QnV' },
        { 'Wave': 300, 'Requisito': '350 - SeV' },
        { 'Wave': 350, 'Requisito': '12.7 - SpG' },
        { 'Wave': 400, 'Requisito': '1.43 - OvG' },
        { 'Wave': 450, 'Requisito': '178 - OvG' },
        { 'Wave': 500, 'Requisito': '22 - NvG' },
        { 'Wave': 550, 'Requisito': '2.4 - TGN' },
        { 'Wave': 600, 'Requisito': '314 - TGN' },
        { 'Wave': 650, 'Requisito': '36.7 - UTG' },
        { 'Wave': 700, 'Requisito': '4.01 - DTG' },
        { 'Wave': 750, 'Requisito': '462 - DTG' },
        { 'Wave': 800, 'Requisito': '52.9 - tsTG' },
        { 'Wave': 850, 'Requisito': '6.78 - qtTG' },
        { 'Wave': 900, 'Requisito': '622 - qtTG' },
        { 'Wave': 950, 'Requisito': '97.5 - QnTG' },
        { 'Wave': 1000, 'Requisito': '30 - ssTG' },
      ]
    },
    gleamRaid: {
      title: "Gleam Raid (Mundo 15)",
      world: "Mundo 15",
      maxWave: 25,
      playerLimit: 1,
      headers: ['Wave', 'HP', 'DPS'],
      rows: [
        { 'Wave': 1, 'HP': '500 - QtV', 'DPS': '500 - QtV' },
        { 'Wave': 2, 'HP': '10 - QnV', 'DPS': '10 - QnV' },
        { 'Wave': 3, 'HP': '170 - QnV', 'DPS': '170 - QnV' },
        { 'Wave': 4, 'HP': '3.5 - SeV', 'DPS': '3.5 - SeV' },
        { 'Wave': 5, 'HP': '80 - SeV', 'DPS': '80 - SeV' },
        { 'Wave': 6, 'HP': '1.5 - SpG', 'DPS': '1.5 - SpG' },
        { 'Wave': 7, 'HP': '30 - SpG', 'DPS': '30 - SpG' },
        { 'Wave': 8, 'HP': '650 - SpG', 'DPS': '650 - SpG' },
        { 'Wave': 9, 'HP': '12 - OvG', 'DPS': '12 - OvG' },
        { 'Wave': 10, 'HP': '230 - OvG', 'DPS': '230 - OvG' },
        { 'Wave': 11, 'HP': '5.3 - NvG', 'DPS': '5.3 - NvG' },
        { 'Wave': 12, 'HP': '136 - NvG', 'DPS': '136 - NvG' },
        { 'Wave': 13, 'HP': '2.26 - TGN', 'DPS': '2.26 - TGN' },
        { 'Wave': 14, 'HP': '58 - TGN', 'DPS': '58 - TGN' },
        { 'Wave': 15, 'HP': '952 - TGN', 'DPS': '952 - TGN' },
        { 'Wave': 16, 'HP': '28 - UTG', 'DPS': '28 - UTG' },
        { 'Wave': 17, 'HP': '427 - UTG', 'DPS': '427 - UTG' },
        { 'Wave': 18, 'HP': '9 - DTG', 'DPS': '9 - DTG' },
        { 'Wave': 19, 'HP': '175 - DTG', 'DPS': '175 - DTG' },
        { 'Wave': 20, 'HP': '5 - TsTG', 'DPS': '5 - TsTG' },
        { 'Wave': 21, 'HP': '82 - TsTG', 'DPS': '82 - TsTG' },
        { 'Wave': 22, 'HP': '2.3 - QtTG', 'DPS': '2.3 - QtTG' },
        { 'Wave': 23, 'HP': '49 - QtTG', 'DPS': '49 - QtTG' },
        { 'Wave': 24, 'HP': '863 - QtTG', 'DPS': '863 - QtTG' },
        { 'Wave': 25, 'HP': '20 - QnTG', 'DPS': '20 - QnTG' }
      ]
    },
    mundoRaid: {
      title: "Mundo Raid (Lobby 2)",
      world: "Lobby 2 (desbloqueada no Mundo 21)",
      maxWave: 20,
      playerLimit: 1,
      headers: ['Wave', 'HP', 'DPS'],
      rows: [
        { 'Wave': 1, 'HP': '3 - NoTG', 'DPS': '3 - NoTG' },
        { 'Wave': 2, 'HP': '60 - NoTG', 'DPS': '60 - NoTG' },
        { 'Wave': 3, 'HP': '903 - NoTG', 'DPS': '903 - NoTG' },
        { 'Wave': 4, 'HP': '23 - QdDR', 'DPS': '23 - QdDR' },
        { 'Wave': 5, 'HP': '528 - QdDR', 'DPS': '528 - QdDR' },
        { 'Wave': 6, 'HP': '12 - uQDR', 'DPS': '12 - uQDR' },
        { 'Wave': 7, 'HP': '230 - uQDR', 'DPS': '230 - uQDR' },
        { 'Wave': 8, 'HP': '10 - dQDR', 'DPS': '10 - dQDR' },
        { 'Wave': 9, 'HP': '92 - dQDR', 'DPS': '92 - dQDR' },
        { 'Wave': 10, 'HP': '2 - tQDR', 'DPS': '2 - tQDR' },
        { 'Wave': 11, 'HP': '4 - tQDR', 'DPS': '4 - tQDR' },
        { 'Wave': 12, 'HP': '50 - tQDR', 'DPS': '50 - tQDR' },
        { 'Wave': 13, 'HP': '700 - tQDR', 'DPS': '700 - tQDR' },
        { 'Wave': 14, 'HP': '12 - QdQDR', 'DPS': '12 - QdQDR' },
        { 'Wave': 15, 'HP': '150 - QdQDR', 'DPS': '150 - QdQDR' },
        { 'Wave': 16, 'HP': '7.89 - QnQDR', 'DPS': '7.89 - QnQDR' },
        { 'Wave': 17, 'HP': '50 - QnQDR', 'DPS': '50 - QnQDR' },
        { 'Wave': 18, 'HP': '732 - QnQDR', 'DPS': '732 - QnQDR' },
        { 'Wave': 19, 'HP': '13.3 - sxQDR', 'DPS': '13.3 - sxQDR' },
        { 'Wave': 20, 'HP': '181 - sxQDR', 'DPS': '181 - sxQDR' }
      ]
    },
    kaijuDungeon: {
      title: "Kaiju Dungeon",
      world: "Mundo 13",
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
      world: "Mundo 11",
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
      world: "Mundo 16",
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
        { 'Wave': 50, 'Requisito': '49.4 - qnTG' },
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
        { 'Wave': 50, 'Requisito': '100 - ssTG' },
        { 'Wave': 100, 'Requisito': '10 - SpTG' },
        { 'Wave': 200, 'Requisito': '342 - OcTG' },
        { 'Wave': 300, 'Requisito': '4.9 - QdDR' },
        { 'Wave': 500, 'Requisito': '870 - dQDR' },
        { 'Wave': 750, 'Requisito': '5 - SxQDR' },
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
        { 'Wave': 50, 'Requisito': '50 - OqDDR' },
        { 'Wave': 100, 'Requisito': '5 - NqDDR' },
        { 'Wave': 200, 'Requisito': '10 - QqGNT' },
        { 'Wave': 300, 'Requisito': '150 - uQGNT' },
        { 'Wave': 500, 'Requisito': '50 - QqQGNT' },
        { 'Wave': 750, 'Requisito': '500 - SpQnGT' },
        { 'Wave': 1000, 'Requisito': '20 - UsxGNTL' },
      ]
    }
  }
};
