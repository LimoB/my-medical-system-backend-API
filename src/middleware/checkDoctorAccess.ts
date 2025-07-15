import type { Request, Response, NextFunction } from 'express';
import db from '@/drizzle/db';
import { doctors } from '@/drizzle/schema';

export const checkDoctorAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    console.warn('[checkDoctorAccess] ❌ No user found in request.');
    return res.status(401).json({ error: 'Unauthorized: No user in request' });
  }

  const doctorIdParam = Number(req.params.id);
  if (isNaN(doctorIdParam)) {
    console.warn('[checkDoctorAccess] ❌ Invalid doctor ID in route params:', req.params.id);
    return res.status(400).json({ error: 'Invalid doctor ID parameter' });
  }

  console.log('[checkDoctorAccess] 🔐 Authenticated user:', user);
  console.log('[checkDoctorAccess] 🔍 Requested doctor_id:', doctorIdParam);

  // ✅ Admins can access any doctor’s patients
  if (user.role === 'admin') {
    console.log('[checkDoctorAccess] ✅ Access granted for admin.');
    return next();
  }

  if (user.role === 'doctor') {
    try {
      const doctor = await db.query.doctors.findFirst({
        where: (d, { eq }) => eq(d.user_id, user.userId),
      });

      if (!doctor) {
        console.warn(`[checkDoctorAccess] ❌ No doctor profile found for userId: ${user.userId}`);
        return res.status(404).json({ error: 'Doctor profile not found' });
      }

      console.log('[checkDoctorAccess] 🩺 Matched doctor:', doctor);

      if (doctor.doctor_id !== doctorIdParam) {
        console.warn('[checkDoctorAccess] ❌ Doctor trying to access someone else’s data.');
        return res.status(403).json({ error: 'Access denied: You can only access your own data' });
      }

      console.log('[checkDoctorAccess] ✅ Access granted for doctor.');
      return next();
    } catch (err) {
      console.error('[checkDoctorAccess] 💥 Error during doctor lookup:', err);
      return res.status(500).json({ error: 'Internal server error while verifying access' });
    }
  }

  console.warn('[checkDoctorAccess] ❌ Unauthorized role trying to access doctor data:', user.role);
  return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
};
