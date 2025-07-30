import express from 'express';
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '@/prescriptions/prescription.controller';


import { getPrescriptionsByUserId } from '@/prescriptions/prescription.controller';


import { adminAuth, doctorAuth, anyRoleAuth, adminOrDoctorAuth } from '@/middleware/bearAuth';
import validate from '@/middleware/validate';
import { newPrescriptionSchema } from '@/validation/zodSchemas';

const prescriptionRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management
 */

/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Get all prescriptions (doctor only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 *       403:
 *         description: Forbidden
 */
prescriptionRouter.get('/prescriptions', adminOrDoctorAuth, getPrescriptions);


/**
 * @swagger
 * /prescriptions/user/{userId}:
 *   get:
 *     summary: Get prescriptions by user ID (admin, doctor, or that user)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prescriptions found
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: No prescriptions found
 */
prescriptionRouter.get('/prescriptions/user/:userId', anyRoleAuth, getPrescriptionsByUserId);


/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID (any logged-in user — doctor, admin, or patient)
 *     tags: [Prescriptions]
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
 *         description: Prescription found
 *       403:
 *         description: Unauthorized or forbidden
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.get('/prescriptions/:id', anyRoleAuth, getPrescriptionById);

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create a new prescription (doctor only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medication
 *               - dosage
 *             properties:
 *               patientId:
 *                 type: string
 *               medication:
 *                 type: string
 *               dosage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created
 *       403:
 *         description: Forbidden
 */
prescriptionRouter.post('/prescriptions', doctorAuth, validate({body:newPrescriptionSchema}), createPrescription);

/**
 * @swagger
 * /prescriptions/{id}:
 *   put:
 *     summary: Update a prescription (doctor only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               medication:
 *                 type: string
 *               dosage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.put('/prescriptions/:id', doctorAuth, validate({body:newPrescriptionSchema.partial()}), updatePrescription);

/**
 * @swagger
 * /prescriptions/{id}:
 *   delete:
 *     summary: Delete a prescription (admin only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Prescription deleted
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.delete('/prescriptions/:id', adminAuth, deletePrescription);

export default prescriptionRouter;
