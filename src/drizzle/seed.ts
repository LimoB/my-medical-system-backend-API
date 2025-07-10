import db from './db';
import { createDoctorService } from '@/doctors/doctor.service';  // Adjust path to the service
import { users } from '@/drizzle/schema';  // Import the users table
import { doctors } from '@/drizzle/schema';  // Import the doctors table
import { eq } from 'drizzle-orm';

// Predefined list of doctors to be seeded
const doctorsData = [
  {
    user_id: 6,  // Dr. Bob Brown
    specialization: 'Cardiologist',
    available_days: 'Monday, Wednesday, Friday',
    available_hours: ['09:00', '10:00', '11:00'],
    payment_per_hour: 150,
  },
  {
    user_id: 7,  // Dr. Charlie Clark
    specialization: 'Pediatrician',
    available_days: 'Tuesday, Thursday',
    available_hours: ['08:00', '09:00', '10:00'],
    payment_per_hour: 120,
  },
  {
    user_id: 8,  // Dr. Dana Davis
    specialization: 'Dermatologist',
    available_days: 'Monday, Wednesday, Friday',
    available_hours: ['10:00', '11:00', '12:00'],
    payment_per_hour: 100,
  },
  {
    user_id: 12,  // Dr. Limo Boaz
    specialization: 'Orthopedic Surgeon',
    available_days: 'Tuesday, Thursday',
    available_hours: ['14:00', '15:00', '16:00'],
    payment_per_hour: 180,
  },
  {
    user_id: 14,  // Dr. Rofine Achieng
    specialization: 'Neurologist',
    available_days: 'Monday, Wednesday',
    available_hours: ['08:00', '09:00', '10:00'],
    payment_per_hour: 200,
  },
  {
    user_id: 15,  // Dr. Boaz Limo15
    specialization: 'General Practitioner',
    available_days: 'Monday, Friday',
    available_hours: ['09:00', '10:00', '11:00'],
    payment_per_hour: 120,
  },
  {
    user_id: 18,  // Dr. Joseph Mwangaza
    specialization: 'Psychiatrist',
    available_days: 'Monday, Thursday',
    available_hours: ['10:00', '11:00', '12:00'],
    payment_per_hour: 250,
  },
  {
    user_id: 21,  // Dr. Dominic Kosgei
    specialization: 'Surgeon',
    available_days: 'Tuesday, Thursday',
    available_hours: ['08:00', '09:00', '10:00'],
    payment_per_hour: 220,
  },
];

const seedDatabase = async () => {
  try {
    // Step 1: Delete all existing doctors from the table (optional: could filter by user_id)
    await db.delete(doctors).where(eq(doctors.user_id, 0)); // Deletes all doctors with user_id 0, can refine this filter if needed

    console.log('Existing doctors deleted.');

    // Step 2: Loop through each doctor and create the doctor profile
    for (const doctor of doctorsData) {
      // Check if the doctor already exists in the database
      const existingDoctor = await db.query.doctors.findFirst({
        where: eq(doctors.user_id, doctor.user_id),
      });

      if (existingDoctor) {
        console.log(`Doctor with user_id ${doctor.user_id} already exists.`);
        continue; // Skip if doctor exists
      }

      // Create the doctor profile
      await createDoctorService(doctor);
      console.log(`Successfully created doctor with user_id ${doctor.user_id}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    // Type guard to check if it's an instance of Error
    if (error instanceof Error) {
      console.error('❌ Error during seeding:', error.message);
    } else {
      console.error('❌ Unknown error during seeding');
    }
  }
};

// Call the seed function to populate the database
seedDatabase();
