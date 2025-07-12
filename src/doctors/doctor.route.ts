import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from './doctor.controller';
import { adminAuth } from '@/middleware/bearAuth';
import validate from '@/middleware/validate';
import { newDoctorSchema } from '@/validation/zodSchemas';

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

export default doctorRouter;
