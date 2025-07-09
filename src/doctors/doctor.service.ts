import { eq, desc, isNull } from 'drizzle-orm'; import db from '@/drizzle/db';
import { users, doctors } from '@/drizzle/schema';
import type { TDoctorInsert, SanitizedDoctor } from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';

// 🔹 Get all doctors — includes users with role 'doctor' but may not yet have doctor profile

// 🔹 Get all doctors — includes users with role 'doctor'
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
        desc(users.updated_at),        // ✅ fallback ordering
        desc(users.created_at),
        desc(users.user_id),          // ✅ ensures latest registered are prioritized
      ],
    });

    return result.map((user): SanitizedDoctor => {
      const doctor = user.doctor;

      return {
        doctor_id: doctor?.doctor_id ?? 0,
        user_id: user.user_id,
        specialization: doctor?.specialization ?? '',
        available_days: doctor?.available_days ?? '',
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

    return {
      doctor_id: doctor.doctor_id,
      user_id: doctor.user_id,
      specialization: doctor.specialization,
      available_days: doctor.available_days ?? '',
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

    const result = await db.insert(doctors).values(doctor).returning();

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

    const result = await db
      .update(doctors)
      .set(updates)
      .where(eq(doctors.doctor_id, doctorId))
      .returning();

    if (result.length === 0) {
      throw new Error('Doctor update failed or doctor not found');
    }

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
