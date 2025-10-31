// src/utils/raidTimings.js
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';

const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Esy',
    'Medium': 'Med',
    'Hard': 'Hd',
    'Insane': 'Isne',
    'Crazy': 'Czy',
    'Nightmare': 'Mare',
    'Leaf Raid (1800)': 'Lf'
};

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

    const totalSecondsInHour = now.getUTCMinutes() * 60 + now.getUTCSeconds();

    for (const raid of raids) {
        const raidId = raid['Dificuldade'];
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        
        let raidStartTime = new Date(now);
        raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

        // Se a hora de início já passou (com uma margem), avança para a próxima hora
        if (raidStartTime.getTime() <= now.getTime() - PORTAL_OPEN_DURATION_SECONDS * 1000) {
            raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
        }

        const timeDiffMs = raidStartTime.getTime() - now.getTime();
        const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || raidId;

        // Verifica se a raid está aberta
        if (timeDiffMs <= 0 && timeDiffMs > -PORTAL_OPEN_DURATION_SECONDS * 1000) {
            currentRaid = {
                raid,
                raidId,
                avatarPrefix,
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
                avatarPrefix,
                startTimeMs: raidStartTime.getTime(),
                fiveMinuteMark: raidStartTime.getTime() - 5 * 60 * 1000,
            };
        }

        // Calcula o status para o painel
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;

        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        // Se a raid já passou nesta hora, calcula para a próxima hora
        if (secondsUntilOpen < -PORTAL_OPEN_DURATION_SECONDS) {
             secondsUntilOpen += 3600; 
        }

        let statusText, details;
        const isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);

        if (isCurrentlyOpen) {
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
        } else {
            statusText = '❌ Fechada';
            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
        }
        
        const separator = statuses.length > 0 ? '---------------------\n' : '';
        statuses.push({
            name: `${separator}${RAID_EMOJIS[raidId] || '⚔️'} ${raidId}`,
            value: `${statusText}\n${details}`,
            inline: false, 
        });
    }

    return { currentRaid, nextRaid, statuses };
}
