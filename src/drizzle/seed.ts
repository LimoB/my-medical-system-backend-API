import db from './db' // your drizzle DB instance
import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema'
import { randomUUID } from 'crypto'

async function seed() {
  // ===== DELETE EXISTING DATA =====
  // Delete in order of foreign key dependencies to avoid constraint violations
  await db.delete(complaints)
  await db.delete(payments)
  await db.delete(prescriptions)
  await db.delete(appointments)
  await db.delete(doctors)
  await db.delete(users)

  // ===== INSERT USERS =====
  const insertedUsers = await db.insert(users).values([
    {
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice@example.com',
      password: 'password123',
      contact_phone: '555-0101',
      address: '123 Main St',
      role: 'user',
      is_verified: true,
    },
    {
      first_name: 'Dr. Bob',
      last_name: 'Brown',
      email: 'bob@example.com',
      password: 'securepass',
      contact_phone: '555-0202',
      address: '456 Doctor St',
      role: 'doctor',
      is_verified: true,
    },
    {
      first_name: 'Dr. Charlie',
      last_name: 'Clark',
      email: 'charlie@example.com',
      password: 'anotherpass',
      contact_phone: '555-0404',
      address: '789 Clinic Ave',
      role: 'doctor',
      is_verified: true,
    },
    {
      first_name: 'Dr. Dana',
      last_name: 'Davis',
      email: 'dana@example.com',
      password: 'mypassword',
      contact_phone: '555-0505',
      address: '101 Hospital Rd',
      role: 'doctor',
      is_verified: true,
    },
    {
      first_name: 'Admin',
      last_name: 'Smith',
      email: 'admin@example.com',
      password: 'adminpass',
      contact_phone: '555-0606',
      address: '111 Admin Ln',
      role: 'admin',
      is_verified: true,
    },
  ]).returning()

  // ===== INSERT DOCTORS =====
  const insertedDoctors = await db.insert(doctors).values([
    {
      user_id: insertedUsers[1].user_id, // Dr. Bob
      specialization: 'Cardiology',
      available_days: 'Monday,Wednesday,Friday',
    },
    {
      user_id: insertedUsers[2].user_id, // Dr. Charlie
      specialization: 'Dermatology',
      available_days: 'Tuesday,Thursday',
    },
    {
      user_id: insertedUsers[3].user_id, // Dr. Dana
      specialization: 'Pediatrics',
      available_days: 'Monday,Tuesday,Thursday',
    },
  ]).returning()

  // ===== INSERT APPOINTMENTS =====
  const insertedAppointments = await db.insert(appointments).values([
    {
      user_id: insertedUsers[0].user_id,
      doctor_id: insertedDoctors[0].doctor_id,
      appointment_date: '2025-07-10',
      time_slot: '09:00:00',
      total_amount: '100.00',
      appointment_status: 'Confirmed',
    },
    {
      user_id: insertedUsers[0].user_id,
      doctor_id: insertedDoctors[1].doctor_id,
      appointment_date: '2025-07-12',
      time_slot: '14:00:00',
      total_amount: '120.00',
      appointment_status: 'Pending',
    },
    {
      user_id: insertedUsers[0].user_id,
      doctor_id: insertedDoctors[2].doctor_id,
      appointment_date: '2025-07-15',
      time_slot: '10:30:00',
      total_amount: '150.00',
      appointment_status: 'Cancelled',
    },
  ]).returning()

  // ===== INSERT PRESCRIPTIONS =====
  await db.insert(prescriptions).values([
    {
      appointment_id: insertedAppointments[0].appointment_id,
      doctor_id: insertedDoctors[0].doctor_id,
      patient_id: insertedUsers[0].user_id,
      notes: 'Take one tablet daily.',
    },
    {
      appointment_id: insertedAppointments[1].appointment_id,
      doctor_id: insertedDoctors[1].doctor_id,
      patient_id: insertedUsers[0].user_id,
      notes: 'Apply cream twice a day.',
    },
    {
      appointment_id: insertedAppointments[2].appointment_id,
      doctor_id: insertedDoctors[2].doctor_id,
      patient_id: insertedUsers[0].user_id,
      notes: 'Rest and hydrate well.',
    },
  ])

  // ===== INSERT PAYMENTS =====
  await db.insert(payments).values([
    {
      appointment_id: insertedAppointments[0].appointment_id,
      amount: '100.00',
      payment_status: 'Paid',
      transaction_id: randomUUID(),
    },
    {
      appointment_id: insertedAppointments[1].appointment_id,
      amount: '120.00',
      payment_status: 'Pending',
      transaction_id: randomUUID(),
    },
    {
      appointment_id: insertedAppointments[2].appointment_id,
      amount: '150.00',
      payment_status: 'Failed',
      transaction_id: randomUUID(),
    },
  ])

  // ===== INSERT COMPLAINTS =====
  await db.insert(complaints).values([
    {
      user_id: insertedUsers[0].user_id,
      related_appointment_id: insertedAppointments[0].appointment_id,
      subject: 'Late Appointment',
      description: 'Doctor was 30 minutes late.',
      status: 'Open',
    },
    {
      user_id: insertedUsers[0].user_id,
      related_appointment_id: insertedAppointments[1].appointment_id,
      subject: 'Unclear Prescription',
      description: 'Instructions were unclear.',
      status: 'In Progress',
    },
    {
      user_id: insertedUsers[0].user_id,
      related_appointment_id: insertedAppointments[2].appointment_id,
      subject: 'Payment Failure',
      description: 'Payment failed despite funds.',
      status: 'Resolved',
    },
  ])

  console.log('✅ Seeding complete')
}

seed().catch(console.error)
