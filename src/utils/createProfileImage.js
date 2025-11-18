// src/utils/createProfileImage.js
import { createCanvas, loadImage } from 'canvas';

// Helper function para formatar números grandes
function formatNumber(num) {
    if (typeof num === 'number') {
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    }
    return num || 'N/A';
}

function drawTextWithIcon(ctx, icon, text, x, y, iconSize, spacing) {
    if (icon) {
        ctx.drawImage(icon, x, y - iconSize / 2 - 2, iconSize, iconSize);
    }
    ctx.fillText(text, x + iconSize + spacing, y);
}

export async function createProfileImage(user, userData, assetService) {
    const width = 800;
    const height = 450;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo
    const bgImage = await assetService.getAsset('ProfileBackground'); // Precisa ter um asset com este nome
    if (bgImage) {
        const loadedBg = await loadImage(bgImage);
        ctx.drawImage(loadedBg, 0, 0, width, height);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#23272A');
        gradient.addColorStop(1, '#2C2F33');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // Overlay semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // Carregar Avatar do Discord
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    
    // Desenhar círculo para o avatar
    const avatarX = 150;
    const avatarY = 150;
    const avatarRadius = 80;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();

    // Borda do Avatar
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
    ctx.strokeStyle = '#5865F2'; // Cor do Discord
    ctx.lineWidth = 6;
    ctx.stroke();

    // Nome de usuário
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(user.username, avatarX, avatarY + avatarRadius + 40);

    // Carregar ícones
    const rankIcon = await loadImage(await assetService.getAsset('RankIcon') || '');
    const worldIcon = await loadImage(await assetService.getAsset('WorldIcon') || '');
    const dpsIcon = await loadImage(await assetService.getAsset('DpsIcon') || '');
    const repIcon = await loadImage(await assetService.getAsset('RepIcon') || '');
    const creditIcon = await loadImage(await assetService.getAsset('CreditIcon') || '');

    // Estatísticas Principais (à direita do avatar)
    const statsX = 400;
    const statsY = 100;
    const statsSpacing = 60;
    const iconSize = 32;

    ctx.fillStyle = '#dcddde';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'left';

    drawTextWithIcon(ctx, rankIcon, `Rank: ${userData.rank || 'N/A'}`, statsX, statsY, iconSize, 15);
    drawTextWithIcon(ctx, worldIcon, `Mundo: ${userData.currentWorld || 'N/A'}`, statsX, statsY + statsSpacing, iconSize, 15);
    drawTextWithIcon(ctx, dpsIcon, `DPS: ${formatNumber(userData.dps)}`, statsX, statsY + statsSpacing * 2, iconSize, 15);

    // Reputação e Créditos (abaixo do nome)
    const secondaryStatsY = avatarY + avatarRadius + 90;
    ctx.font = '22px sans-serif';
    
    drawTextWithIcon(ctx, repIcon, `Reputação: ${formatNumber(userData.reputationPoints)}`, 60, secondaryStatsY, 24, 10);
    drawTextWithIcon(ctx, creditIcon, `Créditos: ${formatNumber(userData.credits)}`, 60, secondaryStatsY + 40, 24, 10);

    // Linha divisória
    ctx.fillStyle = '#40444B';
    ctx.fillRect(50, height - 80, width - 100, 2);

    // Hosts Seguidos
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Hosts Seguidos:', 150, height - 50);

    const followingList = userData.following || [];
    if (followingList.length > 0) {
        const hostNames = await Promise.all(followingList.slice(0, 5).map(async id => {
            const hostUser = await user.client.users.fetch(id).catch(() => null);
            return hostUser ? hostUser.username : '...';
        }));
        ctx.fillStyle = '#dcddde';
        ctx.font = '18px sans-serif';
        ctx.fillText(hostNames.join(', '), 300, height - 50);
    } else {
        ctx.fillStyle = '#B9BBBE';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText('Nenhum', 300, height - 50);
    }

    return canvas.toBuffer('image/png');
}
