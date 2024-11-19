import { FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from '../services/whatsapp.service';

export class WhatsAppController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = new WhatsAppService();
    }

    async initialize(req: FastifyRequest, reply: FastifyReply) {
        await this.whatsappService.initialize();
        return reply.send({ message: 'WhatsApp client initialized' });
    }

    async getQR(req: FastifyRequest, reply: FastifyReply) {
        const qr = await this.whatsappService.getQR();
        return reply.send({ qr });
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