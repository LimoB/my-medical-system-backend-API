// drizzle/seed.ts
import db  from './db';
import {
  users,
  doctors,
  appointments,
  prescriptions,
  payments,
  complaints,
} from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  // === USERS ===
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        firstname: 'Alice',
        lastname: 'Walker',
        email: 'alice@example.com',
        password: 'hashedpassword1',
        contact_phone: '0712345678',
        address: '123 Health St.',
        role: 'user',
        is_verified: true,
      },
      {
        firstname: 'Bob',
        lastname: 'Smith',
        email: 'bob@example.com',
        password: 'hashedpassword2',
        contact_phone: '0798765432',
        address: '456 Wellness Ave.',
        role: 'admin',
        is_verified: false,
      },
    ])
    .returning();

  // === DOCTORS ===
  const insertedDoctors = await db
    .insert(doctors)
    .values([
      {
        first_name: 'Dr. John',
        last_name: 'Doe',
        specialization: 'Cardiology',
        contact_phone: '0700000001',
        available_days: 'Mon,Tue,Fri',
      },
      {
        first_name: 'Dr. Jane',
        last_name: 'Roe',
        specialization: 'Dermatology',
        contact_phone: '0700000002',
        available_days: 'Wed,Thu',
      },
    ])
    .returning();

  // === APPOINTMENTS ===
 const insertedAppointments = await db
  .insert(appointments)
  .values([
    {
      user_id: insertedUsers[0].user_id,
      doctor_id: insertedDoctors[0].doctor_id,
      appointment_date: '2025-07-01', // as string
      time_slot: '10:00:00',
      total_amount: '150.00',
      appointment_status: 'Confirmed',
    },
    {
      user_id: insertedUsers[0].user_id,
      doctor_id: insertedDoctors[1].doctor_id,
      appointment_date: '2025-07-02', // as string
      time_slot: '14:00:00',
      total_amount: '200.00',
      appointment_status: 'Pending',
    },
  ])
  .returning();


  // === PRESCRIPTIONS ===
  await db.insert(prescriptions).values([
    {
      appointment_id: insertedAppointments[0].appointment_id,
      doctor_id: insertedDoctors[0].doctor_id,
      patient_id: insertedUsers[0].user_id,
      notes: 'Take 1 tablet daily',
    },
    {
      appointment_id: insertedAppointments[1].appointment_id,
      doctor_id: insertedDoctors[1].doctor_id,
      patient_id: insertedUsers[0].user_id,
      notes: 'Apply cream twice a day',
    },
  ]);

  // === PAYMENTS ===
  await db.insert(payments).values([
    {
      appointment_id: insertedAppointments[0].appointment_id,
      amount: '150.00',
      payment_status: 'Paid',
    },
    {
      appointment_id: insertedAppointments[1].appointment_id,
      amount: '200.00',
      payment_status: 'Pending',
    },
  ]);

  // === COMPLAINTS ===
  await db.insert(complaints).values([
    {
      user_id: insertedUsers[0].user_id,
      related_appointment_id: insertedAppointments[0].appointment_id,
      subject: 'Late Appointment',
      description: 'The doctor was late for the appointment.',
      status: 'Open',
    },
    {
      user_id: insertedUsers[0].user_id,
      related_appointment_id: insertedAppointments[1].appointment_id,
      subject: 'Overcharged',
      description: 'I was charged more than expected.',
      status: 'In Progress',
    },
  ]);

  console.log('✅ Seed data inserted successfully');
}

seed().catch((err) => {
  console.error('❌ Error seeding database:', err);
});
