import { Request, Response, NextFunction } from 'express';
import { getDoctorAvailabilityService } from '@/doctors/services/getDoctorAvailabilityService';
import db from '@/drizzle/db';

export const getBulkAvailabilityController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const date = req.query.date as string;

  console.log(`[GET] /api/appointments/availability-status?date=${date}`);

  if (!date || typeof date !== 'string' || isNaN(Date.parse(date))) {
    res.status(400).json({ error: 'Invalid or missing date query parameter' });
    return;
  }

  try {
    const doctors = await db.query.doctors.findMany({
      columns: { doctor_id: true },
    });

    const availabilityResults = await Promise.all(
      doctors.map(async ({ doctor_id }) => {
        try {
          const availability = await getDoctorAvailabilityService(doctor_id, date);

          return {
            doctorId: doctor_id,
            fullyBooked: availability.fullyBooked,
          };
        } catch (err) {
          console.warn(`Skipping doctor ${doctor_id} due to error:`, err);
          return {
            doctorId: doctor_id,
            fullyBooked: false, // fallback assumption
          };
        }
      })
    );

    res.status(200).json(availabilityResults);
  } catch (error) {
    console.error('❌ Error fetching bulk doctor availability:', error);
    next(error);
  }
};
