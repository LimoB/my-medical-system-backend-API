import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  deleteDoctorPatient,
} from './controllers/doctor.controller';
import { adminAuth, adminOrDoctorAuth, doctorAuth } from '@/middleware/bearAuth';
import validate from '@/middleware/validate';
import { newDoctorSchema } from '@/validation/zodSchemas';
import { getDoctorAvailability } from './controllers/getDoctorAvailability.controller';
import {
  getSlotDurationController,
  updateSlotDurationController,
} from './controllers/slotDuration.controller';

const doctorRouter = express.Router();

// Get all doctors
doctorRouter.get('/doctors', getDoctors);

// Get a doctor by ID
doctorRouter.get('/doctors/:id', getDoctorById);

// Create a new doctor (admin only)
doctorRouter.post(
  '/doctors',
  adminAuth,
  validate({ body: newDoctorSchema }),
  createDoctor
);

// Update doctor info (admin only)
doctorRouter.put(
  '/doctors/:id',
<<<<<<< HEAD
  // adminAuth,
=======

 
>>>>>>> 4321b48 (cash fix)
  validate({ body: newDoctorSchema.partial() }),
  updateDoctor
);

// Delete a doctor (admin only)
doctorRouter.delete('/doctors/:id', adminAuth, deleteDoctor);

// Get patients for a doctor (admin or own doctor only)
doctorRouter.get('/doctor/patients', adminOrDoctorAuth, getDoctorPatients);

// Delete a doctor's patient history
doctorRouter.delete(
  '/doctors/patients/:patientUserId',
  adminOrDoctorAuth,
  deleteDoctorPatient
);

// Get doctor's available time slots for a specific date
doctorRouter.get('/doctors/:id/availability', getDoctorAvailability);

// Get doctor's slot duration (in minutes)
doctorRouter.get(
  '/doctors/:doctorId/slot-duration',
  adminOrDoctorAuth,
  getSlotDurationController
);

// Update slot duration (doctor only)
doctorRouter.put(
  '/doctors/:doctorId/slot-duration',
  doctorAuth,
  updateSlotDurationController
);

export default doctorRouter;
