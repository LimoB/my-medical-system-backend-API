import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  date,
  time,
  decimal,
  boolean,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';

// ===== ENUMS =====
export const roleEnum = pgEnum('role', ['user', 'admin', 'doctor']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Failed']);
export const complaintStatusEnum = pgEnum('complaint_status', ['Open', 'In Progress', 'Resolved', 'Closed']);
export const paymentStatusEnum = pgEnum('payment_status', [
  'Pending',
  'Paid',
  'Failed',
  'CashOnDelivery'
]);
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'mpesa', 'paypal', 'cash']);
export const consultationStatusEnum = pgEnum('consultation_status', ['Pending', 'Completed']);
export const consultationTypeEnum = pgEnum('consultation_type', ['initial', 'follow-up', 'review']);




// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// ===== USERS =====
export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  contact_phone: varchar('contact_phone', { length: 20 }),
  address: text('address'),
  date_of_birth: varchar('date_of_birth', { length: 255 }),

  gender: genderEnum('gender'), // 👈 added gender enum

  role: roleEnum('role').default('user').notNull(),
  image_url: text('image_url'),
  is_verified: boolean('is_verified').default(false).notNull(),
  verification_token: varchar('verification_token', { length: 255 }),
  token_expiry: timestamp('token_expiry', { withTimezone: true }),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== DOCTORS =====
export const doctors = pgTable('doctors', {
  doctor_id: serial('doctor_id').primaryKey(),
  user_id: integer('user_id').references(() => users.user_id).notNull().unique(),
  specialization: varchar('specialization', { length: 150 }).notNull(),
  available_days: varchar('available_days', { length: 255 }).notNull(),
  available_hours: jsonb('available_hours').$type<string[]>().default([]),
  slot_duration_minutes: integer('slot_duration_minutes').default(60).notNull(), // ✅ added here
  payment_per_hour: integer('payment_per_hour').notNull(),
  description: text('description').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== APPOINTMENTS =====
export const appointments = pgTable('appointments', {
  appointment_id: serial('appointment_id').primaryKey(),
  user_id: integer('user_id').references(() => users.user_id).notNull(),
  doctor_id: integer('doctor_id').references(() => doctors.doctor_id).notNull(),
  appointment_date: date('appointment_date').notNull(),
  time_slot: time('time_slot').notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }),
  appointment_status: appointmentStatusEnum('appointment_status').default('Pending').notNull(),
  payment_per_hour: decimal('payment_per_hour', { precision: 10, scale: 2 }).notNull().default(sql`0`),
  payment_method: paymentMethodEnum('payment_method').notNull(),

  // ✅ New field for payment status
  payment_status: paymentStatusEnum('payment_status').default('Pending').notNull(),

  // ✅ Keep tracking cash delivery confirmation
  is_cash_delivered: boolean('is_cash_delivered').default(false),

  failure_reason: text('failure_reason'),
  was_rescheduled: boolean('was_rescheduled').default(false),
  reason: text('reason').default(sql`NULL`),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== CONSULTATIONS =====
export const consultations = pgTable('consultations', {
  consultation_id: serial('consultation_id').primaryKey(),

  // Relational Fields
  appointment_id: integer('appointment_id')
    .references(() => appointments.appointment_id)
    .notNull(),

  doctor_id: integer('doctor_id')
    .references(() => doctors.doctor_id)
    .notNull(),

  patient_id: integer('patient_id')
    .references(() => users.user_id)
    .notNull(),

  // Updated Core Fields (based on UI mock)
  symptoms: text('symptoms'), // e.g., "Fever, Cough, Heart Burn"
  observation: text('observation'), // matches `observation` in mock
  prescription: text('prescription'), // matches `prescription` in mock

  // Optional UI-related display fields (can be derived from joins, but here if needed directly)
  reference_code: varchar('reference_code', { length: 50 }), // e.g., "#2J983K10"
  consultation_date: date('consultation_date'), // aligns with `date` in mock

  // Existing Fields you already had (kept as is or renamed)
  diagnosis: text('diagnosis'),
  treatment_plan: text('treatment_plan'),
  additional_notes: text('additional_notes'),
  duration_minutes: integer('duration_minutes'),

  consultation_type: consultationTypeEnum('consultation_type')
    .default('initial')
    .notNull(),

  status: consultationStatusEnum('consultation_status')
    .default('Completed')
    .notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});



// ===== PRESCRIPTIONS =====
export const prescriptions = pgTable('prescriptions', {
  prescription_id: serial('prescription_id').primaryKey(),
  appointment_id: integer('appointment_id').references(() => appointments.appointment_id).notNull(),
  doctor_id: integer('doctor_id').references(() => doctors.doctor_id).notNull(),
  patient_id: integer('patient_id').references(() => users.user_id).notNull(),
  notes: text('notes'),
  image_url: text('image_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== PAYMENTS =====
export const payments = pgTable('payments', {
  payment_id: serial('payment_id').primaryKey(),
  appointment_id: integer('appointment_id').references(() => appointments.appointment_id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').default('Pending').notNull(),
  transaction_id: varchar('transaction_id', { length: 255 }).notNull().unique(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  payment_date: timestamp('payment_date', { withTimezone: true }).defaultNow(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== COMPLAINTS =====
export const complaints = pgTable('complaints', {
  complaint_id: serial('complaint_id').primaryKey(),
  user_id: integer('user_id').references(() => users.user_id).notNull(),
  related_appointment_id: integer('related_appointment_id').references(() => appointments.appointment_id),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: complaintStatusEnum('complaint_status').default('Open').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== DOCTOR MEETINGS =====
export const doctorMeetings = pgTable('doctor_meetings', {
  meeting_id: serial('meeting_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  meeting_date: date('meeting_date').notNull(),
  meeting_time: time('meeting_time').notNull(),
  is_global: boolean('is_global').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ===== DOCTOR MEETING ATTENDANCE =====
export const doctorMeetingAttendance = pgTable('doctor_meeting_attendance', {
  id: serial('id').primaryKey(),
  doctor_id: integer('doctor_id').references(() => doctors.doctor_id).notNull(),
  meeting_id: integer('meeting_id').references(() => doctorMeetings.meeting_id).notNull(),
  status: varchar('status', { length: 20 }).default('Pending'),
  attended: boolean('attended').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueDoctorMeeting: unique().on(table.doctor_id, table.meeting_id),
}));

// ===== NOTIFICATIONS =====
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.user_id).notNull(),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at', { withTimezone: true }).defaultNow(),
  read: boolean('read').default(false),
});

// ===== RESCHEDULE REQUESTS =====
export const rescheduleRequests = pgTable('reschedule_requests', {
  id: serial('id').primaryKey(),
  appointment_id: integer('appointment_id').references(() => appointments.appointment_id).notNull(),
  requested_date: date('requested_date').notNull(),
  requested_time: time('requested_time').notNull(),
  status: varchar('status', { length: 20 }).default('Pending'),
});