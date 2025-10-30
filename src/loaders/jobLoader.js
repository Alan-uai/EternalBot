// src/loaders/jobLoader.js
import fs from 'node:fs';
import path from 'node:path';
import cron from 'node-cron';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_PATH = path.join(__dirname, '..', 'jobs');

function validateJob(mod, file) {
    if (!mod.name) return `O job em ${file} não possui a propriedade "name".`;
    if (typeof mod.run !== 'function') return `O job ${mod.name} em ${file} não possui uma função "run".`;
    if (!mod.schedule && !mod.intervalMs) return `O job ${mod.name} em ${file} não possui "schedule" (cron) ou "intervalMs".`;
    return null;
}

export async function loadJobs(container) {
    const { logger, jobs } = container;

    if (!fs.existsSync(JOBS_PATH)) {
        logger.warn(`Diretório de jobs não encontrado em ${JOBS_PATH}`);
        return;
    }

    const jobFiles = fs.readdirSync(JOBS_PATH).filter(file => file.endsWith('.js'));

    for (const file of jobFiles) {
        const filePath = path.join(JOBS_PATH, file);
        try {
            const jobModule = await import(`file://${filePath}?t=${Date.now()}`);

            const validationError = validateJob(jobModule, file);
            if (validationError) {
                logger.warn(validationError);
                continue;
            }
            
            const task = {
                name: jobModule.name,
                run: () => jobModule.run(container),
            };

            if (jobModule.schedule) {
                if (cron.validate(jobModule.schedule)) {
                    cron.schedule(jobModule.schedule, task.run);
                    logger.info(`Job agendado via cron '${jobModule.name}': ${jobModule.schedule}`);
                } else {
                    logger.error(`Formato de cron inválido para o job '${jobModule.name}': ${jobModule.schedule}`);
                    continue;
                }
            } else if (jobModule.intervalMs) {
                setInterval(task.run, jobModule.intervalMs);
                logger.info(`Job agendado via intervalo '${jobModule.name}': a cada ${jobModule.intervalMs}ms`);
            }
            
            jobs.push(task);

        } catch (err) {
            logger.error(`Falha ao carregar o job ${file}:`, err);
        }
    }
}
