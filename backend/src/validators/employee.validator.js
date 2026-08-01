import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    employee_code: z
      .string({ required_error: 'Employee Code is required' })
      .trim()
      .min(3, 'Employee Code must be at least 3 characters'),
    employee_name: z
      .string({ required_error: 'Employee Name is required' })
      .trim()
      .min(2, 'Employee Name must be at least 2 characters'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(10, 'Phone number must be at least 10 digits'),
    joining_date: z.string().or(z.date()),
    notes: z.string().optional().nullable(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    employee_name: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(10).optional(),
    joining_date: z.string().or(z.date()).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateEmployeeStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE'], {
      required_error: 'Status must be either ACTIVE or INACTIVE',
    }),
  }),
});
