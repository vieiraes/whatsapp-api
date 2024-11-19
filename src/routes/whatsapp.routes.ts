import { FastifyInstance } from 'fastify';
import { WhatsAppController } from '../controllers/whatsapp.controller';

export async function whatsappRoutes(app: FastifyInstance) {
    const controller = new WhatsAppController();

    app.post('/initialize', controller.initialize.bind(controller));
    app.post('/logout', controller.logout.bind(controller));
    app.get('/qr', controller.getQR.bind(controller));
    app.post('/send', controller.sendMessage.bind(controller));
    app.get('/status', controller.getStatus.bind(controller));
    app.post('/add-client', controller.addClient.bind(controller));
    app.post('/remove-client', controller.removeClient.bind(controller));
}