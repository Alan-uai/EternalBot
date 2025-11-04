// src/utils/createScheduleImage.js
import { createCanvas } from 'canvas';

const WEEKDAYS_PT_SHORT = {
    sunday: 'DOM',
    monday: 'SEG',
    tuesday: 'TER',
    wednesday: 'QUA',
    thursday: 'QUI',
    friday: 'SEX',
    saturday: 'SAB',
};
const WEEKDAYS_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];


export async function createScheduleImage(farms) {
    const width = 1000;
    const headerHeight = 50;
    const timeColumnWidth = 80;
    const dayColumnWidth = (width - timeColumnWidth) / 7;
    const rowHeight = 30;

    // Agrupar farms por dia e hora
    const schedule = {};
    const timeSlots = new Set();
    farms.forEach(farm => {
        if (!schedule[farm.dayOfWeek]) {
            schedule[farm.dayOfWeek] = {};
        }
        if (!schedule[farm.dayOfWeek][farm.time]) {
            schedule[farm.dayOfWeek][farm.time] = [];
        }
        schedule[farm.dayOfWeek][farm.time].push(farm);
        timeSlots.add(farm.time);
    });

    const sortedTimeSlots = Array.from(timeSlots).sort();
    const height = headerHeight + (sortedTimeSlots.length * rowHeight);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#2C2F33';
    ctx.fillRect(0, 0, width, height);
    
    // Header - Dias da Semana
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    WEEKDAYS_ORDER.forEach((day, index) => {
        const x = timeColumnWidth + (index * dayColumnWidth) + (dayColumnWidth / 2);
        ctx.fillText(WEEKDAYS_PT_SHORT[day], x, headerHeight / 2);
    });
    
    // Coluna de Horários e Grid
    ctx.font = '16px sans-serif';
    sortedTimeSlots.forEach((time, index) => {
        const y = headerHeight + (index * rowHeight);
        
        // Fundo da linha
        ctx.fillStyle = index % 2 === 0 ? '#2C2F33' : '#23272A';
        ctx.fillRect(0, y, width, rowHeight);

        // Desenhar horário
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(time, timeColumnWidth / 2, y + rowHeight / 2);

        // Preencher farms
        WEEKDAYS_ORDER.forEach((day, dayIndex) => {
            const x = timeColumnWidth + (dayIndex * dayColumnWidth);
            if (schedule[day] && schedule[day][time]) {
                const farm = schedule[day][time][0]; // Pega o primeiro farm para exibir
                ctx.fillStyle = '#5865F2'; // Cor do Discord
                ctx.fillRect(x + 2, y + 2, dayColumnWidth - 4, rowHeight - 4);
                ctx.fillStyle = '#FFFFFF';
                
                // Corta o nome da raid se for muito longo
                let raidName = farm.raidName;
                if(ctx.measureText(raidName).width > dayColumnWidth - 10) {
                    raidName = raidName.substring(0, 10) + '...';
                }

                ctx.fillText(raidName, x + dayColumnWidth / 2, y + rowHeight / 2);
            }
        });
    });

    // Bordas da Tabela
    ctx.strokeStyle = '#40444B';
    ctx.lineWidth = 1;
    // Linhas verticais
    for (let i = 0; i <= 7; i++) {
        const x = timeColumnWidth + (i * dayColumnWidth);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
     // Linhas horizontais
    for (let i = 0; i <= sortedTimeSlots.length; i++) {
        const y = headerHeight + (i * rowHeight);
        ctx.beginPath();
        ctx.moveTo(timeColumnWidth, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
     ctx.beginPath();
     ctx.moveTo(0, headerHeight);
     ctx.lineTo(width, headerHeight);
     ctx.stroke();


    return canvas.toBuffer('image/png');
}
