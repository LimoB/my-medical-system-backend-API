import express from 'express'
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '@/payments/payment.controller'

import { adminAuth, anyRoleAuth } from '@/middleware/bearAuth'

const paymentRouter = express.Router()

// Admin or doctor
paymentRouter.get('/payments', adminAuth)
paymentRouter.get('/payments/:id', anyRoleAuth)

// Admin or system-level process
paymentRouter.post('/payments', adminAuth)
paymentRouter.put('/payments/:id', adminAuth)
paymentRouter.delete('/payments/:id', adminAuth)

export default paymentRouter
