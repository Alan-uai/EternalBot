import type { WikiArticle } from '@/lib/types';
import { serverTimestamp } from 'firebase/firestore';

export const gettingStartedArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'getting-started',
    title: 'Começando no Anime Eternal',
    summary: "Um guia para iniciantes para começar sua aventura no mundo do Anime Eternal.",
    content: `Bem-vindo ao Anime Eternal! Este guia irá guiá-lo através das principais características do Mundo 1, o hub central do jogo.

**Criação de Personagem e Primeira Missão**
Primeiro, você precisa escolher sua classe inicial: Guerreiro, Mago ou Ladino. Cada classe tem habilidades únicas. Sua primeira missão será dada pelo Ancião da Vila em Vento Argênteo, que lhe ensinará a se mover, combater e interagir com o mundo.

**Legenda de Cores de Raridade**
No jogo, a cor de fundo do nome de um item indica sua raridade:
*   **Cinza:** Comum
*   **Verde:** Incomum
*   **Azul:** Raro
*   **Lilás/Magenta:** Épico
*   **Amarelo:** Lendário
*   **Red:** Mítico
*   **Roxo:** Phantom
*   **Laranja/Arco-íris:** Supreme

**Principais Atividades no Mundo 1:**
*   **Placares de Líderes Globais:** Confira os melhores jogadores do mundo e veja sua posição.
*   **Subir de Rank e Nível de Avatar:** O Mundo 1 é onde você aumentará seu Rank e o nível de seus avatares.
*   **Baús e Missões Diárias:** Encontre e colete baús e complete missões diárias para obter recompensas valiosas.
*   **Dungeon do Mundo - Torneio:** Sua primeira dungeon específica do mundo é o Torneio, que vai até a Sala 550.
*   **Lobby de Dungeons:** Acesse uma variedade de dungeons especiais, que são diferentes das dungeons encontradas em cada mundo. As dungeons de lobby são: **Fácil, Média, Difícil, Insana, Louca, Pesadelo e Folha**. Todas as outras raids e dungeons pertencem a mundos específicos.`,
    tags: ['iniciante', 'guia', 'novo jogador', 'classe', 'mundo 1', 'geral', '1', 'raridade'],
    imageId: 'wiki-1',
};

export const auraArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'aura-system',
    title: 'Sistema de Auras',
    summary: 'Aprenda sobre Auras de Chefes de Rank-SS, como desbloqueá-las e como elas melhoram suas habilidades.',
    content: `Auras são buffs poderosos dropados por Chefes de Rank-SS em vários mundos. Cada Aura fornece um bônus de status único. Aqui está uma lista de Auras conhecidas e seus status:

*   **Mundo 1 (Kid Kohan):** Aura da Sorte (10% de Sorte de Estrela)
*   **Mundo 2 (Shanks):** Aura do Imperador Vermelho (0.1x)
*   **Mundo 3 (Eizen):** Aura do Traidor Roxo (0.25x)
*   **Mundo 4 (Sakuni):** Aura do Rei do Fogo (25% de Drops)
*   **Mundo 5 (Rangoki):** Aura Flamejante (0.15x)
*   **Mundo 6 (Statue of God):** Aura da Estátua (0.75x)
*   **Mundo 8 (Itechi/Madera):** Aura da Folha (25% de Sorte de Estrela)
*   **Mundo 10 (Ken Turbo):** Aura Energética (1.5x)
*   **Mundo 13 (Esanor):** Aura Monstruosa (2.0x)
*   **Mundo 15 (The Paladin):** Aura Virtual (35% de Drops)
*   **Mundo 16 (Dio):** Aura de Hamon (10% de Exp)
*   **Mundo 17 (Arama):** Aura de Ghoul (1.0x)
*   **Mundo 19 (Leonardo):** Aura do Capitão de Fogo (1.5x)`,
    tags: ['aura', 'poder', 'habilidades', 'buffs', 'drop de chefe', 'sistema', 'geral'],
    imageId: 'wiki-2',
};

export const legendaryWeaponsArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'legendary-weapons',
    title: 'Fabricação de Armas Lendárias',
    summary: 'Descubra os segredos para forjar as armas mais poderosas do jogo.',
    content: 'Armas lendárias são o auge do equipamento em Anime Eternal. Fabricar uma é uma jornada longa e árdua que requer materiais raros, um alto nível de fabricação e uma forja especial.\n\nOs materiais necessários, conhecidos como "Fragmentos Celestiais", são dropados por chefes de mundo e podem ser encontrados nas masmorras mais profundas. Você precisará de 100 fragmentos, juntamente com outros componentes raros, para tentar uma fabricação. A forja está localizada no pico do Monte Celestia. Cuidado, o caminho é traiçoeiro.',
    tags: ['fabricação', 'armas', 'lendário', 'endgame', 'guia', 'geral'],
    imageId: 'wiki-3',
};

export const guildWarsArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'guild-wars',
    title: 'Uma Introdução às Guerras de Guildas',
    summary: 'Junte-se à sua guilda e lute pela supremacia e recompensas raras.',
    content: 'Guerras de Guildas são eventos semanais onde guildas competem entre si em batalhas PvP em grande escala. Para participar, você deve ser membro de uma guilda com pelo menos 10 membros.\n\nAs guerras ocorrem todo sábado. O objetivo é capturar e manter pontos de controle em um mapa especial. A guilda com mais pontos no final do evento vence. Guildas vitoriosas recebem recompensas exclusivas, incluindo cosméticos raros, equipamentos poderosos e uma quantidade significativa de moeda do jogo.',
    tags: ['guilda', 'pvp', 'evento', 'equipe', 'guia', 'geral'],
    imageId: 'wiki-4',
};

export const prestigeArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'prestige-system',
    title: 'Sistema de Prestígio',
    summary: 'Entenda como prestigiar para aumentar seu limite de nível e ganhar mais poder.',
    content: `O sistema de Prestígio permite que os jogadores resetem seu nível em troca de bônus permanentes poderosos. Veja como funciona:`,
    tags: ['prestígio', 'nível', 'endgame', 'status', 'sistema', 'geral'],
    imageId: 'wiki-5',
    tables: {
      prestigeLevels: {
        headers: ['Prestígio', 'Nível Requerido', 'Novo Limite de Nível', 'Pontos de Status por Nível', 'Multiplicador de Exp'],
        rows: [
          { 'Prestígio': 1, 'Nível Requerido': 200, 'Novo Limite de Nível': 210, 'Pontos de Status por Nível': 2, 'Multiplicador de Exp': '0.1x' },
          { 'Prestígio': 2, 'Nível Requerido': 210, 'Novo Limite de Nível': 220, 'Pontos de Status por Nível': 3, 'Multiplicador de Exp': '0.2x' },
          { 'Prestígio': 3, 'Nível Requerido': 220, 'Novo Limite de Nível': 230, 'Pontos de Status por Nível': 4, 'Multiplicador de Exp': '0.3x' },
          { 'Prestígio': 4, 'Nível Requerido': 230, 'Novo Limite de Nível': 250, 'Pontos de Status por Nível': 5, 'Multiplicador de Exp': '0.4x' },
          { 'Prestígio': 5, 'Nível Requerido': 250, 'Novo Limite de Nível': 270, 'Pontos de Status por Nível': 6, 'Multiplicador de Exp': '0.5x' },
        ]
      }
    }
};

export const rankArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'rank-system',
    title: 'Sistema de Ranks',
    summary: 'Uma referência para a energia necessária para alcançar cada rank no jogo.',
    content: `Subir de rank é uma parte central da progressão no Anime Eternal. Cada rank requer uma certa quantidade de energia para ser alcançado. Abaixo está uma tabela detalhando a energia necessária para cada rank.`,
    tags: ['rank', 'progressão', 'energia', 'status', 'sistema', 'geral'],
    imageId: 'wiki-6',
    tables: {
      ranks: {
        headers: ['Rank', 'Energia'],
        rows: [
            { Rank: 1, Energia: '9k' }, { Rank: 2, Energia: '45k' }, { Rank: 3, Energia: '243.03k' },
            { Rank: 4, Energia: '1.41M' }, { Rank: 5, Energia: '8.75M' }, { Rank: 6, Energia: '57.84M' },
            { Rank: 7, Energia: '405.18M' }, { Rank: 8, Energia: '3B' }, { Rank: 9, Energia: '23.39B' },
            { Rank: 10, Energia: '116.96B' }, { Rank: 11, Energia: '631.36B' }, { Rank: 12, Energia: '1.07T' },
            { Rank: 13, Energia: '2.52T' }, { Rank: 14, Energia: '14.99T' }, { Rank: 15, Energia: '154.95T' },
            { Rank: 16, Energia: '776.49T' }, { Rank: 17, Energia: '7.06qd' }, { Rank: 18, Energia: '90.32qd' },
            { Rank: 19, Energia: '1.04Qn' }, { Rank: 20, Energia: '9.49Qn' }, { Rank: 21, Energia: '58.84Qn' },
            { Rank: 22, Energia: '388.50Qn' }, { Rank: 23, Energia: '2.72sx' }, { Rank: 24, Energia: '20.14sx' },
            { Rank: 25, Energia: '157.16sx' }, { Rank: 26, Energia: '785.79sx' }, { Rank: 27, Energia: '4.24Sp' },
            { Rank: 28, Energia: '24.61Sp' }, { Rank: 29, Energia: '152.63Sp' }, { Rank: 30, Energia: '1.01O' },
            { Rank: 31, Energia: '7.05O' }, { Rank: 32, Energia: '52.15O' }, { Rank: 33, Energia: '407.01O' },
            { Rank: 34, Energia: '2.04N' }, { Rank: 35, Energia: '11.01N' }, { Rank: 36, Energia: '63.80N' },
            { Rank: 37, Energia: '395.72N' }, { Rank: 38, Energia: '2.61de' }, { Rank: 39, Energia: '18.29de' },
            { Rank: 40, Energia: '135.46de' }, { Rank: 41, Energia: '1.06Ud' }, { Rank: 42, Energia: '5.28Ud' },
            { Rank: 43, Energia: '28.53Ud' }, { Rank: 44, Energia: '165.50Ud' }, { Rank: 45, Energia: '1.03DD' },
            { Rank: 46, Energia: '6.77DD' }, { Rank: 47, Energia: '47.40DD' }, { Rank: 48, Energia: '351.06DD' },
            { Rank: 49, Energia: '2.74tdD' }, { Rank: 50, Energia: '13.71tdD' }, { Rank: 51, Energia: '74.00tdD' },
            { Rank: 52, Energia: '429.34tdD' }, { Rank: 53, Energia: '2.66qdD' }, { Rank: 54, Energia: '17.57qdD' },
            { Rank: 55, Energia: '85.29qdD' }, { Rank: 56, Energia: '910.22qdD' }, { Rank: 57, Energia: '4.10QnD' },
            { Rank: 58, Energia: '8.20QnD' }, { Rank: 59, Energia: '48.00QnD' }, { Rank: 60, Energia: '336.00QnD' },
            { Rank: 61, Energia: '4.90sxD' }, { Rank: 62, Energia: '45.59sxD' }, { Rank: 63, Energia: '319.31sxD' },
            { Rank: 64, Energia: '2.36 SpD' }, { Rank: 65, Energia: '18.41 SpD' }, { Rank: 66, Energia: '92.06 SpD' },
            { Rank: 67, Energia: '497.12SpD' }, { Rank: 68, Energia: '2.89OcD' }, { Rank: 69, Energia: '17.92OcD' },
            { Rank: 70, Energia: '118.360OcD' }, { Rank: 71, Energia: '828.38OcD' }, { Rank: 72, Energia: '6.13NvD' },
            { Rank: 73, Energia: '47.81NvD' }, { Rank: 74, Energia: '239.06NvD' }, { Rank: 75, Energia: '1.29Vgn' },
            { Rank: 76, Energia: '7.49Vgn' }, { Rank: 77, Energia: '46.41Vgn' }, { Rank: 78, Energia: '306.38Vgn' },
            { Rank: 79, Energia: '2.15Uvg' }, { Rank: 80, Energia: '16.00Uvg' }, { Rank: 81, Energia: '124.80 Uvg' },
            { Rank: 82, Energia: '748.80 Uvg' }, { Rank: 83, Energia: '4.79 DVg' }, { Rank: 84, Energia: '32.59 DVg' },
            { Rank: 85, Energia: '234.63 DVg' }, { Rank: 86, Energia: '100 TVg' }, { Rank: 87, Energia: '1 qtV' },
            { Rank: 88, Energia: '15 qtV' }, { Rank: 89, Energia: '50 qtV' }, { Rank: 90, Energia: '250 qtV' },
            { Rank: 91, Energia: '2 QnV' }, { Rank: 92, Energia: '10 QnV' }, { Rank: 93, Energia: '50 QnV' },
            { Rank: 94, Energia: '500 QnV' }, { Rank: 95, Energia: '5 SeV' }, { Rank: 96, Energia: '500 SeV' },
            { Rank: 97, Energia: '25 SPG' }, { Rank: 98, Energia: '250 SPG' }, { Rank: 99, Energia: '2.5 OVG' },
            { Rank: 100, Energia: '100 OVG' }, { Rank: 101, Energia: '750 OVG' }, { Rank: 102, Energia: '3 NVG' },
            { Rank: 103, Energia: '30 NVG' }, { Rank: 104, Energia: '250 NVG' },
            { Rank: 105, Energia: '1 TGN' },
        ],
      },
    },
};

