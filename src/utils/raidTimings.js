// src/utils/raidTimings.js
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';

const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

const RAID_EMOJIS = {
    'Easy': '🟢', 'Medium': '🟡', 'Hard': '🔴', 'Insane': '⚔️', 
    'Crazy': '🔥', 'Nightmare': '💀', 'Leaf Raid (1800)': '🌿'
};

export function getRaidTimings() {
    const now = new Date();
    const raids = [...lobbyDungeonsArticle.tables.lobbySchedule.rows].sort((a, b) => {
        return parseInt(a['Horário'].substring(3, 5), 10) - parseInt(b['Horário'].substring(3, 5), 10);
    });

    let currentRaid = null;
    let nextRaid = null;
    let minTimeDiff = Infinity;
    const statuses = [];

    const totalSecondsInCurrentHour = now.getUTCMinutes() * 60 + now.getUTCSeconds();

    for (const raid of raids) {
        const raidId = raid['Dificuldade'];
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        
        let raidStartTime = new Date(now);
        raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

        // Se a raid já passou nesta hora, calcule para a próxima hora
        if (raidStartTime.getTime() < now.getTime() && (now.getTime() - raidStartTime.getTime()) > PORTAL_OPEN_DURATION_SECONDS * 1000) {
            raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
        }

        const timeDiffMs = raidStartTime.getTime() - now.getTime();

        // Verifica se a raid está aberta AGORA
        if (timeDiffMs <= 0 && timeDiffMs > -PORTAL_OPEN_DURATION_SECONDS * 1000) {
            currentRaid = {
                raid,
                raidId,
                startTimeMs: raidStartTime.getTime(),
                tenSecondMark: raidStartTime.getTime() + (PORTAL_OPEN_DURATION_SECONDS - 10) * 1000,
                portalCloseTime: raidStartTime.getTime() + PORTAL_OPEN_DURATION_SECONDS * 1000,
            };
        }

        // Encontra a próxima raid a começar
        if (timeDiffMs > 0 && timeDiffMs < minTimeDiff) {
            minTimeDiff = timeDiffMs;
            nextRaid = {
                raid,
                raidId,
                startTimeMs: raidStartTime.getTime(),
                fiveMinuteMark: raidStartTime.getTime() - 5 * 60 * 1000,
            };
        }
        
        // --- Lógica para o painel de status ---
        const isCurrentlyOpen = (currentRaid && currentRaid.raidId === raidId);
        let statusText, details;

        if (isCurrentlyOpen) {
            const secondsUntilClose = Math.floor((currentRaid.portalCloseTime - now.getTime()) / 1000);
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
        } else {
            const secondsUntilOpen = Math.floor(timeDiffMs / 1000);
             if (secondsUntilOpen < 0) {
                 // Este caso não deve acontecer com a nova lógica, mas é um fallback
                 statusText = '❌ Fechada';
                 details = `Calculando...`;
             } else {
                statusText = '❌ Fechada';
                const minutesPart = Math.floor(secondsUntilOpen / 60);
                const secondsPart = secondsUntilOpen % 60;
                details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
             }
        }
        
        statuses.push({
            name: `${RAID_EMOJIS[raidId] || '⚔️'} ${raidId}`,
            value: `${statusText}\n${details}`,
            inline: false, 
        });
    }

    // Ordena os status para uma exibição consistente no painel
    statuses.sort((a,b) => {
        const timeA = a.value.match(/(\d+)m (\d+)s/);
        const timeB = b.value.match(/(\d+)m (\d+)s/);
        const isOpenA = a.value.includes('ABERTA');
        const isOpenB = b.value.includes('ABERTA');

        if (isOpenA) return -1;
        if (isOpenB) return 1;
        if (!timeA || !timeB) return 0;
        
        const secondsA = parseInt(timeA[1]) * 60 + parseInt(timeA[2]);
        const secondsB = parseInt(timeB[1]) * 60 + parseInt(timeB[2]);
        return secondsA - secondsB;
    });

    // Adiciona o separador após ordenar
    const finalStatuses = statuses.map((status, index) => {
        if (index > 0) {
            status.name = `---------------------\n${status.name}`;
        }
        return status;
    });


    return { currentRaid, nextRaid, statuses: finalStatuses };
}
