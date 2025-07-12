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
type UserRole = 'user' | 'admin' | 'doctor';

// === Token Payload ===
type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  exp?: number;
};

// === Generate 6-digit verification code ===
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// === Generate Access Token ===
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: StringValue = '1h'
): string => {
  const options: SignOptions = { expiresIn };
  console.log(`[signToken] Signing token for userId=${payload.userId} with expiry=${expiresIn}`);
  return jwt.sign(payload, secret, options);
};

// === Generate Refresh Token ===
export const signRefreshToken = (
  payload: Pick<DecodedToken, 'userId' | 'email' | 'role'>,
  secret: string,
  expiresIn: StringValue = '7d'
): string => {
  const options: SignOptions = { expiresIn };
  console.log(`[signRefreshToken] Signing refresh token for userId=${payload.userId} with expiry=${expiresIn}`);
  return jwt.sign(payload, secret, options);
};

// === Verify Access Token ===
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    const decodedRaw = jwt.verify(token, secret) as any;
    console.log('[verifyToken] Raw decoded token:', decodedRaw);

    const userIdRaw = decodedRaw.userId ?? decodedRaw.id;
    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

    const decoded: DecodedToken = {
      userId: userId,
      email: decodedRaw.email,
      role: decodedRaw.role,
      exp: decodedRaw.exp,
    };

    if (
      typeof decoded.userId !== 'number' ||
      !decoded.email ||
      !decoded.role
    ) {
      console.error('[verifyToken] Token missing required fields:', decodedRaw);
      return null;
    }

    console.log('[verifyToken] Normalized decoded token:', decoded);
    return decoded;
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
    const decodedRaw = jwt.verify(token, secret) as any;
    console.log('[verifyRefreshToken] Raw decoded refresh token:', decodedRaw);

    const userIdRaw = decodedRaw.userId ?? decodedRaw.id;
    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

    const decoded: DecodedToken = {
      userId: userId,
      email: decodedRaw.email,
      role: decodedRaw.role,
      exp: decodedRaw.exp,
    };

    if (
      typeof decoded.userId !== 'number' ||
      !decoded.email ||
      !decoded.role
    ) {
      console.error('[verifyRefreshToken] Refresh token missing required fields:', decodedRaw);
      return null;
    }

    console.log('[verifyRefreshToken] Normalized decoded refresh token:', decoded);
    return decoded;
  } catch (err) {
    console.error('[verifyRefreshToken] ❌ Invalid or expired refresh token:', err);
    return null;
  }
};

// === Auth Middleware Factory ===
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('[authMiddleware] Authorization header is missing');
      res.status(401).json({ error: 'Authorization header is missing' });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('[authMiddleware] Extracted token:', token);

    const decoded = verifyToken(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      console.log('[authMiddleware] Token verification failed');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    console.log('[authMiddleware] Decoded token:', decoded);

    const { role } = decoded;
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    console.log('[authMiddleware] Allowed roles:', allowed);

    if (!allowed.includes(role)) {
      console.log(`[authMiddleware] Access denied: user role '${role}' not in allowed roles`);
      res.status(403).json({ error: 'Access denied: insufficient role' });
      return;
    }

    req.user = decoded;
    next();
  };
};

// === Exported Role Middleware ===
export const userAuth = authMiddlewareFactory('user');
export const adminAuth = authMiddlewareFactory('admin');
export const doctorAuth = authMiddlewareFactory('doctor');
export const adminOrDoctorAuth = authMiddlewareFactory(['admin', 'doctor']);
export const anyRoleAuth = authMiddlewareFactory(['user', 'admin', 'doctor']);
