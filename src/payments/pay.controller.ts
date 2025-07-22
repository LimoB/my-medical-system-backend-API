import { stripe } from './stripe';
import type { Request, Response } from 'express';
import db from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { appointments } from '@/drizzle/schema';

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.body;

    // 🔒 Validate appointment ID
    if (!appointmentId) {
      res.status(400).json({ error: 'Missing appointmentId in request body' });
      return;
    }

    // 🔍 Fetch the appointment from DB
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointment_id, appointmentId));

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (!appointment.total_amount) {
      res.status(400).json({ error: 'Appointment has no total amount specified' });
      return;
    }

    // 💳 Create Stripe Checkout session
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
      success_url: `${process.env.FRONTEND_URL}/user/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancel`,
    });

    // ✅ Return the Stripe Checkout URL
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] Checkout Session Error:', error);
    res.status(500).json({ error: 'Failed to create Stripe Checkout session' });
  }
};
