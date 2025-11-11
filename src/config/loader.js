// src/config/loader.js
import 'dotenv/config';

export function loadConfig(logger) {
    const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'CLOUDINARY_URL'];
    let hasError = false;

    for (const variable of requiredEnv) {
        if (!process.env[variable]) {
            logger.error(`Variável de ambiente obrigatória não definida: ${variable}`);
            hasError = true;
        }
    }

    if (hasError) {
        return null;
    }
    
    return {
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GUILD_ID: process.env.GUILD_ID,
        CLOUDINARY_URL: process.env.CLOUDINARY_URL,
        // IDs de Canais
        CHAT_CHANNEL_ID: '1429309293076680744',
        MOD_CURATION_CHANNEL_ID: '1426968477482225716',
        COMMUNITY_HELP_CHANNEL_ID: '1426957344897761282',
        FEEDBACK_CHANNEL_ID: '1429314152928641118',
        RAID_CHANNEL_ID: '1429260587648417964',
        BIRTHDAY_CHANNEL_ID: '1429309293076680744',
        CODES_CHANNEL_ID: '1429346813919494214',
        UPDLOG_CHANNEL_ID: '1426958336057675857',
        SOLING_POST_CHANNEL_ID: '1429295597374144563',
        FARMING_PANEL_CHANNEL_ID: '1429295728379039756',
        SUPPORT_PANEL_CHANNEL_ID: '1431044892062122135',
        SUPPORT_THREADS_CHANNEL_ID: '1435359159158833212',
        APPLICATION_REVIEW_CHANNEL_ID: '1426968477482225716',
        // IDs de Cargos
        ADMIN_ROLE_ID: '1429318984716521483',
        VERIFIED_ROLE_ID: '1429278854874140732',
        ALL_RAIDS_ROLE_ID: '1429360300594958397',
        MODERATOR_ROLE_ID: '1429318984716521483', 
        // Outras Configs
        RAID_NOTIFICATION_ROLES: [
            '1429357175373041786', // Easy
            '1429357351906967562', // Medium
            '1429357358303150200', // Hard
            '1429357528168271894', // Insane
            '1429357529044877312', // Crazy
            '1429357530106298428'  // Leaf
        ],
        HOLIDAYS: [
            { date: '04-21', docId: 'easterAnnouncer', webhookName: 'Gui Coelhinho', title: '🐰 Feliz Páscoa! 🐰', description: 'O Gui Coelhinho está passando para desejar uma Páscoa doce e cheia de alegrias para toda a comunidade!', color: 0xFFC0CB, imageAsset: 'EasterBanner' },
            { date: '05-12', docId: 'mothersDayAnnouncer', webhookName: 'Gui Homenageia', title: '💖 Feliz Dia das Mães! 💖', description: 'Um dia especial para todas as mães da nossa comunidade! Obrigado por todo o amor e apoio. Vocês são nossas verdadeiras heroínas!', color: 0xFF69B4 },
            { date: '08-11', docId: 'fathersDayAnnouncer', webhookName: 'Gui Homenageia', title: '👔 Feliz Dia dos Pais! 👔', description: 'Para todos os pais que nos inspiram e nos ensinam a sermos mais fortes, dentro e fora do jogo. Feliz Dia dos Pais!', color: 0x1E90FF },
            { date: '10-31', docId: 'halloweenAnnouncer', webhookName: 'Gui Trevoso 🎃', title: '🎃 Feliz Halloween! 🎃', description: 'Doces ou travessuras? O Gui Trevoso está na área para desejar um Halloween assustadoramente divertido para todos! Cuidado com os ghouls!', color: 0xFF4500, imageAsset: 'HalloweenBanner' },
            { date: '12-25', docId: 'christmasAnnouncer', webhookName: 'Gui Noel', title: '🎄 Feliz Natal! 🎄', description: 'Ho ho ho! O Gui Noel deseja a todos um Natal cheio de paz, alegria e drops lendários!', color: 0xFF0000, imageAsset: 'ChristmasBanner' }
        ],
        GAME_LINK: 'https://www.roblox.com/games/90462358603255/15-Min-Anime-Eternal',
        VOICE_CHANNEL_CATEGORY_ID: '1426957344897761281',
    };
}
