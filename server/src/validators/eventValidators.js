import { z } from 'zod';

const eventBaseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title is required' })
    .trim(),
  slug: z
    .string({ required_error: 'Slug is required' })
    .min(1, { message: 'Slug is required' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be url-friendly (lowercase letters, numbers, and hyphens)' })
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, { message: 'Description is required' }),
  eventType: z.enum(['CONFERENCE', 'WORKSHOP', 'WEBINAR'], {
    errorMap: () => ({ message: 'Event type must be CONFERENCE, WORKSHOP, or WEBINAR' }),
  }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  endDate: z
    .string({ required_error: 'End date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  location: z.string().trim().nullable().optional(),
  online: z.boolean().default(false),
  registrationDeadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid registration deadline format' })
    .nullable()
    .optional(),
  earlyBirdDeadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid early bird deadline format' })
    .nullable()
    .optional(),
  abstractDeadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid abstract deadline format' })
    .nullable()
    .optional(),
  priceMember: z
    .number()
    .nonnegative({ message: 'Price must be 0 or a positive number' })
    .default(0.00),
  priceNonMember: z
    .number()
    .nonnegative({ message: 'Price must be 0 or a positive number' })
    .default(0.00),
  organizer: z.string().trim().nullable().optional(),
  imageUrl: z.string().url({ message: 'Image must be a valid URL' }).or(z.literal('')).nullable().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const createEventSchema = eventBaseSchema.refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const updateEventSchema = eventBaseSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});
