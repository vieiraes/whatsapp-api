import { Client, LocalAuth } from 'whatsapp-web.js';
import { WebhookService } from './webhook.service';

class WhatsAppClient {
    client: Client;
    qrCode: string | null = null;
    status: 'initializing' | 'ready' | 'disconnected' = 'initializing';
    createdAt: Date;
    deletedAt: Date | null = null;
    private webhookService: WebhookService;

    constructor(phoneNumber: string) {
        this.createdAt = new Date();
        this.webhookService = new WebhookService();
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: phoneNumber
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox']
            }
        });
        this.setupEvents(phoneNumber);
    }

    private setupEvents(phoneNumber: string) {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            if (this.webhookService.hasWebhook(phoneNumber)) {
                this.webhookService.sendWebhook(phoneNumber, 'qr', { qr });
            }
        });

        this.client.on('ready', () => {
            this.status = 'ready';
            if (this.webhookService.hasWebhook(phoneNumber)) {
                this.webhookService.sendWebhook(phoneNumber, 'ready', { status: 'ready' });
            }
        });

        this.client.on('disconnected', () => {
            this.status = 'disconnected';
            if (this.webhookService.hasWebhook(phoneNumber)) {
                this.webhookService.sendWebhook(phoneNumber, 'disconnected', { status: 'disconnected' });
            }
        });

        this.client.on('message_create', async (message) => {
            if (this.webhookService.hasWebhook(phoneNumber)) {
                this.webhookService.sendWebhook(phoneNumber, 'message', {
                    from: message.from,
                    body: message.body,
                    timestamp: message.timestamp,
                    type: message.type
                });
            }
        });
    }

    setWebhook(url: string) {
        this.webhookService.setWebhook(this.client.info?.wid?.user || 'unknown', url);
    }

    async sendMessage(to: string, message: string) {
        return this.client.sendMessage(to, message);
    }
}

class WhatsAppManager {
    private clients: Map<string, WhatsAppClient>;

    constructor() {
        this.clients = new Map();
    }

    async addClient(phoneNumber: string) {
        if (this.clients.has(phoneNumber)) {
            throw new Error('Client already exists');
        }

        const whatsappClient = new WhatsAppClient(phoneNumber);
        this.clients.set(phoneNumber, whatsappClient);
        await whatsappClient.client.initialize();
        return whatsappClient;
    }

    getClient(phoneNumber: string) {
        const client = this.clients.get(phoneNumber);
        if (!client) {
            throw new Error('Client not found');
        }
        return client;
    }

    async removeClient(phoneNumber: string) {
        const client = this.clients.get(phoneNumber);
        if (client) {
            client.deletedAt = new Date();
            await client.client.destroy();
            this.clients.delete(phoneNumber);
        }
    }

    getClientStatus(phoneNumber: string) {
        return this.getClient(phoneNumber).status;
    }

    getClientQR(phoneNumber: string) {
        return this.getClient(phoneNumber).qrCode;
    }

    getAllClients() {
        const clientsArray = Array.from(this.clients.entries()).map(([phoneNumber, client]) => ({
            phoneNumber,
            createdAt: client.createdAt,
            deletedAt: client.deletedAt,
            status: client.status
        }));

        return clientsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async sendMessage(phoneNumber: string, to: string, message: string) {
        const client = this.getClient(phoneNumber);
        return client.sendMessage(to, message);
    }

    setWebhook(phoneNumber: string, url: string) {
        const client = this.getClient(phoneNumber);
        client.setWebhook(url);
    }
}

export default WhatsAppManager;