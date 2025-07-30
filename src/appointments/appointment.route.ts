import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentsByUser,
  getAppointmentsByDoctor,
} from './controllers/appointment.controller';

import { rescheduleAppointment } from './controllers/rescheduleAppointment.controller';
import { getAvailableSlots } from './controllers/getAvailableSlots.controller';
import { getBulkAvailabilityController } from '@/appointments/controllers/getBulkAvailabilityController';

import {
  adminAuth,
  anyRoleAuth,
  adminOrDoctorAuth,
  doctorAuth,
} from '@/middleware/bearAuth';

import validate from '@/middleware/validate';
import {
  newAppointmentSchema,
  updateAppointmentStatusSchema,
} from '@/validation/zodSchemas';

const appointmentsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/* ============================================================================
   🔹 ADMIN ROUTES
============================================================================ */

// Get all appointments (Admin only)
appointmentsRouter.get(
  '/appointments',
  adminAuth,
  logAccess('GET /appointments'),
  getAppointments
);

// Delete appointment (Admin only)
appointmentsRouter.delete(
  '/appointments/:id',
  adminAuth,
  logAccess('DELETE /appointments/:id'),
  deleteAppointment
);


/* ============================================================================
   🔹 DOCTOR ROUTES
============================================================================ */

// Get appointments for logged-in doctor
appointmentsRouter.get(
  '/appointments/doctor',
  doctorAuth,
  logAccess('GET /appointments/doctor'),
  getAppointmentsByDoctor
);


/* ============================================================================
   🔹 SHARED ROUTES (Admin, Doctor, User)
============================================================================ */

// Get appointment by ID
appointmentsRouter.get(
  '/appointments/:id',
  anyRoleAuth,
  logAccess('GET /appointments/:id'),
  getAppointmentById
);

// Get appointments by user ID
appointmentsRouter.get(
  '/appointments/user/:userId',
  anyRoleAuth,
  logAccess('GET /appointments/user/:userId'),
  getAppointmentsByUser
);

// Create appointment
appointmentsRouter.post(
  '/appointments',
  anyRoleAuth,
  validate({ body: newAppointmentSchema }),
  logAccess('POST /appointments'),
  createAppointment
);

// Update appointment status (Admin or assigned doctor)
appointmentsRouter.put(
  '/appointments/:id/status',
  adminOrDoctorAuth,
  validate({ body: updateAppointmentStatusSchema }),
  logAccess('PUT /appointments/:id/status'),
  updateAppointmentStatus
);

// Reschedule appointment
appointmentsRouter.put(
  '/appointments/:id/reschedule',
  anyRoleAuth,
  validate({ body: newAppointmentSchema }), // consider using a `rescheduleSchema`
  logAccess('PUT /appointments/:id/reschedule'),
  rescheduleAppointment
);

// Get available time slots for a doctor
appointmentsRouter.get(
  '/available-slots/:doctorId/:date',
  anyRoleAuth,
  logAccess('GET /available-slots/:doctorId/:date'),
  getAvailableSlots
);


appointmentsRouter.get(
  '/availability-status',
  logAccess('GET /availability-status'),
  getBulkAvailabilityController
);

/* ============================================================================
   🔹 Utility Middleware
============================================================================ */

function logAccess(route: string) {
  return (req: any, res: any, next: any) => {
    console.log(`Accessing ${route} by user:`, req.user);
    next();
  };
}

export default appointmentsRouter;
