import jwt, { SignOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken
    }
  }
}

// === ROLES ===
type UserRole = 'user' | 'admin' | 'doctor'

// === Token Payload ===
type DecodedToken = {
  userId: string
  email: string
  role: UserRole
  exp?: number
}

// === Generate 6-digit verification code ===
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// === Generate Access Token ===
export const signToken = (
  payload: DecodedToken,
  secret: string,
  expiresIn: string = '1h'
): string => {
  const options: SignOptions = { expiresIn: expiresIn as any }
  return jwt.sign(payload, secret, options)
}

// === Generate Refresh Token ===
export const signRefreshToken = (
  payload: Pick<DecodedToken, 'userId' | 'email' | 'role'>,
  secret: string,
  expiresIn: string = '7d'
): string => {
  const options: SignOptions = { expiresIn: expiresIn as any }
  return jwt.sign(payload, secret, options)
}

// === Verify Access Token ===
export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    return jwt.verify(token, secret) as DecodedToken
  } catch (err) {
    console.error('❌ Invalid or expired token:', err)
    return null
  }
}

// === Verify Refresh Token ===
export const verifyRefreshToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    return jwt.verify(token, secret) as DecodedToken
  } catch (err) {
    console.error('❌ Invalid or expired refresh token:', err)
    return null
  }
}

// === Auth Middleware Factory ===
const authMiddlewareFactory = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is missing' })
      return
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader

    const decoded = verifyToken(token, process.env.JWT_SECRET as string)
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    const { role } = decoded
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    if (!allowed.includes(role)) {
      res.status(403).json({ error: 'Access denied: insufficient role' })
      return
    }

    req.user = decoded
    next()
  }
}

// === Exported Role Middleware ===
export const userAuth = authMiddlewareFactory('user')
export const adminAuth = authMiddlewareFactory('admin')
export const doctorAuth = authMiddlewareFactory('doctor')
export const adminOrDoctorAuth = authMiddlewareFactory(['admin', 'doctor'])
export const anyRoleAuth = authMiddlewareFactory(['user', 'admin', 'doctor'])
