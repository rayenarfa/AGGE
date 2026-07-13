import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, { message: 'First name is required' })
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, { message: 'Last name is required' })
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});
