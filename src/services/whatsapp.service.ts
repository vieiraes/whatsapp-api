import { Client, ClientOptions, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class WhatsAppService {
    private client: Client;
    private qrCode: string;

    constructor() {
        const options: ClientOptions = {
            puppeteer: { headless: true },
            authStrategy: new LocalAuth()
        };

        this.client = new Client(options);
        this.setupEvents();
    }

    private setupEvents() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client ready');
        });

        this.client.on('message', async (message) => {
            console.log(`Received message: ${message.body}`);
            // Aqui você pode processar a mensagem como desejar
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


}