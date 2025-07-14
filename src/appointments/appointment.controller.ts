import { Request, Response, NextFunction } from 'express';
import {
  getAllAppointmentsService,
  getAppointmentByIdService,
  createAppointmentService,
  updateAppointmentStatusService,
  deleteAppointmentService,
  getAppointmentsByUserIdService,
} from './appointment.service';

// 🔹 GET /api/appointments - Admin only
export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('GET /api/appointments hit');

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const appointments = await getAllAppointmentsService();
    if (!appointments || appointments.length === 0) {
      res.status(404).json({ message: 'No appointments found' });
      return;
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getAppointmentsController:', error);
    next(error);
  }
};

// 🔹 GET /api/appointments/:id - Admin or owner (user who booked or doctor assigned)
export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const appointmentId = parseInt(req.params.id, 10);
  console.log(`GET /api/appointments/${req.params.id} hit`);

  if (isNaN(appointmentId)) {
    res.status(400).json({ error: 'Invalid appointment ID' });
    return;
  }

  try {
    const appointment = await getAppointmentByIdService(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    // Access control: admin OR appointment user OR appointment doctor
    const userId = req.user?.userId?.toString();
    if (
      req.user?.role !== 'admin' &&
      userId !== appointment.user?.user_id?.toString() &&
      userId !== appointment.doctor?.doctor_id?.toString()
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error in getAppointmentByIdController:', error);
    next(error);
  }
};

// 🔹 GET /api/appointments/user/:userId - Admin or the user themself
export const getAppointmentsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestedUserId = parseInt(req.params.userId, 10);
  console.log(`GET /api/appointments/user/${requestedUserId} hit`);
  console.log('[getAppointmentsByUser] Authenticated user:', req.user);

  if (isNaN(requestedUserId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const userId = req.user?.userId;

    if (req.user?.role !== 'admin' && userId !== requestedUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const appointments = await getAppointmentsByUserIdService(requestedUserId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getAppointmentsByUserController:', error);
    next(error);
  }
};

// 🔹 POST /api/appointments - Authenticated users (user or doctor)
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const appointmentData = req.body;
  console.log('POST /api/appointments hit with:', appointmentData);

  if (
    !appointmentData.user_id ||
    !appointmentData.doctor_id ||
    !appointmentData.appointment_date ||
    !appointmentData.time_slot
  ) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const appointment = await createAppointmentService(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error in createAppointmentController:', error);
    next(error);
  }
};

// 🔹 PUT /api/appointments/:id/status - Admin or doctor assigned
export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const appointmentId = parseInt(req.params.id, 10);
  const { status } = req.body;
  console.log(`PUT /api/appointments/${req.params.id}/status hit with:`, status);

  if (isNaN(appointmentId)) {
    res.status(400).json({ error: 'Invalid appointment ID' });
    return;
  }

  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  try {
    const appointment = await getAppointmentByIdService(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    if (
      req.user?.role !== 'admin' &&
      req.user?.userId !== appointment.doctor?.doctor_id
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const message = await updateAppointmentStatusService(appointmentId, status);
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in updateAppointmentStatusController:', error);
    next(error);
  }
};

// 🔹 DELETE /api/appointments/:id - Admin only
export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const appointmentId = parseInt(req.params.id, 10);
  console.log(`DELETE /api/appointments/${req.params.id} hit`);

  if (isNaN(appointmentId)) {
    res.status(400).json({ error: 'Invalid appointment ID' });
    return;
  }

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const deleted = await deleteAppointmentService(appointmentId);
    if (deleted) {
      res.status(200).json({ message: 'Appointment deleted successfully' });
    } else {
      res.status(404).json({ message: 'Appointment not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Error in deleteAppointmentController:', error);
    next(error);
  }
};
