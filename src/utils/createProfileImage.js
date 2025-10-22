// src/utils/createProfileImage.js
import { createCanvas, loadImage } from 'canvas';

function formatNumber(num) {
    if (num === null || num === undefined) return 'N/D';
    if (typeof num !== 'string') {
        num = String(num);
    }
    // Esta regex adiciona vírgulas como separadores de milhar
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function createProfileImage(userData, discordUser) {
    const width = 800;
    const height = 400;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, width, height);
    
    // Fundo do Header
    ctx.fillStyle = '#1e2124';
    ctx.fillRect(0, 0, width, 120);

    // Carregar e desenhar o avatar do usuário
    try {
        const avatar = await loadImage(discordUser.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(80, 60, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 40, 20, 80, 80);
        ctx.restore();
    } catch (error) {
        console.error("Não foi possível carregar o avatar do usuário:", error);
        // Desenha um círculo cinza como fallback
        ctx.beginPath();
        ctx.arc(80, 60, 40, 0, Math.PI * 2, true);
        ctx.fillStyle = '#99aab5';
        ctx.fill();
    }


    // Nome de usuário
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(discordUser.username, 140, 75);

    // Stats Principais
    const stats = [
        { label: 'Mundo Atual', value: userData.currentWorld || 'N/D' },
        { label: 'Rank', value: userData.rank || 'N/D' },
        { label: 'Créditos', value: formatNumber(userData.credits || 0) },
        { label: 'Reputação', value: formatNumber(userData.reputationPoints || 0) },
    ];

    ctx.font = '20px sans-serif';
    const statXStart = 40;
    const statYStart = 160;
    const statYMargin = 60;
    const statXMargin = 200;

    stats.forEach((stat, index) => {
        const x = statXStart + (index % 2) * statXMargin;
        const y = statYStart + Math.floor(index / 2) * statYMargin;
        
        ctx.fillStyle = '#99AAB5';
        ctx.fillText(stat.label, x, y);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(stat.value, x, y + 25);
        ctx.font = '20px sans-serif'; // reset font
    });

    // Stats de Poder
    const powerStats = [
        { label: 'Dano Total (DPS)', value: userData.dps || 'N/D' },
        { label: 'Energia Acumulada', value: userData.totalEnergy || 'N/D' },
        { label: 'Ganho de Energia (p/ clique)', value: userData.energyPerClick || 'N/D' },
    ];
    
    const powerStatXStart = 450;
    const powerStatYStart = 160;
    const powerStatYMargin = 80;

    powerStats.forEach((stat, index) => {
        const x = powerStatXStart;
        const y = powerStatYStart + index * powerStatYMargin;
        
        ctx.fillStyle = '#99AAB5';
        ctx.fillText(stat.label, x, y);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(stat.value, x, y + 25);
        ctx.font = '20px sans-serif'; // reset font
    });


    return canvas.toBuffer('image/png');
}
