// src/services/assetService.js

export class AssetService {
    constructor(config) {
        this.baseUrl = config.CLOUDINARY_URL;
        this.assets = {
            'BotAvatar': `${this.baseUrl}/BotAvatar.png`,
            'DungeonLobby': `${this.baseUrl}/DungeonLobby.png`,
        };
    }

    /**
     * Retorna a URL completa para um asset.
     * @param {string} assetId O ID do asset (ex: 'EasyA', 'Hard5m', 'BotAvatar', 'DungeonLobby')
     * @returns {string|null} A URL completa do asset ou null se não for um asset válido.
     */
    getAsset(assetId) {
        if (!assetId) return null;
        
        if (this.assets[assetId]) {
            return this.assets[assetId];
        }

        // Para assets dinâmicos de raid como 'EasyA', 'Hard5m', etc.
        const validSuffixes = ['PR', '5m', 'A', 'F'];
        const suffix = validSuffixes.find(s => assetId.endsWith(s));

        if (suffix) {
            const extension = 'gif';
            return `${this.baseUrl}/${assetId}.${extension}`;
        }
        
        // Retorna null se não encontrar um padrão válido
        return null;
    }
}
