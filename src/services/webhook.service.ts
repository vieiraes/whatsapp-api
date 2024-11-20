import axios from 'axios';

export class WebhookService {
    private webhookUrls: Map<string, string> = new Map();

    setWebhook(clientId: string, url: string) {
        this.webhookUrls.set(clientId, url);
    }

    getWebhook(clientId: string): string | undefined {
        return this.webhookUrls.get(clientId);
    }

    removeWebhook(clientId: string) {
        this.webhookUrls.delete(clientId);
    }

    async sendWebhook(clientId: string, event: string, data: any) {
        const url = this.webhookUrls.get(clientId);
        if (!url) return;

        try {
            await axios.post(url, {
                event,
                clientId,
                timestamp: new Date().toISOString(),
                data
            });
        } catch (error) {
            console.error(`Failed to send webhook for client ${clientId}:`, error);
        }
    }
}