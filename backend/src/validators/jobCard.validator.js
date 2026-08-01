import { z } from 'zod';

const jobCardItemSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  size: z.string().min(1, 'Garment size is required'),
  quantity: z
    .number({ required_error: 'Item quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than zero'),
});

export const createJobCardSchema = z.object({
  body: z.object({
    job_card_number: z
      .string({ required_error: 'Job Card Number is required' })
      .trim()
      .min(1, 'Job Card Number is required'),
    design_code: z
      .string({ required_error: 'Design Code is required' })
      .trim()
      .min(1, 'Design Code is required'),
    components: z
      .array(z.string())
      .or(z.string())
      .optional(),
    stitching_rate: z
      .number()
      .positive('Stitching rate must be greater than zero')
      .optional(),
    priority: z.enum(['NORMAL', 'HIGH', 'URGENT']).optional(),
    due_date: z.string().or(z.date()).optional(),
    remarks: z.string().optional().nullable(),
    items: z
      .array(jobCardItemSchema)
      .min(1, 'At least one color-size item breakdown is required'),
  }),
});

export const updateJobCardSchema = z.object({
  body: z.object({
    design_code: z.string().trim().min(1).optional(),
    components: z.array(z.string()).or(z.string()).optional(),
    stitching_rate: z.number().positive().optional(),
    priority: z.enum(['NORMAL', 'HIGH', 'URGENT']).optional(),
    due_date: z.string().or(z.date()).optional(),
    remarks: z.string().optional().nullable(),
    items: z.array(jobCardItemSchema).min(1).optional(),
  }),
});
