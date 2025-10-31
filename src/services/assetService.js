// src/services/assetService.js
import { doc, getDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

export class AssetService {
    /**
     * @param {object} config O objeto de configuração do bot.
     * @param {import('firebase/firestore').Firestore} firestore A instância do Firestore.
     * @param {import('../utils/logger.js').Logger} logger O logger para registrar informações.
     */
    constructor(config, firestore, logger) {
        this.cloudinaryUrl = config.CLOUDINARY_URL;
        this.firestore = firestore;
        this.logger = logger;
        this.assetsCache = new Map(); // Cache em memória para acesso rápido
        this.isInitialized = false;

        const match = this.cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);

        if (!match) {
            this.logger.error('[AssetService] CLOUDINARY_URL inválido. Use o formato: cloudinary://<key>:<secret>@<name>');
            return;
        }

        this.apiKey = match[1];
        this.apiSecret = match[2];
        this.cloudName = match[3];
        this.folder = 'Home';
    }
    
    isBaseUrlValid() {
        return !!this.apiKey;
    }

    /**
     * Sincroniza os assets do Cloudinary com o Firestore.
     */
    async initialize() {
        if (!this.apiKey) {
            this.logger.error('[AssetService] Não é possível inicializar, CLOUDINARY_URL inválida ou ausente.');
            return;
        }

        const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/resources/image/upload`;
        const params = `?max_results=500&prefix=${this.folder}/`;

        try {
            this.logger.info(`[AssetService] Sincronizando assets da pasta '${this.folder}' do Cloudinary...`);
            
            const response = await axios.get(url + params, {
                auth: { username: this.apiKey, password: this.apiSecret },
            });

            const assets = response.data.resources;

            if (!assets || assets.length === 0) {
                this.logger.warn(`[AssetService] Nenhum asset encontrado na pasta '${this.folder}' do Cloudinary.`);
                this.isInitialized = true; // Marca como inicializado mesmo sem assets
                return;
            }

            const batch = writeBatch(this.firestore);
            const assetsCollectionRef = collection(this.firestore, 'assets');

            for (const asset of assets) {
                const id = asset.public_id.replace(`${this.folder}/`, '');
                if (id) {
                    const imageUrl = asset.secure_url;
                    const assetRef = doc(assetsCollectionRef, id);
                    batch.set(assetRef, { url: imageUrl, syncedAt: new Date().toISOString() });
                    this.assetsCache.set(id, imageUrl); // Pré-popula o cache em memória
                }
            }

            await batch.commit();
            this.isInitialized = true;
            this.logger.info(`[AssetService] Sincronizados ${assets.length} assets e carregados no cache.`);

        } catch (err) {
            this.logger.error('[AssetService] Falha ao sincronizar assets do Cloudinary:', err.response ? err.response.data : err.message);
            this.logger.warn('[AssetService] Tentando carregar assets do cache do Firestore como fallback...');
            await this.loadFromFirestore();
        }
    }
    
    /**
     * Carrega todos os assets do Firestore para o cache em memória como um fallback.
     */
    async loadFromFirestore() {
        try {
            const assetsCollection = collection(this.firestore, 'assets');
            const snapshot = await getDocs(assetsCollection);
            snapshot.forEach(doc => {
                this.assetsCache.set(doc.id, doc.data().url);
            });
            this.isInitialized = true;
            this.logger.info(`[AssetService] Carregados ${this.assetsCache.size} assets do Firestore para o cache em memória.`);
        } catch (error) {
            this.logger.error('[AssetService] Falha ao carregar assets do cache do Firestore:', error);
        }
    }


    /**
     * Busca a URL de um asset. Tenta primeiro no cache em memória, depois no Firestore.
     * @param {string} assetId O ID do asset (ex: 'EasyPR').
     * @returns {Promise<string|null>} A URL segura do asset ou null se não for encontrado.
     */
    async getAsset(assetId) {
        if (!assetId) return null;
        if (!this.isInitialized) {
            this.logger.warn(`[AssetService] Serviço não inicializado ao tentar buscar asset '${assetId}'. Carregando do Firestore como fallback...`);
            await this.loadFromFirestore();
        }

        // Tenta buscar do cache em memória primeiro
        if (this.assetsCache.has(assetId)) {
            return this.assetsCache.get(assetId);
        }

        // Se não estiver no cache, busca no Firestore (pode ter sido adicionado por outro processo)
        try {
            const docRef = doc(this.firestore, 'assets', assetId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const url = docSnap.data().url;
                this.assetsCache.set(assetId, url); // Atualiza o cache
                return url;
            } else {
                this.logger.warn(`[AssetService] Asset '${assetId}' não encontrado no Firestore.`);
                return null;
            }
        } catch (error) {
            this.logger.error(`[AssetService] Erro ao buscar asset '${assetId}' do Firestore:`, error);
            return null;
        }
    }
}
