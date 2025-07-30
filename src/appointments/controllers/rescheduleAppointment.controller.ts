import type { Request, Response, NextFunction } from 'express';
import { rescheduleAppointmentService } from '@/appointments/rescheduleAppointment.service';

export const rescheduleAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const appointmentId = parseInt(req.params.id, 10);
    const { newDate, newTimeSlot } = req.body;
    const user = req.user;

    if (isNaN(appointmentId)) {
        res.status(400).json({ error: 'Invalid appointment ID' });
        return;
    }

    if (!newDate || !newTimeSlot) {
        res.status(400).json({ error: 'Missing newDate or newTimeSlot in body' });
        return;
    }

    if (!user?.userId || !user?.role) {
        res.status(401).json({ error: 'Unauthorized: Missing user information' });
        return;
    }

    try {
        const updated = await rescheduleAppointmentService({
            appointmentId,
            newDate,
            newTimeSlot,
            userId: user.userId,
        });


        res.status(200).json({
            message: 'Appointment rescheduled successfully',
            appointment: updated,
        });
    } catch (error) {
        console.error('Error in rescheduleAppointmentController:', error);
        next(error);
    }
};
