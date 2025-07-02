import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { prescriptions } from '@/drizzle/schema'
import type { TPrescriptionInsert, PopulatedPrescription } from '@/drizzle/types'

// Get all prescriptions with related appointment + doctor + patient
export const getPrescriptionsService = async (): Promise<PopulatedPrescription[]> => {
  try {
    const result = await db.query.prescriptions.findMany({
      with: {
        appointment: true,
        doctor: true,
        patient: true,
      },
    })
    return result
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    throw new Error('Unable to fetch prescriptions')
  }
}

// Get a single prescription by ID
export const getPrescriptionByIdService = async (
  prescriptionId: number
): Promise<PopulatedPrescription | null> => {
  try {
    const result = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.prescription_id, prescriptionId),
      with: {
        appointment: true,
        doctor: true,
        patient: true,
      },
    })
    return result ?? null
  } catch (error) {
    console.error(`Error fetching prescription ID ${prescriptionId}:`, error)
    throw new Error('Unable to fetch prescription')
  }
}

// Create a new prescription
export const createPrescriptionService = async (
  data: TPrescriptionInsert
): Promise<string> => {
  try {
    const result = await db.insert(prescriptions).values(data).returning()
    if (result.length > 0) {
      return 'Prescription created successfully!'
    }
    throw new Error('Prescription creation failed')
  } catch (error) {
    console.error('Error creating prescription:', error)
    throw new Error('Unable to create prescription')
  }
}

// Update an existing prescription
export const updatePrescriptionService = async (
  prescriptionId: number,
  data: Partial<TPrescriptionInsert>
): Promise<string> => {
  try {
    const result = await db
      .update(prescriptions)
      .set(data)
      .where(eq(prescriptions.prescription_id, prescriptionId))
      .returning()

    if (result.length > 0) {
      return 'Prescription updated successfully!'
    }
    throw new Error('Prescription update failed or not found')
  } catch (error) {
    console.error(`Error updating prescription ID ${prescriptionId}:`, error)
    throw new Error('Unable to update prescription')
  }
}

// Delete a prescription
export const deletePrescriptionService = async (
  prescriptionId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(prescriptions)
      .where(eq(prescriptions.prescription_id, prescriptionId))
      .returning()

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting prescription ID ${prescriptionId}:`, error)
    throw new Error('Unable to delete prescription')
  }
}
