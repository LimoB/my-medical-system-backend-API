import { desc, isNull } from 'drizzle-orm';
import db from '@/drizzle/db';
import { eq, and } from 'drizzle-orm';
import { users, doctors, appointments } from '@/drizzle/schema';
import type { TDoctorInsert, SanitizedDoctor, DoctorPatient } from '@/types';
import { sanitizeUser } from '@/utils/sanitize';
import * as schema from '@/drizzle/schema';

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
        desc(users.updated_at),
        desc(users.created_at),
        desc(users.user_id),
      ],
    });

    return result.map((user): SanitizedDoctor => {
      const doctor = user.doctor;

      const available_hours = Array.isArray(doctor?.available_hours)
        ? doctor?.available_hours
        : [];

      const payment_per_hour = typeof doctor?.payment_per_hour === 'number'
        ? doctor?.payment_per_hour
        : 0;

      return {
        doctor_id: doctor?.doctor_id ?? 0,
        user_id: user.user_id,
        specialization: doctor?.specialization ?? '',
        available_days: doctor?.available_days ?? '',
        available_hours,
        slot_duration_minutes: doctor?.slot_duration_minutes ?? 60, // ✅ <-- add this
        payment_per_hour,
        description: doctor?.description ?? '',
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

    const available_hours = Array.isArray(doctor?.available_hours)
      ? doctor?.available_hours
      : [];

    const payment_per_hour = typeof doctor?.payment_per_hour === 'number'
      ? doctor?.payment_per_hour
      : 0;

    return {
      doctor_id: doctor.doctor_id,
      user_id: doctor.user_id,
      specialization: doctor.specialization,
      available_days: doctor.available_days ?? '',
      available_hours,
      slot_duration_minutes: doctor.slot_duration_minutes ?? 60, // ✅ Add this line
      payment_per_hour,
      description: doctor.description ?? '',
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
    const userExists = await db.query.users.findFirst({
      where: eq(users.user_id, doctor.user_id),
    });

    if (!userExists) {
      throw new Error(`User with ID ${doctor.user_id} does not exist`);
    }

    const alreadyDoctor = await db.query.doctors.findFirst({
      where: eq(doctors.user_id, doctor.user_id),
    });

    if (alreadyDoctor) {
      throw new Error('Doctor profile already exists for this user');
    }

    if (userExists.role !== 'doctor') {
      await db
        .update(users)
        .set({ role: 'doctor' })
        .where(eq(users.user_id, doctor.user_id));
    }

    if (!doctor.specialization || !doctor.available_days || !doctor.payment_per_hour) {
      throw new Error('Doctor profile is incomplete. Please provide specialization, available days, and payment per hour.');
    }

    if (doctor.specialization.trim() === "" || doctor.available_days.trim() === "" || doctor.payment_per_hour <= 0) {
      throw new Error("Doctor profile contains invalid data. Ensure all fields are filled correctly.");
    }

    const doctorData = {
      ...doctor,
      available_days: doctor.available_days || 'Not Available',
      available_hours: doctor.available_hours || [],
      payment_per_hour: doctor.payment_per_hour || 0,
    };

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
    console.log('Updates being applied:', updates);

    if (updates.available_days && typeof updates.available_days === 'string') {
      updates.available_days = updates.available_days.trim();
    }

    if (updates.available_hours && Array.isArray(updates.available_hours)) {
      updates.available_hours = updates.available_hours.filter(hour => typeof hour === 'string');
    }

    if (updates.payment_per_hour && typeof updates.payment_per_hour === 'number') {
      updates.payment_per_hour = Math.max(0, updates.payment_per_hour);
    }

    console.log('Final updates:', updates);

    if (Object.keys(updates).length === 0) {
      console.log('No updates provided, skipping database query');
      return 'No changes to update.';
    }

    const result = await db
      .update(doctors)
      .set(updates)
      .where(eq(doctors.doctor_id, doctorId))
      .returning();

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



// 🔹 Get all patients of a doctor
export const getDoctorPatientsService = async (
  doctorId: number
): Promise<DoctorPatient[]> => {
  try {
    if (!doctorId || doctorId <= 0) {
      throw new Error('Invalid doctor ID');
    }

    const result = await db
      .select({
        user_id: schema.users.user_id,
        first_name: schema.users.first_name,
        last_name: schema.users.last_name,
        email: schema.users.email,
        contact_phone: schema.users.contact_phone,
        image_url: schema.users.image_url,
        role: schema.users.role,
        address: schema.users.address,
        is_verified: schema.users.is_verified,
        last_login: schema.users.last_login,
        date_of_birth: schema.users.date_of_birth, // ✅ Include DOB
        created_at: schema.users.created_at,
        updated_at: schema.users.updated_at,
        appointmentDate: schema.appointments.appointment_date,
        timeSlot: schema.appointments.time_slot,
        status: schema.appointments.appointment_status,
      })
      .from(schema.appointments)
      .innerJoin(
        schema.users,
        eq(schema.appointments.user_id, schema.users.user_id)
      )
      .where(eq(schema.appointments.doctor_id, doctorId));

    const seen = new Set<number>();
    const unique = result.filter((row) => {
      if (seen.has(row.user_id)) return false;
      seen.add(row.user_id);
      return true;
    });



    const allowedGenders = ['male', 'female', 'other'] as const;
    type Gender = typeof allowedGenders[number];

    // Infer the original row type from the `unique` array
    type OriginalRow = (typeof unique)[number];

    type RowWithGender = OriginalRow & {
      gender: string | null;
    };

    return (unique as RowWithGender[]).map((row) => {
      const gender = allowedGenders.includes(row.gender as Gender) ? (row.gender as Gender) : null;

      return {
        user: sanitizeUser({
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          contact_phone: row.contact_phone,
          image_url: row.image_url,
          role: row.role,
          address: row.address,
          is_verified: row.is_verified,
          last_login: row.last_login,
          date_of_birth: row.date_of_birth,
          created_at: row.created_at,
          updated_at: row.updated_at,
          gender,
          password: '',
          verification_token: null,
          token_expiry: null,
        }),
        appointmentDate: row.appointmentDate,
        timeSlot: row.timeSlot,
        status: row.status,
      };
    });

  } catch (error) {
    console.error('❌ Failed to fetch doctor patients:', error);
    throw new Error('Failed to fetch doctor patients');
  }
};


// 🔹 Delete all appointments of a patient by doctor
export const deleteDoctorPatientService = async (
  doctorId: number,
  patientId: number
): Promise<boolean> => {
  try {
    if (!doctorId || !patientId) throw new Error('Missing doctor or patient ID');

    const result = await db
      .delete(appointments)
      .where(
        and(
          eq(appointments.doctor_id, doctorId),
          eq(appointments.user_id, patientId)
        )
      )
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('❌ Failed to delete doctor-patient appointments:', error);
    throw new Error('Failed to delete doctor-patient records');
  }
};
