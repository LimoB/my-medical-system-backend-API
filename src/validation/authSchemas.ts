// src/validation/authSchemas.ts

import { z } from 'zod'
import { roleEnum } from './zodSchemas' // reuse roleEnum

// ===== Register Schema =====
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().optional(),
  role: roleEnum.default('user'),
})

// ===== Login Schema =====
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

// ===== Email Verification Schema =====
export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, 'Code must be at least 4 characters'),
})

// ===== Forgot Password Schema =====
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

// ===== Reset Password Schema =====
export const resetPasswordSchema = z.object({
  code: z.string().min(4),
  newPassword: z.string().min(6),
});


// ===== Resend Code Schema =====
export const resendCodeSchema = z.object({
  email: z.string().email(),
})

// ===== Admin Create User Schema =====
export const adminCreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  role: roleEnum,
})
