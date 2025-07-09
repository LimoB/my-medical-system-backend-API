import db from './db'
import { payments } from './schema'
import { randomUUID } from 'crypto'

// Replace these with actual appointment IDs from your DB
const appointmentIds = [1, 2, 3] // 🔁 Adjust based on real data

async function seedPaymentsOnly() {
  try {
    // Optional: clean up existing payments
    await db.delete(payments)

    // Insert payment records
    await db.insert(payments).values([
      {
        appointment_id: appointmentIds[0],
        amount: '100.00',
        payment_status: 'Paid',
        transaction_id: randomUUID(),
        payment_method: 'mpesa',
      },
      {
        appointment_id: appointmentIds[1],
        amount: '120.00',
        payment_status: 'Pending',
        transaction_id: randomUUID(),
        payment_method: 'stripe',
      },
      {
        appointment_id: appointmentIds[2],
        amount: '150.00',
        payment_status: 'Failed',
        transaction_id: randomUUID(),
        payment_method: 'cash',
      },
    ])

    console.log('✅ Payments seeded successfully.')
  } catch (error) {
    console.error('❌ Error seeding payments:', error)
  }
}

seedPaymentsOnly()
