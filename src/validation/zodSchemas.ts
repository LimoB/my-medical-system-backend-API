// src/validation/zodSchemas.ts
import { z } from 'zod'

// ===== Enums =====
const roleEnum = z.enum(['user', 'admin', 'doctor'])
const appointmentStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled'])
const complaintStatusEnum = z.enum(['Open', 'In Progress', 'Resolved', 'Closed'])
const paymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed'])

// ===== User Schemas =====
export const newUserSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  role: roleEnum.optional(),
  image_url: z.string().url().optional(),
  is_verified: z.boolean().optional(),
  verification_token: z.string().nullable().optional(),
  token_expiry: z.coerce.date().nullable().optional(),
  last_login: z.coerce.date().nullable().optional(),
})

// ===== Doctor Schema =====
export const newDoctorSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  specialization: z.string().min(1),
  contact_phone: z.string().optional(),
  available_days: z.string().optional(), // Could be JSON stringified weekdays
  image_url: z.string().url().optional(),
})

// ===== Appointment Schema =====
export const newAppointmentSchema = z.object({
  user_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.coerce.date(),
  time_slot: z.string(), // format HH:MM
  total_amount: z.coerce.number().optional(),
  appointment_status: appointmentStatusEnum.optional(),
})

// ===== Prescription Schema =====
export const newPrescriptionSchema = z.object({
  appointment_id: z.number(),
  doctor_id: z.number(),
  patient_id: z.number(),
  notes: z.string().optional(),
  image_url: z.string().url().optional(),
})

// ===== Payment Schema =====
export const newPaymentSchema = z.object({
  appointment_id: z.number(),
  amount: z.coerce.number().positive(),
  payment_status: paymentStatusEnum.optional(),
  transaction_id: z.string().uuid().optional(),
  payment_date: z.coerce.date().optional(),
})

// ===== Complaint Schema =====
export const newComplaintSchema = z.object({
  user_id: z.number(),
  related_appointment_id: z.number().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  status: complaintStatusEnum.optional(),
})
