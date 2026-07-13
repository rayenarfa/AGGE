import { z } from 'zod';

export const createContactMessageSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, { message: 'Name cannot be empty' })
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .trim(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .min(1, { message: 'Subject cannot be empty' })
    .trim(),
  message: z
    .string({ required_error: 'Message is required' })
    .min(1, { message: 'Message cannot be empty' })
    .trim(),
  type: z.enum(['GENERAL', 'MEDIA', 'SUPPORT']).default('GENERAL'),
});
