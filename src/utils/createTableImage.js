// src/utils/createTableImage.js
import { createCanvas } from 'canvas';

// Função para quebrar o texto em várias linhas
function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

export async function createTableImage(headers, rows) {
    const padding = 20;
    const cellPadding = 10;
    const headerHeight = 50;
    const rowHeight = 40;
    const font = '16px sans-serif';
    const headerFont = 'bold 16px sans-serif';

    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = font;

    // Calcular a largura das colunas
    const columnWidths = headers.map(header => {
        return tempCtx.measureText(header).width + cellPadding * 2;
    });

    rows.forEach(row => {
        headers.forEach((header, i) => {
            const cellText = String(row[header] || '');
            const width = tempCtx.measureText(cellText).width + cellPadding * 2;
            if (width > columnWidths[i]) {
                columnWidths[i] = width;
            }
        });
    });
    
    // Limitar largura máxima
    const maxColumnWidth = 250;
    columnWidths.forEach((width, i) => {
        if(width > maxColumnWidth) {
            columnWidths[i] = maxColumnWidth;
        }
    });

    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

    // Calcular a altura da tabela com quebra de linha
    let totalHeight = headerHeight;
    const wrappedRows = rows.map(row => {
        let maxLines = 1;
        const wrappedCells = headers.map((header, i) => {
            const cellText = String(row[header] || '');
            const lines = wrapText(tempCtx, cellText, columnWidths[i] - cellPadding * 2);
            if(lines.length > maxLines) {
                maxLines = lines.length;
            }
            return lines;
        });
        totalHeight += rowHeight * maxLines;
        return wrappedCells;
    });

    const canvas = createCanvas(tableWidth + padding * 2, totalHeight + padding * 2);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#2C2F33'; // Discord Dark Theme
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar cabeçalho
    ctx.font = headerFont;
    ctx.fillStyle = '#FFFFFF';
    let currentX = padding;
    ctx.fillStyle = '#23272A';
    ctx.fillRect(padding, padding, tableWidth, headerHeight);
    
    ctx.fillStyle = '#FFFFFF';
    headers.forEach((header, i) => {
        ctx.fillText(header, currentX + cellPadding, padding + headerHeight / 2 + 5);
        currentX += columnWidths[i];
    });

    // Desenhar linhas
    ctx.font = font;
    let currentY = padding + headerHeight;
    wrappedRows.forEach((wrappedCells, rowIndex) => {
        const rowObject = rows[rowIndex];
        const isEven = rowIndex % 2 === 0;
        let maxLinesInRow = 1;
        wrappedCells.forEach(cell => {
            if(cell.length > maxLinesInRow) maxLinesInRow = cell.length;
        });
        const calculatedRowHeight = rowHeight * maxLinesInRow;

        ctx.fillStyle = isEven ? '#2C2F33' : '#23272A';
        ctx.fillRect(padding, currentY, tableWidth, calculatedRowHeight);

        currentX = padding;
        ctx.fillStyle = '#dcddde'; // Discord Text Color
        wrappedCells.forEach((lines, i) => {
             lines.forEach((line, lineIndex) => {
                ctx.fillText(line, currentX + cellPadding, currentY + (lineIndex * 20) + (calculatedRowHeight / maxLinesInRow) - (cellPadding/2));
            });
            currentX += columnWidths[i];
        });
        currentY += calculatedRowHeight;
    });
    
     // Desenhar bordas
    ctx.strokeStyle = '#40444B';
    ctx.lineWidth = 1;

    // Bordas verticais
    currentX = padding;
    columnWidths.forEach(width => {
        ctx.beginPath();
        ctx.moveTo(currentX, padding);
        ctx.lineTo(currentX, totalHeight + padding);
        ctx.stroke();
        currentX += width;
    });
    ctx.beginPath();
    ctx.moveTo(currentX, padding);
    ctx.lineTo(currentX, totalHeight + padding);
    ctx.stroke();

    // Bordas horizontais
    currentY = padding;
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(padding + tableWidth, currentY);
    ctx.stroke();
    currentY += headerHeight;
     wrappedRows.forEach((wrappedCells, rowIndex) => {
         let maxLinesInRow = 1;
         wrappedCells.forEach(cell => {
            if(cell.length > maxLinesInRow) maxLinesInRow = cell.length;
        });
        const calculatedRowHeight = rowHeight * maxLinesInRow;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(padding + tableWidth, currentY);
        ctx.stroke();
        currentY += calculatedRowHeight;
     });
     ctx.beginPath();
     ctx.moveTo(padding, currentY);
     ctx.lineTo(padding + tableWidth, currentY);
     ctx.stroke();


    return canvas.toBuffer('image/png');
}
