import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema';

// ========== Base Drizzle Types ==========

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

// ========== Payment Method Enum ==========
export type PaymentMethod = 'stripe' | 'mpesa' | 'paypal' | 'cash';

// ========== Extended / Populated Types ==========

export interface PopulatedUser extends TUserSelect {
  appointments?: TAppointmentSelect[];
  prescriptions?: TPrescriptionSelect[];
  complaints?: TComplaintSelect[];
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
  })[];
  prescriptions?: (TPrescriptionSelect & {
    patient?: TUserSelect;
    appointment?: TAppointmentSelect;
  })[];
}

export interface PopulatedAppointment extends TAppointmentSelect {
  user?: TUserSelect;
  doctor?: PopulatedDoctor;
  prescriptions?: TPrescriptionSelect[];
  payments?: TPaymentSelect[];
  complaints?: TComplaintSelect[];
}

export interface PopulatedPrescription extends TPrescriptionSelect {
  appointment?: TAppointmentSelect;
  doctor?: TDoctorSelect;
  patient?: TUserSelect;
}

export interface PopulatedPayment extends TPaymentSelect {
  appointment?: {
    doctor?: TDoctorSelect & { user?: TUserSelect };
    user?: TUserSelect;
  } & TAppointmentSelect;
}

export interface PopulatedComplaint extends TComplaintSelect {
  user?: TUserSelect;
  related_appointment?: TAppointmentSelect;
}

// ========== Sanitized Variants ==========

type SensitiveFields = 'password' | 'verification_token' | 'token_expiry';

// ✅ Base user with sensitive fields removed
export type SanitizedUser = Omit<TUserSelect, SensitiveFields>;

// ✅ Full user profile sanitized
export type SanitizedPopulatedUser = Omit<PopulatedUser, SensitiveFields>;

// ✅ Doctor sanitized
export type SanitizedDoctor = Omit<PopulatedDoctor, 'user' | 'appointments' | 'prescriptions'> & {
  user?: SanitizedUser;
  appointments?: (Omit<PopulatedAppointment, 'user'> & {
    user?: SanitizedUser;
  })[];
  prescriptions?: (Omit<PopulatedPrescription, 'patient'> & {
    patient?: SanitizedUser;
  })[];
};

// ✅ Appointment sanitized
export type SanitizedAppointment = Omit<TAppointmentSelect, 'user_id' | 'doctor_id'> & {
  user?: SanitizedUser;
  doctor?: SanitizedDoctor;
  prescriptions?: TPrescriptionSelect[];
  payments?: TPaymentSelect[];
  complaints?: TComplaintSelect[];
};

// ✅ Prescription with patient sanitized
export type SanitizedPrescription = Omit<PopulatedPrescription, 'doctor' | 'patient'> & {
  doctor?: TDoctorSelect;
  patient?: SanitizedUser;
};

// ✅ Payment with sanitized nested appointment (with doctor user separately)
export type SanitizedPayment = Omit<PopulatedPayment, 'appointment'> & {
  appointment?: Omit<PopulatedPayment['appointment'], 'user' | 'doctor'> & {
    user?: SanitizedUser;
    doctor?: TDoctorSelect;
    doctor_user?: SanitizedUser; // 👈 Added for displaying doctor name
  };
};

// ✅ Complaint sanitized
export type SanitizedComplaint = Omit<PopulatedComplaint, 'user'> & {
  user?: SanitizedUser;
};

export type SanitizedPopulatedComplaint = Omit<
  PopulatedComplaint,
  'user' | 'appointment'
> & {
  user?: SanitizedUser;
  appointment?: TAppointmentSelect;
};
