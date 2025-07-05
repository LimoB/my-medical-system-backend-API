import express from 'express'
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getMyAppointments,
} from './appointment.controller'

import {
  adminAuth,
  userAuth,
  doctorAuth,
  anyRoleAuth,
  adminOrDoctorAuth,
} from '@/middleware/bearAuth'

import validate from '@/middleware/validate'
import { newAppointmentSchema, updateAppointmentStatusSchema } from '@/validation/zodSchemas'

const appointmentsRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments (Admin only)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: A list of appointments
 */
appointmentsRouter.get(
  '/appointments',
  adminAuth,
  (req, res, next) => {
    console.log('Accessing GET /appointments by user:', req.user)
    next()
  },
  getAppointments
)


/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID (Admin or owner)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment found
 *       404:
 *         description: Appointment not found
 */
appointmentsRouter.get(
  '/appointments/:id',
  anyRoleAuth,
  (req, res, next) => {
    console.log('Accessing GET /appointments/:id by user:', req.user)
    next()
  },
  getAppointmentById
)

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment (Authenticated users)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - doctor_id
 *               - appointment_date
 *               - time_slot
 *             properties:
 *               user_id:
 *                 type: number
 *               doctor_id:
 *                 type: number
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               time_slot:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
appointmentsRouter.post(
  '/appointments',
  anyRoleAuth,
  validate({ body: newAppointmentSchema }),
  (req, res, next) => {
    console.log('Creating appointment by user:', req.user)
    next()
  },
  createAppointment
)

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status (Admin or doctor assigned)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Appointment not found
 */
appointmentsRouter.put(
  '/appointments/:id/status',
  adminOrDoctorAuth,
  validate({ body: updateAppointmentStatusSchema }),
  (req, res, next) => {
    console.log('Updating status by user:', req.user)
    next()
  },
  updateAppointmentStatus
)

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment by ID (Admin only)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
appointmentsRouter.delete(
  '/appointments/:id',
  adminAuth,
  (req, res, next) => {
    console.log('Deleting appointment by user:', req.user)
    next()
  },
  deleteAppointment
)

/**
 * @swagger
 * /appointments/me:
 *   get:
 *     summary: Get logged-in user's appointments (User only)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of user's appointments
 *       403:
 *         description: Access denied
 */
appointmentsRouter.get(
  '/appointments/me',
  userAuth,
  (req, res, next) => {
    console.log('Getting my appointments by user:', req.user)
    next()
  },
  getMyAppointments
)

export default appointmentsRouter
