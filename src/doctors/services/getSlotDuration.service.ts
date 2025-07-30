// src/doctors/services/getSlotDuration.service.ts
import db from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { doctors } from '@/drizzle/schema';
import { AppError } from '@/utils/AppError'; // or wherever you defined AppError

/**
 * Fetch the slot duration (in minutes) for a specific doctor.
 * Falls back to 60 minutes if undefined.
 */
export const getSlotDurationService = async (
  doctorId: number
): Promise<number> => {
  if (!doctorId || doctorId <= 0) {
    throw new AppError(400, 'Invalid doctor ID');
  }

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctorId),
    columns: {
      slot_duration_minutes: true,
    },
  });

  if (!doctor) {
    throw new AppError(404, 'Doctor not found');
  }

  return doctor.slot_duration_minutes ?? 60;
};
