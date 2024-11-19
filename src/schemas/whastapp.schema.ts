import { z } from 'zod';

export const sendMessageSchema = z.object({
    to: z.string().min(1),
    message: z.string().min(1)
});

export const clientSchema = z.object({
    phoneNumber: z.string().min(1)
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ClientInput = z.infer<typeof clientSchema>;