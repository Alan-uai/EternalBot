// src/loaders/eventLoader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_PATH = path.join(__dirname, '..', 'events');

function validateEvent(mod, file) {
    if (!mod.name) return `O evento em ${file} não possui a propriedade "name".`;
    if (typeof mod.execute !== 'function') return `O evento ${mod.name} em ${file} não possui uma função "execute".`;
    return null;
}

export async function loadEvents(container) {
    const { client, logger } = container;

    if (!fs.existsSync(EVENTS_PATH)) {
        logger.warn(`Diretório de eventos não encontrado em ${EVENTS_PATH}`);
        return;
    }

    const eventFolders = fs.readdirSync(EVENTS_PATH);

    for (const folder of eventFolders) {
        const folderPath = path.join(EVENTS_PATH, folder);
        const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);
            try {
                // Use import() dinâmico para módulos ES
                const event = await import(`file://${filePath}?t=${Date.now()}`);
                
                const validationError = validateEvent(event, file);
                if (validationError) {
                    logger.warn(validationError);
                    continue;
                }
                
                // Passa o container para o wrapper
                const wrapper = (...args) => event.execute(...args, container);

                // Remove o listener antigo para este evento específico antes de adicionar um novo.
                // Isso evita o problema de duplicação de listeners durante hot-reloads.
                client.removeListener(event.name, client.listeners(event.name)[0] || (() => {}));


                if (event.once) {
                    client.once(event.name, wrapper);
                } else {
                    client.on(event.name, wrapper);
                }
                 logger.info(`Evento carregado: ${event.name}`);

            } catch (err) {
                 logger.error(`Falha ao carregar o evento ${file}:`, err);
            }
        }
    }
}
