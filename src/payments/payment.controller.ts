import { Request, Response, NextFunction } from 'express'
import {
  getPaymentsService,
  getPaymentByIdService,
  createPaymentService,
  updatePaymentService,
  deletePaymentService,
} from '@/payments/payment.service'

// GET /api/payments
export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payments = await getPaymentsService()
    res.status(200).json(payments)
  } catch (error) {
    console.error('Error in getPayments:', error)
    next(error)
  }
}

// GET /api/payments/:id
export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const paymentId = parseInt(req.params.id, 10)

  if (isNaN(paymentId)) {
    res.status(400).json({ error: 'Invalid payment ID' })
    return
  }

  try {
    const payment = await getPaymentByIdService(paymentId)
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' })
      return
    }

    res.status(200).json(payment)
  } catch (error) {
    console.error('Error in getPaymentById:', error)
    next(error)
  }
}

// POST /api/payments
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await createPaymentService(req.body)
    res.status(201).json({ message })
  } catch (error) {
    console.error('Error in createPayment:', error)
    next(error)
  }
}

// PUT /api/payments/:id
export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const paymentId = parseInt(req.params.id, 10)

  if (isNaN(paymentId)) {
    res.status(400).json({ error: 'Invalid payment ID' })
    return
  }

  try {
    const message = await updatePaymentService(paymentId, req.body)
    res.status(200).json({ message })
  } catch (error) {
    console.error('Error in updatePayment:', error)
    next(error)
  }
}

// DELETE /api/payments/:id
export const deletePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const paymentId = parseInt(req.params.id, 10)

  if (isNaN(paymentId)) {
    res.status(400).json({ error: 'Invalid payment ID' })
    return
  }

  try {
    const deleted = await deletePaymentService(paymentId)
    if (deleted) {
      res.status(200).json({ message: 'Payment deleted successfully' })
    } else {
      res.status(404).json({ message: 'Payment not found' })
    }
  } catch (error) {
    console.error('Error in deletePayment:', error)
    next(error)
  }
}
