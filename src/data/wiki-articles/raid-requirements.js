
export const raidRequirementsArticle = {
  id: 'raid-requirements',
  title: 'Requisitos de Energia para Raids',
  summary: 'Um guia completo com os requisitos de energia para passar por diferentes ondas em várias raids e dungeons do jogo.',
  content: `Este guia consolida a energia necessária para progredir nas principais raids e dungeons do Anime Eternal. É importante notar que as raids podem ser solo ou em grupo.

**Raids Solo (1 Jogador):**
*   **Gleam Raid (Mundo 15):** Uma raid de desafio individual.
*   **Raid Sins (Mundo 12):** Outra raid projetada para um único jogador.
*   **Mundo Raid (Lobby 2):** Uma raid de desafio individual, desbloqueada com o Mundo 21.

**Raids em Grupo (até 4 Jogadores):**
*   Todas as outras raids não mencionadas como "solo" permitem a participação de até 4 jogadores.

Abaixo estão as tabelas com os requisitos de HP e DPS para as novas raids, e a tabela consolidada para as raids mais antigas.

### Novos Avatares de Dano (Damage Avatars)
Recentemente, as raids Gleam e Mundo foram estendidas e agora recompensam os jogadores com **avatares de dano exclusivos**, os únicos do tipo no jogo.

### Cálculo de HP Exponencial para Raids

Para raids como **Titan Defense** e **Progression Raid**, o HP dos inimigos aumenta exponencialmente a cada sala. Em vez de uma tabela gigante, use a seguinte fórmula para estimar o HP:

**Fórmula:** \`HP(sala) = HP_inicial * (HP_final / HP_inicial)^((sala - 1) / 999)\`

**Valores Base:**
*   **Titan Defense:**
    *   HP Inicial (Sala 1): 7.62 sxD (7.62e51)
    *   HP Final (Sala 1000): 1.63 TGN (1.63e93)
*   **Progression Raid:**
    *   HP Inicial (Sala 1): 57.2 DD (5.72e40)
    *   HP Final (Sala 1000): 12.3 SeV (1.23e82)

A **Mundo Raid**, localizada no Lobby 2, é desbloqueada junto com o Mundo 21. Sua mecânica é similar à da Gleam Raid: cada onda completada é uma conquista que concede um nível de um poder exclusivo da raid (do comum ao supremo), além de uma conquista final que recompensa com créditos.`,
  tags: ['raid', 'dungeon', 'energia', 'guia', 'geral', 'solo', 'damage avatar'],
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
        headers: ['Origem', 'Stats', 'Obtenção'],
        rows: [
            { 'Origem': 'Gleam Raid', 'Stats': '5x', 'Obtenção': 'Alcançar a Wave 25' },
            { 'Origem': 'Mundo Raid', 'Stats': '10x', 'Obtenção': 'Alcançar a Wave 20' },
            { 'Origem': 'Chefe Mundo 26', 'Stats': '15x', 'Obtenção': 'Drop do boss Arcanjo (SSS-Rank)' }
        ]
    },
    gleamRaidWorld15: {
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
    mundoRaidWorld21: {
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
    requirements: {
      headers: ['Wave', 'Restaurant Raid', 'Cursed Raid', 'Leaf Raid', 'Progression Raid', 'Progression 2', 'Ghoul Raid', 'Green Planet Raid', 'Hollow Raid', 'Tomb Raid'],
      rows: [
        { 'Wave': 50, 'Restaurant Raid': '750 - T', 'Cursed Raid': '500 - QN', 'Leaf Raid': '500 - UD', 'Progression Raid': '500 - DD', 'Progression 2': '200 - QNV', 'Ghoul Raid': '600 - SPG', 'Green Planet Raid': 'N/A', 'Hollow Raid': '100 - uTG', 'Tomb Raid': '50 - QqDDR' },
        { 'Wave': 100, 'Restaurant Raid': '140 - QD', 'Cursed Raid': '63 - SX', 'Leaf Raid': '5 - DD', 'Progression Raid': '62 - TDD', 'Progression 2': '24 - SEV', 'Ghoul Raid': '70 - OVG', 'Green Planet Raid': '21.4 - ssTG', 'Hollow Raid': '10 - SpTG', 'Tomb Raid': '5 - NqQDR' },
        { 'Wave': 200, 'Restaurant Raid': '2 - SX', 'Cursed Raid': '860 - SP', 'Leaf Raid': '75 - TDD', 'Progression Raid': '900 - QDD', 'Progression 2': '333 - SPG', 'Ghoul Raid': '1 - TGN', 'Green Planet Raid': '35.9 - OcTG', 'Hollow Raid': '542 - OcTG', 'Tomb Raid': '10 - QnQGNT' },
        { 'Wave': 300, 'Restaurant Raid': '27,5 SP', 'Cursed Raid': '12 - N', 'Leaf Raid': '1 - QND', 'Progression Raid': '12 - SXD', 'Progression 2': '5 - NVG', 'Ghoul Raid': '13 - UTG', 'Green Planet Raid': 'N/A', 'Hollow Raid': '4.9 - QdDR', 'Tomb Raid': '150 - uQGNT' },
        { 'Wave': 500, 'Restaurant Raid': '5 - DE', 'Cursed Raid': '2,25 - DD', 'Leaf Raid': '200 - SPD', 'Progression Raid': '2,25 NVD', 'Progression 2': '900 - UTG', 'Ghoul Raid': '2,5 - QTTG', 'Green Planet Raid': 'N/A', 'Hollow Raid': '870 - dQDR', 'Tomb Raid': '50 - QxQGNT' },
        { 'Wave': 750, 'Restaurant Raid': '110 - TDD', 'Cursed Raid': '50 - QND', 'Leaf Raid': '4,5 - UVG', 'Progression Raid': '50 - DVG', 'Progression 2': '20 - QNTG', 'Ghoul Raid': '55 - SPTG', 'Green Planet Raid': 'N/A', 'Hollow Raid': '5 - SsQDR', 'Tomb Raid': '500 - SpQvGT' },
        { 'Wave': 1000, 'Restaurant Raid': '2,5 - SPD', 'Cursed Raid': '1,1 - NVD', 'Leaf Raid': '95 - QTV', 'Progression Raid': '1 - SEV', 'Progression 2': '430 - OCTG', 'Ghoul Raid': '1,25 - UQDR', 'Green Planet Raid': 'N/A', 'Hollow Raid': '80 - NqDDR', 'Tomb Raid': '20 - UssQGNTL' },
        { 'Wave': 1200, 'Restaurant Raid': 'N/A', 'Cursed Raid': 'N/A', 'Leaf Raid': '18 - SPG', 'Progression Raid': 'N/A', 'Progression 2': 'N/A', 'Ghoul Raid': 'N/A', 'Green Planet Raid': 'N/A', 'Hollow Raid': 'N/A', 'Tomb Raid': 'N/A' },
        { 'Wave': 1400, 'Restaurant Raid': 'N/A', 'Cursed Raid': 'N/A', 'Leaf Raid': '3,5 - TGN', 'Progression Raid': 'N/A', 'Progression 2': 'N/A', 'Ghoul Raid': 'N/A', 'Green Planet Raid': 'N/A', 'Hollow Raid': 'N/A', 'Tomb Raid': 'N/A' },
        { 'Wave': 1600, 'Restaurant Raid': 'N/A', 'Cursed Raid': 'N/A', 'Leaf Raid': '650 - DTG', 'Progression Raid': 'N/A', 'Progression 2': 'N/A', 'Ghoul Raid': 'N/A', 'Green Planet Raid': 'N/A', 'Hollow Raid': 'N/A', 'Tomb Raid': 'N/A' },
        { 'Wave': 1800, 'Restaurant Raid': 'N/A', 'Cursed Raid': 'N/A', 'Leaf Raid': '125 - QNTG', 'Progression Raid': 'N/A', 'Progression 2': 'N/A', 'Ghoul Raid': 'N/A', 'Green Planet Raid': 'N/A', 'Hollow Raid': 'N/A', 'Tomb Raid': 'N/A' },
        { 'Wave': 2000, 'Restaurant Raid': 'N/A', 'Cursed Raid': 'N/A', 'Leaf Raid': '50 - OCTG', 'Progression Raid': 'N/A', 'Progression 2': 'N/A', 'Ghoul Raid': 'N/A', 'Green Planet Raid': 'N/A', 'Hollow Raid': 'N/A', 'Tomb Raid': 'N/A' }
      ]
    }
  }
};
