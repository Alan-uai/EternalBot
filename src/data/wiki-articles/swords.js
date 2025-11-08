
export const swordsArticle = {
  id: 'energy-swords',
  title: 'Espadas de Energia',
  summary: 'Um guia para as espadas que fornecem um multiplicador de energia, onde encontrá-las e seus status.',
  content: `Espadas de energia são armas especiais que aumentam sua energia total. A raridade é fixa na arma base, e as evoluções (estrelas) apenas aumentam seu poder, sem alterar a raridade.

### Locais de Evolução
- **Evolução 1★:** Acontece no **Mundo 4**.
- **Evoluções 2★ e 3★:** Acontecem no **Mundo 5**.`,
  tags: ['espadas', 'energia', 'arma', 'guia', 'geral', '3', '5', '15', '19', 'halloween'],
  imageUrl: 'wiki-8',
  tables: {
    world3: {
      headers: ['name', 'rarity', 'stats', 'obtencao'],
      rows: [
        { name: 'Zangetsu', type: 'energy', rarity: 'Raro', stats: '0.05x', obtencao: 'Drop do Ichige (Mundo 3)' },
        { name: 'Zangetsu (1 Estrela)', type: 'energy', rarity: 'Raro', stats: '0.1x', obtencao: 'Evolução' },
        { name: 'Zangetsu (2 Estrelas)', type: 'energy', rarity: 'Raro', stats: '0.15x', obtencao: 'Evolução' },
        { name: 'Zangetsu (3 Estrelas)', type: 'energy', rarity: 'Raro', stats: '0.25x', obtencao: 'Evolução' },
      ],
    },
    world5: {
      headers: ['name', 'rarity', 'stats', 'obtencao'],
      rows: [
        { name: 'Yellow Nichirin', type: 'energy', rarity: 'Lendário', stats: '0.075x', obtencao: 'Gacha (Mundo 5)' },
        { name: 'Yellow Nichirin (1 Estrela)', type: 'energy', rarity: 'Lendário', stats: '0.15x', obtencao: 'Evolução' },
        { name: 'Yellow Nichirin (2 Estrelas)', type: 'energy', rarity: 'Lendário', stats: '0.225x', obtencao: 'Evolução' },
        { name: 'Yellow Nichirin (3 Estrelas)', type: 'energy', rarity: 'Lendário', stats: '0.375x', obtencao: 'Evolução' },
      ],
    },
    world15: {
        headers: ['name', 'rarity', 'stats', 'obtencao'],
        rows: [
            { name: 'Lucidator', type: 'energy', rarity: 'Mítico', stats: '0.125x', obtencao: 'Gacha (Mundo 15)' },
            { name: 'Lucidator (1 Estrela)', type: 'energy', rarity: 'Mítico', stats: '0.250x', obtencao: 'Evolução' },
            { name: 'Lucidator (2 Estrelas)', type: 'energy', rarity: 'Mítico', stats: '0.375x', obtencao: 'Evolução' },
            { name: 'Lucidator (3 Estrelas)', type: 'energy', rarity: 'Mítico', stats: '0.625x', obtencao: 'Evolução' },
        ],
    },
    world19: {
        headers: ['name', 'rarity', 'stats', 'obtencao'],
        rows: [
            { name: 'Excalibur', type: 'energy', rarity: 'Phantom', stats: '0.2x', obtencao: 'Gacha (Mundo 19)' },
            { name: 'Excalibur (1 Estrela)', type: 'energy', rarity: 'Phantom', stats: '0.4x', obtencao: 'Evolução' },
            { name: 'Excalibur (2 Estrelas)', type: 'energy', rarity: 'Phantom', stats: '0.6x', obtencao: 'Evolução' },
            { name: 'Excalibur (3 Estrelas)', type: 'energy', rarity: 'Phantom', stats: '1x', obtencao: 'Evolução' },
        ],
    },
    halloween: {
        headers: ['name', 'rarity', 'stats', 'obtencao'],
        rows: [
            { name: 'Overdrive Saw', type: 'energy', rarity: 'Supremo', stats: '0.3x', obtencao: 'Evento de Halloween' },
            { name: 'Overdrive Saw (1 Estrela)', type: 'energy', rarity: 'Supremo', stats: '0.6x', obtencao: 'Evolução' },
            { name: 'Overdrive Saw (2 Estrelas)', type: 'energy', rarity: 'Supremo', stats: '0.9x', obtencao: 'Evolução' },
            { name: 'Overdrive Saw (3 Estrelas)', type: 'energy', rarity: 'Supremo', stats: '1.5x', obtencao: 'Evolução' },
        ]
    }
  },
};
