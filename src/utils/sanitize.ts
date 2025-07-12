// Define fields considered sensitive and removable
interface SensitiveFields {
  password?: string;
  verification_token?: string | null;
  token_expiry?: string | Date | null;
  image_url?: string | null; // ✅ Optional, but preserved
  [key: string]: any;
}

// 🔹 Sanitize a single user object by removing sensitive fields
export const sanitizeUser = <T extends SensitiveFields>(
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
export const sanitizeUsers = <T extends SensitiveFields>(
  users: T[]
): Omit<T, 'password' | 'verification_token' | 'token_expiry'>[] => {
  return users.map(sanitizeUser);
};
