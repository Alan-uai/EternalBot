// src/utils/createRaidPanelAssets.js
import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const WIDTH = 400;
const HEIGHT = 100;
const FONT = 'bold 24px sans-serif';

function drawBaseFrame(ctx, text, color) {
    // Fundo
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Texto
    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
}

export async function createLoopedTextGif(text, color) {
    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const totalFrames = 20; // Controls animation duration/speed
    const maxOffset = 5;

    for (let i = 0; i < totalFrames; i++) {
        drawBaseFrame(ctx, text, color);

        // Animação sutil de brilho/sombra
        const offset = Math.sin(i / totalFrames * Math.PI * 2) * maxOffset;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + offset * 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillText(text, WIDTH / 2, HEIGHT / 2);
        
        // Reset shadow for next frame
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
}

export async function createCountdownGif(textPrefix) {
    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    encoder.start();
    encoder.setRepeat(0); // Loop
    encoder.setDelay(1000); // 1 segundo por frame
    encoder.setQuality(10);

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    for (let i = 10; i >= 1; i--) {
        const text = `${textPrefix}${i}s`;
        drawBaseFrame(ctx, text, '#E74C3C'); // Vermelho para urgência

        ctx.fillText(text, WIDTH / 2, HEIGHT / 2);
        encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
}
