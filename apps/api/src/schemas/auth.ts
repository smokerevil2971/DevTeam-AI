import { z } from 'zod';

// Password reset request
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// Password reset confirmation
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// Email verification
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

// Resend verification email
export const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
