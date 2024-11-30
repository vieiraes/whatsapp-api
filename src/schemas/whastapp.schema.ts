import { z } from 'zod';

export const sendMessageSchema = z.object({
    to: z.string().min(1),
    message: z.string().min(1)
});

export const clientSchema = z.object({
    phoneNumber: z.string().min(1)
});

export const listClientsQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1))
        .pipe(z.number().positive().int()),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
        .pipe(z.number().min(1).max(100).int())
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ListClientsQueryInput = z.infer<typeof listClientsQuerySchema>;