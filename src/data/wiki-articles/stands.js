
export const standsArticle = {
  id: 'stands-world-16',
  title: 'Guia de Stands (Mundo 16)',
  summary: 'Um guia sobre os Stands, um tipo de "lutador" do Mundo 16, e os bônus de dano que eles fornecem.',
  content: 'Stands são lutadores especiais encontrados no Mundo 16. Eles fornecem um bônus percentual ao seu dano total, aumentando seu poder. O bônus aumenta com a evolução (estrelas) do Stand.',
  tags: ['stand', 'lutador', 'dano', 'mundo 16', '16', 'guia', 'geral'],
  imageUrl: 'wiki-2', // Reusing aura image for now
  tables: {
    stands: {
      headers: ['Stand', 'Atk Spd', 'Stats', 'Stats (1 Star)', 'Stats (2 Star)', 'Stats (3 Star)'],
      rows: [
        { Stand: 'Door', 'Atk Spd': '1s', Stats: '15.1%', 'Stats (1 Star)': '22.7%', 'Stats (2 Star)': '30.2%', 'Stats (3 Star)': '45.3%' },
        { Stand: 'Hand', 'Atk Spd': '0.9s', Stats: '15.2%', 'Stats (1 Star)': '23%', 'Stats (2 Star)': '30.4%', 'Stats (3 Star)': '45.6%' },
        { Stand: 'Zipper Man', 'Atk Spd': '0.8s', Stats: '15.3%', 'Stats (1 Star)': '23.0%', 'Stats (2 Star)': '30.6%', 'Stats (3 Star)': '45.9%' },
        { Stand: 'Deadly Queen', 'Atk Spd': '0.7s', Stats: '15.4%', 'Stats (1 Star)': '23%', 'Stats (2 Star)': '30.8%', 'Stats (3 Star)': '46.2%' },
        { Stand: 'Pale Snake', 'Atk Spd': '0.6s', Stats: '15.5%', 'Stats (1 Star)': '23.3%', 'Stats (2 Star)': '31%', 'Stats (3 Star)': '46.5%' },
        { Stand: 'Shining Diamond', 'Atk Spd': '0.5s', Stats: '15.6%', 'Stats (1 Star)': '23%', 'Stats (2 Star)': '31.2%', 'Stats (3 Star)': '46.8%' },
        { Stand: 'Platinum', 'Atk Spd': '0.35s', Stats: '15.7%', 'Stats (1 Star)': '24%', 'Stats (2 Star)': '31.4%', 'Stats (3 Star)': '47.1%' },
        { Stand: 'World', 'Atk Spd': '0.2s', Stats: '15.8%', 'Stats (1 Star)': '24%', 'Stats (2 Star)': '31.6%', 'Stats (3 Star)': '47.4%' },
      ]
    }
  }
};
