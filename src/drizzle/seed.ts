// import db from './db';
// import { eq } from 'drizzle-orm';
// import { doctors, appointments, users, paymentStatusEnum, paymentMethodEnum, appointmentStatusEnum, payments } from '@/drizzle/schema';  // Ensure correct imports

// const patients = [
//   { user_id: 5, first_name: "Alice", last_name: "Anderson" },
//   { user_id: 21, first_name: "Dominic", last_name: "Kosgei" },
// ];

// const seedAppointmentsAndPayments = async () => {
//   try {
//     // Fetch all doctors
//     const allDoctors = await db.query.doctors.findMany();

//     // Loop through each doctor and create appointments
//     for (const doctor of allDoctors) {
//       // Fetch the doctor’s user record to get the first_name and last_name
//       const doctorUser = await db.query.users.findFirst({
//         where: eq(users.user_id, doctor.user_id),
//       });

//       const doctorName = `${doctorUser?.first_name} ${doctorUser?.last_name}`;
//       const availableDays = doctor.available_days.split(', ');
//       const availableHours = doctor.available_hours as string[];

//       // Fetch available patients
//       const availablePatients = patients;

//       for (const day of availableDays) {
//         for (const hour of availableHours) {
//           // Assign a random patient to this time slot
//           const patient = availablePatients[Math.floor(Math.random() * availablePatients.length)];

//           const appointmentDate = new Date();
//           appointmentDate.setDate(appointmentDate.getDate() + 7);  // Schedule 1 week from now
//           const formattedDate = appointmentDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD

//           // Create the appointment data
//           const appointmentData = {
//             user_id: patient.user_id,
//             doctor_id: doctor.doctor_id,
//             appointment_date: formattedDate,
//             time_slot: hour,
//             total_amount: (doctor.payment_per_hour * 1).toString(),  // Convert total_amount to string
//             appointment_status: appointmentStatusEnum.Pending,  // Use the enum, not string
//             payment_per_hour: doctor.payment_per_hour.toString(),  // Convert to string
//           };

//           // Insert the appointment data into the database
//           const appointment = await db.insert(appointments).values(appointmentData).returning();
//           const appointmentId = appointment[0].appointment_id;

//           console.log(`Appointment scheduled with Dr. ${doctorName} for patient ${patient.first_name} ${patient.last_name} on ${formattedDate} at ${hour}.`);

//           // Seed payment for this appointment
//           const paymentData = {
//             appointment_id: appointmentId,  // Use the actual appointment ID
//             amount: (doctor.payment_per_hour * 1).toString(),  // Convert amount to string
//             payment_status: paymentStatusEnum.Pending,  // Use the enum, not string
//             transaction_id: `txn-${Math.random().toString(36).substr(2, 9)}`,  // Generate a random transaction ID
//             payment_method: paymentMethodEnum[Math.floor(Math.random() * paymentMethodEnum.length)],  // Random payment method from the enum
//             payment_date: new Date().toISOString(),
//           };

//           // Insert the payment data into the database
//           await db.insert(payments).values(paymentData);
//           console.log(`Payment scheduled for Appointment ID: ${appointmentId} with status Pending.`);
//         }
//       }
//     }

//     console.log('Appointments and payments seeded successfully!');
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('❌ Error during appointment and payment seeding:', error.message);
//     } else {
//       console.error('❌ Unknown error during appointment and payment seeding');
//     }
//   }
// };

// // Call the function to seed appointments and payments
// seedAppointmentsAndPayments();