export const energyGainPerRankArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'energy-gain-per-rank',
    title: 'Ganho de Energia Base por Rank',
    summary: 'Uma referência para o ganho de energia base por clique para cada rank no jogo.',
    content: `Esta tabela detalha o ganho de energia base que um jogador recebe por cada clique em um determinado rank. Esse valor pode ser aumentado por vários multiplicadores no jogo.`,
    tags: ['ganho', 'energia', 'rank', 'clique', 'guia', 'geral'],
    imageId: 'wiki-2',
    tables: {
      energyGain: {
        headers: ['Rank', 'Ganho de Energia'],
        rows: [
          { 'Rank': 1, 'Ganho de Energia': '4.17e-15' },
          { 'Rank': 2, 'Ganho de Energia': '8.34e-15' },
          { 'Rank': 3, 'Ganho de Energia': '1.67e-14' },
          { 'Rank': 4, 'Ganho de Energia': '3.34e-14' },
          { 'Rank': 5, 'Ganho de Energia': '6.67e-14' },
          { 'Rank': 6, 'Ganho de Energia': '1.33e-13' },
          { 'Rank': 7, 'Ganho de Energia': '2.67e-13' },
          { 'Rank': 8, 'Ganho de Energia': '5.34e-13' },
          { 'Rank': 9, 'Ganho de Energia': '1.07e-12' },
          { 'Rank': 10, 'Ganho de Energia': '2.14e-12' },
          { 'Rank': 11, 'Ganho de Energia': '4.27e-12' },
          { 'Rank': 12, 'Ganho de Energia': '8.55e-12' },
          { 'Rank': 13, 'Ganho de Energia': '1.71e-11' },
          { 'Rank': 14, 'Ganho de Energia': '3.42e-11' },
          { 'Rank': 15, 'Ganho de Energia': '6.84e-11' },
          { 'Rank': 16, 'Ganho de Energia': '1.37e-10' },
          { 'Rank': 17, 'Ganho de Energia': '2.74e-10' },
          { 'Rank': 18, 'Ganho de Energia': '5.47e-10' },
          { 'Rank': 19, 'Ganho de Energia': '1.09e-09' },
          { 'Rank': 20, 'Ganho de Energia': '2.19e-09' },
          { 'Rank': 21, 'Ganho de Energia': '4.38e-09' },
          { 'Rank': 22, 'Ganho de Energia': '8.76e-09' },
          { 'Rank': 23, 'Ganho de Energia': '1.75e-08' },
          { 'Rank': 24, 'Ganho de Energia': '3.50e-08' },
          { 'Rank': 25, 'Ganho de Energia': '7.01e-08' },
          { 'Rank': 26, 'Ganho de Energia': '1.40e-07' },
          { 'Rank': 27, 'Ganho de Energia': '2.80e-07' },
          { 'Rank': 28, 'Ganho de Energia': '5.61e-07' },
          { 'Rank': 29, 'Ganho de Energia': '1.12e-06' },
          { 'Rank': 30, 'Ganho de Energia': '2.24e-06' },
          { 'Rank': 31, 'Ganho de Energia': '4.49e-06' },
          { 'Rank': 32, 'Ganho de Energia': '8.98e-06' },
          { 'Rank': 33, 'Ganho de Energia': '0.0000179' },
          { 'Rank': 34, 'Ganho de Energia': '0.0000359' },
          { 'Rank': 35, 'Ganho de Energia': '0.0000718' },
          { 'Rank': 36, 'Ganho de Energia': '0.000143' },
          { 'Rank': 37, 'Ganho de Energia': '0.000287' },
          { 'Rank': 38, 'Ganho de Energia': '0.000574' },
          { 'Rank': 39, 'Ganho de Energia': '0.00114' },
          { 'Rank': 40, 'Ganho de Energia': '0.00229' },
          { 'Rank': 41, 'Ganho de Energia': '0.00459' },
          { 'Rank': 42, 'Ganho de Energia': '0.00919' },
          { 'Rank': 43, 'Ganho de Energia': '0.0183' },
          { 'Rank': 44, 'Ganho de Energia': '0.0367' },
          { 'Rank': 45, 'Ganho de Energia': '0.0735' },
          { 'Rank': 46, 'Ganho de Energia': '0.147' },
          { 'Rank': 47, 'Ganho de Energia': '0.294' },
          { 'Rank': 48, 'Ganho de Energia': '0.588' },
          { 'Rank': 49, 'Ganho de Energia': '1.17' },
          { 'Rank': 50, 'Ganho de Energia': '2.35' },
          { 'Rank': 51, 'Ganho de Energia': '4.71' },
          { 'Rank': 52, 'Ganho de Energia': '9.42' },
          { 'Rank': 53, 'Ganho de Energia': '18.8' },
          { 'Rank': 54, 'Ganho de Energia': '37.7' },
          { 'Rank': 55, 'Ganho de Energia': '75.4' },
          { 'Rank': 56, 'Ganho de Energia': '150' },
          { 'Rank': 57, 'Ganho de Energia': '301' },
          { 'Rank': 58, 'Ganho de Energia': '603' },
          { 'Rank': 59, 'Ganho de Energia': '1.20k' },
          { 'Rank': 60, 'Ganho de Energia': '2.41k' },
          { 'Rank': 61, 'Ganho de Energia': '4.83k' },
          { 'Rank': 62, 'Ganho de Energia': '9.66k' },
          { 'Rank': 63, 'Ganho de Energia': '19.3k' },
          { 'Rank': 64, 'Ganho de Energia': '38.6k' },
          { 'Rank': 65, 'Ganho de Energia': '77.2k' },
          { 'Rank': 66, 'Ganho de Energia': '154k' },
          { 'Rank': 67, 'Ganho de Energia': '308k' },
          { 'Rank': 68, 'Ganho de Energia': '617k' },
          { 'Rank': 69, 'Ganho de Energia': '1.23M' },
          { 'Rank': 70, 'Ganho de Energia': '2.47M' },
          { 'Rank': 71, 'Ganho de Energia': '4.94M' },
          { 'Rank': 72, 'Ganho de Energia': '9.88M' },
          { 'Rank': 73, 'Ganho de Energia': '19.7M' },
          { 'Rank': 74, 'Ganho de Energia': '39.5M' },
          { 'Rank': 75, 'Ganho de Energia': '79.0M' },
          { 'Rank': 76, 'Ganho de Energia': '158M' },
          { 'Rank': 77, 'Ganho de Energia': '316M' },
          { 'Rank': 78, 'Ganho de Energia': '632M' },
          { 'Rank': 79, 'Ganho de Energia': '1.26B' },
          { 'Rank': 80, 'Ganho de Energia': '2.52B' },
          { 'Rank': 81, 'Ganho de Energia': '5.05B' },
          { 'Rank': 82, 'Ganho de Energia': '10.1B' },
          { 'Rank': 83, 'Ganho de Energia': '20.2B' },
          { 'Rank': 84, 'Ganho de Energia': '40.4B' },
          { 'Rank': 85, 'Ganho de Energia': '80.9T' },
          { 'Rank': 86, 'Ganho de Energia': '161T' },
          { 'Rank': 87, 'Ganho de Energia': '323T' },
          { 'Rank': 88, 'Ganho de Energia': '647T' },
          { 'Rank': 89, 'Ganho de Energia': '1.29qd' },
          { 'Rank': 90, 'Ganho de Energia': '2.58qd' },
          { 'Rank': 91, 'Ganho de Energia': '5.17qd' },
          { 'Rank': 92, 'Ganho de Energia': '10.3qd' },
          { 'Rank': 93, 'Ganho de Energia': '20.7qd' },
          { 'Rank': 94, 'Ganho de Energia': '41.4qd' },
          { 'Rank': 95, 'Ganho de Energia': '82.8Qn' },
          { 'Rank': 96, 'Ganho de Energia': '165Qn' },
          { 'Rank': 97, 'Ganho de Energia': '331Qn' },
          { 'Rank': 98, 'Ganho de Energia': '663Qn' },
          { 'Rank': 99, 'Ganho de Energia': '1.32sx' },
          { 'Rank': 100, 'Ganho de Energia': '2.65sx' },
          { 'Rank': 101, 'Ganho de Energia': '5.31sx' },
          { 'Rank': 102, 'Ganho de Energia': '10.6sx' },
          { 'Rank': 103, 'Ganho de Energia': '21.2sx' },
          { 'Rank': 104, 'Ganho de Energia': '42.5Sp' },
          { 'Rank': 105, 'Ganho de Energia': '85.1Sp' },
          { 'Rank': 106, 'Ganho de Energia': '170Sp' },
          { 'Rank': 107, 'Ganho de Energia': '340Sp' },
          { 'Rank': 108, 'Ganho de Energia': '681Sp' },
          { 'Rank': 109, 'Ganho de Energia': '1.36O' },
          { 'Rank': 110, 'Ganho de Energia': '2.72O' },
        ]
      }
    }
};

