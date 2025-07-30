import express from 'express'
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByUserId,
} from '@/payments/payment.controller'

import { adminAuth, anyRoleAuth } from '@/middleware/bearAuth'
import { createCheckoutSession } from './pay.controller'
import { handleStripeWebhook } from './webhook.controller'

import validate from '@/middleware/validate'
import { newPaymentSchema, } from '@/validation/zodSchemas'//checkoutSchema

const paymentRouter = express.Router()

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
paymentRouter.get('/payments', adminAuth, getPayments)

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
paymentRouter.get('/payments/:id', anyRoleAuth, getPaymentById)


// 🔹 GET /payments/user/:userId — fetch all payments for that user
paymentRouter.get('/payments/user/:userId', anyRoleAuth, getPaymentsByUserId);


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
paymentRouter.post('/payments', adminAuth, validate({ body: newPaymentSchema }), createPayment)

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
paymentRouter.put('/payments/:id', adminAuth, validate({ body: newPaymentSchema.partial() }), updatePayment)

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
paymentRouter.delete('/payments/:id', adminAuth, deletePayment)

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Create a Stripe checkout session
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
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: Invalid input or missing data
 *       500:
 *         description: Internal server error
 */
paymentRouter.post('/checkout', createCheckoutSession)  // anyRoleAuth, validate({body:checkoutSchema}),

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Stripe webhook event object
 *     responses:
 *       200:
 *         description: Webhook event received and processed
 *       400:
 *         description: Invalid Stripe signature or event format
 *       500:
 *         description: Failed to record payment
 */
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

export default paymentRouter
