import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { payments } from '@/drizzle/schema'
import type { TPaymentInsert, TPaymentSelect } from '@/drizzle/types'

// Get all payments
export const getPaymentsService = async (): Promise<TPaymentSelect[]> => {
  try {
    const result = await db.query.payments.findMany()
    return result
  } catch (error) {
    console.error('Error fetching payments:', error)
    throw new Error('Unable to fetch payments')
  }
}

// Get payment by ID
export const getPaymentByIdService = async (
  paymentId: number
): Promise<TPaymentSelect | null> => {
  try {
    const result = await db.query.payments.findFirst({
      where: eq(payments.payment_id, paymentId),
    })
    return result ?? null
  } catch (error) {
    console.error(`Error fetching payment with ID ${paymentId}:`, error)
    throw new Error('Unable to fetch payment by ID')
  }
}

// Create payment
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

// Update payment
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

// Delete payment
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