export const levelExpArticle: Omit<WikiArticle, 'createdAt'> = {
    id: 'level-exp',
    title: 'Experiência por Nível',
    summary: 'Uma tabela de referência para a experiência necessária para cada nível do jogo.',
    content: `Esta tabela detalha a quantidade total de experiência necessária para atingir cada nível, até o nível máximo de 270 (Prestígio 5). A experiência necessária aumenta aproximadamente 10% a cada nível.`,
    tags: ['nível', 'experiência', 'exp', 'progressão', 'guia', 'geral'],
    imageId: 'wiki-5', // Reusing prestige image
    tables: {
      levelExp: {
        headers: ['Nível', 'Experiência Necessária'],
        rows: [
            { Nível: 1, 'Experiência Necessária': '1k' },
            { Nível: 2, 'Experiência Necessária': '1.1k' },
            { Nível: 3, 'Experiência Necessária': '1.21k' },
            { Nível: 4, 'Experiência Necessária': '1.33k' },
            { Nível: 5, 'Experiência Necessária': '1.46k' },
            { Nível: 6, 'Experiência Necessária': '1.61k' },
            { Nível: 7, 'Experiência Necessária': '1.77k' },
            { Nível: 8, 'Experiência Necessária': '1.95k' },
            { Nível: 9, 'Experiência Necessária': '2.14k' },
            { Nível: 10, 'Experiência Necessária': '2.36k' },
            { Nível: 11, 'Experiência Necessária': '2.59k' },
            { Nível: 12, 'Experiência Necessária': '2.85k' },
            { Nível: 13, 'Experiência Necessária': '3.14k' },
            { Nível: 14, 'Experiência Necessária': '3.45k' },
            { Nível: 15, 'Experiência Necessária': '3.8k' },
            { Nível: 16, 'Experiência Necessária': '4.18k' },
            { Nível: 17, 'Experiência Necessária': '4.59k' },
            { Nível: 18, 'Experiência Necessária': '5.05k' },
            { Nível: 19, 'Experiência Necessária': '5.56k' },
            { Nível: 20, 'Experiência Necessária': '6.12k' },
            { Nível: 21, 'Experiência Necessária': '6.73k' },
            { Nível: 22, 'Experiência Necessária': '7.4k' },
            { Nível: 23, 'Experiência Necessária': '8.14k' },
            { Nível: 24, 'Experiência Necessária': '8.95k' },
            { Nível: 25, 'Experiência Necessária': '9.85k' },
            { Nível: 26, 'Experiência Necessária': '10.8k' },
            { Nível: 27, 'Experiência Necessária': '11.9k' },
            { Nível: 28, 'Experiência Necessária': '13.1k' },
            { Nível: 29, 'Experiência Necessária': '14.4k' },
            { Nível: 30, 'Experiência Necessária': '15.9k' },
            { Nível: 31, 'Experiência Necessária': '17.5k' },
            { Nível: 32, 'Experiência Necessária': '19.2k' },
            { Nível: 33, 'Experiência Necessária': '21.1k' },
            { Nível: 34, 'Experiência Necessária': '23.2k' },
            { Nível: 35, 'Experiência Necessária': '25.6k' },
            { Nível: 36, 'Experiência Necessária': '28.1k' },
            { Nível: 37, 'Experiência Necessária': '30.9k' },
            { Nível: 38, 'Experiência Necessária': '34k' },
            { Nível: 39, 'Experiência Necessária': '37.4k' },
            { Nível: 40, 'Experiência Necessária': '41.2k' },
            { Nível: 41, 'Experiência Necessária': '45.3k' },
            { Nível: 42, 'Experiência Necessária': '49.8k' },
            { Nível: 43, 'Experiência Necessária': '54.8k' },
            { Nível: 44, 'Experiência Necessária': '60.3k' },
            { Nível: 45, 'Experiência Necessária': '66.3k' },
            { Nível: 46, 'Experiência Necessária': '73k' },
            { Nível: 47, 'Experiência Necessária': '80.3k' },
            { Nível: 48, 'Experiência Necessária': '88.3k' },
            { Nível: 49, 'Experiência Necessária': '97.1k' },
            { Nível: 50, 'Experiência Necessária': '107k' },
            { Nível: 51, 'Experiência Necessária': '118k' },
            { Nível: 52, 'Experiência Necessária': '129k' },
            { Nível: 53, 'Experiência Necessária': '142k' },
            { Nível: 54, 'Experiência Necessária': '157k' },
            { Nível: 55, 'Experiência Necessária': '172k' },
            { Nível: 56, 'Experiência Necessária': '190k' },
            { Nível: 57, 'Experiência Necessária': '209k' },
            { Nível: 58, 'Experiência Necessária': '229k' },
            { Nível: 59, 'Experiência Necessária': '252k' },
            { Nível: 60, 'Experiência Necessária': '278k' },
            { Nível: 61, 'Experiência Necessária': '305k' },
            { Nível: 62, 'Experiência Necessária': '336k' },
            { Nível: 63, 'Experiência Necessária': '370k' },
            { Nível: 64, 'Experiência Necessária': '407k' },
            { Nível: 65, 'Experiência Necessária': '447k' },
            { Nível: 66, 'Experiência Necessária': '492k' },
            { Nível: 67, 'Experiência Necessária': '541k' },
            { Nível: 68, 'Experiência Necessária': '596k' },
            { Nível: 69, 'Experiência Necessária': '655k' },
            { Nível: 70, 'Experiência Necessária': '721k' },
            { Nível: 71, 'Experiência Necessária': '793k' },
            { Nível: 72, 'Experiência Necessária': '872k' },
            { Nível: 73, 'Experiência Necessária': '960k' },
            { Nível: 74, 'Experiência Necessária': '1.06M' },
            { Nível: 75, 'Experiência Necessária': '1.16M' },
            { Nível: 76, 'Experiência Necessária': '1.28M' },
            { Nível: 77, 'Experiência Necessária': '1.41M' },
            { Nível: 78, 'Experiência Necessária': '1.55M' },
            { Nível: 79, 'Experiência Necessária': '1.7M' },
            { Nível: 80, 'Experiência Necessária': '1.87M' },
            { Nível: 81, 'Experiência Necessária': '2.06M' },
            { Nível: 82, 'Experiência Necessária': '2.27M' },
            { Nível: 83, 'Experiência Necessária': '2.49M' },
            { Nível: 84, 'Experiência Necessária': '2.74M' },
            { Nível: 85, 'Experiência Necessária': '3.02M' },
            { Nível: 86, 'Experiência Necessária': '3.32M' },
            { Nível: 87, 'Experiência Necessária': '3.65M' },
            { Nível: 88, 'Experiência Necessária': '4.02M' },
            { Nível: 89, 'Experiência Necessária': '4.42M' },
            { Nível: 90, 'Experiência Necessária': '4.86M' },
            { Nível: 91, 'Experiência Necessária': '5.35M' },
            { Nível: 92, 'Experiência Necessária': '5.88M' },
            { Nível: 93, 'Experiência Necessária': '6.47M' },
            { Nível: 94, 'Experiência Necessária': '7.12M' },
            { Nível: 95, 'Experiência Necessária': '7.83M' },
            { Nível: 96, 'Experiência Necessária': '8.61M' },
            { Nível: 97, 'Experiência Necessária': '9.47M' },
            { Nível: 98, 'Experiência Necessária': '10.4M' },
            { Nível: 99, 'Experiência Necessária': '11.5M' },
            { Nível: 100, 'Experiência Necessária': '12.6M' },
            { Nível: 101, 'Experiência Necessária': '13.9M' },
            { Nível: 102, 'Experiência Necessária': '15.3M' },
            { Nível: 103, 'Experiência Necessária': '16.8M' },
            { Nível: 104, 'Experiência Necessária': '18.5M' },
            { Nível: 105, 'Experiência Necessária': '20.3M' },
            { Nível: 106, 'Experiência Necessária': '22.4M' },
            { Nível: 107, 'Experiência Necessária': '24.6M' },
            { Nível: 108, 'Experiência Necessária': '27.1M' },
            { Nível: 109, 'Experiência Necessária': '29.8M' },
            { Nível: 110, 'Experiência Necessária': '32.8M' },
            { Nível: 111, 'Experiência Necessária': '36.1M' },
            { Nível: 112, 'Experiência Necessária': '39.7M' },
            { Nível: 113, 'Experiência Necessária': '43.6M' },
            { Nível: 114, 'Experiência Necessária': '48M' },
            { Nível: 115, 'Experiência Necessária': '52.8M' },
            { Nível: 116, 'Experiência Necessária': '58.1M' },
            { Nível: 117, 'Experiência Necessária': '63.9M' },
            { Nível: 118, 'Experiência Necessária': '70.3M' },
            { Nível: 119, 'Experiência Necessária': '77.3M' },
            { Nível: 120, 'Experiência Necessária': '85.1M' },
            { Nível: 121, 'Experiência Necessária': '93.6M' },
            { Nível: 122, 'Experiência Necessária': '103M' },
            { Nível: 123, 'Experiência Necessária': '113M' },
            { Nível: 124, 'Experiência Necessária': '125M' },
            { Nível: 125, 'Experiência Necessária': '137M' },
            { Nível: 126, 'Experiência Necessária': '151M' },
            { Nível: 127, 'Experiência Necessária': '166M' },
            { Nível: 128, 'Experiência Necessária': '183M' },
            { Nível: 129, 'Experiência Necessária': '201M' },
            { Nível: 130, 'Experiência Necessária': '221M' },
            { Nível: 131, 'Experiência Necessária': '243M' },
            { Nível: 132, 'Experiência Necessária': '268M' },
            { Nível: 133, 'Experiência Necessária': '294M' },
            { Nível: 134, 'Experiência Necessária': '324M' },
            { Nível: 135, 'Experiência Necessária': '356M' },
            { Nível: 136, 'Experiência Necessária': '392M' },
            { Nível: 137, 'Experiência Necessária': '431M' },
            { Nível: 138, 'Experiência Necessária': '474M' },
            { Nível: 139, 'Experiência Necessária': '522M' },
            { Nível: 140, 'Experiência Necessária': '574M' },
            { Nível: 141, 'Experiência Necessária': '631M' },
            { Nível: 142, 'Experiência Necessária': '694M' },
            { Nível: 143, 'Experiência Necessária': '764M' },
            { Nível: 144, 'Experiência Necessária': '840M' },
            { Nível: 145, 'Experiência Necessária': '924M' },
            { Nível: 146, 'Experiência Necessária': '1.02B' },
            { Nível: 147, 'Experiência Necessária': '1.12B' },
            { Nível: 148, 'Experiência Necessária': '1.23B' },
            { Nível: 149, 'Experiência Necessária': '1.35B' },
            { Nível: 150, 'Experiência Necessária': '1.49B' },
            { Nível: 151, 'Experiência Necessária': '1.64B' },
            { Nível: 152, 'Experiência Necessária': '1.8B' },
            { Nível: 153, 'Experiência Necessária': '1.98B' },
            { Nível: 154, 'Experiência Necessária': '2.18B' },
            { Nível: 155, 'Experiência Necessária': '2.4B' },
            { Nível: 156, 'Experiência Necessária': '2.64B' },
            { Nível: 157, 'Experiência Necessária': '2.9B' },
            { Nível: 158, 'Experiência Necessária': '3.19B' },
            { Nível: 159, 'Experiência Necessária': '3.51B' },
            { Nível: 160, 'Experiência Necessária': '3.86B' },
            { Nível: 161, 'Experiência Necessária': '4.25B' },
            { Nível: 162, 'Experiência Necessária': '4.67B' },
            { Nível: 163, 'Experiência Necessária': '5.14B' },
            { Nível: 164, 'Experiência Necessária': '5.65B' },
            { Nível: 165, 'Experiência Necessária': '6.22B' },
            { Nível: 166, 'Experiência Necessária': '6.84B' },
            { Nível: 167, 'Experiência Necessária': '7.52B' },
            { Nível: 168, 'Experiência Necessária': '8.28B' },
            { Nível: 169, 'Experiência Necessária': '9.1B' },
            { Nível: 170, 'Experiência Necessária': '10B' },
            { Nível: 171, 'Experiência Necessária': '11B' },
            { Nível: 172, 'Experiência Necessária': '12.1B' },
            { Nível: 173, 'Experiência Necessária': '13.3B' },
            { Nível: 174, 'Experiência Necessária': '14.7B' },
            { Nível: 175, 'Experiência Necessária': '16.1B' },
            { Nível: 176, 'Experiência Necessária': '17.7B' },
            { Nível: 177, 'Experiência Necessária': '19.5B' },
            { Nível: 178, 'Experiência Necessária': '21.5B' },
            { Nível: 179, 'Experiência Necessária': '23.6B' },
            { Nível: 180, 'Experiência Necessária': '26B' },
            { Nível: 181, 'Experiência Necessária': '28.6B' },
            { Nível: 182, 'Experiência Necessária': '31.4B' },
            { Nível: 183, 'Experiência Necessária': '34.6B' },
            { Nível: 184, 'Experiência Necessária': '38B' },
            { Nível: 185, 'Experiência Necessária': '41.8B' },
            { Nível: 186, 'Experiência Necessária': '46B' },
            { Nível: 187, 'Experiência Necessária': '50.6B' },
            { Nível: 188, 'Experiência Necessária': '55.7B' },
            { Nível: 189, 'Experiência Necessária': '61.2B' },
            { Nível: 190, 'Experiência Necessária': '67.4B' },
            { Nível: 191, 'Experiência Necessária': '74.1B' },
            { Nível: 192, 'Experiência Necessária': '81.5B' },
            { Nível: 193, 'Experiência Necessária': '89.7B' },
            { Nível: 194, 'Experiência Necessária': '98.6B' },
            { Nível: 195, 'Experiência Necessária': '109B' },
            { Nível: 196, 'Experiência Necessária': '119B' },
            { Nível: 197, 'Experiência Necessária': '131B' },
            { Nível: 198, 'Experiência Necessária': '144B' },
            { Nível: 199, 'Experiência Necessária': '159B' },
            { Nível: 200, 'Experiência Necessária': '175B' },
            { Nível: 201, 'Experiência Necessária': '192B' },
            { Nível: 202, 'Experiência Necessária': '211B' },
            { Nível: 203, 'Experiência Necessária': '232B' },
            { Nível: 204, 'Experiência Necessária': '256B' },
            { Nível: 205, 'Experiência Necessária': '281B' },
            { Nível: 206, 'Experiência Necessária': '309B' },
            { Nível: 207, 'Experiência Necessária': '340B' },
            { Nível: 208, 'Experiência Necessária': '374B' },
            { Nível: 209, 'Experiência Necessária': '412B' },
            { Nível: 210, 'Experiência Necessária': '453B' },
            { Nível: 211, 'Experiência Necessária': '498B' },
            { Nível: 212, 'Experiência Necessária': '548B' },
            { Nível: 213, 'Experiência Necessária': '603B' },
            { Nível: 214, 'Experiência Necessária': '663B' },
            { Nível: 215, 'Experiência Necessária': '730B' },
            { Nível: 216, 'Experiência Necessária': '803B' },
            { Nível: 217, 'Experiência Necessária': '883B' },
            { Nível: 218, 'Experiência Necessária': '971B' },
            { Nível: 219, 'Experiência Necessária': '1.07T' },
            { Nível: 220, 'Experiência Necessária': '1.18T' },
            { Nível: 221, 'Experiência Necessária': '1.29T' },
            { Nível: 222, 'Experiência Necessária': '1.42T' },
            { Nível: 223, 'Experiência Necessária': '1.57T' },
            { Nível: 224, 'Experiência Necessária': '1.72T' },
            { Nível: 225, 'Experiência Necessária': '1.9T' },
            { Nível: 226, 'Experiência Necessária': '2.09T' },
            { Nível: 227, 'Experiência Necessária': '2.3T' },
            { Nível: 228, 'Experiência Necessária': '2.53T' },
            { Nível: 229, 'Experiência Necessária': '2.78T' },
            { Nível: 230, 'Experiência Necessária': '3.06T' },
            { Nível: 231, 'Experiência Necessária': '3.37T' },
            { Nível: 232, 'Experiência Necessária': '3.7T' },
            { Nível: 233, 'Experiência Necessária': '4.07T' },
            { Nível: 234, 'Experiência Necessária': '4.48T' },
            { Nível: 235, 'Experiência Necessária': '4.93T' },
            { Nível: 236, 'Experiência Necessária': '5.42T' },
            { Nível: 237, 'Experiência Necessária': '5.96T' },
            { Nível: 238, 'Experiência Necessária': '6.56T' },
            { Nível: 239, 'Experiência Necessária': '7.22T' },
            { Nível: 240, 'Experiência Necessária': '7.94T' },
            { Nível: 241, 'Experiência Necessária': '8.73T' },
            { Nível: 242, 'Experiência Necessária': '9.61T' },
            { Nível: 243, 'Experiência Necessária': '10.6T' },
            { Nível: 244, 'Experiência Necessária': '11.6T' },
            { Nível: 245, 'Experiência Necessária': '12.8T' },
            { Nível: 246, 'Experiência Necessária': '14.1T' },
            { Nível: 247, 'Experiência Necessária': '15.5T' },
            { Nível: 248, 'Experiência Necessária': '17T' },
            { Nível: 249, 'Experiência Necessária': '18.7T' },
            { Nível: 250, 'Experiência Necessária': '20.6T' },
            { Nível: 251, 'Experiência Necessária': '22.7T' },
            { Nível: 252, 'Experiência Necessária': '24.9T' },
            { Nível: 253, 'Experiência Necessária': '27.4T' },
            { Nível: 254, 'Experiência Necessária': '30.2T' },
            { Nível: 255, 'Experiência Necessária': '33.2T' },
            { Nível: 256, 'Experiência Necessária': '36.5T' },
            { Nível: 257, 'Experiência Necessária': '40.2T' },
            { Nível: 258, 'Experiência Necessária': '44.2T' },
            { Nível: 259, 'Experiência Necessária': '48.6T' },
            { Nível: 260, 'Experiência Necessária': '53.5T' },
            { Nível: 261, 'Experiência Necessária': '58.8T' },
            { Nível: 262, 'Experiência Necessária': '64.7T' },
            { Nível: 263, 'Experiência Necessária': '71.2T' },
            { Nível: 264, 'Experiência Necessária': '78.3T' },
            { Nível: 265, 'Experiência Necessária': '86.1T' },
            { Nível: 266, 'Experiência Necessária': '94.7T' },
            { Nível: 267, 'Experiência Necessária': '104T' },
            { Nível: 268, 'Experiência Necessária': '115T' },
            { Nível: 269, 'Experiência Necessária': '126T' },
            { Nível: 270, 'Experiência Necessária': '139T' }
        ]
      }
    }
};


