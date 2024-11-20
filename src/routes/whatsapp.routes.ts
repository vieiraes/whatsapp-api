import { FastifyInstance } from 'fastify';
import { WhatsAppController } from '../controllers/whatsapp.controller';

export async function whatsappRoutes(app: FastifyInstance) {
    const controller = new WhatsAppController();

    // Gerenciamento de clientes
    app.post('/clients', controller.addClient.bind(controller));
    app.get('/clients', controller.listClients.bind(controller));
    app.delete('/clients', controller.removeClient.bind(controller));

    // Operações específicas de cliente
    app.get('/clients/qr', controller.getQR.bind(controller));
    app.get('/clients/status', controller.getStatus.bind(controller));
    
    // Webhook
    app.post('/webhook', controller.setWebhook.bind(controller));
    
    // Mensagens
    app.post('/messages', controller.sendMessage.bind(controller));
}