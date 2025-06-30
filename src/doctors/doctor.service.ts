import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { doctors } from '@/drizzle/schema'
import type { TDoctorInsert, TDoctorSelect, PopulatedDoctor } from '@/drizzle/types'

// Get all doctors
export const getDoctorsService = async (): Promise<TDoctorSelect[]> => {
    try {
        return await db.query.doctors.findMany()
    } catch (error) {
        console.error('Error fetching doctors:', error)
        throw new Error('Unable to fetch doctors')
    }
}

// Get doctor by ID
export const getDoctorByIdService = async (
    doctorId: number
): Promise<TDoctorSelect | null> => {
    try {
        const doctor = await db.query.doctors.findFirst({
            where: eq(doctors.doctor_id, doctorId),
        })
        return doctor ?? null // 👈 ensure it's null if undefined
    } catch (error) {
        console.error(`Error fetching doctor with ID ${doctorId}:`, error)
        throw new Error('Unable to fetch doctor')
    }
}


// Create a new doctor
export const createDoctorService = async (
    doctor: TDoctorInsert
): Promise<string> => {
    try {
        const result = await db.insert(doctors).values(doctor).returning()
        if (result.length > 0) {
            return '✅ Doctor created successfully!'
        }
        throw new Error('Doctor creation failed')
    } catch (error) {
        console.error('Error creating doctor:', error)
        throw new Error('Unable to create doctor')
    }
}

// Update an existing doctor
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
            return '✅ Doctor updated successfully!'
        }
        throw new Error('Doctor update failed or doctor not found')
    } catch (error) {
        console.error(`Error updating doctor with ID ${doctorId}:`, error)
        throw new Error('Unable to update doctor')
    }
}

// Delete a doctor
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
