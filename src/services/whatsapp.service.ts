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
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            authStrategy: new LocalAuth({
                clientId: this.clientId
            })
        };

        this.client = new Client(options);
        this.setupEvents();
    }

    private setupEvents() {
        this.client.on('qr', (qr) => {
            console.log('Novo QR Code recebido');
            this.qrCode = qr;
            qrcode.generate(qr, { small: true });
            this.webhookService.sendWebhook(this.clientId, 'qr', { qr });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client ready');
            this.webhookService.sendWebhook(this.clientId, 'ready', { status: 'ready' });
        });

        this.client.on('auth_failure', (msg) => {
            console.error('Falha na autenticação:', msg);
            this.webhookService.sendWebhook(this.clientId, 'auth_failure', { error: msg });
        });

        this.client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            this.webhookService.sendWebhook(this.clientId, 'disconnected', { reason });
        });

        this.client.on('message_create', async (message) => {
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
        try {
            console.log('Iniciando cliente WhatsApp...');
            await this.client.initialize();
            console.log('Cliente inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar cliente:', error);
            throw error;
        }
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
}