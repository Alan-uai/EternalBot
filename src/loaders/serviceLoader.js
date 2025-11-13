// src/loaders/serviceLoader.js
import { initializeFirebase } from '../firebase/index.js';
import { WikiService } from '../services/wikiService.js';
import { AssetService } from '../services/assetService.js';
import { ImageGenerationService } from '../services/imageGenerationService.js';
import { DataCompilerService } from '../services/dataCompiler.js';

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

    // Data Compiler Service (NEW)
    try {
        const dataCompiler = new DataCompilerService(logger);
        services.dataCompiler = dataCompiler;
        logger.info('Serviço de Compilação de Dados inicializado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço de Compilação de Dados:', error);
        throw error;
    }

    // Knowledge Base Service (now depends on Data Compiler)
    try {
        const wikiService = new WikiService(services.dataCompiler, logger);
        services.wikiContext = wikiService;
        logger.info('Serviço de Base de Conhecimento (Wiki) inicializado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço da Base de Conhecimento:', error);
        throw error;
    }
    
    // Asset Service
    try {
        const assetService = new AssetService(config, services.firebase.firestore, logger);
        await assetService.initialize(); // Dispara a sincronização
        services.assetService = assetService;
        // Adiciona uma referência cruzada para fácil acesso em outros serviços que dependem do firebase
        services.firebase.assetService = assetService; 
        logger.info('Serviço de Assets inicializado.');
    } catch (error) {
        logger.error('Falha ao inicializar o serviço de Assets:', error);
        // Não relança o erro para permitir que o bot funcione sem assets visuais
    }
    
    // Image Generation Service
     try {
        services.imageGenerator = new ImageGenerationService(services.assetService, logger);
        logger.info('Serviço de Geração de Imagem inicializado.');
    } catch(error) {
        logger.error('Falha ao inicializar o serviço de Geração de Imagem:', error);
    }
}
