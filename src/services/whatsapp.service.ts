import { Client, ClientOptions, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { WebhookService } from './webhook.service';

export class WhatsAppService {
    private client: Client;
    private qrCode: string;
    private webhookService: WebhookService;
    private clientId: string;

    constructor(clientId: string = 'default') {
        this.clientId = clientId;
        this.webhookService = new WebhookService();
        
        const options: ClientOptions = {
            puppeteer: { headless: true },
            authStrategy: new LocalAuth({
                clientId: this.clientId
            })
        };
        
        this.client = new Client(options);
        this.setupEvents();
    }

    private setupEvents() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            qrcode.generate(qr, { small: true });
            this.webhookService.sendWebhook(this.clientId, 'qr', { qr });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client ready');
            this.webhookService.sendWebhook(this.clientId, 'ready', { status: 'ready' });
        });

        this.client.on('message_create', async (message: Message) => {
            console.log(`Received message: ${message.body}`);
            
            const messageData = {
                from: message.from,
                body: message.body,
                timestamp: message.timestamp,
                type: message.type
            };
            
            this.webhookService.sendWebhook(this.clientId, 'message', messageData);
        });
    }

    async initialize() {
        await this.client.initialize();
    }

    async getQR() {
        return { qr: this.qrCode };
    }

    async sendMessage(to: string, message: string) {
        return this.client.sendMessage(to, message);
    }

    async getStatus() {
        return this.client.info ? "connected" : "disconnected";
    }

    async logout() {
        await this.client.logout();
    }

    setWebhook(url: string) {
        this.webhookService.setWebhook(this.clientId, url);
    }

    getWebhook(): string | undefined {
        return this.webhookService.getWebhook(this.clientId);
    }
}