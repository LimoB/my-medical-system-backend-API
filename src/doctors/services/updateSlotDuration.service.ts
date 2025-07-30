import db from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { doctors } from '@/drizzle/schema';
import { AppError } from '@/utils/AppError';

export const updateSlotDurationService = async (
  doctorId: number,
  slotDuration: number
): Promise<number> => {
  if (!doctorId || doctorId <= 0) {
    throw new AppError(400, 'Invalid doctor ID');
  }

  if (![30, 60].includes(slotDuration)) {
    throw new AppError(400, 'Slot duration must be 30 or 60 minutes');
  }

  const result = await db
    .update(doctors)
    .set({ slot_duration_minutes: slotDuration })
    .where(eq(doctors.doctor_id, doctorId));

  if (result.rowCount === 0) {
    throw new AppError(404, 'Doctor not found');
  }
  console.log(typeof db.update); // Should NOT be undefined

  return slotDuration;
};
