import { stripe } from './stripe';
import type { Request, Response } from 'express';
import db from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { appointments } from '@/drizzle/schema';

/**
 * NOTE: Ensure this middleware exists in your main server file:
 * app.use(express.json());
 */

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('\n================= [Payment] Incoming Request =================');
    console.log('[Request Headers]:', req.headers);
    console.log('[Request Body Raw]:', req.body);

    // ✅ FULL BODY LOG
    const body = req.body;
    console.log('[Payment] Parsed Full Body:', body);

    const { appointmentId, paymentMethod } = body;

    // ✅ Ensure required fields
    if (!appointmentId || !paymentMethod) {
      console.warn('[Payment] ❌ Missing appointmentId or paymentMethod');
      res.status(400).json({ error: 'Missing appointmentId or paymentMethod in request body' });
      return;
    }

    console.log('[DB] Fetching appointment from DB for ID:', appointmentId);
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointment_id, appointmentId));

    if (!appointment) {
      console.warn('[Payment] ❌ Appointment not found for ID:', appointmentId);
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    console.log('[DB] ✅ Appointment found:', appointment);

    if (!appointment.total_amount) {
      console.warn('[Payment] ❌ Appointment has no total_amount:', appointmentId);
      res.status(400).json({ error: 'Appointment has no total amount specified' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      console.error('[Config] ❌ FRONTEND_URL environment variable is not set.');
      res.status(500).json({ error: 'Server misconfiguration: FRONTEND_URL is missing' });
      return;
    }

    // 💵 Handle Cash
    if (paymentMethod === 'cash') {
      console.log('[Payment] 💵 Cash payment selected for appointment ID:', appointmentId);

      await db
        .update(appointments)
        .set({
          payment_status: 'CashOnDelivery',
          appointment_status: 'Confirmed',
        })
        .where(eq(appointments.appointment_id, appointmentId));

      console.log('[DB] ✅ Appointment updated with CashOnDelivery and Confirmed status');

      res.status(200).json({ message: 'Cash payment selected. Pay at appointment.' });
      return;
    }

    // 💳 Handle Stripe
    if (paymentMethod === 'stripe') {
      console.log('[Stripe] 💳 Stripe payment selected. Creating session...');

      await db
        .update(appointments)
        .set({
          payment_status: 'Pending',
          appointment_status: 'Pending',
        })
        .where(eq(appointments.appointment_id, appointmentId));

      console.log('[DB] ✅ Appointment updated with Pending payment and appointment status');

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
              unit_amount: Math.round(Number(appointment.total_amount) * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          appointment_id: appointment.appointment_id.toString(),
          user_id: appointment.user_id.toString(),
        },
        success_url: `${frontendUrl}/user/payment-success`,
        cancel_url: `${frontendUrl}/user/payment-cancel`,
      });

      console.log('[Stripe] ✅ Stripe session created successfully:', {
        sessionId: session.id,
        sessionUrl: session.url,
      });

      res.status(200).json({ url: session.url });
      return;
    }

    // ❌ Handle unsupported method
    console.warn('[Payment] ❌ Unsupported payment method:', paymentMethod);
    res.status(400).json({ error: `Unsupported payment method: ${paymentMethod}` });

  } catch (error: any) {
    console.error('[Payment] ❌ Error creating checkout session:', {
      message: error.message,
      type: error.type,
      raw: error.raw,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
};
