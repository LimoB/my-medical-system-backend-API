import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '@/payments/payment.controller';

import { adminAuth, anyRoleAuth } from '@/middleware/bearAuth';

const paymentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment transaction management
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *       403:
 *         description: Forbidden
 */
paymentRouter.get('/payments', adminAuth, getPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a payment by ID (any authenticated user)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
paymentRouter.get('/payments/:id', anyRoleAuth, getPaymentById);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - patientId
 *               - method
 *             properties:
 *               amount:
 *                 type: number
 *               patientId:
 *                 type: string
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 *       403:
 *         description: Forbidden
 */
paymentRouter.post('/payments', adminAuth, createPayment);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update a payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *       404:
 *         description: Payment not found
 */
paymentRouter.put('/payments/:id', adminAuth, updatePayment);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Payment deleted
 *       404:
 *         description: Payment not found
 */
paymentRouter.delete('/payments/:id', adminAuth, deletePayment);

export default paymentRouter;
