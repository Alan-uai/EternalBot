// src/services/assetService.js
// Este serviço foi desativado, pois a geração de GIFs foi removida.
// Os assets visuais serão carregados de uma CDN no futuro.

export class AssetService {
    constructor(logger) {
        this.logger = logger;
        this.ready = false;
        this.logger.info('AssetService inicializado, mas a geração de GIFs está desativada.');
    }

    isReady() {
        // Retorna true imediatamente, pois não há nada para gerar.
        return true;
    }
    
    getAsset(raidName, state) {
        // Retorna null, pois não há assets locais para fornecer.
        return null;
    }

    generateAssets() {
        // Função vazia para não fazer nada.
        this.logger.info('Geração de assets pulada conforme configuração.');
        this.ready = true;
    }
}
