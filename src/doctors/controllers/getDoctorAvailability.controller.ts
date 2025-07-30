import { Request, Response, NextFunction } from 'express';
import { getDoctorAvailabilityService } from '@/doctors/services/getDoctorAvailabilityService';

export const getDoctorAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10);
  const date = req.query.date as string;

  console.log(`[GET] /api/doctors/${doctorId}/availability?date=${date}`);

  // Validate doctor ID
  if (isNaN(doctorId) || doctorId <= 0) {
    res.status(400).json({ error: 'Invalid doctor ID' });
    return;
  }

  // Validate date
  if (!date || typeof date !== 'string' || isNaN(Date.parse(date))) {
    res.status(400).json({ error: 'Invalid or missing date query parameter' });
    return;
  }

  try {
    const { availableSlots, fullyBooked } = await getDoctorAvailabilityService(doctorId, date);

    const status = fullyBooked ? 'Fully Booked' : 'Available';

    res.status(200).json({
      date,
      doctorId,
      availableSlots,
      status,
    });
  } catch (error) {
    console.error(`❌ Error fetching availability for doctor ${doctorId} on ${date}:`, error);
    next(error);
  }
};
