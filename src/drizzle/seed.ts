// // seed.ts
// import { db } from './db'; // Make sure this points to your drizzle db instance
// import {
//   users,
//   doctors,
//   appointments,
//   consultations,
// } from './schema'; // Adjust to correct schema path

// // import { faker } from '@faker-js/faker';

// async function seed() {
//   // Seed Users
//   await db.insert(users).onConflictDoNothing().values([
//     {
//       user_id: 5,
//       first_name: 'Jane',
//       last_name: 'Doe',
//       email: 'janedoe@example.com',
//       password: 'hashedpassword123',
//       role: 'user',
//       is_verified: true,
//     },
//     {
//       user_id: 18,
//       first_name: 'Dr.',
//       last_name: 'Smith',
//       email: 'drsmith@example.com',
//       password: 'hashedpassword456',
//       role: 'doctor',
//       is_verified: true,
//     },
//   ]);

//   // Seed Doctor (linked to user 18)
//   await db.insert(doctors).onConflictDoNothing().values({
//     doctor_id: 18,
//     user_id: 18,
//     specialization: 'General Medicine',
//     available_days: 'Monday,Wednesday,Friday',
//     available_hours: ['09:00', '17:00'],
//     payment_per_hour: 5000,
//     description: 'Experienced general practitioner',
//     slot_duration_minutes: 30,
//   });

//   // Seed Completed Appointments
//   await db.insert(appointments).onConflictDoNothing().values([
//     {
//       appointment_id: 101,
//       user_id: 5,
//       doctor_id: 18,
//       appointment_date: new Date('2025-07-25'),
//       time_slot: '09:00',
//       total_amount: '1000.00',
//       appointment_status: 'Completed',
//       payment_per_hour: '5000.00',
//       payment_method: 'cash',
//     },
//     {
//       appointment_id: 102,
//       user_id: 5,
//       doctor_id: 18,
//       appointment_date: new Date('2025-07-26'),
//       time_slot: '10:30',
//       total_amount: '1000.00',
//       appointment_status: 'Completed',
//       payment_per_hour: '5000.00',
//       payment_method: 'cash',
//     },
//     {
//       appointment_id: 103,
//       user_id: 5,
//       doctor_id: 18,
//       appointment_date: new Date('2025-07-27'),
//       time_slot: '11:15',
//       total_amount: '1000.00',
//       appointment_status: 'Completed',
//       payment_per_hour: '5000.00',
//       payment_method: 'cash',
//     },
//   ]);

//   // Seed Consultations
//   await db.insert(consultations).values([
//     {
//       appointment_id: 101,
//       doctor_id: 18,
//       patient_id: 5,
//       symptoms: 'Headache, nausea',
//       observation: 'Patient shows mild dehydration',
//       prescription: 'Panadol, fluids',
//       reference_code: 'CONS-101',
//       consultation_date: new Date('2025-07-25'),
//       diagnosis: 'Migraine',
//       treatment_plan: 'Rest, hydration, and Panadol for 5 days',
//       additional_notes: 'Follow up if symptoms persist',
//       duration_minutes: 30,
//       consultation_type: 'initial',
//       status: 'Completed',
//     },
//     {
//       appointment_id: 102,
//       doctor_id: 18,
//       patient_id: 5,
//       symptoms: 'Cough, sore throat',
//       observation: 'Slight redness in throat',
//       prescription: 'Cough syrup and warm fluids',
//       reference_code: 'CONS-102',
//       consultation_date: new Date('2025-07-26'),
//       diagnosis: 'Common cold',
//       treatment_plan: 'Syrup, hydration, rest',
//       additional_notes: '',
//       duration_minutes: 20,
//       consultation_type: 'follow-up',
//       status: 'Completed',
//     },
//     {
//       appointment_id: 103,
//       doctor_id: 18,
//       patient_id: 5,
//       symptoms: 'Stomach pain',
//       observation: 'Tenderness in lower abdomen',
//       prescription: 'Antacids and light diet',
//       reference_code: 'CONS-103',
//       consultation_date: new Date('2025-07-27'),
//       diagnosis: 'Acid reflux',
//       treatment_plan: 'Avoid spicy food, take meds',
//       additional_notes: 'Review after 1 week',
//       duration_minutes: 25,
//       consultation_type: 'review',
//       status: 'Completed',
//     },
//   ]);

//   console.log('✅ Seeded users, doctor, appointments, and consultations.');
// }

// seed().catch((err) => {
//   console.error('❌ Seed error:', err);
//   process.exit(1);
// });
