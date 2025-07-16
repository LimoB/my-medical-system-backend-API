import { relations } from 'drizzle-orm';
import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
  consultations,
  doctorMeetings,
  doctorMeetingAttendance,
} from './schema';

// ===== USERS RELATIONS =====
export const usersRelations = relations(users, ({ many, one }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  complaints: many(complaints),
  consultations: many(consultations),
  doctor: one(doctors, {
    fields: [users.user_id],
    references: [doctors.user_id],
  }),
}));

// ===== DOCTORS RELATIONS =====
export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.user_id],
    references: [users.user_id],
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  consultations: many(consultations),
  meetingAttendance: many(doctorMeetingAttendance), // ✅ links to attendance table
}));

// ===== APPOINTMENTS RELATIONS =====
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
  consultation: one(consultations, {
    fields: [appointments.appointment_id],
    references: [consultations.appointment_id],
  }),
}));

// ===== CONSULTATIONS RELATIONS =====
export const consultationsRelations = relations(consultations, ({ one }) => ({
  appointment: one(appointments, {
    fields: [consultations.appointment_id],
    references: [appointments.appointment_id],
  }),
  doctor: one(doctors, {
    fields: [consultations.doctor_id],
    references: [doctors.doctor_id],
  }),
  patient: one(users, {
    fields: [consultations.patient_id],
    references: [users.user_id],
  }),
}));

// ===== PRESCRIPTIONS RELATIONS =====
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

// ===== PAYMENTS RELATIONS =====
export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointment_id],
    references: [appointments.appointment_id],
  }),
}));

// ===== COMPLAINTS RELATIONS =====
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

// ===== DOCTOR MEETINGS RELATIONS =====
export const doctorMeetingsRelations = relations(doctorMeetings, ({ many }) => ({
  attendees: many(doctorMeetingAttendance), // ✅ 1:N relationship to attendance table
}));

// ===== DOCTOR MEETING ATTENDANCE RELATIONS =====
export const doctorMeetingAttendanceRelations = relations(doctorMeetingAttendance, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorMeetingAttendance.doctor_id],
    references: [doctors.doctor_id],
  }),
  meeting: one(doctorMeetings, {
    fields: [doctorMeetingAttendance.meeting_id],
    references: [doctorMeetings.meeting_id],
  }),
}));
