import axios from 'axios';

export class WebhookService {
    private webhookUrls: Map<string, string> = new Map();

    setWebhook(clientId: string, url: string) {
        console.log(`Setting webhook for client ${clientId}: ${url}`);
        this.webhookUrls.set(clientId, url);
    }

    hasWebhook(clientId: string): boolean {
        return this.webhookUrls.has(clientId);
    }

    async sendWebhook(clientId: string, event: string, data: any) {
        const url = this.webhookUrls.get(clientId);
        
        // Se não há URL configurada, não tenta enviar
        if (!this.hasWebhook(clientId)) {
            console.log('No webhook URL configured for client', clientId);
            return;
        }

        try {
            console.log('Sending webhook data:', { event, clientId, data });
            await axios.post(url!, {
                event,
                clientId,
                timestamp: new Date().toISOString(),
                data
            }, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Webhook sent successfully');
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
                console.error('Webhook timeout - continuing execution');
                return;
            }
            console.error(`Failed to send webhook for client ${clientId}:`, error);
        }
    }
}