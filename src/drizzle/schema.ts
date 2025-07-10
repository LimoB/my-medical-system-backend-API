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
  jsonb,  // jsonb is imported here
} from 'drizzle-orm/pg-core'

// ===== ENUMS =====
export const roleEnum = pgEnum('role', ['user', 'admin', 'doctor']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['Pending', 'Confirmed', 'Cancelled']);
export const complaintStatusEnum = pgEnum('complaint_status', ['Open', 'In Progress', 'Resolved', 'Closed']);
export const paymentStatusEnum = pgEnum('payment_status', ['Pending', 'Paid', 'Failed']);
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'mpesa', 'paypal', 'cash']);

// ===== USERS =====
export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  contact_phone: varchar('contact_phone', { length: 20 }),
  address: text('address'),
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
  user_id: integer('user_id').references(() => users.user_id).notNull().unique(), // References the `users` table
  specialization: varchar('specialization', { length: 150 }).notNull(), // Doctor's specialization
  available_days: varchar('available_days', { length: 255 }).notNull(),  // Days the doctor is available (e.g., "Monday, Tuesday, Friday")
  available_hours: jsonb('available_hours').default('[]'), // Correct usage of jsonb with default
  payment_per_hour: integer('payment_per_hour').notNull(), // New field for payment per hour

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
