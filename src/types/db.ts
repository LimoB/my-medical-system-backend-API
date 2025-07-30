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
  rescheduleRequests, // ✅ Added this
} from '@/drizzle/schema';

export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

export type TDoctorInsert = typeof doctors.$inferInsert;
export type TDoctorSelect = typeof doctors.$inferSelect;

export type TAppointmentInsert = typeof appointments.$inferInsert;
export type TAppointmentSelect = typeof appointments.$inferSelect;

export type TPrescriptionInsert = typeof prescriptions.$inferInsert;
export type TPrescriptionSelect = typeof prescriptions.$inferSelect;

export type TPaymentInsert = typeof payments.$inferInsert;
export type TPaymentSelect = typeof payments.$inferSelect;

export type TComplaintInsert = typeof complaints.$inferInsert;
export type TComplaintSelect = typeof complaints.$inferSelect;

export type TConsultationInsert = typeof consultations.$inferInsert;
export type TConsultationSelect = typeof consultations.$inferSelect;

export type TDoctorMeetingInsert = typeof doctorMeetings.$inferInsert;
export type TDoctorMeetingSelect = typeof doctorMeetings.$inferSelect;

export type TDoctorMeetingAttendanceInsert = typeof doctorMeetingAttendance.$inferInsert;
export type TDoctorMeetingAttendanceSelect = typeof doctorMeetingAttendance.$inferSelect;

export type TRescheduleRequestInsert = typeof rescheduleRequests.$inferInsert; // ✅ Added
export type TRescheduleRequestSelect = typeof rescheduleRequests.$inferSelect; // ✅ Added
