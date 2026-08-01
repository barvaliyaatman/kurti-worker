import { z } from 'zod';

export const startCuttingSchema = z.object({
  body: z.object({
    job_card_id: z.string({ required_error: 'Job Card ID is required' }),
  }),
});

export const updateComponentStatusSchema = z.object({
  body: z.object({
    job_card_id: z.string({ required_error: 'Job Card ID is required' }),
    component: z.string({ required_error: 'Component is required' }),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
      required_error: 'Status must be PENDING, IN_PROGRESS, or COMPLETED',
    }),
  }),
});

export const completeColorAndGenerateBundleSchema = z.object({
  body: z.object({
    job_card_id: z.string({ required_error: 'Job Card ID is required' }),
  }),
});
