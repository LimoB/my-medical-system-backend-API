import { eq, desc, isNull } from 'drizzle-orm';
import db from '@/drizzle/db';
import { users, doctors } from '@/drizzle/schema';
import type { TDoctorInsert, SanitizedDoctor } from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';
// 🔹 Get all doctors — includes users with role 'doctor' but may not yet have doctor profile
// 🔹 Get all doctors — includes users with role 'doctor' but may not yet have doctor profile
export const getDoctorsService = async (): Promise<SanitizedDoctor[]> => {
  try {
    const result = await db.query.users.findMany({
      where: eq(users.role, 'doctor'),
      with: {
        doctor: {
          with: {
            appointments: {
              with: {
                user: true,
                complaints: true,
                payments: true,
              },
            },
            prescriptions: {
              with: {
                patient: true,
                appointment: true,
              },
            },
          },
        },
      },
      orderBy: [
        desc(users.updated_at), // fallback ordering
        desc(users.created_at),
        desc(users.user_id), // ensures latest registered are prioritized
      ],
    });

    return result.map((user): SanitizedDoctor => {
      const doctor = user.doctor;

      // Ensure available_hours is always an array
      const available_hours = Array.isArray(doctor?.available_hours)
        ? doctor?.available_hours
        : [];

      // Ensure payment_per_hour is a number (default to 0 if undefined)
      const payment_per_hour = typeof doctor?.payment_per_hour === 'number'
        ? doctor?.payment_per_hour
        : 0;

      return {
        doctor_id: doctor?.doctor_id ?? 0,
        user_id: user.user_id,
        specialization: doctor?.specialization ?? '',
        available_days: doctor?.available_days ?? '',
        available_hours, // Ensure this is included as an array
        payment_per_hour, // Add payment per hour
        description: doctor?.description ?? '', // Add description field
        created_at: doctor?.created_at ?? null,
        updated_at: doctor?.updated_at ?? null,
        user: sanitizeUser(user),
        appointments:
          doctor?.appointments?.map((appt) => ({
            ...appt,
            user: appt.user ? sanitizeUser(appt.user) : undefined,
            complaints: appt.complaints,
            payments: appt.payments,
          })) ?? [],
        prescriptions:
          doctor?.prescriptions?.map((presc) => ({
            ...presc,
            patient: presc.patient ? sanitizeUser(presc.patient) : undefined,
            appointment: presc.appointment,
          })) ?? [],
      };
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    throw new Error('Unable to fetch doctors');
  }
};
// 🔹 Get doctor by ID
export const getDoctorByIdService = async (
  doctorId: number
): Promise<SanitizedDoctor | null> => {
  try {
    if (!doctorId || doctorId <= 0) throw new Error('Invalid doctor ID');

    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.doctor_id, doctorId),
      with: {
        user: true,
        appointments: {
          with: {
            user: true,
            complaints: true,
            payments: true,
          },
        },
        prescriptions: {
          with: {
            patient: true,
            appointment: true,
          },
        },
      },
    });

    if (!doctor) return null;

    // Ensure available_hours is always an array
    const available_hours = Array.isArray(doctor?.available_hours)
      ? doctor?.available_hours
      : [];

    // Ensure payment_per_hour is a number (default to 0 if undefined)
    const payment_per_hour = typeof doctor?.payment_per_hour === 'number'
      ? doctor?.payment_per_hour
      : 0;

    return {
      doctor_id: doctor.doctor_id,
      user_id: doctor.user_id,
      specialization: doctor.specialization,
      available_days: doctor.available_days ?? '',
      available_hours, // Ensure this is included as an array
      payment_per_hour, // Add payment per hour
      description: doctor.description ?? '', // Add description field
      created_at: doctor.created_at,
      updated_at: doctor.updated_at,
      user: doctor.user ? sanitizeUser(doctor.user) : undefined,
      appointments:
        doctor.appointments?.map((appt) => ({
          ...appt,
          user: appt.user ? sanitizeUser(appt.user) : undefined,
          complaints: appt.complaints,
          payments: appt.payments,
        })) ?? [],
      prescriptions:
        doctor.prescriptions?.map((presc) => ({
          ...presc,
          patient: presc.patient ? sanitizeUser(presc.patient) : undefined,
          appointment: presc.appointment,
        })) ?? [],
    };
  } catch (error) {
    console.error(`❌ Error fetching doctor with ID ${doctorId}:`, error);
    throw new Error('Unable to fetch doctor');
  }
};





