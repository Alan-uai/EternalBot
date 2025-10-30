// src/loaders/serviceLoader.js
import { initializeFirebase } from '../firebase/index.js';
import { loadKnowledgeBase } from '../knowledge-base.js';
import { AssetService } from '../services/assetService.js';

export async function loadServices(container) {
    const { logger, services } = container;

    // Firebase Service
    try {
        services.firebase = initializeFirebase();
        logger.info('Serviço Firebase inicializado com sucesso.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço Firebase:', error);
        throw error;
    }

    // Knowledge Base Service
    try {
        const context = loadKnowledgeBase(logger);
        services.wikiContext = {
            getContext: () => context,
        };
        logger.info('Serviço de Base de Conhecimento (Wiki) inicializado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço da Base de Conhecimento:', error);
        throw error;
    }
    
    // Raid Panel Asset Service
    try {
        services.assetService = new AssetService(logger);
        // Não bloqueia a inicialização, ele gerará os assets em segundo plano
        services.assetService.generateAssets(); 
        logger.info('Serviço de Assets do Painel de Raid inicializado. A geração de GIFs começou em segundo plano.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço de Assets do Painel de Raid:', error);
        throw error;
    }
}
