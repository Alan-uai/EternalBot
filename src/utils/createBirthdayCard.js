// src/utils/createBirthdayCard.js
import { createCanvas, loadImage } from 'canvas';

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, testY);
            line = words[n] + ' ';
            testY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, testY);
}


export async function createBirthdayCard(userName, message) {
    const width = 800;
    const height = 400;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FFD700'); // Gold
    gradient.addColorStop(1, '#FF8C00'); // DarkOrange
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay de confete (simulado)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for(let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 5 + 2;
        ctx.fillRect(x, y, size, size);
    }
    
    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(`Feliz Aniversário, ${userName}!`, width / 2, 100);
    ctx.shadowColor = 'transparent'; // reset shadow

    // Mensagem Motivacional
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 24px sans-serif';
    wrapText(ctx, `"${message}"`, width / 2, 200, width - 100, 30);
    
    // Footer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '16px sans-serif';
    ctx.fillText('- Com carinho, Gui, seu Guia Eterno.', width / 2, height - 30);


    return canvas.toBuffer('image/png');
}
