// src/utils/createProfileImage.js
import { createCanvas, loadImage } from 'canvas';
import GIFEncoder from 'gif-encoder-2';
import { Readable } from 'stream';
import { parse } from 'gifuct-js';


// Helper para a imagem estática
function formatNumber(num) {
    if (typeof num === 'number') {
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    }
    return num || 'N/A';
}

// Helper para a imagem estática
async function drawTextWithIcon(ctx, iconPath, text, x, y, iconSize, spacing, assetService) {
    try {
        const icon = await loadImage(await assetService.getAsset(iconPath) || Buffer.from(''));
        if (icon) {
            ctx.drawImage(icon, x, y - iconSize / 2 - 2, iconSize, iconSize);
        }
    } catch (e) {
        // Ignora se o ícone não puder ser carregado, o texto ainda será desenhado
    }
    ctx.fillText(text, x + iconSize + spacing, y);
}


// Função para desenhar o conteúdo estático (reutilizada por ambas as funções)
async function drawStaticContent(ctx, user, userData, assetService) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Carregar Avatar do Discord
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    
    const avatarX = 150;
    const avatarY = 150;
    const avatarRadius = 80;

    // Desenhar círculo para o avatar
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
    ctx.strokeStyle = '#5865F2';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Nome de usuário
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(user.username, avatarX, avatarY + avatarRadius + 40);

    // Estatísticas Principais
    const statsX = 400;
    const statsY = 100;
    const statsSpacing = 60;
    const iconSize = 32;

    ctx.fillStyle = '#dcddde';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'left';

    await drawTextWithIcon(ctx, 'RankIcon', `Rank: ${userData.rank || 'N/A'}`, statsX, statsY, iconSize, 15, assetService);
    await drawTextWithIcon(ctx, 'WorldIcon', `Mundo: ${userData.currentWorld || 'N/A'}`, statsX, statsY + statsSpacing, iconSize, 15, assetService);
    await drawTextWithIcon(ctx, 'DpsIcon', `DPS: ${formatNumber(userData.dps)}`, statsX, statsY + statsSpacing * 2, iconSize, 15, assetService);
    
    // Reputação e Créditos
    const secondaryStatsY = avatarY + avatarRadius + 90;
    ctx.font = '22px sans-serif';
    
    await drawTextWithIcon(ctx, 'RepIcon', `Reputação: ${formatNumber(userData.reputationPoints)}`, 60, secondaryStatsY, 24, 10, assetService);
    await drawTextWithIcon(ctx, 'CreditIcon', `Créditos: ${formatNumber(userData.credits)}`, 60, secondaryStatsY + 40, 24, 10, assetService);

    // Linha divisória
    ctx.fillStyle = '#40444B';
    ctx.fillRect(50, height - 80, width - 100, 2);

    // Hosts Seguidos
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hosts Seguidos:', 60, height - 50);

    const followingList = userData.following || [];
    if (followingList.length > 0) {
        const hostNames = await Promise.all(followingList.slice(0, 5).map(async id => {
            const hostUser = await user.client.users.fetch(id).catch(() => null);
            return hostUser ? hostUser.username : '...';
        }));
        ctx.fillStyle = '#dcddde';
        ctx.font = '18px sans-serif';
        ctx.fillText(hostNames.join(', '), 220, height - 50);
    } else {
        ctx.fillStyle = '#B9BBBE';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText('Nenhum', 220, height - 50);
    }
}


// Função original para criar imagem estática
export async function createProfileImage(user, userData, assetService) {
    const width = 800;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgAssetUrl = await assetService.getAsset('ProfileBackground');
    if (bgAssetUrl) {
        try {
            const loadedBg = await loadImage(bgAssetUrl);
            ctx.drawImage(loadedBg, 0, 0, width, height);
        } catch (e) {
             // Fallback para fundo gradiente se a imagem falhar
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#23272A');
            gradient.addColorStop(1, '#2C2F33');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    } else {
        // Fundo gradiente padrão
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#23272A');
        gradient.addColorStop(1, '#2C2F33');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    // Overlay semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // Desenha o conteúdo
    await drawStaticContent(ctx, user, userData, assetService);

    return canvas.toBuffer('image/png');
}


// Nova função para criar imagem animada (GIF)
export async function createAnimatedProfileImage(user, userData, assetService, gifBuffer) {
    const width = 800;
    const height = 450;
    
    const frames = parse(gifBuffer);
    const encoder = new GIFEncoder(width, height, 'octree');

    // Inicia a codificação do GIF
    const stream = encoder.createReadStream();
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {}); // A promessa será resolvida abaixo
    
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (const frame of frames) {
        // Configura o delay do frame
        encoder.setDelay(frame.delay);

        // Cria um canvas temporário para o frame do GIF
        const frameCanvas = createCanvas(frame.dims.width, frame.dims.height);
        const frameCtx = frameCanvas.getContext('2d');
        const frameImageData = frameCtx.createImageData(frame.dims.width, frame.dims.height);
        frameImageData.data.set(frame.patch);
        frameCtx.putImageData(frameImageData, 0, 0);

        // Desenha o frame do GIF no canvas principal
        ctx.drawImage(frameCanvas, frame.dims.left, frame.dims.top);

        // Desenha o overlay semitransparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, width, height);

        // Desenha todo o conteúdo estático (avatar, texto, etc.) por cima do frame
        await drawStaticContent(ctx, user, userData, assetService);
        
        // Adiciona o frame completo ao encoder
        encoder.addFrame(ctx);
    }
    
    encoder.finish();

    // Aguarda a finalização do stream para retornar o buffer completo
    return new Promise(resolve => stream.on('end', () => resolve(Buffer.concat(chunks))));
}
