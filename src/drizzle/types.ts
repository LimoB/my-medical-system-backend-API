import z from 'zod';
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

import {
  newDoctorSchema,
  newUserSchema,
  updateUserSchema,
} from '@/validation/zodSchemas';
import type { sanitizeUser } from '@/utils/sanitize';

// ========== Zod Input Types ==========
export type NewUserInput = z.infer<typeof newUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type NewDoctorInput = z.infer<typeof newDoctorSchema>;

// ========== Drizzle Table Types ==========
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

// ========== Enums ==========
export type PaymentMethod = 'stripe' | 'mpesa' | 'paypal' | 'cash';
export type Role = 'user' | 'admin' | 'doctor';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type ConsultationStatus = 'Pending' | 'Completed';
export type ConsultationType = 'initial' | 'follow-up' | 'review';

// ========== Extended / Populated Types ==========
export interface PopulatedUser extends TUserSelect {
  appointments?: TAppointmentSelect[];
  prescriptions?: TPrescriptionSelect[];
  complaints?: TComplaintSelect[];
  consultations?: TConsultationSelect[];
  doctor?: TDoctorSelect;
}

export interface VerifiedUser extends TUserSelect {
  is_verified: boolean;
  verification_token: string | null;
  token_expiry: Date | null;
  last_login: Date | null;
}

export interface PopulatedDoctor extends TDoctorSelect {
  user?: TUserSelect;
  appointments?: (TAppointmentSelect & {
    user?: TUserSelect;
    complaints?: TComplaintSelect[];
    payments?: TPaymentSelect[];
    consultations?: TConsultationSelect[];
  })[];
  prescriptions?: (TPrescriptionSelect & {
    patient?: TUserSelect;
    appointment?: TAppointmentSelect;
  })[];
  consultations?: TConsultationSelect[];
  meetingAttendance?: (TDoctorMeetingAttendanceSelect & {
    meeting?: TDoctorMeetingSelect;
  })[];
}

export interface PopulatedAppointment extends TAppointmentSelect {
  user?: TUserSelect;
  doctor?: PopulatedDoctor;
  prescriptions?: TPrescriptionSelect[];
  payments?: TPaymentSelect[];
  complaints?: TComplaintSelect[];
  consultations?: TConsultationSelect[];
}

export interface PopulatedPrescription extends TPrescriptionSelect {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: TUserSelect;
}

export interface PopulatedPayment extends TPaymentSelect {
  appointment?: TAppointmentSelect & {
    user?: TUserSelect;
    doctor?: TDoctorSelect;
  };
}

export interface PopulatedComplaint extends TComplaintSelect {
  user?: TUserSelect;
  related_appointment?: TAppointmentSelect;
}

export interface PopulatedConsultation extends TConsultationSelect {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: TUserSelect;
}

export interface PopulatedDoctorMeeting extends TDoctorMeetingSelect {
  attendees?: (TDoctorMeetingAttendanceSelect & {
    doctor?: TDoctorSelect & {
      user?: TUserSelect;
    };
  })[];
}

// ========== Sanitized Variants ==========
type SensitiveFields = 'password' | 'verification_token' | 'token_expiry';

export type SanitizedUser = Omit<TUserSelect, SensitiveFields>;

export type SanitizedPopulatedUser = Omit<PopulatedUser, SensitiveFields>;

export type SanitizedDoctor = Omit<
  PopulatedDoctor,
  'user' | 'appointments' | 'prescriptions' | 'consultations' | 'meetingAttendance'
> & {
  user?: SanitizedUser;
  appointments?: (Omit<PopulatedAppointment, 'user'> & {
    user?: SanitizedUser;
  })[];
  prescriptions?: (Omit<PopulatedPrescription, 'patient'> & {
    patient?: SanitizedUser;
  })[];
  consultations?: Omit<PopulatedConsultation, 'patient'>[];
  meetingAttendance?: (TDoctorMeetingAttendanceSelect & {
    meeting?: TDoctorMeetingSelect;
  })[];
};

export type SanitizedAppointment = Omit<TAppointmentSelect, 'user' | 'doctor'> & {
  doctor_id: number;
  user_id: number;
  user?: SanitizedUser;
  doctor?: SanitizedDoctor;
  prescriptions?: TPrescriptionSelect[];
  payments?: TPaymentSelect[];
  complaints?: TComplaintSelect[];
  consultations?: TConsultationSelect[];
};

// ✅ UPDATED TYPE
export type SanitizedPrescription = Omit<PopulatedPrescription, 'doctor' | 'patient' | 'appointment'> & {
  appointment?: {
    appointment_id: number;
    appointment_date: string;
    time_slot: string;
    appointment_status: AppointmentStatus;
    payment_method: PaymentMethod;
    reason: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    user_id: number;
    doctor_id?: number;
    payment_per_hour?: string;
    total_amount?: string | null;
  };
  doctor?: ReturnType<typeof sanitizeUser>;
  patient?: ReturnType<typeof sanitizeUser>;
};

export type SanitizedConsultation = Omit<PopulatedConsultation, 'appointment' | 'doctor' | 'patient'> & {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: SanitizedUser;
};

export type SanitizedPayment = Omit<PopulatedPayment, 'appointment'> & {
  appointment?: Omit<NonNullable<PopulatedPayment['appointment']>, 'user' | 'doctor'> & {
    user?: SanitizedUser;
    doctor?: TDoctorSelect;
  };
};

export type SanitizedComplaint = Omit<PopulatedComplaint, 'user'> & {
  user?: SanitizedUser;
};

export type SanitizedPopulatedComplaint = Omit<
  PopulatedComplaint,
  'user' | 'related_appointment'
> & {
  user?: SanitizedUser;
  appointment?: TAppointmentSelect;
};

export type SanitizedDoctorMeeting = Omit<PopulatedDoctorMeeting, 'attendees'> & {
  attendees?: Array<Omit<NonNullable<PopulatedDoctorMeeting['attendees']>[number], 'doctor'> & {
    doctor?: SanitizedDoctor;
  }>;
};

// ========== Utility Types ==========
export interface DoctorPatient {
  user: SanitizedUser;
  appointmentDate: TAppointmentSelect['appointment_date'];
  timeSlot: TAppointmentSelect['time_slot'];
  status: TAppointmentSelect['appointment_status'];
}
