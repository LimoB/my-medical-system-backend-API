import { z } from 'zod'

// ===== Enums =====
export const roleEnum = z.enum(['user', 'admin', 'doctor'])
export const appointmentStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled'])
export const complaintStatusEnum = z.enum(['Open', 'In Progress', 'Resolved', 'Closed'])
export const paymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed'])

// ===== User Schema =====
export const newUserSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  role: roleEnum.default('user').optional(),
  image_url: z.string().url().optional(),
  is_verified: z.boolean().optional(),
  verification_token: z.string().nullable().optional(),
  token_expiry: z.coerce.date().nullable().optional(),
  last_login: z.coerce.date().nullable().optional(),
})

// ===== Doctor Schema =====
export const newDoctorSchema = z.object({
  user_id: z.number(),
  specialization: z.string(),
  available_days: z.string().optional(),
  available_hours: z.array(z.string()).optional(), // Add this validation rule for available_hours
  payment_per_hour: z.number().optional(), // Add this validation rule for payment_per_hour
});

// ===== Appointment Schema =====
export const newAppointmentSchema = z.object({
  user_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.coerce.date(),
  time_slot: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
  total_amount: z.coerce.number().positive().optional(),
  appointment_status: appointmentStatusEnum.default('Pending').optional(),
})

// ===== Appointment Status Update Schema =====
export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusEnum,
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
  amount: z.coerce.number().positive(),
  patientId: z.string().min(1),
  method: z.string().min(1),
  status: paymentStatusEnum.optional(),
})

// ===== Checkout Schema =====
export const checkoutSchema = z.object({
  appointmentId: z.number().int().positive(),
})

// ===== Complaint Schema =====
export const newComplaintSchema = z.object({
  user_id: z.number(),
  related_appointment_id: z.number().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  status: complaintStatusEnum.default('Open').optional(),
})
