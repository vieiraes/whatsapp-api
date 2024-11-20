import { FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from '../services/whatsapp.service';
import QRCode from 'qrcode';
import WhatsAppManager from '../services/whatsapp.manager'



interface Query {
    output?: string; // Define que 'output' é um parâmetro opcional
}
export class WhatsAppController {
    private whatsappService: WhatsAppService;
    private whatsappManager: WhatsAppManager;

    constructor() {
        this.whatsappService = new WhatsAppService();
        this.whatsappManager = new WhatsAppManager();
    }

    async initialize(req: FastifyRequest, reply: FastifyReply) {
        await this.whatsappService.initialize();
        return reply.send({ message: 'WhatsApp client initialized' });
    }

    async getQR(req: FastifyRequest<{ Querystring: Query }>, reply: FastifyReply) {
        const qrData = await this.whatsappService.getQR(); // Obtenha o QR code em formato de string

        // Obtém o parâmetro de consulta 'output'
        const outputFormat = req.query.output || 'json'; // Default para 'json' se não fornecido

        try {
            if (outputFormat === 'svg') {
                const qrImage = await QRCode.toString(qrData.qr, { type: 'svg' });
                reply.type('image/svg+xml').send(qrImage);
            } else if (outputFormat === 'png') {
                const qrImage = await QRCode.toDataURL(qrData.qr, { type: 'image/png' });
                reply.type('image/png').send(Buffer.from(qrImage.split(',')[1], 'base64'));
            } else {
                // Retorna o QR code como JSON
                reply.send({ qr: qrData.qr });
            }
        } catch (error) {
            reply.status(500).send({ error: 'Error generating QR code' });
        }
    }

    async sendMessage(req: FastifyRequest<{ Body: { to: string, message: string } }>, reply: FastifyReply) {
        const { to, message } = req.body;
        const result = await this.whatsappService.sendMessage(to, message);
        return reply.send(result);
    }

    async getStatus(req: FastifyRequest, reply: FastifyReply) {
        const status = await this.whatsappService.getStatus();
        return reply.send({ status });
    }

    async logout(req: FastifyRequest, reply: FastifyReply) {
        await this.whatsappService.logout();
        return reply.send({ message: 'WhatsApp client logged out' });
    }


    async addClient(req: FastifyRequest<{ Body: { phoneNumber: string } }>, reply: FastifyReply) {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return reply.status(400).send({ error: 'Phone number is required' });
        }

        this.whatsappManager.addClient(phoneNumber);
        return reply.send({ message: `Client for ${phoneNumber} added` });
    }


    async removeClient(req: FastifyRequest<{ Querystring: { phoneNumber: string } }>, reply: FastifyReply) {
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            return reply.status(400).send({ error: 'Phone number is required' });
        }

        this.whatsappManager.removeClient(phoneNumber);
        return reply.send({ message: `Client for ${phoneNumber} removed` });
    }


    async setWebhook(req: FastifyRequest<{ Body: { url: string } }>, reply: FastifyReply) {
        const { url } = req.body;
        if (!url) {
            return reply.status(400).send({ error: 'Webhook URL is required' });
        }

        try {
            this.whatsappService.setWebhook(url);
            return reply.send({ success: true, message: 'Webhook configured successfully' });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to set webhook'
            });
        }
    }
}