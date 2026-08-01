import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    bundle_id: z.string({ required_error: 'Bundle ID is required' }),
    employee_id: z.string({ required_error: 'Employee ID is required' }),
    assigned_sets: z
      .number({ required_error: 'Assigned sets quantity is required' })
      .int('Assigned sets must be an integer')
      .positive('Assigned sets must be greater than zero'),
    remarks: z.string().optional().nullable(),
  }),
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    assigned_sets: z
      .number({ required_error: 'Assigned sets quantity is required' })
      .int('Assigned sets must be an integer')
      .positive('Assigned sets must be greater than zero'),
    remarks: z.string().optional().nullable(),
  }),
});

export const updateAssignmentProgressSchema = z.object({
  body: z.object({
    completed_sets: z
      .number({ required_error: 'Completed sets quantity is required' })
      .int('Completed sets must be an integer')
      .min(0, 'Completed sets cannot be negative'),
    notes: z.string().optional().nullable(),
  }),
});
