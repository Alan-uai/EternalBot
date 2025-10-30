// src/services/assetService.js
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { createLoopedTextGif, createCountdownGif } from '../utils/createRaidPanelAssets.js';
import { AttachmentBuilder } from 'discord.js';

export class AssetService {
    constructor(logger) {
        this.logger = logger;
        this.assets = new Map(); // raidName -> { next, warning, open, closing }
        this.ready = false;
    }

    isReady() {
        return this.ready;
    }
    
    getAsset(raidName, state) {
        const raidAssets = this.assets.get(raidName);
        return raidAssets ? raidAssets[state] : null;
    }

    async generateAssets() {
        this.logger.info('Iniciando a geração de assets para o painel de raids...');
        const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;

        for (const raid of raids) {
            const raidName = raid['Dificuldade'];
            this.logger.debug(`Gerando assets para a raid: ${raidName}`);
            
            try {
                const nextGif = await createLoopedTextGif(`Próxima Raid: ${raidName}`, '#3498DB');
                const warningGif = await createLoopedTextGif(`${raidName} abre em 5m`, '#F1C40F');
                const openGif = await createLoopedTextGif(`${raidName} ABERTA`, '#2ECC71');
                const closingGif = await createCountdownGif(`Fechando em: `);

                this.assets.set(raidName, {
                    next: this.bufferToDataURI(nextGif),
                    warning: this.bufferToDataURI(warningGif),
                    open: this.bufferToDataURI(openGif),
                    closing: this.bufferToDataURI(closingGif),
                });
                
                this.logger.debug(`Assets para ${raidName} gerados com sucesso.`);
            } catch(error) {
                this.logger.error(`Falha ao gerar assets para a raid ${raidName}:`, error);
            }
        }
        
        this.ready = true;
        this.logger.info('Todos os assets do painel de raids foram gerados e estão prontos para uso.');
    }
    
    bufferToDataURI(buffer) {
        return `data:image/gif;base64,${buffer.toString('base64')}`;
    }
}
