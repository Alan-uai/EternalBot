// src/services/imageGenerationService.js
import { createCanvas, loadImage } from 'canvas';
import { createBirthdayCard } from '../utils/createBirthdayCard.js';
import { createScheduleImage } from '../utils/createScheduleImage.js';
import { createTableImage } from '../utils/createTableImage.js';
import { createProfileImage, createAnimatedProfileImage } from '../utils/createProfileImage.js';
import axios from 'axios';

export class ImageGenerationService {
    constructor(assetService, logger) {
        this.assetService = assetService;
        this.logger = logger;
    }

    async createBirthdayCard(userName, message) {
        return createBirthdayCard(userName, message, this.assetService);
    }

    async createScheduleImage(farms) {
        return createScheduleImage(farms, this.assetService);
    }
    
    async createTableImage(headers, rows) {
        return createTableImage(headers, rows);
    }

    async createProfileImage(user, userData) {
        const bgAssetUrl = await this.assetService.getAsset('ProfileBackground');
        
        if (bgAssetUrl && bgAssetUrl.endsWith('.gif')) {
            try {
                // Se for um GIF, usa a nova função para perfil animado
                const response = await axios.get(bgAssetUrl, { responseType: 'arraybuffer' });
                const gifBuffer = Buffer.from(response.data, 'binary');
                return await createAnimatedProfileImage(user, userData, this.assetService, gifBuffer);
            } catch (error) {
                this.logger.error('Falha ao criar perfil animado, recorrendo ao estático:', error);
                // Fallback para imagem estática se a animada falhar
                return await createProfileImage(user, userData, this.assetService);
            }
        } else {
            // Se for PNG/JPG ou não existir, usa a função original para perfil estático
            return await createProfileImage(user, userData, this.assetService);
        }
    }
}
