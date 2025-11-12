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

    // Limpa jobs agendados anteriormente para evitar duplicação em hot-reloads
    jobs.forEach(task => {
        if (task.stop) task.stop();
    });
    jobs.length = 0;

    if (!fs.existsSync(JOBS_PATH)) {
        logger.warn(`Diretório de jobs não encontrado em ${JOBS_PATH}`);
        return;
    }

    const jobFiles = fs.readdirSync(JOBS_PATH).filter(file => file.endsWith('.js'));

    for (const file of jobFiles) {
        const filePath = path.join(JOBS_PATH, file);
        try {
            const jobModule = await import(`file://${filePath}?t=${Date.now()}`);
             // Pula o arquivo se estiver vazio
            if (Object.keys(jobModule).length === 0) {
                 logger.debug(`Arquivo de job vazio ignorado: ${file}`);
                 continue;
            }

            const validationError = validateJob(jobModule, file);
            if (validationError) {
                logger.warn(validationError);
                continue;
            }
            
            let task;
            const runJob = () => jobModule.run(container);

            if (jobModule.schedule) {
                if (cron.validate(jobModule.schedule)) {
                    task = cron.schedule(jobModule.schedule, runJob, {
                        timezone: "America/Sao_Paulo"
                    });
                    logger.info(`Job agendado via cron '${jobModule.name}': ${jobModule.schedule}`);
                } else {
                    logger.error(`Formato de cron inválido para o job '${jobModule.name}': ${jobModule.schedule}`);
                    continue;
                }
            } else if (jobModule.intervalMs) {
                const intervalId = setInterval(runJob, jobModule.intervalMs);
                task = { stop: () => clearInterval(intervalId) }; // Para poder parar o intervalo
                logger.info(`Job agendado via intervalo '${jobModule.name}': a cada ${jobModule.intervalMs}ms`);
            }
            
            jobs.push({
                name: jobModule.name,
                run: runJob,
                stop: () => { if(task.stop) task.stop() },
            });
            // Execute o job uma vez na inicialização, se for um painel
            if(jobModule.name.includes('Panel')) {
                runJob();
            }

        } catch (err) {
            logger.error(`Falha ao carregar o job ${file}:`, err);
        }
    }
}
