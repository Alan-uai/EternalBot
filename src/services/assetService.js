// src/services/assetService.js

export class AssetService {
    constructor(config) {
        this.baseUrl = config.CLOUDINARY_URL;
        // O BotAvatar é o único que não tem um padrão dinâmico
        this.assets = {
            'BotAvatar': `${this.baseUrl}/BotAvatar.png`,
        };
    }

    /**
     * Retorna a URL completa para um asset.
     * Para assets de raid, o ID é construído dinamicamente.
     * @param {string} assetId O ID do asset (ex: 'EasyA', 'Hard5m', 'BotAvatar')
     * @returns {string|null} A URL completa do asset ou null se não for um asset válido.
     */
    getAsset(assetId) {
        if (this.assets[assetId]) {
            return this.assets[assetId];
        }

        // Para assets dinâmicos de raid como 'EasyA', 'Hard5m', etc.
        // O assetId é o próprio nome do arquivo (sem extensão)
        const validSuffixes = ['PR', '5m', 'A', 'F'];
        const suffix = validSuffixes.find(s => assetId.endsWith(s));

        if (suffix) {
             // Assumimos que a maioria são GIFs, exceto o avatar
            const extension = 'gif';
            return `${this.baseUrl}/${assetId}.${extension}`;
        }
        
        // Retorna null se não encontrar um padrão válido
        return null;
    }
}
