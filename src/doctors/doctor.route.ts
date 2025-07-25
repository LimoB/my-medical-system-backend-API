import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} from './doctor.controller';
import { adminAuth, adminOrDoctorAuth } from '@/middleware/bearAuth';
import validate from '@/middleware/validate';
import { newDoctorSchema } from '@/validation/zodSchemas';
import { checkDoctorAccess } from '@/middleware/checkDoctorAccess';
import { deleteDoctorPatient } from './doctor.controller';





const doctorRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management endpoints
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
doctorRouter.get('/doctors', getDoctors);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor found
 *       404:
 *         description: Doctor not found
 */
doctorRouter.get('/doctors/:id', getDoctorById);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor (admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - specialization
 *             properties:
 *               user_id:
 *                 type: number
 *               specialization:
 *                 type: string
 *               available_days:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created
 *       403:
 *         description: Forbidden (admin only)
 */
doctorRouter.post(
  '/doctors',
  adminAuth,
  validate({ body: newDoctorSchema }),
  createDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor info (admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               user_id:
 *                 type: number
 *               specialization:
 *                 type: string
 *               available_days:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated
 *       404:
 *         description: Doctor not found
 */
doctorRouter.put(
  '/doctors/:id',
  adminAuth,
  validate({ body: newDoctorSchema.partial() }), // all fields optional for update
  updateDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete a doctor (admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Doctor deleted
 *       404:
 *         description: Doctor not found
 */
doctorRouter.delete('/doctors/:id', adminAuth, deleteDoctor);

/**
 * @swagger
 * /doctors/{id}/patients:
 *   get:
 *     summary: Get patients for a doctor (admin or own doctor only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients
 *       403:
 *         description: Access denied
 */
// doctor.routes.ts or wherever your doctor routes are defined
doctorRouter.get('/doctor/patients', adminOrDoctorAuth, getDoctorPatients);

/**
 * @swagger
 * /doctors/patients/{patientUserId}:
 *   delete:
 *     summary: Delete a doctor's patient history
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientUserId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Patient history deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Appointment history not found
 */
doctorRouter.delete(
  '/doctors/patients/:patientUserId',
  adminOrDoctorAuth,
  deleteDoctorPatient
);



import { getDoctorAvailability } from './getDoctorAvailability.controller'; // ⬅️ add this import

// 🔹 Route: Get doctor's available time slots on a specific date
/**
 * @swagger
 * /doctors/{id}/availability:
 *   get:
 *     summary: Get available time slots for a doctor on a given date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Available time slots for the given date
 *       400:
 *         description: Invalid doctor ID or date format
 *       404:
 *         description: Doctor not found
 */
doctorRouter.get('/doctors/:id/availability', getDoctorAvailability);





export default doctorRouter;


