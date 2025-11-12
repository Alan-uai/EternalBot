// src/loaders/interactionLoader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTERACTIONS_PATH = path.join(__dirname, '..', 'interactions');

function validateInteraction(mod, file) {
    // A validação agora checará se customIdPrefix é um array ou uma string
    if (!mod.customIdPrefix || (Array.isArray(mod.customIdPrefix) && mod.customIdPrefix.length === 0)) {
        return `O manipulador em ${file} não possui a propriedade "customIdPrefix".`;
    }
    if (typeof mod.handleInteraction !== 'function') {
        return `O manipulador em ${file} não possui uma função "handleInteraction".`;
    }
    return null;
}


async function loadHandlersFromDirectory(directoryPath, container) {
    const { logger, interactions } = container;
    
    if (!fs.existsSync(directoryPath)) return;
    
    const interactionFiles = fs.readdirSync(directoryPath).filter(file => file.endsWith('.js'));
    
    for (const file of interactionFiles) {
        const filePath = path.join(directoryPath, file);
        try {
            const handlerModule = await import(`file://${filePath}?t=${Date.now()}`);
            
            if (Object.keys(handlerModule).length === 0) continue;

            const validationError = validateInteraction(handlerModule, file);
            if (validationError) {
                logger.warn(validationError);
                continue;
            }

            // Garante que estamos sempre trabalhando com um array de prefixos
            const prefixes = Array.isArray(handlerModule.customIdPrefix) ? handlerModule.customIdPrefix : [handlerModule.customIdPrefix];

            for (const prefix of prefixes) {
                if(interactions.has(prefix)) {
                    logger.warn(`Prefixo de interação duplicado detectado: '${prefix}' no arquivo ${file}. Isso pode levar a comportamento inesperado.`);
                }
                interactions.set(prefix, handlerModule.handleInteraction);
                logger.info(`Manipulador de interação carregado para o prefixo: ${prefix}`);
            }
                
        } catch (err) {
            logger.error(`Falha ao carregar o manipulador de interação ${file}:`, err);
        }
    }
}

export async function loadInteractions(container) {
    const { logger, interactions } = container;
    
    interactions.clear();

    if (!fs.existsSync(INTERACTIONS_PATH)) {
        logger.warn(`Diretório de interações não encontrado em ${INTERACTIONS_PATH}`);
        return;
    }

    const interactionFolders = fs.readdirSync(INTERACTIONS_PATH);
    
    for (const folder of interactionFolders) {
        const folderPath = path.join(INTERACTIONS_PATH, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            await loadHandlersFromDirectory(folderPath, container);
        }
    }
}
