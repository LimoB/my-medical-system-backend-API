import { z } from 'zod';

// ────────────────────────────────
// ENUMS (Match Drizzle schema)
// ────────────────────────────────
export const roleEnum = z.enum(['user', 'admin', 'doctor']);
export const appointmentStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']);
export const complaintStatusEnum = z.enum(['Open', 'In Progress', 'Resolved', 'Closed']);
export const paymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed']);
export const consultationStatusEnum = z.enum(['Pending', 'Completed']); // ✅ FIXED
export const paymentMethodEnum = z.enum(['stripe', 'mpesa', 'paypal', 'cash']);

// ────────────────────────────────
// USER SCHEMAS
// ────────────────────────────────
export const newUserSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contact_phone: z.string().optional(),
  address: z.string().optional(),

  // 🔄 date_of_birth is a string in DB, so treat it as a string
  date_of_birth: z.string().optional(), // optionally add .regex(...) for format

  role: roleEnum.optional().default('user'),
  image_url: z.string().url().optional(),
  is_verified: z.boolean().optional(),
  verification_token: z.string().nullable().optional(),

  // ✅ These are stored as Date or Timestamp
  token_expiry: z.coerce.date().nullable().optional(),
  last_login: z.coerce.date().nullable().optional(),
});


export const updateUserSchema = z
  .object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    date_of_birth: z.coerce.date().optional(),
    image_url: z.string().url().optional(),
    role: roleEnum.optional(),
    is_verified: z.boolean().optional(),
  })
  .strict();

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
  available_hours: z.array(z.string()).optional(), // matches `jsonb(string[])`
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
  total_amount: z.coerce.number().positive(),
  payment_per_hour: z.coerce.number().nonnegative().default(0),
  appointment_status: appointmentStatusEnum.optional().default('Pending'),
  payment_method: paymentMethodEnum,

  // New reason field added
  reason: z.string().max(255).optional(), // You can use .nullable() if you want to explicitly allow nulls
});


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
// CONSULTATION SCHEMAS
// ────────────────────────────────
export const newConsultationSchema = z.object({
  appointment_id: z.number().int(),
  doctor_id: z.number().int(),
  patient_id: z.number().int(),
  symptoms: z.string().optional(),
  diagnosis: z.string().min(1),
  treatment_plan: z.string().optional(),
  additional_notes: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  status: consultationStatusEnum.default('Completed'),
});

// ────────────────────────────────
// PAYMENT SCHEMAS
// ────────────────────────────────
export const newPaymentSchema = z.object({
  appointment_id: z.number().int(),
  amount: z.coerce.number().positive(),
  payment_method: paymentMethodEnum,
  transaction_id: z.string().min(1),
  payment_status: paymentStatusEnum.optional().default('Pending'),
});

// ────────────────────────────────
// CHECKOUT SCHEMA
// ────────────────────────────────
export const checkoutSchema = z.object({
  appointmentId: z.number().int().positive(),
});

// ────────────────────────────────
// COMPLAINT SCHEMAS
// ────────────────────────────────
export const newComplaintSchema = z.object({
  related_appointment_id: z.number().int().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  status: complaintStatusEnum.optional().default('Open'),
});

// ────────────────────────────────
// DOCTOR MEETING SCHEMAS
// ────────────────────────────────
export const newDoctorMeetingSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  meeting_date: z.coerce.date({ required_error: 'Meeting date is required' }),
  meeting_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
      message: 'Meeting time must be in HH:MM or HH:MM:SS format',
    }),
  is_global: z.boolean().optional(), // ✅ included since in schema
});

// ────────────────────────────────
// MEETING ATTENDANCE SCHEMAS
// ────────────────────────────────
export const newDoctorMeetingAttendanceSchema = z.object({
  doctor_id: z.number().int({ message: 'Doctor ID must be an integer' }),
  meeting_id: z.number().int({ message: 'Meeting ID must be an integer' }),
  status: z.enum(['Pending', 'Attending', 'Not Attending']).optional(),
  attended: z.boolean().optional(),
});
