import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema'

// ========== Base Drizzle Types ==========

export type TUserInsert = typeof users.$inferInsert
export type TUserSelect = typeof users.$inferSelect

export type TDoctorInsert = typeof doctors.$inferInsert
export type TDoctorSelect = typeof doctors.$inferSelect

export type TAppointmentInsert = typeof appointments.$inferInsert
export type TAppointmentSelect = typeof appointments.$inferSelect

export type TPrescriptionInsert = typeof prescriptions.$inferInsert
export type TPrescriptionSelect = typeof prescriptions.$inferSelect

export type TPaymentInsert = typeof payments.$inferInsert
export type TPaymentSelect = typeof payments.$inferSelect

export type TComplaintInsert = typeof complaints.$inferInsert
export type TComplaintSelect = typeof complaints.$inferSelect

// ========== Extended / Populated Types ==========

export interface PopulatedUser extends TUserSelect {
  appointments?: TAppointmentSelect[]
  prescriptions?: TPrescriptionSelect[]
  complaints?: TComplaintSelect[]
  doctor?: TDoctorSelect
}

export interface VerifiedUser extends TUserSelect {
  is_verified: boolean
  verification_token: string | null
  token_expiry: Date | null
  last_login: Date | null
}

export interface PopulatedDoctor extends TDoctorSelect {
  user?: TUserSelect
  appointments?: (TAppointmentSelect & {
    user?: TUserSelect
    complaints?: TComplaintSelect[]
    payments?: TPaymentSelect[]
  })[]
  prescriptions?: (TPrescriptionSelect & {
    patient?: TUserSelect
    appointment?: TAppointmentSelect
  })[]
}

export interface PopulatedAppointment extends TAppointmentSelect {
  user?: TUserSelect
  doctor?: TDoctorSelect
  prescriptions?: TPrescriptionSelect[]
  payment?: TPaymentSelect
  complaint?: TComplaintSelect
}

export interface PopulatedPrescription extends TPrescriptionSelect {
  appointment?: TAppointmentSelect
  doctor?: TDoctorSelect
  patient?: TUserSelect
}

export interface PopulatedPayment extends TPaymentSelect {
  appointment?: {
    doctor?: TDoctorSelect
    user?: TUserSelect
  } & TAppointmentSelect
}

export interface PopulatedComplaint extends TComplaintSelect {
  user?: TUserSelect
  related_appointment?: TAppointmentSelect
}

// ========== Sanitized Variants ==========

type SensitiveFields = 'password' | 'verification_token' | 'token_expiry'

// Sanitize base user
export type SanitizedUser = Omit<TUserSelect, SensitiveFields>

// Sanitize full user profile
export type SanitizedPopulatedUser = Omit<PopulatedUser, SensitiveFields>

// Sanitize prescription (remove sensitive patient data)
export type SanitizedPrescription = Omit<PopulatedPrescription, 'doctor' | 'patient'> & {
  doctor?: TDoctorSelect
  patient?: SanitizedUser
}

// Sanitize appointment (remove sensitive user data)
export type SanitizedAppointment = Omit<PopulatedAppointment, 'user' | 'doctor'> & {
  user?: SanitizedUser
  doctor?: TDoctorSelect
}

// Sanitize payment (deep nested user inside appointment)
export type SanitizedPayment = Omit<PopulatedPayment, 'appointment'> & {
  appointment?: Omit<PopulatedPayment['appointment'], 'user' | 'doctor'> & {
    user?: SanitizedUser
    doctor?: TDoctorSelect
  }
}

// Sanitize doctor profile deeply
export type SanitizedDoctor = Omit<PopulatedDoctor, 'user' | 'appointments' | 'prescriptions'> & {
  user?: SanitizedUser
  appointments?: (Omit<PopulatedAppointment, 'user'> & {
    user?: SanitizedUser
  })[]
  prescriptions?: (Omit<PopulatedPrescription, 'patient'> & {
    patient?: SanitizedUser
  })[]
}

// Sanitize complaint if needed (optional)
export type SanitizedComplaint = Omit<PopulatedComplaint, 'user'> & {
  user?: SanitizedUser
}


export type SanitizedPopulatedComplaint = Omit<PopulatedComplaint, 'user' | 'appointment'> & {
  user?: SanitizedUser
  appointment?: TAppointmentSelect
}

