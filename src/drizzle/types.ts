import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema'

// Base Drizzle types
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

// ====== Extended / Populated Types ======

export interface PopulatedUser extends TUserSelect {
  appointments?: TAppointmentSelect[]
  prescriptions?: TPrescriptionSelect[]
  complaints?: TComplaintSelect[]
}

export interface VerifiedUser extends TUserSelect {
  is_verified: boolean
  verification_token: string | null
  token_expiry: Date | null
  last_login: Date | null
}

export interface PopulatedDoctor extends TDoctorSelect {
  appointments?: TAppointmentSelect[]
  prescriptions?: TPrescriptionSelect[]
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
  appointment?: TAppointmentSelect
}

export interface PopulatedComplaint extends TComplaintSelect {
  user?: TUserSelect
  related_appointment?: TAppointmentSelect
}
