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
    
    const items = fs.readdirSync(directoryPath, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(directoryPath, item.name);
        if (item.isDirectory()) {
            await loadHandlersFromDirectory(fullPath, container); // Recursão para subpastas
        } else if (item.isFile() && item.name.endsWith('.js')) {
            try {
                const handlerModule = await import(`file://${fullPath}?t=${Date.now()}`);
                
                if (Object.keys(handlerModule).length === 0) continue;

                const validationError = validateInteraction(handlerModule, item.name);
                if (validationError) {
                    logger.warn(validationError);
                    continue;
                }

                const prefixes = Array.isArray(handlerModule.customIdPrefix) ? handlerModule.customIdPrefix : [handlerModule.customIdPrefix];

                for (const prefix of prefixes) {
                    if(interactions.has(prefix)) {
                        logger.warn(`Prefixo de interação duplicado detectado: '${prefix}' no arquivo ${item.name}. Isso pode levar a comportamento inesperado.`);
                    }
                    interactions.set(prefix, handlerModule.handleInteraction);
                    logger.info(`Manipulador de interação carregado para o prefixo: ${prefix}`);
                }
                    
            } catch (err) {
                logger.error(`Falha ao carregar o manipulador de interação ${item.name}:`, err);
            }
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
    
    await loadHandlersFromDirectory(INTERACTIONS_PATH, container);
}
