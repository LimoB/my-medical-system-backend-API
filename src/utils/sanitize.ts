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
