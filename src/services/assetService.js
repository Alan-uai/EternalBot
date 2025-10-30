// src/services/assetService.js
import { doc, getDoc } from 'firebase/firestore';

export class AssetService {
    /**
     * @param {object} config O objeto de configuração do bot.
     * @param {import('firebase/firestore').Firestore} firestore A instância do Firestore.
     */
    constructor(config, firestore) {
        this.baseUrl = config.CLOUDINARY_URL || '';
        this.firestore = firestore;
        this.assetIds = new Set(); // Usar um Set para buscas rápidas
        this.isInitialized = false;
    }

    /**
     * Carrega a lista de IDs de assets do Firestore para a memória.
     * @param {import('../utils/logger.js').Logger} logger - O logger para registrar informações.
     */
    async initialize(logger) {
        if (!this.firestore) {
            logger.error('[AssetService] Firestore não está disponível. O serviço não pode ser inicializado.');
            return;
        }
        try {
            const assetIdsDocRef = doc(this.firestore, 'bot_config', 'asset_ids');
            const docSnap = await getDoc(assetIdsDocRef);
            if (docSnap.exists() && Array.isArray(docSnap.data().ids)) {
                this.assetIds = new Set(docSnap.data().ids);
                this.isInitialized = true;
                logger.info(`[AssetService] Carregados ${this.assetIds.size} IDs de assets do Firestore.`);
            } else {
                logger.warn(`[AssetService] Documento 'asset_ids' não encontrado no Firestore. Execute /sync-assets para popular a lista de assets.`);
            }
        } catch (error) {
            logger.error('[AssetService] Falha ao inicializar e carregar IDs de assets:', error);
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

        // Verifica se o ID do asset foi carregado durante a inicialização
        if (!this.isInitialized || !this.assetIds.has(assetId)) {
            // Não loga um erro para não poluir, mas retorna null
            return null;
        }

        // Constrói a URL final juntando a base com o ID do asset.
        // Ex: https://.../eternal-bot-assets/EasyA
        return `${this.baseUrl}/${assetId}`;
    }

    /**
     * Wrapper para manter a compatibilidade com a assinatura async anterior, embora agora seja síncrona.
     * @param {string} assetId O ID do asset.
     * @returns {Promise<string|null>} A URL do asset ou null.
     */
    async getAsset(assetId) {
        return this.getAssetUrl(assetId);
    }
}
