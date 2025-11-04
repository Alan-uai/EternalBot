// src/services/imageGenerationService.js
import { createCanvas, loadImage } from 'canvas';
import { createBirthdayCard } from '../utils/createBirthdayCard.js';
import { createProfileImage } from '../utils/createProfileImage.js';
import { createScheduleImage } from '../utils/createScheduleImage.js';
import { createTableImage } from '../utils/createTableImage.js';

export class ImageGenerationService {
    constructor(assetService, logger) {
        this.assetService = assetService;
        this.logger = logger;
    }

    async createBirthdayCard(userName, message) {
        return createBirthdayCard(userName, message, this.assetService);
    }

    async createProfileImage(userData, discordUser) {
        return createProfileImage(userData, discordUser, this.assetService);
    }

    async createScheduleImage(farms) {
        return createScheduleImage(farms, this.assetService);
    }
    
    async createTableImage(headers, rows) {
        return createTableImage(headers, rows);
    }
}
