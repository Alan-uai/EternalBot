// src/config/loader.js
import 'dotenv/config';

export function loadConfig(logger) {
    const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
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
        CLOUDINARY_URL: process.env.CLOUDINARY_URL, // URL base para os assets
        // IDs de Canais
        CHAT_CHANNEL_ID: '1429309293076680744',
        MOD_CURATION_CHANNEL_ID: '1426968477482225716',
        COMMUNITY_HELP_CHANNEL_ID: '1426957344897761282',
        FEEDBACK_CHANNEL_ID: '1429314152928641118',
        RAID_CHANNEL_ID: '1429260587648417964',
        BIRTHDAY_CHANNEL_ID: '1429309293076680744',
        // IDs de Cargos
        ADMIN_ROLE_ID: '1429318984716521483',
        VERIFIED_ROLE_ID: '1429278854874140734',
        ALL_RAIDS_ROLE_ID: '1429360300594958397',
        // Outras Configs
        RAID_NOTIFICATION_ROLES: [
            '1429357175373041786', // Easy
            '1429357351906967562', // Medium
            '1429357358303150200', // Hard
            '1429357528168271894', // Insane
            '1429357529044877312', // Crazy
            '1429357530106298428'  // Leaf
        ],
        GAME_LINK: 'https://www.roblox.com/games/90462358603255/15-Min-Anime-Eternal',
        SOLING_POST_CHANNEL_ID: '1429295597374144563',
    };
}
