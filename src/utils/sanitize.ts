// Define fields considered sensitive and removable for user
interface SensitiveUserFields {
  password?: string;
  verification_token?: string | null;
  token_expiry?: string | Date | null;
  image_url?: string | null; // ✅ Optional, but preserved
  [key: string]: any;
}

// 🔹 Sanitize a single user object by removing sensitive fields
export const sanitizeUser = <T extends SensitiveUserFields>(
  user: T
): Omit<T, 'password' | 'verification_token' | 'token_expiry'> => {
  const {
    password,
    verification_token,
    token_expiry,
    ...safeUser
  } = user;

  return safeUser;
};

// 🔹 Sanitize an array of user objects
export const sanitizeUsers = <T extends SensitiveUserFields>(
  users: T[]
): Omit<T, 'password' | 'verification_token' | 'token_expiry'>[] => {
  return users.map(sanitizeUser);
};

// Define fields considered sensitive and removable for doctor
interface SensitiveDoctorFields {
  password?: string;
  verification_token?: string | null;
  token_expiry?: string | Date | null;
  image_url?: string | null; // Optional, but preserved
  [key: string]: any;
}

// 🔹 Sanitize a single doctor object by removing sensitive fields
export const sanitizeDoctor = <T extends SensitiveDoctorFields>(
  doctor: T
): Omit<T, 'password' | 'verification_token' | 'token_expiry'> => {
  const {
    password,
    verification_token,
    token_expiry,
    ...safeDoctor
  } = doctor;

  return safeDoctor;
};

// 🔹 Sanitize an array of doctor objects
export const sanitizeDoctors = <T extends SensitiveDoctorFields>(
  doctors: T[]
): Omit<T, 'password' | 'verification_token' | 'token_expiry'>[] => {
  return doctors.map(sanitizeDoctor);
};



// 🔹 Define the base interface for sensitive payment fields
interface SensitivePaymentFields {
  user?: SensitiveUserFields;
  doctor?: SensitiveDoctorFields;
  [key: string]: any;
}

// 🔹 Define the sanitized payment shape
type Sanitized<T extends SensitivePaymentFields> = Omit<T, 'user' | 'doctor'> & {
  user?: ReturnType<typeof sanitizeUser>;
  doctor?: ReturnType<typeof sanitizeDoctor>;
};

// 🔹 Sanitize a single payment object
export const sanitizePayment = <T extends SensitivePaymentFields>(
  payment: T
): Sanitized<T> => {
  const { user, doctor, ...rest } = payment;

  return {
    ...rest,
    user: user ? sanitizeUser(user) : undefined,
    doctor: doctor ? sanitizeDoctor(doctor) : undefined,
  };
};

// 🔹 Sanitize an array of payment objects
export const sanitizePayments = <T extends SensitivePaymentFields>(
  payments: T[]
): Sanitized<T>[] => {
  return payments.map(sanitizePayment);
};

// 🔹 Export the type of a sanitized payment object
export type SanitizedPayment<T extends SensitivePaymentFields = SensitivePaymentFields> = Sanitized<T>;
