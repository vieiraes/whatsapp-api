import { Client, LocalAuth } from 'whatsapp-web.js';

class WhatsAppClient {
    client: Client;
    qrCode: string | null = null;
    status: 'initializing' | 'ready' | 'disconnected' = 'initializing';

    constructor(phoneNumber: string) {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: phoneNumber
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox']
            }
        });
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

        whatsappClient.client.on('qr', (qr) => {
            whatsappClient.qrCode = qr;
        });

        whatsappClient.client.on('ready', () => {
            whatsappClient.status = 'ready';
        });

        whatsappClient.client.on('disconnected', () => {
            whatsappClient.status = 'disconnected';
        });

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
        return Array.from(this.clients.keys());
    }
}

export default WhatsAppManager;