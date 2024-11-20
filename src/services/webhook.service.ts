import axios from 'axios';

export class WebhookService {
    private webhookUrls: Map<string, string> = new Map();

    setWebhook(clientId: string, url: string) {
        console.log(`Setting webhook for client ${clientId}: ${url}`);
        this.webhookUrls.set(clientId, url);
    }

    async sendWebhook(clientId: string, event: string, data: any) {
        const url = this.webhookUrls.get(clientId);
        if (!url) {
            console.log('No webhook URL configured for client', clientId);
            return;
        }

        try {
            console.log('Sending webhook data:', { event, clientId, data });
            await axios.post(url, {
                event,
                clientId,
                timestamp: new Date().toISOString(),
                data
            }, {
                timeout: 5000, // 5 segundos de timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Webhook sent successfully');
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
                console.error('Webhook timeout - continuing execution');
                return; // Não deixa o erro interromper o fluxo
            }
            console.error(`Failed to send webhook for client ${clientId}:`, error);
        }
    }
}