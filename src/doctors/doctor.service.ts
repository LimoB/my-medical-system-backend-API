import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { doctors } from '@/drizzle/schema'
import type {
  TDoctorInsert,
  SanitizedDoctor,
  PopulatedDoctor,
} from '@/drizzle/types'
import { sanitizeUser } from '@/utils/sanitize'

// 🔹 Get all doctors with deeply sanitized relations
export const getDoctorsService = async (): Promise<SanitizedDoctor[]> => {
  try {
    const doctorsList = await db.query.doctors.findMany({
      with: {
        user: true,
        appointments: {
          with: {
            user: true, // patient info
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
    })

    return doctorsList.map((doctor): SanitizedDoctor => ({
      ...doctor,
      user: doctor.user ? sanitizeUser(doctor.user) : undefined,
      appointments: doctor.appointments?.map((appt) => ({
        ...appt,
        user: appt.user ? sanitizeUser(appt.user) : undefined,
      })),
      prescriptions: doctor.prescriptions?.map((presc) => ({
        ...presc,
        patient: presc.patient ? sanitizeUser(presc.patient) : undefined,
      })),
    }))
  } catch (error) {
    console.error('Error fetching doctors:', error)
    throw new Error('Unable to fetch doctors')
  }
}

// 🔹 Get single doctor by ID with sanitized relations
export const getDoctorByIdService = async (
  doctorId: number
): Promise<SanitizedDoctor | null> => {
  try {
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
    })

    if (!doctor) return null

    return {
      ...doctor,
      user: doctor.user ? sanitizeUser(doctor.user) : undefined,
      appointments: doctor.appointments?.map((appt) => ({
        ...appt,
        user: appt.user ? sanitizeUser(appt.user) : undefined,
      })),
      prescriptions: doctor.prescriptions?.map((presc) => ({
        ...presc,
        patient: presc.patient ? sanitizeUser(presc.patient) : undefined,
      })),
    }
  } catch (error) {
    console.error(`Error fetching doctor with ID ${doctorId}:`, error)
    throw new Error('Unable to fetch doctor')
  }
}

// 🔹 Create doctor
export const createDoctorService = async (
  doctor: TDoctorInsert
): Promise<string> => {
  try {
    const result = await db.insert(doctors).values(doctor).returning()
    if (result.length > 0) {
      return 'Doctor created successfully!'
    }
    throw new Error('Doctor creation failed')
  } catch (error) {
    console.error('Error creating doctor:', error)
    throw new Error('Unable to create doctor')
  }
}

// 🔹 Update doctor
export const updateDoctorService = async (
  doctorId: number,
  updates: Partial<TDoctorInsert>
): Promise<string> => {
  try {
    const result = await db
      .update(doctors)
      .set(updates)
      .where(eq(doctors.doctor_id, doctorId))
      .returning()

    if (result.length > 0) {
      return 'Doctor updated successfully!'
    }
    throw new Error('Doctor update failed or doctor not found')
  } catch (error) {
    console.error(`Error updating doctor with ID ${doctorId}:`, error)
    throw new Error('Unable to update doctor')
  }
}

// 🔹 Delete doctor
export const deleteDoctorService = async (
  doctorId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(doctors)
      .where(eq(doctors.doctor_id, doctorId))
      .returning()
    return result.length > 0
  } catch (error) {
    console.error(`Error deleting doctor with ID ${doctorId}:`, error)
    throw new Error('Unable to delete doctor')
  }
}
