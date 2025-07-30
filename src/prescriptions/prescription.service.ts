import { eq } from 'drizzle-orm';
import db from '@/drizzle/db';
import { prescriptions } from '@/drizzle/schema';
import type {
  TPrescriptionInsert,
  PopulatedPrescription,
  SanitizedPrescription,
} from '@/types';
import { sanitizeUser } from '@/utils/sanitize';

// 🔹 Get all prescriptions with sanitized patient/doctor
export const getPrescriptionsService = async (): Promise<SanitizedPrescription[]> => {
  try {
    const result = await db.query.prescriptions.findMany({
      with: {
        appointment: true,
        doctor: {
          with: {
            user: true,
          },
        },
        patient: true,
      },
    });

    return result.map((prescription) => ({
      ...prescription,
      appointment: prescription.appointment && {
        appointment_id: prescription.appointment.appointment_id,
        appointment_date: prescription.appointment.appointment_date,
        time_slot: prescription.appointment.time_slot,
        appointment_status: prescription.appointment.appointment_status,
        payment_method: prescription.appointment.payment_method,
        reason: prescription.appointment.reason,
        created_at: prescription.appointment.created_at,
        updated_at: prescription.appointment.updated_at,
        user_id: prescription.appointment.user_id,
        doctor_id: prescription.appointment.doctor_id,
        payment_per_hour: prescription.appointment.payment_per_hour,
        total_amount: prescription.appointment.total_amount,
      },
      doctor: sanitizeUser(prescription.doctor?.user),
      patient: sanitizeUser(prescription.patient),
    }));
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw new Error('Unable to fetch prescriptions');
  }
};




// 🔹 Get a single prescription by ID with sanitized fields
export const getPrescriptionByIdService = async (
  prescriptionId: number
): Promise<SanitizedPrescription | null> => {
  try {
    const prescription = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.prescription_id, prescriptionId),
      with: {
        appointment: true,
        doctor: {
          with: {
            user: true,
          },
        },
        patient: true,
      },
    });

    if (!prescription) return null;

    return {
      ...prescription,
      appointment: prescription.appointment && {
        appointment_id: prescription.appointment.appointment_id,
        appointment_date: prescription.appointment.appointment_date,
        time_slot: prescription.appointment.time_slot,
        appointment_status: prescription.appointment.appointment_status,
        payment_method: prescription.appointment.payment_method,
        reason: prescription.appointment.reason,
        created_at: prescription.appointment.created_at,
        updated_at: prescription.appointment.updated_at,
        user_id: prescription.appointment.user_id,
        doctor_id: prescription.appointment.doctor_id,
        payment_per_hour: prescription.appointment.payment_per_hour,
        total_amount: prescription.appointment.total_amount,
      },
      doctor: sanitizeUser(prescription.doctor?.user),
      patient: sanitizeUser(prescription.patient),
    };
  } catch (error) {
    console.error(`Error fetching prescription ID ${prescriptionId}:`, error);
    throw new Error('Unable to fetch prescription');
  }
};

// 🔹 Create a new prescription
export const createPrescriptionService = async (
  data: TPrescriptionInsert
): Promise<string> => {
  try {
    const result = await db.insert(prescriptions).values(data).returning();
    if (result.length > 0) {
      return 'Prescription created successfully!';
    }
    throw new Error('Prescription creation failed');
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw new Error('Unable to create prescription');
  }
};

// 🔹 Update an existing prescription
export const updatePrescriptionService = async (
  prescriptionId: number,
  data: Partial<TPrescriptionInsert>
): Promise<string> => {
  try {
    const result = await db
      .update(prescriptions)
      .set(data)
      .where(eq(prescriptions.prescription_id, prescriptionId))
      .returning();

    if (result.length > 0) {
      return 'Prescription updated successfully!';
    }
    throw new Error('Prescription update failed or not found');
  } catch (error) {
    console.error(`Error updating prescription ID ${prescriptionId}:`, error);
    throw new Error('Unable to update prescription');
  }
};

// 🔹 Delete a prescription
export const deletePrescriptionService = async (
  prescriptionId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(prescriptions)
      .where(eq(prescriptions.prescription_id, prescriptionId))
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting prescription ID ${prescriptionId}:`, error);
    throw new Error('Unable to delete prescription');
  }
};

// 🔹 Get prescriptions for a specific patient (user)
export const getPrescriptionsByUserIdService = async (
  userId: number
): Promise<SanitizedPrescription[]> => {
  try {
    const prescriptionsForUser = await db.query.prescriptions.findMany({
      where: eq(prescriptions.patient_id, userId),
      with: {
        appointment: {
          columns: {
            appointment_id: true,
            appointment_date: true,
            time_slot: true,
            appointment_status: true,
            payment_method: true,
            reason: true,
            created_at: true,
            updated_at: true,
            user_id: true,
            doctor_id: true,
            payment_per_hour: true,
            total_amount: true,
          },
        },
        doctor: {
          with: {
            user: {
              columns: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                image_url: true,
              },
            },
          },
        },
        patient: {
          columns: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            image_url: true,
          },
        },
      },
    });

    return prescriptionsForUser.map((prescription) => ({
      prescription_id: prescription.prescription_id,
      image_url: prescription.image_url,
      notes: prescription.notes,
      created_at: prescription.created_at,
      updated_at: prescription.updated_at,
      appointment_id: prescription.appointment_id,
      doctor_id: prescription.doctor_id,
      patient_id: prescription.patient_id,
      appointment: prescription.appointment && {
        appointment_id: prescription.appointment.appointment_id,
        appointment_date: prescription.appointment.appointment_date,
        time_slot: prescription.appointment.time_slot,
        appointment_status: prescription.appointment.appointment_status,
        payment_method: prescription.appointment.payment_method,
        reason: prescription.appointment.reason,
        created_at: prescription.appointment.created_at,
        updated_at: prescription.appointment.updated_at,
        user_id: prescription.appointment.user_id,
        doctor_id: prescription.appointment.doctor_id,
        payment_per_hour: prescription.appointment.payment_per_hour,
        total_amount: prescription.appointment.total_amount,
      },
      doctor: sanitizeUser(prescription.doctor?.user),
      patient: sanitizeUser(prescription.patient),
    }));
  } catch (error) {
    console.error(`Error fetching prescriptions for user ID ${userId}:`, error);
    throw new Error('Unable to fetch prescriptions for user');
  }
};
