import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { appointments, payments, doctors, users } from '@/drizzle/schema';
import type {
  TPaymentInsert,
  
} from '@/types'

import type { SanitizedPayment } from '@/utils/sanitize';

import { sanitizeUser, } from '@/utils/sanitize'

// 🔹 Get all payments with appointment + doctor & user (sanitized)
export const getPaymentsService = async (): Promise<SanitizedPayment[]> => {
  try {
    const result = await db.query.payments.findMany({
      with: {
        appointment: {
          with: {
            user: true,
            doctor: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    return result.map((payment) => ({
      ...payment,
      appointment: payment.appointment && {
        ...payment.appointment,
        user: payment.appointment.user
          ? sanitizeUser(payment.appointment.user)
          : undefined,
        doctor: payment.appointment.doctor ?? undefined,
        doctor_user: payment.appointment.doctor?.user
          ? sanitizeUser(payment.appointment.doctor.user)
          : undefined,
      },
    }));
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    throw new Error('Unable to fetch payments');
  }
};

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
            user: true,
            doctor: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) return null;

    return {
      ...payment,
      appointment: payment.appointment && {
        ...payment.appointment,
        user: payment.appointment.user
          ? sanitizeUser(payment.appointment.user)
          : undefined,
        doctor: payment.appointment.doctor ?? undefined,
        doctor_user: payment.appointment.doctor?.user
          ? sanitizeUser(payment.appointment.doctor.user)
          : undefined,
      },
    };
  } catch (error) {
    console.error(`❌ Error fetching payment with ID ${paymentId}:`, error);
    throw new Error('Unable to fetch payment by ID');
  }
};

// 🔹 Create a payment
export const createPaymentService = async (
  data: TPaymentInsert
): Promise<string> => {
  try {
    const result = await db.insert(payments).values(data).returning()
    if (result.length > 0) {
      return '✅ Payment created successfully!'
    }
    throw new Error('Payment creation failed')
  } catch (error) {
    console.error('❌ Error creating payment:', error)
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
      return '✅ Payment updated successfully!'
    }
    throw new Error('Payment update failed or payment not found')
  } catch (error) {
    console.error(`❌ Error updating payment with ID ${paymentId}:`, error)
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
    console.error(`❌ Error deleting payment with ID ${paymentId}:`, error)
    throw new Error('Unable to delete payment')
  }
}



// 🔹 Get payments by user ID (for logged-in patients to view their history)
import {
 
  users as usersTable,
  
} from '@/drizzle/schema';
import { alias } from 'drizzle-orm/pg-core';

//  Helper to sanitize payment results deeply
const sanitizePaymentDeep = (payment: any): SanitizedPayment => ({
  ...payment,
  appointment: payment.appointment
    ? {
        ...payment.appointment,
        user: payment.appointment.user ? sanitizeUser(payment.appointment.user) : undefined,
        doctor: payment.appointment.doctor ?? undefined,
        doctor_user: payment.appointment.doctor_user
          ? sanitizeUser(payment.appointment.doctor_user)
          : undefined,
      }
    : undefined,
});

export const getPaymentsByUserIdService = async (
  userId: number,
  limit = 50,
  offset = 0
): Promise<SanitizedPayment[]> => {
  const doctorUserAlias = alias(users, 'doctor_user');

  try {
    console.time('🔍 getPaymentsByUserIdService');
    const result = await db
      .select({
        payment: payments,
        appointment: appointments,
        patient: users,
        doctor: doctors,
        doctor_user: doctorUserAlias,
      })
      .from(payments)
      .leftJoin(appointments, eq(payments.appointment_id, appointments.appointment_id))
      .leftJoin(users, eq(appointments.user_id, users.user_id))
      .leftJoin(doctors, eq(appointments.doctor_id, doctors.doctor_id))
      .leftJoin(doctorUserAlias, eq(doctors.user_id, doctorUserAlias.user_id))
      .where(eq(appointments.user_id, userId))
      .limit(limit)
      .offset(offset);

    console.timeEnd('🔍 getPaymentsByUserIdService');

    if (!result.length) return [];

    return result.map(({ payment, appointment, patient, doctor, doctor_user }) =>
      sanitizePaymentDeep({
        ...payment,
        appointment: appointment
          ? {
              ...appointment,
              user: patient ?? undefined,
              doctor: doctor ?? undefined,
              doctor_user: doctor_user ?? undefined,
            }
          : undefined,
      })
    );
  } catch (error) {
    console.error(`❌ Error fetching payments for user ID ${userId}:`, error);
    throw new Error('Unable to fetch user payments');
  }
};
