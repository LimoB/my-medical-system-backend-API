import { Request, Response, NextFunction } from 'express';
import {
  getAllAppointmentsService,
  getAppointmentByIdService,
  createAppointmentService,
  updateAppointmentStatusService,
  deleteAppointmentService,
  getAppointmentsByUserIdService,
} from './appointment.service';
// import { Request, Response, NextFunction } from 'express';
import { getAppointmentsByDoctorUserIdService } from './appointment.service';



// 🔹 GET /api/appointments/doctor - Authenticated doctor only
export const getAppointmentsByDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('GET /api/appointments/doctor hit');

  try {
    const userId = req.user?.userId; // ✅ use correct field
    const role = req.user?.role;

    if (!userId || role !== 'doctor') {
      res.status(403).json({ error: 'Access denied. Doctor access only.' });
      return;
    }

    const appointments = await getAppointmentsByDoctorUserIdService(userId);

    if (!appointments || appointments.length === 0) {
      res.status(404).json({ message: 'No appointments found for this doctor' });
      return;
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getAppointmentsByDoctorController:', error);
    next(error);
  }
};



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



// 🔹 PUT /api/appointments/:id/status - Admin or assigned doctor
// 🔹 PUT /api/appointments/:id/status - Admin or assigned doctor

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const appointmentId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const user = req.user;

  console.log(`🔄 PUT /api/appointments/${appointmentId}/status hit`);
  console.log('🧾 New Status:', status);

  // ✅ Validate ID
  if (isNaN(appointmentId)) {
    res.status(400).json({ error: 'Invalid appointment ID' });
    return;
  }

  // ✅ Validate Status
  const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  try {
    // 🔍 Fetch appointment with doctor nested
    const appointment = await getAppointmentByIdService(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    // 🔒 Authorization: only admin or assigned doctor (via doctor.user.user_id)
    const isAdmin = user?.role === 'admin';
    const isAssignedDoctor =
      user?.role === 'doctor' && user.userId === appointment.doctor?.user?.user_id;

    if (!isAdmin && !isAssignedDoctor) {
      console.warn('❌ Access denied:', {
        userId: user?.userId,
        role: user?.role,
        appointmentDoctorUserId: appointment.doctor?.user?.user_id,
      });
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // 🔄 Update status
    const message = await updateAppointmentStatusService(appointmentId, status);
    console.log(`✅ Appointment ${appointmentId} status updated to ${status}`);
    res.status(200).json({ message });
    return;
  } catch (error) {
    console.error('❌ Error in updateAppointmentStatus:', error);
    return next(error);
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
