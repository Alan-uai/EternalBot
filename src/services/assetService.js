// src/services/assetService.js
import { doc, writeBatch, collection, getDocs, getDoc } from 'firebase/firestore';
import { v2 as cloudinary } from 'cloudinary';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';

// Mapeamento de raids para seus prefixos e nomes de asset
const RAID_ASSET_MAP = lobbyDungeonsArticle.tables.lobbySchedule.rows.reduce((acc, raid) => {
    const name = raid.Dificuldade;
    const prefixMap = {
        'Easy': 'Esy', 'Medium': 'Med', 'Hard': 'Hd', 'Insane': 'Isne',
        'Crazy': 'Czy', 'Nightmare': 'Mare', 'Leaf Raid': 'Lf'
    };
    if (prefixMap[name]) {
        // O nome base para GIFs é o nome completo, exceto para 'Leaf Raid'
        const baseName = name === 'Leaf Raid' ? 'Leaf' : name;
        acc[name] = {
            prefix: prefixMap[name],
            baseName: baseName,
        };
    }
    return acc;
}, {});


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
        this.raidAssets = {}; // Objeto para armazenar assets de raid estruturados
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
     * Organiza os assets de raid em uma estrutura aninhada para fácil acesso,
     * seguindo a lógica de nomenclatura corrigida.
     */
    _organizeRaidAssets() {
        this.raidAssets = {}; // Limpa para garantir que não haja dados antigos
        const states = {
            next_up: 'PR',
            starting_soon: '5m',
            open: 'A',
            closing_soon: 'F'
        };

        for (const raidName in RAID_ASSET_MAP) {
            const { prefix, baseName } = RAID_ASSET_MAP[raidName];
            
            this.raidAssets[raidName] = {
                avatars: {},
                gifs: {
                    transition: {},
                    final: {}
                }
            };
            
            for (const state in states) {
                const suffix = states[state];
                
                // 1. Monta os Avatares (Ex: EsyA, Med5m)
                this.raidAssets[raidName].avatars[state] = this.assetsCache.get(`${prefix}${suffix}`);
                
                // 2. Monta os GIFs Finais (Ex: EasyA, Medium5m)
                this.raidAssets[raidName].gifs.final[state] = this.assetsCache.get(`${baseName}${suffix}`);
                
                // 3. Monta os GIFs de Transição (Ex: TranEasyA, TranMedium5m), pulando o estado 'closing_soon'
                if (state !== 'closing_soon') {
                    this.raidAssets[raidName].gifs.transition[state] = this.assetsCache.get(`Tran${baseName}${suffix}`);
                }
            }

            // Adiciona um fallback genérico para o avatar caso algum estado específico falhe
            this.raidAssets[raidName].fallbackAvatar = this.assetsCache.get(`${prefix}PR`) || this.assetsCache.get('DungeonLobby');
        }
        
        this.logger.info('[AssetService] Assets de Raid organizados com a nova estrutura.');
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
            
            this._organizeRaidAssets(); // Organiza os assets de raid após carregar tudo

        } catch (err) {
            this.logger.error('[AssetService] Falha ao sincronizar assets do Cloudinary:', err);
            this.logger.warn('[AssetService] Tentando carregar assets do Firestore como fallback...');
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
            this._organizeRaidAssets(); // Tenta organizar mesmo com dados do Firestore
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

        // 1. Busca no cache
        if (this.assetsCache.has(assetId)) {
            return this.assetsCache.get(assetId);
        }
        
        // 2. Se não estiver no cache, busca no Firestore (uma única vez)
        this.logger.warn(`[AssetService] Asset '${assetId}' não encontrado no cache. Tentando buscar diretamente no Firestore.`);
        try {
            const docRef = doc(this.firestore, 'assets', assetId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const url = docSnap.data().url;
                this.assetsCache.set(assetId, url); // Adiciona ao cache para futuras buscas
                this.logger.info(`[AssetService] Asset '${assetId}' encontrado no Firestore e adicionado ao cache.`);
                return url;
            } else {
                this.logger.warn(`[AssetService] Asset '${assetId}' também não foi encontrado no Firestore. A busca termina aqui.`);
                return null; // Retorna null e não tenta novamente.
            }
        } catch (error) {
            this.logger.error(`[AssetService] Erro ao buscar fallback de asset '${assetId}' do Firestore:`, error);
            return null;
        }
    }
}
