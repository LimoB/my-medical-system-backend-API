import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from './appointment.controller';

const appointmentsRouter = express.Router();

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
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: A list of appointments
 */
appointmentsRouter.get('/appointments', getAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
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
appointmentsRouter.get('/appointments/:id', getAppointmentById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientName
 *               - doctorId
 *               - date
 *             properties:
 *               patientName:
 *                 type: string
 *               doctorId:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
appointmentsRouter.post('/appointments', createAppointment);

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
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
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Appointment not found
 */
appointmentsRouter.put('/appointments/:id/status', updateAppointmentStatus);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
appointmentsRouter.delete('/appointments/:id', deleteAppointment);

export default appointmentsRouter;
