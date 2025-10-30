// src/utils/webhookManager.js
import { ChannelType, Collection } from 'discord.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

class WebhookManager {
    constructor(container) {
        this.client = container.client;
        this.config = container.config;
        this.logger = container.logger;
        this.firestore = container.services.firebase.firestore;
        this.webhooks = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        this.logger.info('Inicializando o Gerenciador de Webhooks...');
        const webhookConfigs = [
            { name: 'raidAnnouncer', channelId: this.config.RAID_CHANNEL_ID, webhookName: 'Anunciador de Raids' },
            { name: 'raidPanel', channelId: this.config.RAID_CHANNEL_ID, webhookName: 'Painel de Status das Raids do Lobby' }
        ];

        for (const config of webhookConfigs) {
            await this._createOrUpdateWebhook(config);
        }
        this.isInitialized = true;
        this.logger.info('Gerenciador de Webhooks inicializado com sucesso.');
    }

    async _createOrUpdateWebhook({ name, channelId, webhookName }) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || channel.type !== ChannelType.GuildText) {
                this.logger.error(`[WebhookManager] Canal com ID ${channelId} para '${name}' não é um canal de texto válido.`);
                return;
            }

            const docRef = doc(this.firestore, 'bot_config/webhooks');
            const docSnap = await getDoc(docRef);
            const allWebhooksData = docSnap.exists() ? docSnap.data() : {};
            const webhookData = allWebhooksData[name];

            const discordWebhooks = await channel.fetchWebhooks().catch(() => new Collection());
            let foundWebhook = webhookData ? discordWebhooks.get(webhookData.id) : discordWebhooks.find(wh => wh.name === webhookName);
            
            if (!foundWebhook) {
                 this.logger.warn(`[WebhookManager] Webhook '${webhookName}' não encontrado no Discord. Criando um novo...`);
                 foundWebhook = await channel.createWebhook({
                    name: webhookName,
                    avatar: this.client.user.displayAvatarURL(),
                    reason: `Webhook para o sistema ${name}`,
                 });
                 this.logger.info(`[WebhookManager] Webhook '${webhookName}' criado com sucesso.`);
            }

            const newWebhookData = { id: foundWebhook.id, token: foundWebhook.token, url: foundWebhook.url };
            this.webhooks.set(name, { ...newWebhookData, name: webhookName });
            
            // Salva no Firestore
            await setDoc(docRef, { [name]: newWebhookData }, { merge: true });

        } catch (error) {
            this.logger.error(`[WebhookManager] Falha ao inicializar webhook para '${name}':`, error);
        }
    }

    getWebhook(name) {
        if (!this.isInitialized) {
            this.logger.warn(`[WebhookManager] Tentativa de obter webhook '${name}' antes da inicialização.`);
            return null;
        }
        return this.webhooks.get(name) || null;
    }
}

export async function initializeWebhooks(container) {
    if (!container.services.webhookManager) {
        const manager = new WebhookManager(container);
        await manager.initialize();
        container.services.webhookManager = manager;
    }
}
