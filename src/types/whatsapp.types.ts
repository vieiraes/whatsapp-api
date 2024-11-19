export interface SendMessageRequest {
    to: string;
    message: string;
}

export interface QRResponse {
    qr: string;
    status: 'pending' | 'ready';
}

export interface StatusResponse {
    status: 'disconnected' | 'connecting' | 'ready';
    lastConnection?: Date;
}