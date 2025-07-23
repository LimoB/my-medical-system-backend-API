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
  notifications,
  rescheduleRequests,
} from './schema';

// ===== USERS RELATIONS =====
export const usersRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [users.user_id],
    references: [doctors.user_id],
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  complaints: many(complaints),
  consultations: many(consultations),
  notifications: many(notifications),
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
  meetingAttendance: many(doctorMeetingAttendance),
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
  consultations: many(consultations),
  rescheduleRequests: many(rescheduleRequests),
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
    relationName: 'prescribingDoctor',
  }),
  patient: one(users, {
    fields: [prescriptions.patient_id],
    references: [users.user_id],
    relationName: 'prescriptionPatient',
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

// ===== NOTIFICATIONS RELATIONS =====
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.user_id],
  }),
}));

// ===== RESCHEDULE REQUESTS RELATIONS =====
export const rescheduleRequestsRelations = relations(rescheduleRequests, ({ one }) => ({
  appointment: one(appointments, {
    fields: [rescheduleRequests.appointment_id],
    references: [appointments.appointment_id],
  }),
}));

// ===== DOCTOR MEETINGS RELATIONS =====
export const doctorMeetingsRelations = relations(doctorMeetings, ({ many }) => ({
  attendees: many(doctorMeetingAttendance),
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
