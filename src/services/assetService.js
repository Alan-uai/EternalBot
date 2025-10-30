// src/services/assetService.js

export class AssetService {
    constructor(config) {
        this.baseUrl = config.CLOUDINARY_URL || '';
        this.assets = {
            'BotAvatar': 'BotAvatar.png',
            'DungeonLobby': 'DungeonLobby.png',
        };
    }
    
    isBaseUrlValid() {
        return this.baseUrl && this.baseUrl.startsWith('https://');
    }

    /**
     * Retorna a URL completa para um asset.
     * @param {string} assetId O ID do asset (ex: 'EasyA', 'Hard5m', 'BotAvatar')
     * @returns {string|null} A URL completa do asset ou null se não for um asset válido.
     */
    getAsset(assetId) {
        if (!assetId || !this.isBaseUrlValid()) return null;
        
        let fileName;
        
        if (this.assets[assetId]) {
            fileName = this.assets[assetId];
        } else {
            // Para assets dinâmicos de raid como 'EasyA', 'Hard5m', etc.
            const validSuffixes = ['PR', '5m', 'A', 'F'];
            const suffix = validSuffixes.find(s => assetId.endsWith(s));
            if (suffix) {
                fileName = `${assetId}.gif`;
            }
        }

        if (fileName) {
            return `${this.baseUrl}/${fileName}`;
        }
        
        // Retorna null se não encontrar um padrão válido
        return null;
    }
}
