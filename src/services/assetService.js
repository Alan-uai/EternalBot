// src/services/assetService.js
import { doc, writeBatch, collection, getDocs, getDoc } from 'firebase/firestore';
import { v2 as cloudinary } from 'cloudinary';

export class AssetService {
    /**
     * @param {object} config O objeto de configuração do bot.
     * @param {import('firebase/firestore').Firestore} firestore A instância do Firestore.
     * @param {import('../utils/logger.js').Logger} logger O logger para registrar informações.
     */
    constructor(config, firestore, logger) {
        this.firestore = firestore;
        this.logger = logger;
        this.assetsCache = new Map();
        this.isInitialized = false;

        const url = config.CLOUDINARY_URL;
        const match = url ? url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/) : null;

        if (!match) {
            this.logger.error('[AssetService] CLOUDINARY_URL inválida ou ausente. O serviço de assets não funcionará.');
            this.v2 = null; 
        } else {
            const [, apiKey, apiSecret, cloudName] = match;
            
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });
            this.v2 = cloudinary; // Use o objeto cloudinary importado
            this.logger.info('[AssetService] SDK do Cloudinary configurado.');
        }
    }
    
    isBaseUrlValid() {
        return !!this.v2;
    }

    /**
     * Sincroniza os assets do Cloudinary com o Firestore na inicialização.
     */
    async initialize() {
        if (!this.v2) {
            this.logger.error('[AssetService] Não é possível inicializar, SDK do Cloudinary não foi configurado.');
            return;
        }

        this.logger.info(`[AssetService] Sincronizando todos os assets do Cloudinary...`);

        try {
            const result = await this.v2.api.resources({
                type: 'upload',
                max_results: 500, // Busca o máximo de assets possível
            });

            const assets = result.resources;
            if (!assets || assets.length === 0) {
                this.logger.warn(`[AssetService] Nenhum asset encontrado no Cloudinary. Carregando do cache do Firestore se disponível.`);
                await this.loadFromFirestore();
                return;
            }

            const batch = writeBatch(this.firestore);
            const assetsCollectionRef = collection(this.firestore, 'assets');
            
            // Limpa o cache local antes de popular
            this.assetsCache.clear();

            for (const asset of assets) {
                const id = asset.public_id.split('/').pop(); // Extrai apenas o nome do arquivo/asset
                if (id) {
                    const imageUrl = asset.secure_url;
                    const assetRef = doc(assetsCollectionRef, id);
                    batch.set(assetRef, { url: imageUrl, syncedAt: new Date().toISOString() });
                    this.assetsCache.set(id, imageUrl);
                }
            }

            await batch.commit();
            this.isInitialized = true;
            this.logger.info(`[AssetService] Sincronizados ${assets.length} assets e carregados no cache.`);

        } catch (err) {
            this.logger.error('[AssetService] Falha ao sincronizar assets do Cloudinary:', err);
            this.logger.warn('[AssetService] Tentando carregar assets do cache do Firestore como fallback...');
            await this.loadFromFirestore();
        }
    }
    
    async loadFromFirestore() {
        try {
            const assetsCollection = collection(this.firestore, 'assets');
            const snapshot = await getDocs(assetsCollection);
            snapshot.forEach(doc => {
                this.assetsCache.set(doc.id, doc.data().url);
            });
            this.isInitialized = true;
            this.logger.info(`[AssetService] Carregados ${this.assetsCache.size} assets do Firestore para o cache.`);
        } catch (error) {
            this.logger.error('[AssetService] Falha ao carregar assets do cache do Firestore:', error);
        }
    }

    async getAsset(assetId) {
        if (!assetId) return null;
        
        if (!this.isInitialized) {
             this.logger.warn(`[AssetService] Serviço não inicializado ao buscar '${assetId}'. Tentando carregar do Firestore...`);
             await this.loadFromFirestore();
        }

        if (this.assetsCache.has(assetId)) {
            return this.assetsCache.get(assetId);
        }

        this.logger.warn(`[AssetService] Asset '${assetId}' não encontrado no cache. Tentando buscar diretamente no Firestore.`);
        try {
            const docRef = doc(this.firestore, 'assets', assetId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const url = docSnap.data().url;
                this.assetsCache.set(assetId, url);
                return url;
            } else {
                this.logger.warn(`[AssetService] Asset '${assetId}' também não foi encontrado no Firestore.`);
                return null;
            }
        } catch (error) {
            this.logger.error(`[AssetService] Erro ao buscar fallback de asset '${assetId}' do Firestore:`, error);
            return null;
        }
    }
}
