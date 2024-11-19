import { FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from '../services/whatsapp.service';
import QRCode from 'qrcode';




interface Query {
    output?: string; // Define que 'output' é um parâmetro opcional
}
export class WhatsAppController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = new WhatsAppService();
    }

    async initialize(req: FastifyRequest, reply: FastifyReply) {
        await this.whatsappService.initialize();
        return reply.send({ message: 'WhatsApp client initialized' });
    }

    async getQR(req: FastifyRequest<{ Querystring: Query }>, reply: FastifyReply) {
        const qrData = await this.whatsappService.getQR(); // Obtenha o QR code em formato de string

        // Obtém o parâmetro de consulta 'output'
        const outputFormat = req.query.output || 'png'; // Default para 'png' se não fornecido

        try {
            let qrImage;

            // Gera a imagem em formato especificado
            if (outputFormat === 'svg') {
                qrImage = await QRCode.toString(qrData.qr, { type: 'svg' });
                reply.type('image/svg+xml').send(qrImage);
            } else {
                qrImage = await QRCode.toDataURL(qrData.qr, { type: 'image/png' });
                reply.type('image/png').send(Buffer.from(qrImage.split(',')[1], 'base64'));
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
}