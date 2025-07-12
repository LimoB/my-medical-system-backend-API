import { z } from 'zod';

// ────────────────────────────────
// ENUMS
// ────────────────────────────────
export const roleEnum = z.enum(['user', 'admin', 'doctor']);
export const appointmentStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled']);
export const complaintStatusEnum = z.enum(['Open', 'In Progress', 'Resolved', 'Closed']);
export const paymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed']);

// ────────────────────────────────
// USER SCHEMAS
// ────────────────────────────────

// For new user registration
export const newUserSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  role: roleEnum.optional().default('user'),
  image_url: z.string().url().optional(),
  is_verified: z.boolean().optional(),
  verification_token: z.string().nullable().optional(),
  token_expiry: z.coerce.date().nullable().optional(),
  last_login: z.coerce.date().nullable().optional(),
});

// For full user updates (by admin or self, excluding password)
export const updateUserSchema = z
  .object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    image_url: z.string().url().optional(),
    role: roleEnum.optional(),
    is_verified: z.boolean().optional(),
  })
  .strict();

// ✅ For role-only updates
export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

// ────────────────────────────────
// DOCTOR SCHEMAS
// ────────────────────────────────
export const newDoctorSchema = z.object({
  user_id: z.number().int(),
  specialization: z.string().min(1),
  available_days: z.string().optional(),
  available_hours: z.array(z.string()).optional(),
  payment_per_hour: z.number().positive(),
  description: z.string().optional(),
});

// ────────────────────────────────
// APPOINTMENT SCHEMAS
// ────────────────────────────────
export const newAppointmentSchema = z.object({
  user_id: z.number().int(),
  doctor_id: z.number().int(),
  appointment_date: z.coerce.date(),
  time_slot: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Time must be in HH:MM format',
    }),
  total_amount: z.coerce.number().positive().optional(),
  appointment_status: appointmentStatusEnum.optional().default('Pending'),
});

// For updating only the appointment status
export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusEnum,
});

// ────────────────────────────────
// PRESCRIPTION SCHEMAS
// ────────────────────────────────
export const newPrescriptionSchema = z.object({
  appointment_id: z.number().int(),
  doctor_id: z.number().int(),
  patient_id: z.number().int(),
  notes: z.string().optional(),
  image_url: z.string().url().optional(),
});

// ────────────────────────────────
// PAYMENT SCHEMAS
// ────────────────────────────────
export const newPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  patientId: z.string().min(1),
  method: z.string().min(1),
  status: paymentStatusEnum.optional(),
});

// ────────────────────────────────
// CHECKOUT SCHEMAS
// ────────────────────────────────
export const checkoutSchema = z.object({
  appointmentId: z.number().int().positive(),
});

// ────────────────────────────────
// COMPLAINT SCHEMAS
// ────────────────────────────────
export const newComplaintSchema = z.object({
  user_id: z.number().int(),
  related_appointment_id: z.number().int().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  status: complaintStatusEnum.optional().default('Open'),
});
