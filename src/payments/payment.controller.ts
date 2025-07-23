import type { Request, Response, NextFunction } from 'express'
import {
  getPaymentsService,
  getPaymentByIdService,
  createPaymentService,
  updatePaymentService,
  deletePaymentService,
  getPaymentsByUserIdService,
} from '@/payments/payment.service'

// 🔹 GET /api/payments - Admin and doctor only
export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'doctor') {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const payments = await getPaymentsService()
    res.status(200).json(payments)
  } catch (error) {
    console.error('Error in getPayments:', error)
    next(error)
  }
}

// 🔹 GET /api/payments/:id - Admin, doctor, or owner of the appointment
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

    const userId = req.user?.userId?.toString()
    const isAdmin = req.user?.role === 'admin'
    const isDoctor = req.user?.role === 'doctor'
    const isOwner = payment.appointment?.user?.user_id?.toString() === userId

    if (!isAdmin && !isDoctor && !isOwner) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    res.status(200).json(payment)
  } catch (error) {
    console.error('Error in getPaymentById:', error)
    next(error)
  }
}

// 🔹 POST /api/payments - Admin and doctor only
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'doctor') {
    res.status(403).json({ error: 'Only doctors or admins can create payments' })
    return
  }

  try {
    const message = await createPaymentService(req.body)
    res.status(201).json({ message })
  } catch (error) {
    console.error('Error in createPayment:', error)
    next(error)
  }
}

// 🔹 PUT /api/payments/:id - Admin only
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

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Only admin can update payments' })
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

// 🔹 DELETE /api/payments/:id - Admin only
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

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Only admin can delete payments' })
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



// 🔹 GET /api/payments/user/:userId - For users to fetch their own payments, or admin

export const getPaymentsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestedUserId = parseInt(req.params.userId, 10);
  const loggedInUserId = req.user?.userId;
  const role = req.user?.role;

  // Validate user ID
  if (isNaN(requestedUserId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  // Check access control
  const isAdmin = role === 'admin';
  const isSelf = requestedUserId === loggedInUserId;

  if (!isAdmin && !isSelf) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  try {
    const payments = await getPaymentsByUserIdService(requestedUserId);
    res.status(200).json({ payments });
  } catch (error) {
    console.error(`❌ Error in getPaymentsByUserId:`, error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
