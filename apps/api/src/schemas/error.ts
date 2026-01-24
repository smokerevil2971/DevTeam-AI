import { z } from 'zod';

// Standard error response schema
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Validation error schema (for Zod validation failures)
export const ValidationErrorSchema = ErrorResponseSchema.extend({
  issues: z.array(z.object({
    path: z.array(z.string().or(z.number())),
    message: z.string(),
  })).optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;
