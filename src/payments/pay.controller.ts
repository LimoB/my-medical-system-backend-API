import { stripe } from './stripe'
import { Request, Response } from 'express'
import db from '@/drizzle/db'
import { eq } from 'drizzle-orm'
import { appointments } from '@/drizzle/schema'

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.body

    if (!appointmentId) {
      res.status(400).json({ error: 'appointmentId is required' })
      return
    }

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointment_id, appointmentId))

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' })
      return
    }

    if (!appointment.total_amount) {
      res.status(400).json({ error: 'Appointment does not have a total amount' })
      return
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment with Doctor ID: ${appointment.doctor_id}`,
            },
            unit_amount: Math.round(Number(appointment.total_amount) * 100), // in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointment_id: appointment.appointment_id.toString(),
        user_id: appointment.user_id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Checkout Session Error:', error)
    res.status(500).json({ error: 'Stripe checkout session creation failed' })
  }
}
