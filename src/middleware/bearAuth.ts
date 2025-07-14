import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ms, { StringValue } from 'ms';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// === ROLES ===
export type UserRole = 'user' | 'admin' | 'doctor';

// === Token Payload ===
export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  exp?: number;
};

// === Generate 6-digit verification code ===
export const generateVerificationCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// === Sign Token ===
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

// === Normalize Decoded Token ===
const normalizeDecodedToken = (raw: any): DecodedToken | null => {
  const userIdRaw = raw.userId ?? raw.id;
  const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

  const decoded: DecodedToken = {
    userId,
    email: raw.email,
    role: raw.role,
    exp: raw.exp,
  };

  if (!decoded.userId || !decoded.email || !decoded.role) {
    console.error('[normalizeDecodedToken] Missing fields:', raw);
    return null;
  }

  return decoded;
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

// === Auth Middleware Factory ===
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.warn('[authMiddleware] Authorization header missing');
       res.status(401).json({ error: 'Missing authorization token' });
       return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token, process.env.JWT_SECRET as string);

    if (!decoded) {
     res.status(401).json({ error: 'Invalid or expired token' });

     return;
    }

    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(decoded.role)) {
      console.warn(`[authMiddleware] Access denied. Role '${decoded.role}' not in ${allowed}`);
       res.status(403).json({ error: 'Access denied' });

       return;
    }

    req.user = decoded;
    next();
  };
};

// === Export Role-Based Middlewares ===
export const userAuth = authMiddlewareFactory('user');
export const adminAuth = authMiddlewareFactory('admin');
export const doctorAuth = authMiddlewareFactory('doctor');
export const adminOrDoctorAuth = authMiddlewareFactory(['admin', 'doctor']);
export const anyRoleAuth = authMiddlewareFactory(['user', 'admin', 'doctor']);
