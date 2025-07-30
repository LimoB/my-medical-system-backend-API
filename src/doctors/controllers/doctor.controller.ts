import type { Request, Response, NextFunction } from 'express';
import {
  getDoctorsService,
  getDoctorByIdService,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
  getDoctorPatientsService,
  deleteDoctorPatientService,
} from '../services/doctor.service';
import { newDoctorSchema } from '@/validation/zodSchemas';
import { z } from 'zod';
import db from '@/drizzle/db'; // ✅ correct this path based on your project structure

import * as schema from '@/drizzle/schema';
import { eq } from 'drizzle-orm';


// 🔹 GET /api/doctors
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('[GET] /api/doctors');

  try {
    const doctors = await getDoctorsService();
    if (!doctors.length) {
      res.status(404).json({ message: 'No doctors found' });
      return;
    }
    res.status(200).json(doctors);
  } catch (error) {
    console.error('❌ getDoctors error:', error);
    next(error);
  }
};

// 🔹 GET /api/doctors/:id
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10);
  console.log(`[GET] /api/doctors/${doctorId}`);

  if (isNaN(doctorId) || doctorId <= 0) {
    res.status(400).json({ error: 'Invalid doctor ID' });
    return;
  }

  try {
    const doctor = await getDoctorByIdService(doctorId);

    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(`❌ getDoctorById error for ID ${doctorId}:`, error);
    next(error);
  }
};

// 🔹 POST /api/doctors
export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('[POST] /api/doctors with body:', req.body);

  try {
    // Validate the request body using Zod schema
    const doctorData = newDoctorSchema.parse(req.body);

    // Ensure available_days and payment_per_hour are never undefined
    const formattedDoctorData = {
      ...doctorData,
      available_days: doctorData.available_days ?? '', // Ensure available_days is always a string
      available_hours: doctorData.available_hours ?? [], // Ensure available_hours is always an array
      payment_per_hour: doctorData.payment_per_hour ?? 0, // Ensure payment_per_hour defaults to 0
      description: doctorData.description ?? '', // Ensure description is added if provided
    };

    // Pass the formatted data to the service for doctor creation
    const message = await createDoctorService(formattedDoctorData);

    // Return the success response
    res.status(201).json({ message });
  } catch (error) {
    console.error('❌ createDoctor error:', error);

    // If the error is a ZodError, return a 400 with the validation errors
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.flatten() });
    } else {
      next(error);
    }
  }
};

// 🔹 PUT /api/doctors/:id
export const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10);
  console.log(`[PUT] /api/doctors/${doctorId} with body:`, req.body);

  if (isNaN(doctorId) || doctorId <= 0) {
    res.status(400).json({ error: 'Invalid doctor ID' });
    return;
  }

  try {
    // Use .partial() to allow partial updates, so missing fields are not required
    const parsedDoctor = newDoctorSchema.partial().parse(req.body);

    // Ensure available_days is always a string
    if (parsedDoctor.available_days && typeof parsedDoctor.available_days !== 'string') {
      throw new Error('available_days should be a string');
    }

    // Handle available_hours as an array if provided
    if (parsedDoctor.available_hours && !Array.isArray(parsedDoctor.available_hours)) {
      throw new Error('available_hours should be an array');
    }

    // Ensure description is correctly handled
    const message = await updateDoctorService(doctorId, parsedDoctor);
    res.status(200).json({ message });
  } catch (error) {
    console.error(`❌ updateDoctor error for ID ${doctorId}:`, error);

    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.flatten() });
    } else {
      next(error);
    }
  }
};

// 🔹 DELETE /api/doctors/:id
export const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10);
  console.log(`[DELETE] /api/doctors/${doctorId}`);

  if (isNaN(doctorId) || doctorId <= 0) {
    res.status(400).json({ error: 'Invalid doctor ID' });
    return;
  }

  try {
    const deleted = await deleteDoctorService(doctorId);

    if (deleted) {
      res.status(200).json({ message: 'Doctor deleted successfully' });
    } else {
      res.status(404).json({ message: 'Doctor not found or not deleted' });
    }
  } catch (error) {
    console.error(`❌ deleteDoctor error for ID ${doctorId}:`, error);
    next(error);
  }
};


// 🔹 GET /api/doctors/:id/patients




export const getDoctorPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const currentUser = req.user;

  console.log(
    `[GET] /api/doctor/patients requested by user ${currentUser?.userId} (${currentUser?.role})`
  );

  if (!currentUser?.userId) {
    res.status(401).json({ error: 'Unauthorized: user ID missing' });
    return;
  }

  try {
    const doctor = await db.query.doctors.findFirst({
      where: eq(schema.doctors.user_id, currentUser.userId),
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor profile not found.' });
      return;
    }

    const patients = await getDoctorPatientsService(doctor.doctor_id);

    if (!patients || patients.length === 0) {
      res.status(404).json({ message: 'No patients found for this doctor.' });
      return;
    }

    res.status(200).json(patients);
  } catch (error) {
    console.error(
      `❌ Error fetching patients for doctor userId ${currentUser.userId}:`,
      error
    );
    next(error);
  }
};



// 🔹 DELETE /api/doctor/patients/:patientId
export const deleteDoctorPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const currentUser = req.user;
  const patientId = Number(req.params.patientId);

  console.log(
    `[DELETE] /api/doctor/patients/${patientId} requested by doctor user ${currentUser?.userId}`
  );

  if (!currentUser?.userId) {
    res.status(401).json({ error: 'Unauthorized: user ID missing' });
    return;
  }

  if (!patientId || isNaN(patientId)) {
    res.status(400).json({ error: 'Invalid patient ID' });
    return;
  }

  try {
    const doctor = await db.query.doctors.findFirst({
      where: eq(schema.doctors.user_id, currentUser.userId),
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor profile not found' });
      return;
    }

    // Use the service to delete appointment history for this doctor-patient
    const deleted = await deleteDoctorPatientService(doctor.doctor_id, patientId);

    if (!deleted) {
      res.status(404).json({ message: 'No matching patient records to delete' });
      return;
    }

    res.status(200).json({ message: 'Patient records deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting patient ${patientId} for doctor ${currentUser.userId}:`, error);
    next(error);
  }
};