export const worldBossesArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'world-bosses',
  title: 'Guia de Chefes de Mundo',
  summary: 'Um guia completo para todos os chefes de mundo, seus status e o HP necessário para derrotá-los.',
  content: `Este guia fornece uma lista de chefes de Rank-SS e SSS, detalhando o HP necessário para um "one-hit kill".`,
  tags: ['chefes', 'guia', 'dps', 'hp', 'recompensas', 'geral', '1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '13', '15', '16', '17', '19', '20'],
  imageId: 'wiki-7',
  tables: {
    ssBosses: {
      headers: ['Mundo', 'Chefe (Rank SS)', 'HP para Hit Kill'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS)': 'Kid Kohan', 'HP para Hit Kill': '2.5qd' },
        { 'Mundo': 2, 'Chefe (Rank SS)': 'Shanks', 'HP para Hit Kill': '5sx' },
        { 'Mundo': 3, 'Chefe (Rank SS)': 'Eizen', 'HP para Hit Kill': '2.5Sp' },
        { 'Mundo': 4, 'Chefe (Rank SS)': 'Sakuni', 'HP para Hit Kill': '120Sp' },
        { 'Mundo': 5, 'Chefe (Rank SS)': 'Rangaki', 'HP para Hit Kill': '31.2de' },
        { 'Mundo': 6, 'Chefe (Rank SS)': 'Statue of God', 'HP para Hit Kill': '195Ud' },
        { 'Mundo': 7, 'Chefe (Rank SS)': 'Novi Chroni', 'HP para Hit Kill': '101tdD' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Itechi', 'HP para Hit Kill': '2.82QnD' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Madera', 'HP para Hit Kill': '5.64QnD' },
        { 'Mundo': 9, 'Chefe (Rank SS)': 'Ken Turbo', 'HP para Hit Kill': '494sxD' },
        { 'Mundo': 10, 'Chefe (Rank SS)': 'Killas Godspeed', 'HP para Hit Kill': '296OcD' },
        { 'Mundo': 11, 'Chefe (Rank SS)': 'Eran', 'HP para Hit Kill': '49.4Vgn' },
        { 'Mundo': 12, 'Chefe (Rank SS)': 'Esanor', 'HP para Hit Kill': '9.77DVg' },
        { 'Mundo': 13, 'Chefe (Rank SS)': 'Number 8', 'HP para Hit Kill': '5.55qtV' },
        { 'Mundo': 14, 'Chefe (Rank SS)': 'Valzora', 'HP para Hit Kill': '4.79SeV' },
        { 'Mundo': 15, 'Chefe (Rank SS)': 'The Paladin', 'HP para Hit Kill': '967SPG' },
        { 'Mundo': 16, 'Chefe (Rank SS)': 'Dio', 'HP para Hit Kill': '195NVG' },
        { 'Mundo': 17, 'Chefe (Rank SS)': 'Arama', 'HP para Hit Kill': '686UTG' },
        { 'Mundo': 18, 'Chefe (Rank SS)': 'Mr. Chainsaw', 'HP para Hit Kill': '5.09tsTG' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Hero of Hell', 'HP para Hit Kill': '50.9qTG' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Leonardo', 'HP para Hit Kill': '1.76QnTG' },
        { 'Mundo': '19', 'Chefe (Rank SS)': 'Bansho', 'HP para Hit Kill': '17.6ssTG' },
        { 'Mundo': 20, 'Chefe (Rank SS)': 'Koku SSJ', 'HP para Hit Kill': '1.52NoTG' },
        { 'Mundo': 20, 'Chefe (Rank SSS)': 'Frezi Final Form', 'HP para Hit Kill': '15.2QdDR' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Cifer', 'HP para Hit Kill': '871uQDR' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Vasto Ichge', 'HP para Hit Kill': '8.72tQDR' }
      ]
    }
  }
};


