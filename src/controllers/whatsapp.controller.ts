import { FastifyRequest, FastifyReply } from 'fastify';
import WhatsAppManager from '../services/whatsapp.manager';
import QRCode from 'qrcode';
import { z } from 'zod';
import { listClientsQuerySchema } from '../schemas/whastapp.schema';
// Schemas de validação
const phoneNumberSchema = z.object({
    phoneNumber: z.string().min(1)
});

const sendMessageSchema = z.object({
    phoneNumber: z.string().min(1),
    to: z.string().min(1),
    message: z.string().min(1)
});

const webhookSchema = z.object({
    phoneNumber: z.string().min(1),
    url: z.string().url()
});

export class WhatsAppController {
    private whatsappManager: WhatsAppManager;

    constructor() {
        this.whatsappManager = new WhatsAppManager();
    }

    async addClient(req: FastifyRequest<{ Body: z.infer<typeof phoneNumberSchema> }>, reply: FastifyReply) {
        try {
            const { phoneNumber } = phoneNumberSchema.parse(req.body);
            const client = await this.whatsappManager.addClient(phoneNumber);
            return reply.send({
                success: true,
                data: {
                    phoneNumber,
                    createdAt: client.createdAt,
                    status: client.status
                },
                message: `Client for ${phoneNumber} added`
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add client'
            });
        }
    }

    async getQR(req: FastifyRequest<{
        Querystring: { phoneNumber: string, output?: string }
    }>, reply: FastifyReply) {
        try {
            const { phoneNumber, output = 'json' } = req.query;
            const qrCode = this.whatsappManager.getClientQR(phoneNumber);

            if (!qrCode) {
                return reply.status(404).send({ error: 'QR Code not available' });
            }

            if (output === 'svg') {
                const qrImage = await QRCode.toString(qrCode, { type: 'svg' });
                return reply.type('image/svg+xml').send(qrImage);
            } else if (output === 'png') {
                const qrImage = await QRCode.toDataURL(qrCode);
                return reply.type('image/png').send(Buffer.from(qrImage.split(',')[1], 'base64'));
            }

            return reply.send({ qr: qrCode });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get QR code'
            });
        }
    }

    async sendMessage(req: FastifyRequest<{ Body: z.infer<typeof sendMessageSchema> }>, reply: FastifyReply) {
        try {
            const { phoneNumber, to, message } = sendMessageSchema.parse(req.body);
            await this.whatsappManager.sendMessage(phoneNumber, to, message);
            return reply.send({
                success: true,
                message: 'Message sent successfully'
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send message'
            });
        }
    }

    async getStatus(req: FastifyRequest<{ Querystring: { phoneNumber: string } }>, reply: FastifyReply) {
        try {
            const { phoneNumber } = req.query;
            const status = this.whatsappManager.getClientStatus(phoneNumber);
            return reply.send({ status });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get status'
            });
        }
    }

    async setWebhook(req: FastifyRequest<{ Body: z.infer<typeof webhookSchema> }>, reply: FastifyReply) {
        try {
            const { phoneNumber, url } = webhookSchema.parse(req.body);
            this.whatsappManager.setWebhook(phoneNumber, url);
            return reply.send({
                success: true,
                message: 'Webhook configured successfully'
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to set webhook'
            });
        }
    }

    async removeClient(req: FastifyRequest<{ Querystring: { phoneNumber: string } }>, reply: FastifyReply) {
        try {
            const { phoneNumber } = req.query;
            await this.whatsappManager.removeClient(phoneNumber);
            return reply.send({
                success: true,
                message: `Client ${phoneNumber} removed successfully`
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove client'
            });
        }
    }

    async listClients(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { page, limit, status } = listClientsQuerySchema.parse(req.query);

            let allClients = this.whatsappManager.getAllClients();

            // Filtra por status se fornecido
            if (status) {
                allClients = allClients.filter(client => client.status === status);
            }

            const totalClients = allClients.length;
            const totalPages = Math.ceil(totalClients / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedClients = allClients.slice(startIndex, endIndex);

            return reply.send({
                success: true,
                data: {
                    clients: paginatedClients,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalClients,
                        limit,
                        hasNext: page < totalPages,
                        hasPrevious: page > 1
                    }
                }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    success: false,
                    error: 'Parâmetros de consulta inválidos',
                    details: error.errors
                });
            }
            throw error;
        }
    }
}