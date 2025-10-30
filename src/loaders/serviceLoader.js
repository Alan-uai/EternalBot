// src/loaders/serviceLoader.js
import { initializeFirebase } from '../firebase/index.js';
import { loadKnowledgeBase } from '../knowledge-base.js';
import { AssetService } from '../services/assetService.js';

export async function loadServices(container) {
    const { logger, services, config } = container;

    // Firebase Service
    try {
        const firebaseServices = initializeFirebase();
        services.firebase = firebaseServices;
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
    
    // Asset Service
    try {
        // Injeta a configuração e a instância do firestore no serviço de assets
        services.firebase.assetService = new AssetService(config, services.firebase.firestore);
        logger.info('Serviço de Assets inicializado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço de Assets:', error);
        throw error;
    }
}
