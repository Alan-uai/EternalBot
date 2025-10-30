// src/loaders/serviceLoader.js
import { initializeFirebase } from '../firebase/index.js';
import { loadKnowledgeBase } from '../knowledge-base.js';
import { AssetService } from '../services/assetService.js';
import { v2 as cloudinary } from 'cloudinary';

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
        // Configura o Cloudinary aqui, pois só é necessário durante a inicialização dos serviços.
        if (process.env.CLOUDINARY_URL) {
            cloudinary.config({ secure: true });
        } else {
             logger.warn('[AssetService] A variável de ambiente CLOUDINARY_URL não está configurada. A sincronização de assets não será executada.');
        }

        const assetService = new AssetService(config, services.firebase.firestore, cloudinary.api, logger);
        await assetService.initialize(); // Sincroniza e carrega os IDs dos assets
        services.assetService = assetService;
        services.firebase.assetService = assetService; // Mantém a referência antiga por compatibilidade
        logger.info('Serviço de Assets inicializado e sincronizado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço de Assets:', error);
        throw error;
    }
}
