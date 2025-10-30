// src/services/assetService.js
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class AssetService {
    /**
     * @param {object} config O objeto de configuração do bot.
     * @param {import('firebase/firestore').Firestore} firestore A instância do Firestore.
     * @param {import('cloudinary').Api} cloudinaryApi A API do Cloudinary.
     * @param {import('../utils/logger.js').Logger} logger O logger para registrar informações.
     */
    constructor(config, firestore, cloudinaryApi, logger) {
        this.baseUrl = config.CLOUDINARY_URL || '';
        this.firestore = firestore;
        this.cloudinaryApi = cloudinaryApi;
        this.logger = logger;
        this.assetIds = new Set();
        this.isInitialized = false;
    }

    /**
     * Sincroniza os assets do Cloudinary com o Firestore e depois carrega-os para a memória.
     */
    async initialize() {
        if (!this.firestore) {
            this.logger.error('[AssetService] Firestore não está disponível. O serviço não pode ser inicializado.');
            return;
        }
         if (!this.cloudinaryApi || !process.env.CLOUDINARY_URL) {
            this.logger.warn('[AssetService] API do Cloudinary ou CLOUDINARY_URL não configurada. Pulando sincronização e tentando carregar do cache.');
            await this.loadFromCache();
            return;
        }

        try {
            this.logger.info('[AssetService] Iniciando sincronização de assets do Cloudinary...');
            const result = await this.cloudinaryApi.resources({
                type: 'upload',
                max_results: 500,
                prefix: 'eternal-bot-assets/'
            });

            const assetIds = result.resources.map(res => res.public_id.replace(/^eternal-bot-assets\//, ''));

            if (assetIds.length > 0) {
                const assetIdsDocRef = doc(this.firestore, 'bot_config', 'asset_ids');
                await setDoc(assetIdsDocRef, {
                    ids: assetIds,
                    lastSynced: new Date().toISOString(),
                });
                this.logger.info(`[AssetService] Sincronização concluída! ${assetIds.length} assets salvos no Firestore.`);
            } else {
                 this.logger.warn('[AssetService] Nenhum asset encontrado na pasta `eternal-bot-assets` do Cloudinary durante a sincronização.');
            }
        } catch (error) {
             this.logger.error('[AssetService] Falha ao sincronizar assets do Cloudinary. O serviço usará o cache do Firestore, se disponível.', error);
        }

        // Após a tentativa de sincronização, carrega os IDs para a memória
        await this.loadFromCache();
    }
    
    /**
     * Carrega a lista de IDs de assets do cache do Firestore para a memória.
     */
    async loadFromCache() {
         try {
            const assetIdsDocRef = doc(this.firestore, 'bot_config', 'asset_ids');
            const docSnap = await getDoc(assetIdsDocRef);
            if (docSnap.exists() && Array.isArray(docSnap.data().ids)) {
                this.assetIds = new Set(docSnap.data().ids);
                this.isInitialized = true;
                this.logger.info(`[AssetService] Carregados ${this.assetIds.size} IDs de assets do cache do Firestore.`);
            } else {
                this.logger.warn(`[AssetService] Documento 'asset_ids' não encontrado no cache do Firestore. A busca de assets pode falhar.`);
            }
        } catch (error) {
            this.logger.error('[AssetService] Falha ao carregar IDs de assets do cache:', error);
        }
    }


    isBaseUrlValid() {
        return this.baseUrl && this.baseUrl.startsWith('https://');
    }

    /**
     * Gera a URL completa de um asset se o ID for válido.
     * @param {string} assetId O ID público do asset (ex: 'EasyA', 'BotAvatar').
     * @returns {string|null} A URL completa ou null se inválido.
     */
    getAssetUrl(assetId) {
        if (!assetId || !this.isBaseUrlValid()) return null;

        if (!this.isInitialized || !this.assetIds.has(assetId)) {
            this.logger.debug(`[AssetService] Asset ID '${assetId}' não encontrado na lista de assets carregados.`);
            return null;
        }

        return `${this.baseUrl}/${assetId}`;
    }
    
    /**
     * @param {string} assetId O ID do asset.
     * @returns {Promise<string|null>} A URL do asset ou null.
     */
    async getAsset(assetId) {
        return this.getAssetUrl(assetId);
    }
}