export const swordsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'energy-swords',
  title: 'Espadas de Energia',
  summary: 'Um guia para as espadas que fornecem um multiplicador de energia, onde encontrá-las e seus status.',
  content: 'Espadas de energia são armas especiais que aumentam sua energia total com base em seu nível. Elas são encontradas em diferentes mundos.',
  tags: ['espadas', 'energia', 'arma', 'guia', 'geral', '3', '5', '15', '19'],
  imageId: 'wiki-8',
  tables: {
    world3: {
      headers: ['Espada (Mundo 3 - Ichige)', 'Stats'],
      rows: [
        { 'Espada (Mundo 3 - Ichige)': 'Zangetsu', 'Stats': '0.05x' },
        { 'Espada (Mundo 3 - Ichige)': 'Zangetsu (1 Estrela)', 'Stats': '0.1x' },
        { 'Espada (Mundo 3 - Ichige)': 'Zangetsu (2 Estrelas)', 'Stats': '0.15x' },
        { 'Espada (Mundo 3 - Ichige)': 'Zangetsu (3 Estrelas)', 'Stats': '0.25x' },
      ],
    },
    world5: {
      headers: ['Espada (Mundo 5 - Zentsu)', 'Stats'],
      rows: [
        { 'Espada (Mundo 5 - Zentsu)': 'Yellow Nichirin', 'Stats': '0.075x' },
        { 'Espada (Mundo 5 - Zentsu)': 'Yellow Nichirin (1 Estrela)', 'Stats': '0.15x' },
        { 'Espada (Mundo 5 - Zentsu)': 'Yellow Nichirin (2 Estrelas)', 'Stats': '0.225x' },
        { 'Espada (Mundo 5 - Zentsu)': 'Yellow Nichirin (3 Estrelas)', 'Stats': '0.375x' },
      ],
    },
    world15: {
        headers: ['Espada (Mundo 15 - Beater)', 'Stats'],
        rows: [
            { 'Espada (Mundo 15 - Beater)': 'Lucidator', 'Stats': '0.125x' },
            { 'Espada (Mundo 15 - Beater)': 'Lucidator (1 Estrela)', 'Stats': '0.250x' },
            { 'Espada (Mundo 15 - Beater)': 'Lucidator (2 Estrelas)', 'Stats': '0.375x' },
            { 'Espada (Mundo 15 - Beater)': 'Lucidator (3 Estrelas)', 'Stats': '0.625x' },
        ],
    },
    world19: {
        headers: ['Espada (Mundo 19 - Arter)', 'Stats'],
        rows: [
            { 'Espada (Mundo 19 - Arter)': 'Excalibur', 'Stats': '0.2x' },
            { 'Espada (Mundo 19 - Arter)': 'Excalibur (1 Estrela)', 'Stats': '0.4x' },
            { 'Espada (Mundo 19 - Arter)': 'Excalibur (2 Estrelas)', 'Stats': '0.6x' },
            { 'Espada (Mundo 19 - Arter)': 'Excalibur (3 Estrelas)', 'Stats': '1x' },
        ],
    }
  },
};

export const damageSwordsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'damage-swords',
  title: 'Espadas de Dano (Evolução)',
  summary: 'Um guia para as espadas de dano e seus multiplicadores em cada nível de evolução (estrela), incluindo informações sobre a espada de evento Golden Venom Strike.',
  content: `Espadas de dano aumentam seu poder de ataque. A cada evolução (nível de estrela), o multiplicador de dano aumenta significativamente. Para maximizar ainda mais o dano, as espadas podem ser aprimoradas com encantamentos como **Respirações** e **Runas**, que também possuem suas próprias raridades e bônus.

**Nota Especial sobre a Golden Venom Strike:** A Golden Venom Strike foi uma espada de evento da atualização 17, que saiu na atualização 18 e não está mais disponível para obtenção. Ela era adquirida no Mundo 2 ao trocar uma Venomstrike de 3 estrelas (Phantom) por ela. A Golden Venom Strike possui um multiplicador de dano base de 38x e não possui estrelas ou passivas.`,
  tags: ['espadas', 'dano', 'arma', 'guia', 'geral', 'evolução', 'golden venom', 'respiração', 'runa'],
  imageId: 'wiki-9',
  tables: {
    damageSwords: {
      headers: ['Espada', 'Raridade', 'Dano Base (3 Estrelas)', 'Com Respiração Phantom', 'Com Runa de Dano Phantom + Respiração Phantom', 'Com Runa de Dano Supremo + Respiração Phantom'],
      rows: [
        { 'Espada': 'BloodThorn', 'Raridade': 'Comum', 'Dano Base (3 Estrelas)': '1.25x', 'Com Respiração Phantom': '2.25x', 'Com Runa de Dano Phantom + Respiração Phantom': '4.05x', 'Com Runa de Dano Supremo + Respiração Phantom': '5x' },
        { 'Espada': 'Eclipse Warden', 'Raridade': 'Incomum', 'Dano Base (3 Estrelas)': '2.25x', 'Com Respiração Phantom': '4.05x', 'Com Runa de Dano Phantom + Respiração Phantom': '7.29x', 'Com Runa de Dano Supremo + Respiração Phantom': '9.10x' },
        { 'Espada': 'Obsidian Reaver', 'Raridade': 'Raro', 'Dano Base (3 Estrelas)': '3.75x', 'Com Respiração Phantom': '6.75x', 'Com Runa de Dano Phantom + Respiração Phantom': '12.15x', 'Com Runa de Dano Supremo + Respiração Phantom': '13.50x' },
        { 'Espada': 'Aquarius Edge', 'Raridade': 'Lendário', 'Dano Base (3 Estrelas)': '5x', 'Com Respiração Phantom': '9x', 'Com Runa de Dano Phantom + Respiração Phantom': '16.2x', 'Com Runa de Dano Supremo + Respiração Phantom': '18x' },
        { 'Espada': 'Demon Soul', 'Raridade': 'Mítico', 'Dano Base (3 Estrelas)': '6.25x', 'Com Respiração Phantom': '11.25x', 'Com Runa de Dano Phantom + Respiração Phantom': '20.25x', 'Com Runa de Dano Supremo + Respiração Phantom': '22.50x' },
        { 'Espada': 'Redmourne', 'Raridade': 'Mítico', 'Dano Base (3 Estrelas)': '7.5x', 'Com Respiração Phantom': '13.5x', 'Com Runa de Dano Phantom + Respiração Phantom': '24.3x', 'Com Runa de Dano Supremo + Respiração Phantom': '27x' },
        { 'Espada': 'VenomStrike', 'Raridade': 'Phantom', 'Dano Base (3 Estrelas)': '10x', 'Com Respiração Phantom': '18x', 'Com Runa de Dano Phantom + Respiração Phantom': '32.4x', 'Com Runa de Dano Supremo + Respiração Phantom': '36x' },
        { 'Espada': 'Golden Venom Strike', 'Raridade': 'Evento', 'Dano Base (3 Estrelas)': '38x (Não possui estrelas)', 'Com Respiração Phantom': 'N/A', 'Com Runa de Dano Phantom + Respiração Phantom': 'N/A', 'Com Runa de Dano Supremo + Respiração Phantom': 'N/A' },
      ],
    },
  },
};

