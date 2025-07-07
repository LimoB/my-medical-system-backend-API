import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { doctors } from '@/drizzle/schema'
import type { TDoctorInsert, PopulatedDoctor } from '@/drizzle/types'

// 🔹 Get all doctors with relations
export const getDoctorsService = async (): Promise<PopulatedDoctor[]> => {
  try {
    return await db.query.doctors.findMany({
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
  } catch (error) {
    console.error('Error fetching doctors:', error)
    throw new Error('Unable to fetch doctors')
  }
}

// 🔹 Get doctor by ID with relations
export const getDoctorByIdService = async (
  doctorId: number
): Promise<PopulatedDoctor | null> => {
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
    return doctor ?? null
  } catch (error) {
    console.error(`Error fetching doctor with ID ${doctorId}:`, error)
    throw new Error('Unable to fetch doctor')
  }
}

// ✅ No changes needed below this line unless you want to expand relational creation logic

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
