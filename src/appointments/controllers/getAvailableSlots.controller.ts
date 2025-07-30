import type { Request, Response, NextFunction } from 'express';
import { getAvailableSlotsService } from '@/appointments/getAvailableSlots.service';

export const getAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.doctorId, 10);
  const date = req.query.date as string;

  if (isNaN(doctorId)) {
    res.status(400).json({ error: 'Invalid doctor ID' });
    return;
  }

  if (!date) {
    res.status(400).json({ error: 'Missing appointment date (query param: date)' });
    return;
  }

  try {
    const slots = await getAvailableSlotsService(doctorId, date);
    res.status(200).json({ availableSlots: slots });
  } catch (error) {
    console.error('Error in getAvailableSlotsController:', error);
    next(error);
  }
};