export const world20RaidsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'world-20-raids',
  title: 'Raids do Mundo 20',
  summary: 'Requisitos de energia para as raids "Green Planet" e "Suffering" no Mundo 20.',
  content: 'Este guia detalha a quantidade de energia necessária para passar por ondas específicas nas raids do Mundo 20.',
  tags: ['raid', 'guia', 'mundo 20', 'energia', '20', 'geral'],
  imageId: 'wiki-10',
  tables: {
    raids: {
      headers: ['Wave', 'Green Planet Raid', 'Suffering Raid'],
      rows: [
        { 'Wave': '10', 'Green Planet Raid': '494 - qnTG', 'Suffering Raid': '200 - OcTG' },
        { 'Wave': '20', 'Green Planet Raid': '1.19 - ssTG', 'Suffering Raid': '600 - NoTG' },
        { 'Wave': '30', 'Green Planet Raid': '3.12 - ssTG', 'Suffering Raid': '---' },
        { 'Wave': '40', 'Green Planet Raid': '7.53 - ssTG', 'Suffering Raid': '---' },
        { 'Wave': '50', 'Green Planet Raid': '21.4 - ssTG', 'Suffering Raid': '---' },
        { 'Wave': '100', 'Green Planet Raid': '2.5 - spTG', 'Suffering Raid': '---' },
        { 'Wave': '115', 'Green Planet Raid': '10.1 - spTG', 'Suffering Raid': '---' },
        { 'Wave': '130', 'Green Planet Raid': '45.1 - spTG', 'Suffering Raid': '---' },
        { 'Wave': '150', 'Green Planet Raid': '286 - spTG', 'Suffering Raid': '---' },
        { 'Wave': '175', 'Green Planet Raid': '2.94 - OcTG', 'Suffering Raid': '---' },
        { 'Wave': '200', 'Green Planet Raid': '35.9 - OcTG', 'Suffering Raid': '---' },
      ]
    }
  }
};

export const raidRequirementsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'raid-requirements',
  title: 'Requisitos de Energia para Raids',
  summary: 'Um guia completo com os requisitos de energia para passar por diferentes ondas em várias raids e dungeons do jogo.',
  content: `Este guia consolida a energia necessária para progredir nas principais raids e dungeons do Anime Eternal. É importante notar que as raids podem ser solo ou em grupo.

**Raids Solo (1 Jogador):**
*   **Gleam Raid (Mundo 15):** Uma raid de desafio individual.
*   **Raid Sins:** Outra raid projetada para um único jogador.

**Raids em Grupo (até 4 Jogadores):**
*   Todas as outras raids não mencionadas como "solo" permitem a participação de até 4 jogadores.

Abaixo estão as tabelas com os requisitos de HP e DPS para as novas raids, e a tabela consolidada para as raids mais antigas.`,
  tags: ['raid', 'dungeon', 'energia', 'guia', 'geral', 'solo'],
  imageId: 'wiki-11',
  tables: {
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
      headers: ['Wave', 'Tournament Raid', 'Restaurant Raid', 'Cursed Raid', 'Leaf Raid', 'Progression Raid', 'Titan Defense', 'Raid Sins', 'Kaiju Dungeon', 'Progression Raid 2', 'Ghoul Raid', 'Chainsaw Defense', 'Nether World Raid', 'Green Planet Raid'],
      rows: [
        { 'Wave': 50, 'Tournament Raid': '10 QD', 'Restaurant Raid': '750 T', 'Cursed Raid': '500 QN', 'Leaf Raid': '500 UD', 'Progression Raid': '500 DD', 'Titan Defense': '300 SXD', 'Raid Sins': '111 OCD', 'Kaiju Dungeon': '500 UVG', 'Progression Raid 2': '200 QNV', 'Ghoul Raid': '600 SPG', 'Chainsaw Defense': '230 TGN', 'Nether World Raid': '6 TSTG', 'Green Planet Raid': '21.4 - ssTG' },
        { 'Wave': 100, 'Tournament Raid': '11 N', 'Restaurant Raid': '140 QD', 'Cursed Raid': '140 QD', 'Leaf Raid': '5 DD', 'Progression Raid': '62 TDD', 'Titan Defense': '20 SPD', 'Raid Sins': '13 NVD', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '24 SEV', 'Ghoul Raid': '70 OVG', 'Chainsaw Defense': '27 UTG', 'Nether World Raid': '40 QTTG', 'Green Planet Raid': '2.5 - spTG' },
        { 'Wave': 200, 'Tournament Raid': '14 NVD', 'Restaurant Raid': '2 SX', 'Cursed Raid': '860 SP', 'Leaf Raid': '75 TDD', 'Progression Raid': '900 QDD', 'Titan Defense': '250 OCD', 'Raid Sins': '200 VGN', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '333 SPG', 'Ghoul Raid': '1 TGN', 'Chainsaw Defense': '375 DTG', 'Nether World Raid': '//////', 'Green Planet Raid': '35.9 - OcTG' },
        { 'Wave': 300, 'Tournament Raid': '17 NVG', 'Restaurant Raid': '27,5 SP', 'Cursed Raid': '12 N', 'Leaf Raid': '1 QND', 'Progression Raid': '12 SXD', 'Titan Defense': '10 VGN', 'Raid Sins': '2 DVG', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '5 NVG', 'Ghoul Raid': '13 UTG', 'Chainsaw Defense': '5 QTTG', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 500, 'Tournament Raid': '????', 'Restaurant Raid': '5 DE', 'Cursed Raid': '2,25 DD', 'Leaf Raid': '200 SPG', 'Progression Raid': '2,25 NVD', 'Titan Defense': '650 DVG', 'Raid Sins': '10 OVG', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '900 UTG', 'Ghoul Raid': '2,5 QTTG', 'Chainsaw Defense': '1 SPTG', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 750, 'Tournament Raid': '//////', 'Restaurant Raid': '110 TDD', 'Cursed Raid': '500 QND', 'Leaf Raid': '4,5 UVG', 'Progression Raid': '50 DVG', 'Titan Defense': '15 SEV', 'Raid Sins': '200 UTG', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '20 QNTG', 'Ghoul Raid': '55 SPTG', 'Chainsaw Defense': '22 QDDR', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 1000, 'Tournament Raid': '//////', 'Restaurant Raid': '2,5 SPD', 'Cursed Raid': '1,1 NVD', 'Leaf Raid': '95 QTV', 'Progression Raid': '1 SEV', 'Titan Defense': '350 NVG', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '500 OCTG', 'Ghoul Raid': '2 UQDR', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 1200, 'Tournament Raid': '//////', 'Restaurant Raid': '//////', 'Cursed Raid': '//////', 'Leaf Raid': '18 SPG', 'Progression Raid': '//////', 'Titan Defense': '//////', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '//////', 'Ghoul Raid': '//////', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 1400, 'Tournament Raid': '//////', 'Restaurant Raid': '//////', 'Cursed Raid': '//////', 'Leaf Raid': '3,5 TGN', 'Progression Raid': '//////', 'Titan Defense': '//////', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '//////', 'Ghoul Raid': '//////', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 1600, 'Tournament Raid': '//////', 'Restaurant Raid': '//////', 'Cursed Raid': '//////', 'Leaf Raid': '650 DTG', 'Progression Raid': '//////', 'Titan Defense': '//////', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '//////', 'Ghoul Raid': '//////', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 1800, 'Tournament Raid': '//////', 'Restaurant Raid': '//////', 'Cursed Raid': '//////', 'Leaf Raid': '100 QNTG', 'Progression Raid': '//////', 'Titan Defense': '//////', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '//////', 'Ghoul Raid': '//////', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
        { 'Wave': 2000, 'Tournament Raid': '//////', 'Restaurant Raid': '//////', 'Cursed Raid': '//////', 'Leaf Raid': '35 OCTG', 'Progression Raid': '//////', 'Titan Defense': '//////', 'Raid Sins': '//////', 'Kaiju Dungeon': '//////', 'Progression Raid 2': '//////', 'Ghoul Raid': '//////', 'Chainsaw Defense': '//////', 'Nether World Raid': '//////', 'Green Planet Raid': '?????' },
      ]
    }
  }
};

export const gamepassTierListArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'gamepass-tier-list',
  title: 'Tier List de Gamepasses',
  summary: 'Uma tier list da comunidade para as gamepasses, classificando-as da mais para a menos útil para jogadores novos e de endgame.',
  content: `Esta tier list classifica as gamepasses disponíveis no jogo com base em sua utilidade geral e impacto. A lista é dividida em duas partes: uma para novos jogadores e outra para jogadores de endgame.

### Sugestões para Novos Jogadores

Estas são sugestões, não uma lista imposta a seguir.

### Se você está no Endgame

Estas são as gamepasses que você deve ter no endgame.`,
  tags: ['gamepass', 'tier list', 'endgame', 'compra', 'guia', 'geral'],
  imageId: 'wiki-12',
  tables: {
    newPlayerTiers: {
      headers: ['Tier', 'Gamepass', 'Recomendação'],
      rows: [
        { Tier: 'S', Gamepass: 'Fast Click, Fast Roll, Fast Star, 2x Damage', Recomendação: 'Estes são os passes mais importantes. Você deve comprá-los primeiro.' },
        { Tier: 'A', Gamepass: '+3 Champions Equip, +2 Champions Equip, Double Weapon Equip', Recomendação: 'Depois de ter os primeiros passes, compre estes a seguir.' },
        { Tier: 'B', Gamepass: '2x EXP, VIP, Extra Stand, Remote Gacha', Recomendação: 'Você precisará desses passes para progredir mais rápido no futuro.' },
        { Tier: 'C', Gamepass: '2x Soul, +2 Gacha, +5 Star Open, 2x Coin, Super Luck, Extra Luck, Lucky', Recomendação: 'Esses passes não são necessários, mas dão um bom bônus. Compre-os somente depois de todos os outros.' },
        { Tier: 'D', Gamepass: '+10 Backpack Space, +20 Backpack Space', Recomendação: 'Não vale a pena. Compre por último se realmente quiser.' },
        { Tier: '!', Gamepass: 'Extra Titan, Extra Shadow', Recomendação: 'Não compre esses passes até desbloquear os Titan Fighters no Mundo 11 e os Stand Fighters no Mundo 16.' },
      ],
    },
    endgameTiers: {
      headers: ['Tier', 'Gamepass', 'Recomendação'],
      rows: [
        { Tier: 'S', Gamepass: 'Fast Click, Fast Roll, Fast Star, 2x Damage, 2x Energy, Triple Weapon Equip, Extra Titan, Extra Shadow', Recomendação: 'Deve ter no endgame.' },
        { Tier: 'A', Gamepass: '+3 Champions Equip, +2 Champions Equip, 2x EXP, VIP, Extra Stand, Remote Gacha, 2x Coin', Recomendação: 'Deveria ter para um progresso mais rápido.' },
        { Tier: 'B', Gamepass: '2x Soul, +2 Gacha, +5 Star Open, Super Luck, Extra Luck, Lucky', Recomendação: 'Principalmente Qualidade de Vida e economia de tempo.' },
        { Tier: 'C', Gamepass: '+10 Backpack Space, +20 Backpack Space', Recomendação: 'Não é realmente necessário, mas é bom ter no endgame.' },
      ],
    }
  },
};

