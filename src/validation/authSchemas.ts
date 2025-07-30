
// src/validation/authSchemas.ts
import { z } from 'zod';
import { roleEnum } from './zodSchemas';

export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().optional(),
  role: roleEnum.default('user'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, 'Code must be at least 4 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  code: z.string().min(4),
  newPassword: z.string().min(6),
});

export const resendCodeSchema = z.object({
  email: z.string().email(),
});

export const adminCreateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum,
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});
