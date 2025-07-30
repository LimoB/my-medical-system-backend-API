import type { Request, Response, NextFunction } from 'express';
import {
  createConsultationService,
  getAllConsultationsService,
  getConsultationsByDoctorIdService,
  getConsultationsByPatientIdService,
  getConsultationByIdService,
  getConsultationByAppointmentIdService,
  deleteConsultationService,
} from './consultation.service';

// 🔹 POST /api/consultations - Doctor only
export const createConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role;
    if (role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctor only.' });
    }

    const data = req.body;

    if (!data || !data.appointment_id || !data.doctor_id || !data.patient_id || !data.diagnosis) {
      return res.status(400).json({ error: 'Missing required consultation fields' });
    }

    // 🛠️ Ensure consultation_date is a string (ISO) if provided
    if (data.consultation_date && data.consultation_date instanceof Date) {
      data.consultation_date = data.consultation_date.toISOString();
    } else if (data.consultation_date && typeof data.consultation_date === 'string') {
      // Valid date string – do nothing
    } else {
      data.consultation_date = new Date().toISOString(); // Fallback default
    }

    const created = await createConsultationService(data);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error in createConsultation:', err);
    next(err);
  }
};

// 🔹 GET /api/consultations - Admin only
export const getAllConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const consultations = await getAllConsultationsService();
    res.status(200).json(consultations);
  } catch (err) {
    console.error('Error in getAllConsultations:', err);
    next(err);
  }
};

// 🔹 GET /api/consultations/doctor - Doctor only
export const getDoctorConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctor only.' });
    }

    const consultations = await getConsultationsByDoctorIdService(userId);
    res.status(200).json(consultations);
  } catch (err) {
    console.error('Error in getDoctorConsultations:', err);
    next(err);
  }
};

// 🔹 GET /api/consultations/patient/:id - Patient or Admin
export const getPatientConsultations = async (req: Request, res: Response, next: NextFunction) => {
  const requestedId = parseInt(req.params.id, 10);
  const user = req.user;

  if (isNaN(requestedId)) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }

  try {
    if (user?.role !== 'admin' && user?.userId !== requestedId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const consultations = await getConsultationsByPatientIdService(requestedId);
    res.status(200).json(consultations);
  } catch (err) {
    console.error('Error in getPatientConsultations:', err);
    next(err);
  }
};

// 🔹 GET /api/consultations/:id - Admin, Doctor, or Patient
export const getConsultationById = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id, 10);
  const user = req.user;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid consultation ID' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  try {
    const consultation = await getConsultationByIdService(id, user.userId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const isAdmin = user.role === 'admin';
    const isDoctor = user.role === 'doctor' && consultation.doctor?.user_id === user.userId;
    const isPatient = user.role === 'user' && consultation.patient?.user_id === user.userId;

    if (!isAdmin && !isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(consultation);
  } catch (err) {
    console.error('Error in getConsultationById:', err);
    next(err);
  }
};

// 🔹 GET /api/consultations/appointment/:appointmentId - Authenticated
export const getConsultationByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const user = req.user;

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    const consultations = await getConsultationByAppointmentIdService(appointmentId);

    if (!consultations || consultations.length === 0) {
      return res.status(404).json({ message: 'Consultation not found for this appointment' });
    }

    const consultation = consultations[0];

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor' && consultation.doctor?.user_id === user.userId;
    const isPatient = user?.role === 'user' && consultation.patient?.user_id === user.userId;

    if (!isAdmin && !isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(consultation);
  } catch (err) {
    console.error('Error in getConsultationByAppointmentId:', err);
    next(err);
  }
};

// 🔹 DELETE /api/consultations/:id - Admin only
export const deleteConsultation = async (req: Request, res: Response, next: NextFunction) => {
  const consultationId = parseInt(req.params.id, 10);

  if (isNaN(consultationId)) {
    return res.status(400).json({ error: 'Invalid consultation ID' });
  }

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await deleteConsultationService(consultationId, req.user?.userId);
    if (deleted) {
      res.status(200).json({ message: 'Consultation deleted successfully' });
    } else {
      res.status(404).json({ message: 'Consultation not found' });
    }
  } catch (err) {
    console.error('Error in deleteConsultation:', err);
    next(err);
  }
};



// import type { Request, Response, NextFunction } from 'express';
import { getDoctorByUserIdService } from './consultation.service';

// 🔹 GET /api/doctors/user/:userId
export const getDoctorByUserId = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const doctor = await getDoctorByUserIdService(userId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found for the given user ID' });
    }

    res.status(200).json(doctor);
  } catch (err) {
    console.error('Error in getDoctorByUserId:', err);
    next(err);
  }
};
