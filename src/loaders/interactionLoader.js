// src/loaders/interactionLoader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTERACTIONS_PATH = path.join(__dirname, '..', 'interactions');

function validateInteraction(mod, file) {
    if (!mod.customIdPrefix) {
        return `O manipulador em ${file} não possui a propriedade "customIdPrefix".`;
    }
    if (typeof mod.handleInteraction !== 'function') {
        return `O manipulador em ${file} não possui uma função "handleInteraction".`;
    }
    return null;
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
        if(!fs.statSync(folderPath).isDirectory()) continue;
        
        const interactionFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of interactionFiles) {
            const filePath = path.join(folderPath, file);
            try {
                const handlerModule = await import(`file://${filePath}?t=${Date.now()}`);
                
                // Adicionado para registrar múltiplos prefixos se o handler exportar um array
                const prefixes = Array.isArray(handlerModule.customIdPrefix) ? handlerModule.customIdPrefix : [handlerModule.customIdPrefix];

                for (const prefix of prefixes) {
                    const validationMod = { ...handlerModule, customIdPrefix: prefix };
                    const validationError = validateInteraction(validationMod, file);
                    if(validationError){
                        logger.warn(validationError);
                        continue;
                    }
                    interactions.set(prefix, handlerModule.handleInteraction);
                    logger.info(`Manipulador de interação carregado para o prefixo: ${prefix}`);
                }
                
            } catch (err) {
                logger.error(`Falha ao carregar o manipulador de interação ${file}:`, err);
            }
        }
    }
}
