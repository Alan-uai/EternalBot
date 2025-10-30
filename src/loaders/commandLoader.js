// src/loaders/commandLoader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMANDS_PATH = path.join(__dirname, '..', 'commands', 'utility');

function validateCommand(mod, file) {
    if (!mod.data || !mod.data.name) {
        return `O comando em ${file} não possui a propriedade "data.name".`;
    }
    if (typeof mod.execute !== 'function') {
        return `O comando ${mod.data.name} em ${file} não possui uma função "execute".`;
    }
    return null;
}

export async function loadCommands(container) {
    const { logger, commands } = container;
    
    if (!fs.existsSync(COMMANDS_PATH)) {
        logger.warn(`Diretório de comandos não encontrado em ${COMMANDS_PATH}`);
        return;
    }

    const commandFiles = fs.readdirSync(COMMANDS_PATH).filter((file) => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(COMMANDS_PATH, file);
        try {
            // ESM-friendly way to import and bypass cache for potential hot-reloading
            const commandModule = await import(`file://${filePath}?t=${Date.now()}`);
            
            const validationError = validateCommand(commandModule, file);
            if (validationError) {
                logger.warn(validationError);
                continue;
            }
            
            commands.set(commandModule.data.name, commandModule);
            logger.info(`Comando carregado: /${commandModule.data.name}`);

        } catch (err) {
            logger.error(`Falha ao carregar o comando ${file}:`, err);
        }
    }
}
