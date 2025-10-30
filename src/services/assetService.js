// src/services/assetService.js
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

export class AssetService {
    /**
     * @param {object} config O objeto de configuração do bot.
     * @param {import('firebase/firestore').Firestore} firestore A instância do Firestore.
     */
    constructor(config, firestore) {
        this.baseUrl = config.CLOUDINARY_URL || '';
        this.firestore = firestore;
        this.assets = {
            'BotAvatar': 'BotAvatar',
            'DungeonLobby': 'DungeonLobby',
        };
    }

    isBaseUrlValid() {
        return this.baseUrl && this.baseUrl.startsWith('https://');
    }

    /**
     * Gera a URL completa de um asset (sem acessar o Firestore).
     * @param {string} assetId O ID do asset (ex: 'EasyA', 'Hard5m').
     * @returns {string|null} A URL completa ou null se inválido.
     */
    generateAssetUrl(assetId) {
        if (!assetId || !this.isBaseUrlValid()) return null;
        // O assetId já é o nome final do arquivo no Cloudinary (ex: 'EasyA', 'BotAvatar')
        // A extensão é gerenciada pelo próprio Cloudinary na entrega.
        return `${this.baseUrl}/${assetId}`;
    }

    /**
     * Busca a URL do asset no Firestore.
     * Se não existir, gera automaticamente, salva e retorna.
     * @param {string} assetId O ID do asset.
     * @returns {Promise<string|null>} A URL do asset ou null.
     */
    async getAsset(assetId) {
        if (!assetId || !this.firestore) return null;

        const assetRef = doc(collection(this.firestore, 'assets'), assetId);
        
        try {
            const snapshot = await getDoc(assetRef);

            if (snapshot.exists()) {
                return snapshot.data().url;
            }

            const generatedUrl = this.generateAssetUrl(assetId);
            if (!generatedUrl) {
                return null;
            }

            await setDoc(assetRef, {
                id: assetId,
                url: generatedUrl,
                createdAt: new Date().toISOString(),
            });

            return generatedUrl;

        } catch (error) {
            console.error(`[AssetService] Erro ao buscar/salvar o asset '${assetId}':`, error);
            // Fallback para gerar a URL dinamicamente em caso de erro no Firestore
            return this.generateAssetUrl(assetId);
        }
    }
}
