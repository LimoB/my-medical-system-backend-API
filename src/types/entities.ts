import type {
  TUserSelect,
  TDoctorSelect,
  TAppointmentSelect,
  TPrescriptionSelect,
  TPaymentSelect,
  TComplaintSelect,
  TConsultationSelect,
  TDoctorMeetingSelect,
  TDoctorMeetingAttendanceSelect,
  TRescheduleRequestSelect,
} from './db';

import type { AppointmentStatus, PaymentMethod } from './enums';
import type { sanitizeUser } from '@/utils/sanitize';

// === Extended / Populated Types ===

export interface PopulatedUser extends TUserSelect {
  appointments?: TAppointmentSelect[];
  prescriptions?: TPrescriptionSelect[];
  complaints?: TComplaintSelect[];
  consultations?: TConsultationSelect[];
  doctor?: TDoctorSelect;
}

export interface PopulatedDoctor extends TDoctorSelect {
  user?: TUserSelect;
  appointments?: (TAppointmentSelect & {
    user?: TUserSelect;
    complaints?: TComplaintSelect[];
    payments?: TPaymentSelect[];
    consultations?: TConsultationSelect[];
    rescheduleRequests?: TRescheduleRequestSelect[];
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
  rescheduleRequests?: TRescheduleRequestSelect[]; // ✅ Added
}

export interface PopulatedPrescription extends TPrescriptionSelect {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: TUserSelect;
}

export interface PopulatedConsultation extends TConsultationSelect {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: TUserSelect;
}

// === Sanitized Types ===

type SensitiveFields = 'password' | 'verification_token' | 'token_expiry';

export type SanitizedUser = Omit<TUserSelect, SensitiveFields>;

export type SanitizedPopulatedUser = Omit<PopulatedUser, SensitiveFields>;

export type SanitizedDoctor = Omit<
  PopulatedDoctor,
  'user' | 'appointments' | 'prescriptions' | 'consultations' | 'meetingAttendance'
> & {
  user?: SanitizedUser;
  appointments?: (Omit<PopulatedAppointment, 'user'> & { user?: SanitizedUser })[];
  prescriptions?: (Omit<TPrescriptionSelect, 'patient'> & { patient?: SanitizedUser })[];
  consultations?: Omit<PopulatedConsultation, 'patient'>[];
  meetingAttendance?: (TDoctorMeetingAttendanceSelect & { meeting?: TDoctorMeetingSelect })[];
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
  rescheduleRequests?: TRescheduleRequestSelect[]; // ✅ Added
};

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

export type SanitizedConsultation = Omit<PopulatedConsultation, 'doctor' | 'patient' | 'appointment'> & {
  appointment?: Pick<TAppointmentSelect, 'appointment_id' | 'appointment_date' | 'time_slot'>;
  doctor?: ReturnType<typeof sanitizeUser>;
  patient?: ReturnType<typeof sanitizeUser>;
};

// === Utility Types ===

export interface DoctorPatient {
  user: SanitizedUser;
  appointmentDate: TAppointmentSelect['appointment_date'];
  timeSlot: TAppointmentSelect['time_slot'];
  status: TAppointmentSelect['appointment_status'];
}


// === Utility Types ===

export interface DoctorPatient {
  user: SanitizedUser;
  appointmentDate: TAppointmentSelect['appointment_date'];
  timeSlot: TAppointmentSelect['time_slot'];
  status: TAppointmentSelect['appointment_status'];
}


// === Sanitized Doctor Meeting ===

export type SanitizedDoctorMeeting = Omit<TDoctorMeetingSelect, 'attendees'> & {
  attendees?: Array<
    Omit<TDoctorMeetingAttendanceSelect, 'doctor'> & {
      doctor?: SanitizedDoctor;
    }
  >;
};




// === Sanitized Complaint ===

export type SanitizedComplaint = Omit<TComplaintSelect, 'user'> & {
  user?: SanitizedUser;
};

// === Sanitized Populated Complaint ===

export type SanitizedPopulatedComplaint = Omit<
  TComplaintSelect & { user?: TUserSelect; related_appointment?: TAppointmentSelect },
  'user' | 'related_appointment'
> & {
  user?: SanitizedUser;
  appointment?: TAppointmentSelect;
};