export const scientificNotationArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'scientific-notation',
  title: 'Abreviações de Notação Científica',
  summary: 'Um guia de referência para as abreviações de números grandes usadas no jogo.',
  content: 'Entender as abreviações para números grandes é crucial para medir seu poder e o HP dos inimigos. Aqui está um guia completo.',
  tags: ['notação', 'abreviação', 'números', 'guia', 'geral'],
  imageId: 'wiki-13',
  tables: {
    notation1: {
      headers: ['Abreviação', 'Nome', 'Notação Científica'],
      rows: [
        { Abreviação: 'k', Nome: 'Thousand', 'Notação Científica': '1.00E+003' },
        { Abreviação: 'M', Nome: 'Million', 'Notação Científica': '1.00E+006' },
        { Abreviação: 'B', Nome: 'Billion', 'Notação Científica': '1.00E+009' },
        { Abreviação: 'T', Nome: 'Trillion', 'Notação Científica': '1.00E+012' },
        { Abreviação: 'qd', Nome: 'Quadrillion', 'Notação Científica': '1.00E+015' },
        { Abreviação: 'Qn', Nome: 'Quintillion', 'Notação Científica': '1.00E+018' },
        { Abreviação: 'sx', Nome: 'Sextillion', 'Notação Científica': '1.00E+021' },
        { Abreviação: 'Sp', Nome: 'Septillion', 'Notação Científica': '1.00E+024' },
        { Abreviação: 'O', Nome: 'Octillion', 'Notação Científica': '1.00E+027' },
        { Abreviação: 'N', Nome: 'Nonillion', 'Notação Científica': '1.00E+030' },
      ],
    },
    notation2: {
        headers: ['Abreviação', 'Nome (Decillion)', 'Notação Científica'],
        rows: [
            { Abreviação: 'de', Nome: 'Decillion', 'Notação Científica': '1.00E+033' },
            { Abreviação: 'Ud', Nome: 'Undecillion', 'Notação Científica': '1.00E+036' },
            { Abreviação: 'dD', Nome: 'Duodecillion', 'Notação Científica': '1.00E+039' },
            { Abreviação: 'tD', Nome: 'Tredecillion', 'Notação Científica': '1.00E+042' },
            { Abreviação: 'qdD', Nome: 'Quattuordecillion', 'Notação Científica': '1.00E+045' },
            { Abreviação: 'QnD', Nome: 'Quindecillion', 'Notação Científica': '1.00E+048' },
            { Abreviação: 'sxD', Nome: 'Sexdecillion', 'Notação Científica': '1.00E+051' },
            { Abreviação: 'SpD', Nome: 'Septendecillion', 'Notação Científica': '1.00E+054' },
            { Abreviação: 'OcD', Nome: 'Octodecillion', 'Notação Científica': '1.00E+057' },
            { Abreviação: 'NvD', Nome: 'Novemdecillion', 'Notação Científica': '1.00E+060' },
        ]
    },
    notation3: {
        headers: ['Abreviação', 'Nome (Vigintillion)', 'Notação Científica'],
        rows: [
            { Abreviação: 'Vgn', Nome: 'Vigintillion', 'Notação Científica': '1.00E+063' },
            { Abreviação: 'UVg', Nome: 'Unvigintillion', 'Notação Científica': '1.00E+066' },
            { Abreviação: 'DVg', Nome: 'Duovigintillion', 'Notação Científica': '1.00E+069' },
            { Abreviação: 'TVg', Nome: 'Tresvigintillion', 'Notação Científica': '1.00E+072' },
            { Abreviação: 'qtV', Nome: 'Quattuorvigintillion', 'Notação Científica': '1.00E+075' },
            { Abreviação: 'QnV', Nome: 'Quinvigintillion', 'Notação Científica': '1.00E+078' },
            { Abreviação: 'SeV', Nome: 'Sesvigintillion', 'Notação Científica': '1.00E+081' },
            { Abreviação: 'SPG', Nome: 'Septenvigintillion', 'Notação Científica': '1.00E+084' },
            { Abreviação: 'OVG', Nome: 'Octovigintillion', 'Notação Científica': '1.00E+087' },
            { Abreviação: 'NVG', Nome: 'Novemvigintillion', 'Notação Científica': '1.00E+090' },
        ]
    },
    notation4: {
        headers: ['Abreviação', 'Nome (Trigintillion)', 'Notação Científica'],
        rows: [
            { Abreviação: 'TGN', Nome: 'Trigintillion', 'Notação Científica': '1.00E+093' },
            { Abreviação: 'UTG', Nome: 'Untrigintillion', 'Notação Científica': '1.00E+096' },
            { Abreviação: 'DTG', Nome: 'Duotrigintillion', 'Notação Científica': '1.00E+099' },
            { Abreviação: 'tsTG', Nome: 'Trestrigintillion', 'Notação Científica': '1.00E+102' },
            { Abreviação: 'qTG', Nome: 'Quattuortrigintillion', 'Notação Científica': '1.00E+105' },
            { Abreviação: 'QnTG', Nome: 'Quintrigintillion', 'Notação Científica': '1.00E+108' },
            { Abreviação: 'ssTG', Nome: 'Sestrigintillion', 'Notação Científica': '1.00E+111' },
            { Abreviação: 'SpTG', Nome: 'Septentrigintillion', 'Notação Científica': '1.00E+114' },
            { Abreviação: 'OcTG', Nome: 'Octotrigintillion', 'Notação Científica': '1.00E+117' },
            { Abreviação: 'NoTG', Nome: 'Noventrigintillion', 'Notação Científica': '1.00E+120' },
        ]
    },
    notation5: {
        headers: ['Abreviação', 'Nome (Quadragintillion)', 'Notação Científica'],
        rows: [
            { Abreviação: 'QDR', Nome: 'Quadragintillion', 'Notação Científica': '1.00E+123' },
            { Abreviação: 'uQDR', Nome: 'Unquadragintillion', 'Notação Científica': '1.00E+126' },
            { Abreviação: 'dQDR', Nome: 'Duoquadragintillion', 'Notação Científica': '1.00E+129' },
            { Abreviação: 'tQDR', Nome: 'Tresquadragintillion', 'Notação Científica': '1.00E+132' },
            { Abreviação: 'qdQDR', Nome: 'Quattuorquadragintillion', 'Notação Científica': '1.00E+135' },
            { Abreviação: 'QnQDR', Nome: 'Quinquadragintillion', 'Notação Científica': '1.00E+138' },
            { Abreviação: 'sxQDR', Nome: 'Sesquadragintillion', 'Notação Científica': '1.00E+141' },
            { Abreviação: 'SpQDR', Nome: 'Septenquadragintillion', 'Notação Científica': '1.00E+144' },
            { Abreviação: 'OQQDR', Nome: 'Octoquadragintillion', 'Notação Científica': '1.00E+147' },
            { Abreviação: 'NQQDR', Nome: 'Novemquadragintillion', 'Notação Científica': '1.00E+150' },
        ]
    }
  }
};

export const scythesArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'scythes-world-21',
  title: 'Foices (Mundo 21)',
  summary: 'Um guia para as foices do Mundo 21, as armas mais recentes do jogo, e seus multiplicadores de dano.',
  content: 'As foices são as armas introduzidas no Mundo 21. Elas oferecem multiplicadores de dano significativos que aumentam com a evolução (estrelas). Além disso, as foices podem vir com encantamentos de **Passiva**, que concedem bônus adicionais e também possuem raridades distintas.',
  tags: ['foice', 'arma', 'mundo 21', '21', 'guia', 'geral', 'passiva'],
  imageId: 'wiki-14',
  tables: {
    scythes: {
      headers: ['Foice', 'Stats (Base)', 'Stats (1 Estrela)', 'Stats (2 Estrelas)', 'Stats (3 Estrelas)'],
      rows: [
        { 'Foice': 'Venomleaf', 'Stats (Base)': '0.75x', 'Stats (1 Estrela)': '1.5x', 'Stats (2 Estrelas)': '2.25x', 'Stats (3 Estrelas)': '3.75x' },
        { 'Foice': 'Cryoscythe', 'Stats (Base)': '1x', 'Stats (1 Estrela)': '2x', 'Stats (2 Estrelas)': '3x', 'Stats (3 Estrelas)': '5x' },
        { 'Foice': 'Toxinfang', 'Stats (Base)': '1.75x', 'Stats (1 Estrela)': '3.5x', 'Stats (2 Estrelas)': '5.25x', 'Stats (3 Estrelas)': '8.75x' },
        { 'Foice': 'Crimson Thorn', 'Stats (Base)': '2.2x', 'Stats (1 Estrela)': '4.4x', 'Stats (2 Estrelas)': '6.6x', 'Stats (3 Estrelas)': '11x' },
        { 'Foice': 'Bonehowl', 'Stats (Base)': '2.75x', 'Stats (1 Estrela)': '5.5x', 'Stats (2 Estrelas)': '8.25x', 'Stats (3 Estrelas)': '13.75x' },
        { 'Foice': 'Ashfang', 'Stats (Base)': '3.5x', 'Stats (1 Estrela)': '7x', 'Stats (2 Estrelas)': '10.5x', 'Stats (3 Estrelas)': '17.5x' },
        { 'Foice': 'Phantom Requiem', 'Stats (Base)': '4.25x', 'Stats (1 Estrela)': '8.5x', 'Stats (2 Estrelas)': '12.75x', 'Stats (3 Estrelas)': '21.25x' },
        { 'Foice': 'Stormreaver', 'Stats (Base)': '5x', 'Stats (1 Estrela)': '10x', 'Stats (2 Estrelas)': '15x', 'Stats (3 Estrelas)': '25x' },
      ]
    }
  }
};

