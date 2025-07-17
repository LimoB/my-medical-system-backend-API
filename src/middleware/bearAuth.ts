//middleware bearAuth
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import ms, { type StringValue } from 'ms';

// === Extend Express Request to include user ===
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// === User Role Types ===
export type UserRole = 'user' | 'admin' | 'doctor';

// === Decoded JWT Payload Type ===
export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  exp?: number;
};

// === Generate a random 6-digit verification code ===
export const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// === Sign Access Token ===
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: StringValue = '1h'
): string => {
  const options: SignOptions = { expiresIn };
  console.log(`[signToken] Signing token for userId=${payload.userId}`);
  return jwt.sign(payload, secret, options);
};

// === Sign Refresh Token ===
export const signRefreshToken = (
  payload: Pick<DecodedToken, 'userId' | 'email' | 'role'>,
  secret: string,
  expiresIn: StringValue = '7d'
): string => {
  const options: SignOptions = { expiresIn };
  console.log(`[signRefreshToken] Signing refresh token for userId=${payload.userId}`);
  return jwt.sign(payload, secret, options);
};

// === Normalize a decoded JWT payload ===
const normalizeDecodedToken = (raw: any): DecodedToken | null => {
  if (!raw || typeof raw !== 'object') {
    console.error('[normalizeDecodedToken] Invalid token payload:', raw);
    return null;
  }

  const idCandidates = [raw.userId, raw.id];
  const userId = idCandidates.find(id => typeof id === 'number')
    ?? (typeof idCandidates.find(id => typeof id === 'string') === 'string'
      ? parseInt(idCandidates.find(id => typeof id === 'string')!, 10)
      : null);

  const email = typeof raw.email === 'string' ? raw.email : null;
  const role = raw.role;

  if (
    typeof userId !== 'number' ||
    !email ||
    !['user', 'admin', 'doctor'].includes(role)
  ) {
    console.error('[normalizeDecodedToken] Missing/invalid fields:', {
      userId,
      email,
      role,
    });
    return null;
  }

  return {
    userId,
    email,
    role,
    exp: typeof raw.exp === 'number' ? raw.exp : undefined,
  };
};

// === Verify Access Token ===
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const raw = jwt.verify(token, secret);
    return normalizeDecodedToken(raw);
  } catch (err) {
    console.error('[verifyToken] Invalid or expired token:', err);
    return null;
  }
};

// === Verify Refresh Token ===
export const verifyRefreshToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const raw = jwt.verify(token, secret);
    return normalizeDecodedToken(raw);
  } catch (err) {
    console.error('[verifyRefreshToken] Invalid or expired refresh token:', err);
    return null;
  }
};

// === Auth Middleware Factory for role-based access ===
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.warn('[authMiddleware] Authorization header missing');
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!process.env.JWT_SECRET) {
      console.error('[authMiddleware] JWT_SECRET not defined in environment');
      res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
      return;
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET);

    console.log('[authMiddleware] Decoded token:', decoded);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    console.log('[authMiddleware] Allowed roles:', allowed);
    console.log('[authMiddleware] Decoded role:', decoded.role);

    if (!allowed.includes(decoded.role)) {
      console.warn(
        `[authMiddleware] Access denied. Role '${decoded.role}' not allowed. Allowed: ${allowed.join(', ')}`
      );
      res.status(403).json({ error: `Role '${decoded.role}' not authorized` });
      return;
    }

    req.user = decoded;
    next();
  };
};

// === Export Specific Role-Based Middleware ===
export const userAuth = authMiddlewareFactory('user');
export const adminAuth = authMiddlewareFactory('admin');
export const doctorAuth = authMiddlewareFactory('doctor');
export const adminOrDoctorAuth = authMiddlewareFactory(['admin', 'doctor']);
export const anyRoleAuth = authMiddlewareFactory(['user', 'admin', 'doctor']);


