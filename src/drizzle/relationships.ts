import { relations } from 'drizzle-orm';
import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema';

// === USERS ===
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  complaints: many(complaints),
}));

// === DOCTORS ===
export const doctorsRelations = relations(doctors, ({ many }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

// === APPOINTMENTS ===
export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  user: one(users, {
    fields: [appointments.user_id],
    references: [users.user_id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctor_id],
    references: [doctors.doctor_id],
  }),
  prescriptions: many(prescriptions),
  payments: many(payments),
  complaints: many(complaints),
}));

// === PRESCRIPTIONS ===
export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  appointment: one(appointments, {
    fields: [prescriptions.appointment_id],
    references: [appointments.appointment_id],
  }),
  doctor: one(doctors, {
    fields: [prescriptions.doctor_id],
    references: [doctors.doctor_id],
  }),
  patient: one(users, {
    fields: [prescriptions.patient_id],
    references: [users.user_id],
  }),
}));

// === PAYMENTS ===
export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointment_id],
    references: [appointments.appointment_id],
  }),
}));

// === COMPLAINTS ===
export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.user_id],
    references: [users.user_id],
  }),
  appointment: one(appointments, {
    fields: [complaints.related_appointment_id],
    references: [appointments.appointment_id],
  }),
}));
