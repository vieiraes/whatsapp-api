import fastify from 'fastify';
import { whatsappRoutes } from './routes/whatsapp.routes';

const app = fastify();

app.register(whatsappRoutes);


const start = async () => {
    try {
        await app.listen({
            host: "0.0.0.0",
            port: process.env.PORT ? Number(process.env.PORT) : 3344
        });
        console.log(`Server is running on port ${process.env.PORT ? Number(process.env.PORT) : 3344}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();