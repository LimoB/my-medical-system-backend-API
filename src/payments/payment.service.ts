import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { payments } from '@/drizzle/schema'
import type {
  TPaymentInsert,
  SanitizedPayment,
} from '@/drizzle/types'
import { sanitizeUser } from '@/utils/sanitize'

// 🔹 Get all payments with appointment + doctor & user (sanitized)
export const getPaymentsService = async (): Promise<SanitizedPayment[]> => {
  try {
    const result = await db.query.payments.findMany({
      with: {
        appointment: {
          with: {
            doctor: true,
            user: true,
          },
        },
      },
    })

    const sanitized = result.map((payment) => ({
      ...payment,
      appointment: {
        ...payment.appointment,
        doctor: payment.appointment.doctor
          ? sanitizeUser(payment.appointment.doctor)
          : undefined,
        user: payment.appointment.user
          ? sanitizeUser(payment.appointment.user)
          : undefined,
      },
    }))

    return sanitized
  } catch (error) {
    console.error('Error fetching payments:', error)
    throw new Error('Unable to fetch payments')
  }
}

// 🔹 Get payment by ID with appointment + doctor & user (sanitized)
export const getPaymentByIdService = async (
  paymentId: number
): Promise<SanitizedPayment | null> => {
  try {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.payment_id, paymentId),
      with: {
        appointment: {
          with: {
            doctor: true,
            user: true,
          },
        },
      },
    })

    if (!payment) return null

    const sanitized: SanitizedPayment = {
      ...payment,
      appointment: {
        ...payment.appointment,
        doctor: payment.appointment.doctor
          ? sanitizeUser(payment.appointment.doctor)
          : undefined,
        user: payment.appointment.user
          ? sanitizeUser(payment.appointment.user)
          : undefined,
      },
    }

    return sanitized
  } catch (error) {
    console.error(`Error fetching payment with ID ${paymentId}:`, error)
    throw new Error('Unable to fetch payment by ID')
  }
}

// 🔹 Create a payment
export const createPaymentService = async (
  data: TPaymentInsert
): Promise<string> => {
  try {
    const result = await db.insert(payments).values(data).returning()
    if (result.length > 0) {
      return 'Payment created successfully!'
    }
    throw new Error('Payment creation failed')
  } catch (error) {
    console.error('Error creating payment:', error)
    throw new Error('Unable to create payment')
  }
}

// 🔹 Update a payment
export const updatePaymentService = async (
  paymentId: number,
  data: Partial<TPaymentInsert>
): Promise<string> => {
  try {
    const result = await db
      .update(payments)
      .set(data)
      .where(eq(payments.payment_id, paymentId))
      .returning()

    if (result.length > 0) {
      return 'Payment updated successfully!'
    }
    throw new Error('Payment update failed or payment not found')
  } catch (error) {
    console.error(`Error updating payment with ID ${paymentId}:`, error)
    throw new Error('Unable to update payment')
  }
}

// 🔹 Delete a payment
export const deletePaymentService = async (
  paymentId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(payments)
      .where(eq(payments.payment_id, paymentId))
      .returning()

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting payment with ID ${paymentId}:`, error)
    throw new Error('Unable to delete payment')
  }
}
