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
    // Permite que comandos "virtuais" não tenham execute
    if (typeof mod.execute !== 'function' && mod.data.name !== 'gerenciar') {
        return `O comando ${mod.data.name} em ${file} não possui uma função "execute".`;
    }
    return null;
}

export async function loadCommands(container) {
    const { logger, commands } = container;
    
    commands.clear();

    if (!fs.existsSync(COMMANDS_PATH)) {
        logger.warn(`Diretório de comandos não encontrado em ${COMMANDS_PATH}`);
        return;
    }

    const commandFiles = fs.readdirSync(COMMANDS_PATH).filter((file) => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(COMMANDS_PATH, file);
        try {
            // Use import com um timestamp para evitar o cache do módulo, permitindo o hot-reload
            const commandModule = await import(`file://${filePath}?t=${Date.now()}`);
            
            // Se o arquivo estiver vazio, pule-o
            if (Object.keys(commandModule).length === 0) {
                 logger.debug(`Arquivo de comando vazio ignorado: ${file}`);
                 continue;
            }

            const validationError = validateCommand(commandModule, file);
            if (validationError) {
                logger.warn(validationError);
                continue;
            }
            
            // Não carrega o comando gerenciar se for "removido"
            if (commandModule.data.name === 'gerenciar') {
                continue;
            }

            commands.set(commandModule.data.name, commandModule);
            logger.info(`Comando carregado: /${commandModule.data.name}`);

        } catch (err) {
            logger.error(`Falha ao carregar o comando ${file}:`, err);
        }
    }
}
