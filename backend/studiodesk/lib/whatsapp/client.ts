import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'

export interface WhatsAppMessagePayload {
    to: string;
    type: 'text' | 'template';
    text?: string;
    templateName?: string;
    templateComponents?: any[];
}

export class WhatsAppClient {
    private get baseUrl() {
        return env.WHATSAPP_API_BASE_URL?.replace(/\/+$/, '');
    }

    private get headers() {
        if (!env.WHATSAPP_API_KEY) throw Errors.external('WhatsApp API Key is missing')

        // Auto-detect provider based on URL or use a standard token bearer if it's Meta Graph API
        const isMeta = this.baseUrl?.includes('graph.facebook.com');

        return {
            'Content-Type': 'application/json',
            ...(isMeta
                ? { 'Authorization': `Bearer ${env.WHATSAPP_API_KEY}` }
                : { 'x-api-key': env.WHATSAPP_API_KEY }) // Fallback for Interakt or similar
        };
    }

    async send(payload: WhatsAppMessagePayload) {
        const isMeta = this.baseUrl?.includes('graph.facebook.com');
        let requestBody: any;
        let endpoint = `${this.baseUrl}/messages`;

        if (isMeta) {
            requestBody = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: payload.to.replace('+', ''),
                type: payload.type,
                ...(payload.type === 'text' && { text: { body: payload.text } }),
                ...(payload.type === 'template' && {
                    template: {
                        name: payload.templateName,
                        language: { code: 'en' },
                        components: payload.templateComponents
                    }
                })
            }
        } else {
            // Generic fallback used previously across generic vendors
            requestBody = {
                to: payload.to,
                type: payload.type,
                message: payload.text || payload.templateName,
                components: payload.templateComponents
            }
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(requestBody),
            })

            const body = await res.json().catch(() => ({}))

            if (!res.ok) {
                console.error('[WhatsAppClient] Error sending message:', JSON.stringify(body));
                throw Errors.external('WhatsApp delivery failed');
            }

            return { messageId: String(body.messages?.[0]?.id ?? body.messageId ?? body.id ?? '') }
        } catch (e) {
            console.error('[WhatsAppClient] Core fetch exception:', e)
            throw Errors.external('WhatsApp API unreachable');
        }
    }

    async sendTextMessage(to: string, text: string) {
        return this.send({ to, type: 'text', text });
    }

    async sendTemplateMessage(to: string, templateName: string, components: any[]) {
        return this.send({ to, type: 'template', templateName, templateComponents: components });
    }
}

export const whatsappClient = new WhatsAppClient();
