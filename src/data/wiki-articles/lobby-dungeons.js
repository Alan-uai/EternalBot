
export const lobbyDungeonsArticle = {
  id: 'lobby-dungeons',
  title: 'Guia de Dungeons do Lobby',
  summary: 'Um guia completo com horários, vida do chefe e requisitos de dano para as dungeons do lobby.',
  content: 'Este guia detalha as informações essenciais para participar e ter sucesso nas dungeons acessíveis pelo lobby central do jogo. Use esta tabela como referência para saber quando cada dungeon abre e se você tem o dano necessário. O "Tempo Otimizado" refere-se ao tempo de conclusão com rank máximo de velocidade e acessórios de velocidade.',
  tags: ['dungeon', 'lobby', 'guia', 'requisitos', 'dano', 'geral'],
  imageUrl: 'wiki-11', // Reusing a relevant image
  tables: {
    lobbySchedule: {
      headers: ['Horário', 'Dificuldade', 'Tipo', 'Vida Último Boss', 'Dano Mínimo', 'Dano Recomendado', 'Tempo Otimizado', 'roleId'],
      rows: [
        { 'Horário': 'XX:00', 'Dificuldade': 'Easy', 'Tipo': 'dungeon', 'Vida Último Boss': '600x - 1Sp', 'Dano Mínimo': '800-QN', 'Dano Recomendado': '1-SX', 'Tempo Otimizado': '1m 12s', 'roleId': '1429357175373041786' },
        { 'Horário': 'XX:10', 'Dificuldade': 'Medium', 'Tipo': 'dungeon', 'Vida Último Boss': '60 O - 100 O', 'Dano Mínimo': '50-SP', 'Dano Recomendado': '100-SP', 'Tempo Otimizado': '1m 12s', 'roleId': '1429357351906967562' },
        { 'Horário': 'XX:20', 'Dificuldade': 'Hard', 'Tipo': 'dungeon', 'Vida Último Boss': '100 Dc - 140 D', 'Dano Mínimo': '80-N', 'Dano Recomendado': '150-N', 'Tempo Otimizado': '1m 12s', 'roleId': '1429357358303150200' },
        { 'Horário': 'XX:30', 'Dificuldade': 'Insane', 'Tipo': 'dungeon', 'Vida Último Boss': '90 DD - 130 DD', 'Dano Mínimo': '60-UD', 'Dano Recomendado': '100-UD', 'Tempo Otimizado': '1m 12s', 'roleId': '1429357528168271894' },
        { 'Horário': 'XX:40', 'Dificuldade': 'Crazy', 'Tipo': 'dungeon', 'Vida Último Boss': '90 QnD - 35 NvD', 'Dano Mínimo': '300-QND', 'Dano Recomendado': '1-NVD', 'Tempo Otimizado': '1m 12s', 'roleId': '1429357529044877312' },
        { 'Horário': 'XX:50', 'Dificuldade': 'Nightmare', 'Tipo': 'dungeon', 'Vida Último Boss': '433 SpG - 530 SpG', 'Dano Mínimo': '500-SPG', 'Dano Recomendado': '700 SPG', 'Tempo Otimizado': '', 'roleId': '1429357529317511279' },
        { 'Horário': 'XX:15', 'Dificuldade': 'Leaf Raid', 'Tipo': 'raid', 'Vida Último Boss': 'Wave 2000 - 353 OcTG', 'Dano Mínimo': '35.3-OcTG', 'Dano Recomendado': '50-OCTG', 'Tempo Otimizado': '', 'roleId': '1429357530106298428' },
      ],
    },
  },
};
