import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name cannot be empty' })
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, { message: 'Last name cannot be empty' })
    .trim()
    .optional(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .trim()
    .optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, { message: 'Current password is required' }),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, { message: 'New password must be at least 6 characters long' }),
});
