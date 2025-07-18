import type { Request, Response } from 'express'
import { stripe } from './stripe'
import db from '@/drizzle/db'
import { payments, appointments, users } from '@/drizzle/schema'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { sendHospitalEmail } from '@/middleware/googleMailer' // adjust path if needed



export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const isDev = process.env.NODE_ENV === 'development'
    let event: Stripe.Event

    // 🌐 Webhook verification
    if (isDev) {
        event = req.body as Stripe.Event
        console.log('[DEV Webhook] 🔧 Bypassing Stripe signature check.')
    } else {
        const sig = req.headers['stripe-signature'] as string | undefined
        if (!sig) {
            console.error('[Stripe webhook error] ❌ Missing Stripe-Signature header.')
            res.status(400).send('Missing Stripe signature header')
            return
        }

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET as string
            )
        } catch (err) {
            console.error('[Stripe webhook error] ❌ Invalid signature or malformed event:', err)
            res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
            return
        }
    }

    console.log(`[Webhook] ✅ Received event: ${event.type}`)

    // 💳 Handle successful checkout
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[Webhook] 🔍 Session payload:', JSON.stringify(session, null, 2))

        try {
            const appointmentId = parseInt(session.metadata?.appointment_id || '')
            const transactionId = session.id
            const amount = (session.amount_total || 0) / 100

            if (!appointmentId || !transactionId) {
                throw new Error('Missing appointment_id or session.id')
            }

            // 🔁 Prevent duplicate insert
            const existing = await db.query.payments.findFirst({
                where: eq(payments.transaction_id, transactionId),
            })

            if (existing) {
                console.log(`[Webhook] ⚠️ Duplicate transaction ID (${transactionId}), skipping insert.`)
                res.status(200).json({ received: true, duplicate: true })
                return
            }

            // 🧾 Insert payment record
            await db.insert(payments).values({
                appointment_id: appointmentId,
                amount: amount.toFixed(2),
                payment_status: 'Paid',
                transaction_id: transactionId,
                payment_method: 'stripe', // ✅ Add your method here
                payment_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });


            // 📅 Update appointment status
            await db.update(appointments).set({
                appointment_status: 'Confirmed',
                updated_at: new Date(),
            }).where(eq(appointments.appointment_id, appointmentId))

            // 📧 Send email to user (lookup from appointment → user)
            const appointment = await db.query.appointments.findFirst({
                where: eq(appointments.appointment_id, appointmentId),
                with: {
                    user: true,
                },
            })

            if (appointment?.user) {
                const user = appointment.user

                await sendHospitalEmail(
                    user.email,
                    `${user.first_name} ${user.last_name}`,
                    '🧾 Payment Confirmation - Harmony Health Clinic',
                    `
            <p>Dear ${user.first_name},</p>
            <p>Your payment of <strong>$${amount.toFixed(2)}</strong> for appointment #${appointmentId} has been received.</p>
            <p>Your appointment is now <strong>Confirmed</strong>.</p>
          `,
                    'user'
                )
            } else {
                console.warn(`[Webhook] ⚠️ No user found for appointment ID ${appointmentId}, email not sent.`)
            }

            console.log('[Webhook] ✅ Payment recorded, appointment confirmed, email sent.')

        } catch (err) {
            console.error('[Webhook] ❌ Failed to process session.completed event:', err)
            res.status(500).json({ error: 'Webhook processing failed' })
            return
        }
    } else {
        console.log(`[Webhook] ⚠️ Unhandled event type: ${event.type}`)
    }

    // 📬 Always acknowledge receipt to Stripe
    res.status(200).json({ received: true })
}
