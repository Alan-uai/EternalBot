// src/services/assetService.js

export class AssetService {
    constructor(config) {
        this.baseUrl = config.CLOUDINARY_URL;
        this.assets = {
            // Próxima Raid (PR)
            'EasyPR': `${this.baseUrl}/EasyPR.gif`,
            'MediumPR': `${this.baseUrl}/MediumPR.gif`,
            'HardPR': `${this.baseUrl}/HardPR.gif`,
            'InsanePR': `${this 'baseUrl}/InsanePR.gif`,
            'CrazyPR': `${this.baseUrl}/CrazyPR.gif`,
            'NightmarePR': `${this.baseUrl}/NightmarePR.gif`,
            'Leaf Raid (1800)PR': `${this.baseUrl}/LeafPR.gif`,
            // 5 Minutos para Raid
            'Easy5m': `${this.baseUrl}/Easy5m.gif`,
            'Medium5m': `${this.baseUrl}/Medium5m.gif`,
            'Hard5m': `${this.baseUrl}/Hard5m.gif`,
            'Insane5m': `${this.baseUrl}/Insane5m.gif`,
            'Crazy5m': `${this.baseUrl}/Crazy5m.gif`,
            'Nightmare5m': `${this.baseUrl}/Nightmare5m.gif`,
            'Leaf Raid (1800)5m': `${this.baseUrl}/Leaf5m.gif`,
            // Raid Aberta
            'EasyOpen': `${this.baseUrl}/EasyOpen.gif`,
            'MediumOpen': `${this.baseUrl}/MediumOpen.gif`,
            'HardOpen': `${this.baseUrl}/HardOpen.gif`,
            'InsaneOpen': `${this.baseUrl}/InsaneOpen.gif`,
            'CrazyOpen': `${this.baseUrl}/CrazyOpen.gif`,
            'NightmareOpen': `${this.baseUrl}/NightmareOpen.gif`,
            'Leaf Raid (1800)Open': `${this.baseUrl}/LeafOpen.gif`,
            // Outros
            'Closing': `${this.baseUrl}/Closing.gif`,
            'BotAvatar': `${this.baseUrl}/BotAvatar.png`,
        };
    }

    getAsset(assetId) {
        return this.assets[assetId] || null;
    }
}