export const titansArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'titans-world-11',
  title: 'Guia de Titãs (Mundo 11)',
  summary: 'Um guia sobre os Titãs, um tipo de "lutador" do Mundo 11, e o dano que eles causam em cada nível de estrela.',
  content: 'Titãs são lutadores especiais encontrados no Mundo 11. O dano deles é uma porcentagem do seu próprio dano total, tornando-os aliados poderosos. O dano aumenta significativamente com a evolução (estrelas).',
  tags: ['titã', 'lutador', 'dano', 'mundo 11', '11', 'guia', 'geral'],
  imageId: 'wiki-15',
  tables: {
    baseTitans: {
      headers: ['Titã (0 Estrelas)', 'Tempo de Ataque', 'Dano de Ataque'],
      rows: [
        { 'Titã (0 Estrelas)': 'Jaw Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '5%' },
        { 'Titã (0 Estrelas)': 'Female Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '10%' },
        { 'Titã (0 Estrelas)': 'Beast Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '15%' },
        { 'Titã (0 Estrelas)': 'Armored Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '20%' },
        { 'Titã (0 Estrelas)': 'Warhammer Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '25%' },
        { 'Titã (0 Estrelas)': 'Attack Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '30%' },
        { 'Titã (0 Estrelas)': 'Colossal Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '40%' },
      ],
    },
    oneStarTitans: {
      headers: ['Titã (1 Estrela)', 'Tempo de Ataque', 'Dano de Ataque'],
      rows: [
        { 'Titã (1 Estrela)': 'Jaw Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '7.5%' },
        { 'Titã (1 Estrela)': 'Female Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '15%' },
        { 'Titã (1 Estrela)': 'Beast Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '22.5%' },
        { 'Titã (1 Estrela)': 'Armored Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '30%' },
        { 'Titã (1 Estrela)': 'Warhammer Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '37.5%' },
        { 'Titã (1 Estrela)': 'Attack Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '45.0%' },
        { 'Titã (1 Estrela)': 'Colossal Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '60%' },
      ],
    },
    twoStarTitans: {
      headers: ['Titã (2 Estrelas)', 'Tempo de Ataque', 'Dano de Ataque'],
      rows: [
        { 'Titã (2 Estrelas)': 'Jaw Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '10%' },
        { 'Titã (2 Estrelas)': 'Female Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '20%' },
        { 'Titã (2 Estrelas)': 'Beast Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '30%' },
        { 'Titã (2 Estrelas)': 'Armored Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '40%' },
        { 'Titã (2 Estrelas)': 'Warhammer Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '50%' },
        { 'Titã (2 Estrelas)': 'Attack Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '60%' },
        { 'Titã (2 Estrelas)': 'Colossal Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '80%' },
      ],
    },
    threeStarTitans: {
      headers: ['Titã (3 Estrelas)', 'Tempo de Ataque', 'Dano de Ataque'],
      rows: [
        { 'Titã (3 Estrelas)': 'Jaw Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '15%' },
        { 'Titã (3 Estrelas)': 'Female Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '30%' },
        { 'Titã (3 Estrelas)': 'Beast Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '45%' },
        { 'Titã (3 Estrelas)': 'Armored Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '60%' },
        { 'Titã (3 Estrelas)': 'Warhammer Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '75%' },
        { 'Titã (3 Estrelas)': 'Attack Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '90%' },
        { 'Titã (3 Estrelas)': 'Colossal Titan', 'Tempo de Ataque': '1s', 'Dano de Ataque': '120%' },
      ],
    },
  },
};

export const standsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'stands-world-16',
  title: 'Guia de Stands (Mundo 16)',
  summary: 'Um guia sobre os Stands, um tipo de "lutador" do Mundo 16, e os bônus de energia que eles fornecem.',
  content: 'Stands são lutadores especiais encontrados no Mundo 16. Eles fornecem um bônus percentual à sua energia total, aumentando seu poder. O bônus aumenta com a raridade do Stand.',
  tags: ['stand', 'lutador', 'energia', 'mundo 16', '16', 'guia', 'geral'],
  imageId: 'wiki-2', // Reusing aura image for now
  tables: {
    stands: {
      headers: ['Stand', 'Raridade', 'Bônus de Energia'],
      rows: [
        { 'Stand': 'Star Platinum', 'Raridade': 'Comum', 'Bônus de Energia': '2%' },
        { 'Stand': 'Magicians Red', 'Raridade': 'Incomum', 'Bônus de Energia': '4%' },
        { 'Stand': 'Hierophant Green', 'Raridade': 'Raro', 'Bônus de Energia': '6%' },
        { 'Stand': 'The World', 'Raridade': 'Épico', 'Bônus de Energia': '10%' },
        { 'Stand': 'King Crimson', 'Raridade': 'Lendário', 'Bônus de Energia': '15%' },
        { 'Stand': 'Killer Queen', 'Raridade': 'Mítico', 'Bônus de Energia': '20%' },
        { 'Stand': 'Golden Experience', 'Raridade': 'Mítico', 'Bônus de Energia': '25%' },
        { 'Stand': 'Golden Experience Requiem', 'Raridade': 'Phantom', 'Bônus de Energia': '35%' },
        { 'Stand': 'The World Over Heaven', 'Raridade': 'Phantom', 'Bônus de Energia': '40%' },
      ]
    }
  }
};

export const howToGetStrongerArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'how-to-get-stronger',
  title: 'Como Ficar Mais Forte',
  summary: 'Um guia estratégico com objetivos e prioridades para otimizar sua progressão no Anime Eternal.',
  content: `Este guia fornece um conjunto de objetivos e prioridades para ajudar os jogadores a ficarem mais fortes e progredirem eficientemente.

### Objetivos Principais
- Pegar todos os phantoms/supremes de todas as ilhas.
- Completar os achievements.
- Completar o Index.
- Pegar acessórios de boss SS (capa/chinelo/chapéu/cachecol/máscara).
- Pegar joias de craft das dungeons (colar/anel/brinco).
- Maximizar todas as progressões de ilha.
- Completar o máximo possível de obeliscos.
- Pegar time full mítico/phantom da última ilha que você estiver.
- Pegar e evoluir as espadas do mundo 3, 5, 15 de energia.

### Gamepasses por Categoria
- **Energia:** Double Energy, Fast click, More Equips, Extra Champions Equips, Vip
- **Dano:** Double Damage, Double Weapon, Extra Titan
- **Utilidade:** Fast Roll, Double Souls, Double Coins, Remote Access, Double Exp

### Ordem de Prioridade de Gamepass
1. Fast click
2. Double Energy
3. Double Damage
4. Double Weapon
5. Double Exp
6. Fast Roll
7. Extra Champions Equips
8. More Equips
9. Double Souls
10. Vip
11. Extra Stand
12. Extra Titan

### Perguntas Frequentes
**Compensa comprar Exclusive Stars?**
Não compensa. É muito melhor comprar o Starter Pack #1 por 300 créditos, que já vem com o avatar top e 1 pet bom.
`,
  tags: ['guia', 'estratégia', 'dicas', 'forte', 'progressão', 'gamepass', 'geral'],
  imageId: 'wiki-3', // Reusing a relevant image
};

export const lobbyDungeonsArticle: Omit<WikiArticle, 'createdAt'> = {
  id: 'lobby-dungeons',
  title: 'Guia de Dungeons do Lobby',
  summary: 'Um guia completo com horários, vida do chefe e requisitos de dano para as dungeons do lobby.',
  content: 'Este guia detalha as informações essenciais para participar e ter sucesso nas dungeons acessíveis pelo lobby central do jogo. Use esta tabela como referência para saber quando cada dungeon abre e se você tem o dano necessário. O "Tempo Otimizado" refere-se ao tempo de conclusão com rank máximo de velocidade e acessórios de velocidade.',
  tags: ['dungeon', 'lobby', 'guia', 'requisitos', 'dano', 'geral'],
  imageId: 'wiki-11', // Reusing a relevant image
  tables: {
    lobbySchedule: {
      headers: ['Horário', 'Dificuldade', 'Vida Último Boss', 'Dano Mínimo', 'Dano Recomendado', 'Tempo Otimizado'],
      rows: [
        { 'Horário': 'XX:00', 'Dificuldade': 'Easy', 'Vida Último Boss': '600x-1Sp', 'Dano Mínimo': '800qn', 'Dano Recomendado': '1sx', 'Tempo Otimizado': '1m 12s' },
        { 'Horário': 'XX:10', 'Dificuldade': 'Medium', 'Vida Último Boss': '60o-100o', 'Dano Mínimo': '50sp', 'Dano Recomendado': '100SP', 'Tempo Otimizado': '1m 12s' },
        { 'Horário': 'XX:20', 'Dificuldade': 'Hard', 'Vida Último Boss': '100de-140d', 'Dano Mínimo': '80N', 'Dano Recomendado': '150N', 'Tempo Otimizado': '1m 12s' },
        { 'Horário': 'XX:30', 'Dificuldade': 'Insane', 'Vida Último Boss': '90DD-130DD', 'Dano Mínimo': '60Ud', 'Dano Recomendado': '100Ud', 'Tempo Otimizado': '1m 12s' },
        { 'Horário': 'XX:40', 'Dificuldade': 'Crazy', 'Vida Último Boss': '90Qnd-35Nvd', 'Dano Mínimo': '300qnd', 'Dano Recomendado': '1Nvd', 'Tempo Otimizado': '1m 12s' },
        { 'Horário': 'XX:50', 'Dificuldade': 'Nightmare', 'Vida Último Boss': '40VG-50VG', 'Dano Mínimo': '500spg', 'Dano Recomendado': '700SPG', 'Tempo Otimizado': '' },
        { 'Horário': 'XX:15', 'Dificuldade': 'Leaf Raid (1800)', 'Vida Último Boss': '///////// ', 'Dano Mínimo': '18qntg', 'Dano Recomendado': '50QNTG', 'Tempo Otimizado': '' },
      ],
    },
  },
};


// A comprehensive list for seeding all articles at once if needed.
export const allWikiArticles: WikiArticle[] = [
  {...gettingStartedArticle, createdAt: serverTimestamp()},
  {...auraArticle, createdAt: serverTimestamp()},
  {...legendaryWeaponsArticle, createdAt: serverTimestamp()},
  {...guildWarsArticle, createdAt: serverTimestamp()},
  {...prestigeArticle, createdAt: serverTimestamp()},
  {...rankArticle, createdAt: serverTimestamp()},
  {...energyGainPerRankArticle, createdAt: serverTimestamp()},
  {...levelExpArticle, createdAt: serverTimestamp()},
  {...worldBossesArticle, createdAt: serverTimestamp()},
  {...swordsArticle, createdAt: serverTimestamp()},
  {...damageSwordsArticle, createdAt: serverTimestamp()},
  {...world20RaidsArticle, createdAt: serverTimestamp()},
  {...raidRequirementsArticle, createdAt: serverTimestamp()},
  {...gamepassTierListArticle, createdAt: serverTimestamp()},
  {...scientificNotationArticle, createdAt: serverTimestamp()},
  {...scythesArticle, createdAt: serverTimestamp()},
  {...titansArticle, createdAt: serverTimestamp()},
  {...standsArticle, createdAt: serverTimestamp()},
  {...howToGetStrongerArticle, createdAt: serverTimestamp()},
  {...lobbyDungeonsArticle, createdAt: serverTimestamp()},
];
    
    
