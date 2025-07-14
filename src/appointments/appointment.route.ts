import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentsByUser, // ✅ new controller
} from './appointment.controller';

import {
  adminAuth,
  userAuth,
  doctorAuth,
  anyRoleAuth,
  adminOrDoctorAuth,
} from '@/middleware/bearAuth';

import validate from '@/middleware/validate';
import { newAppointmentSchema, updateAppointmentStatusSchema } from '@/validation/zodSchemas';

const appointmentsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

// 🔹 Get all appointments (Admin only)
appointmentsRouter.get(
  '/appointments',
  adminAuth,
  (req, res, next) => {
    console.log('Accessing GET /appointments by user:', req.user);
    next();
  },
  getAppointments
);

// 🔹 Get appointment by ID (Admin, user who booked, or doctor)
appointmentsRouter.get(
  '/appointments/:id',
  anyRoleAuth,
  (req, res, next) => {
    console.log('Accessing GET /appointments/:id by user:', req.user);
    next();
  },
  getAppointmentById
);

// 🔹 Create appointment (Authenticated user/doctor)
appointmentsRouter.post(
  '/appointments',
  anyRoleAuth,
  validate({ body: newAppointmentSchema }),
  (req, res, next) => {
    console.log('Creating appointment by user:', req.user);
    next();
  },
  createAppointment
);

// 🔹 Update appointment status (Admin or doctor assigned)
appointmentsRouter.put(
  '/appointments/:id/status',
  adminOrDoctorAuth,
  validate({ body: updateAppointmentStatusSchema }),
  (req, res, next) => {
    console.log('Updating status by user:', req.user);
    next();
  },
  updateAppointmentStatus
);

// 🔹 Delete appointment (Admin only)
appointmentsRouter.delete(
  '/appointments/:id',
  adminAuth,
  (req, res, next) => {
    console.log('Deleting appointment by user:', req.user);
    next();
  },
  deleteAppointment
);

// 🔹 Get appointments by user ID (Admin or the user themself)
appointmentsRouter.get(
  '/appointments/user/:userId',
  anyRoleAuth,
  (req, res, next) => {
    console.log(`Accessing GET /appointments/user/${req.params.userId} by:`, req.user);
    next();
  },
  getAppointmentsByUser
);

export default appointmentsRouter;
