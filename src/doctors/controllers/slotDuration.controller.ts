import { Request, Response, NextFunction } from 'express';
import { getSlotDurationService } from '@/doctors/services/getSlotDuration.service';
import { updateSlotDurationService } from '../services/updateSlotDuration.service';

/**
 * GET /doctors/:doctorId/slot-duration
 * Returns the appointment slot duration (in minutes) for a specific doctor.
 */
export const getSlotDurationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = parseInt(req.params.doctorId);

    if (isNaN(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    const slotDuration = await getSlotDurationService(doctorId);

    return res.status(200).json({ doctorId, slotDuration });
  } catch (error) {
    next(error);
  }
};


export const updateSlotDurationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const { slotDuration } = req.body;

    const updated = await updateSlotDurationService(doctorId, slotDuration);

    res.status(200).json({
      message: 'Slot duration updated',
      doctorId,
      newSlotDuration: updated,
    });
  } catch (err) {
    next(err);
  }
};