// 🔹 Create new doctor
export const createDoctorService = async (
  doctor: TDoctorInsert
): Promise<string> => {
  try {
    // Ensure user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.user_id, doctor.user_id),
    });

    if (!userExists) {
      throw new Error(`User with ID ${doctor.user_id} does not exist`);
    }

    // Optional: prevent duplicates
    const alreadyDoctor = await db.query.doctors.findFirst({
      where: eq(doctors.user_id, doctor.user_id),
    });

    if (alreadyDoctor) {
      throw new Error('Doctor profile already exists for this user');
    }

    // Ensure role is set to 'doctor'
    if (userExists.role !== 'doctor') {
      await db
        .update(users)
        .set({ role: 'doctor' })
        .where(eq(users.user_id, doctor.user_id));
    }

    // Validate required fields for doctor profile
    if (!doctor.specialization || !doctor.available_days || !doctor.payment_per_hour) {
      throw new Error('Doctor profile is incomplete. Please provide specialization, available days, and payment per hour.');
    }

    // Ensure that specialization, available days, and payment per hour are not empty or invalid
    if (doctor.specialization.trim() === "" || doctor.available_days.trim() === "" || doctor.payment_per_hour <= 0) {
      throw new Error("Doctor profile contains invalid data. Ensure all fields are filled correctly.");
    }

    // Optional: Set default values if some fields are missing
    const doctorData = {
      ...doctor,
      available_days: doctor.available_days || 'Not Available', // Default value for available_days
      available_hours: doctor.available_hours || [], // Default empty array for available_hours
      payment_per_hour: doctor.payment_per_hour || 0, // Default payment per hour if not provided
    };

    // Insert the new doctor record without specifying doctor_id (let the database handle the ID)
    const result = await db.insert(doctors).values(doctorData).returning();

    if (result.length === 0) {
      throw new Error('Doctor creation failed');
    }

    return 'Doctor created successfully!';
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
    throw new Error(error instanceof Error ? error.message : 'Unable to create doctor');
  }
};


// 🔹 Update doctor
export const updateDoctorService = async (
  doctorId: number,
  updates: Partial<TDoctorInsert>
): Promise<string> => {
  try {
    if (!doctorId || doctorId <= 0) throw new Error('Invalid doctor ID');

    console.log('Received update for doctorId:', doctorId);
    console.log('Updates being applied:', updates);  // This will log the data being passed

    // Validate and clean data if needed
    if (updates.available_days && typeof updates.available_days === 'string') {
      updates.available_days = updates.available_days.trim();
    }

    if (updates.available_hours && Array.isArray(updates.available_hours)) {
      updates.available_hours = updates.available_hours.filter(hour => typeof hour === 'string');
    }

    if (updates.payment_per_hour && typeof updates.payment_per_hour === 'number') {
      updates.payment_per_hour = Math.max(0, updates.payment_per_hour);  // Ensure non-negative
    }

    // Log the final updates
    console.log('Final updates:', updates);

    // Ensure that there are changes to be updated
    if (Object.keys(updates).length === 0) {
      console.log('No updates provided, skipping database query');
      return 'No changes to update.';
    }

    // Perform the update query
    const result = await db
      .update(doctors)
      .set(updates)
      .where(eq(doctors.doctor_id, doctorId))
      .returning();

    // Check if the doctor was updated
    if (result.length === 0) {
      console.error('No doctor updated, check doctor_id:', doctorId);
      throw new Error('Doctor update failed or doctor not found');
    }

    console.log('Doctor updated successfully:', result[0]);

    return 'Doctor updated successfully!';
  } catch (error) {
    console.error(`❌ Error updating doctor with ID ${doctorId}:`, error);
    throw new Error('Unable to update doctor');
  }
};

// 🔹 Delete doctor
export const deleteDoctorService = async (
  doctorId: number
): Promise<boolean> => {
  try {
    if (!doctorId || doctorId <= 0) throw new Error('Invalid doctor ID');

    const result = await db
      .delete(doctors)
      .where(eq(doctors.doctor_id, doctorId))
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error(`❌ Error deleting doctor with ID ${doctorId}:`, error);
    throw new Error('Unable to delete doctor');
  }
};
