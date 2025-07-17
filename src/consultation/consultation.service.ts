import db from '@/drizzle/db';
import { consultations, appointments } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import type {
  TConsultationInsert,
  TConsultationSelect,
  SanitizedConsultation,
} from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';
import { sanitizeDoctor } from '@/utils/sanitize'; // Assuming sanitizeDoctor function exists

// ────────────────────────────────
// Create a new consultation
// ────────────────────────────────
export const createConsultationService = async (
  data: TConsultationInsert
): Promise<TConsultationSelect> => {
  const { appointment_id } = data;

  // 1. Validate appointment
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, appointment_id),
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.appointment_status !== 'Completed') {
    throw new Error('Consultation can only be created for completed appointments');
  }

  // 2. Insert consultation (No check for existing consultation to allow multiple consultations)
  const [inserted] = await db.insert(consultations).values({
    ...data,
    status: data.status ?? 'Completed', // Uses new consultationStatusEnum
  }).returning();

  return inserted;
};

// ────────────────────────────────
// Get all consultations (Admin)
// ────────────────────────────────
export const getAllConsultationsService = async (): Promise<SanitizedConsultation[]> => {
  const results = await db.query.consultations.findMany({
    orderBy: desc(consultations.created_at),
    with: {
      appointment: true,
      doctor: true,  // Ensure this is included
      patient: true, // Ensure this is included
    },
  });

  return results.map((consultation) => ({
    ...consultation,
    patient: consultation.patient ? sanitizeUser(consultation.patient) : undefined, // Sanitizing patient
    doctor: consultation.doctor ? sanitizeDoctor(consultation.doctor) : undefined, // Sanitizing doctor
  }));
};

// ────────────────────────────────
// Get consultations by doctor_id
// ────────────────────────────────
export const getConsultationsByDoctorIdService = async (
  doctorId: number
): Promise<SanitizedConsultation[]> => {
  const results = await db.query.consultations.findMany({
    where: eq(consultations.doctor_id, doctorId),
    orderBy: desc(consultations.created_at),
    with: {
      appointment: true,
      patient: true,
    },
  });

  return results.map((consultation) => ({
    ...consultation,
    patient: consultation.patient ? sanitizeUser(consultation.patient) : undefined,
  }));
};

// ────────────────────────────────
// Get consultations by patient_id
// ────────────────────────────────
export const getConsultationsByPatientIdService = async (
  userId: number
): Promise<SanitizedConsultation[]> => {
  const results = await db.query.consultations.findMany({
    where: eq(consultations.patient_id, userId),
    orderBy: desc(consultations.created_at),
    with: {
      appointment: true,
      doctor: true,
    },
  });

  return results.map((consultation) => ({
    ...consultation,
    patient: undefined, // Intentionally sanitized
  }));
};

// ────────────────────────────────
// Get a single consultation by ID with authorization check
// ────────────────────────────────
export const getConsultationByIdService = async (
  consultationId: number,
  userId: number // Pass the logged-in doctor's user ID
): Promise<SanitizedConsultation | null> => {
  const result = await db.query.consultations.findFirst({
    where: eq(consultations.consultation_id, consultationId),
    with: {
      appointment: true,
      doctor: true,
      patient: true,
    },
  });

  if (!result) return null;

  // Check if the logged-in doctor is the one who owns this consultation
  if (result.doctor?.user_id !== userId) {
    throw new Error('Access denied. This consultation does not belong to you.');
  }

  return {
    ...result,
    patient: result.patient ? sanitizeUser(result.patient) : undefined,
  };
};

// ────────────────────────────────
// Get consultation by appointment_id
// ────────────────────────────────
export const getConsultationByAppointmentIdService = async (
  appointmentId: number
): Promise<SanitizedConsultation[] | null> => {
  const results = await db.query.consultations.findMany({
    where: eq(consultations.appointment_id, appointmentId),
    with: {
      appointment: true,
      doctor: true,
      patient: true,
    },
  });

  if (!results) return null;

  return results.map((consultation) => ({
    ...consultation,
    patient: consultation.patient ? sanitizeUser(consultation.patient) : undefined,
  }));
};

// ────────────────────────────────
// Delete consultation by ID with authorization check
// ────────────────────────────────
export const deleteConsultationService = async (
  consultationId: number,
  userId: number // Pass the logged-in doctor's user ID
): Promise<boolean> => {
  // Fetch consultation to check ownership
  const consultation = await db.query.consultations.findFirst({
    where: eq(consultations.consultation_id, consultationId),
    with: {
      doctor: true,
    },
  });

  if (!consultation || consultation.doctor?.user_id !== userId) {
    throw new Error('Access denied. This consultation does not belong to you.');
  }

  const deleted = await db
    .delete(consultations)
    .where(eq(consultations.consultation_id, consultationId));
  
  return (deleted?.rowCount ?? 0) > 0;
};

// ────────────────────────────────
// Update consultation by ID with authorization check
// ────────────────────────────────
export const updateConsultationService = async (
  consultationId: number,
  data: Partial<TConsultationInsert>,
  userId: number // Pass the logged-in doctor's user ID
): Promise<TConsultationSelect | null> => {
  const consultation = await db.query.consultations.findFirst({
    where: eq(consultations.consultation_id, consultationId),
    with: {
      doctor: true,
    },
  });

  if (!consultation || consultation.doctor?.user_id !== userId) {
    throw new Error('Access denied. This consultation does not belong to you.');
  }

  // Now perform the update
  const updatedConsultation = await db
    .update(consultations)
    .set(data)
    .where(eq(consultations.consultation_id, consultationId))
    .returning();

  return updatedConsultation[0] ?? null;
};
