import db from '@/drizzle/db';
import { consultations, appointments } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import type {
  TConsultationInsert,
  TConsultationSelect,
  SanitizedConsultation,
} from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';

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

  // 2. Prevent duplicate consultation
  const existing = await db.query.consultations.findFirst({
    where: eq(consultations.appointment_id, appointment_id),
  });

  if (existing) {
    throw new Error('Consultation for this appointment already exists');
  }

  // 3. Insert consultation
  const [inserted] = await db.insert(consultations).values({
    ...data,
    status: data.status ?? 'Completed', // uses new consultationStatusEnum
  }).returning();

  // ✅ No need to update appointment_status — it's already 'Completed'
  // You now track consultation separately using the `consultations.status`

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
      doctor: true,
      patient: true,
    },
  });

  return results.map((consultation) => ({
    ...consultation,
    patient: consultation.patient ? sanitizeUser(consultation.patient) : undefined,
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
    patient: undefined, // intentionally sanitized
  }));
};

// ────────────────────────────────
// Get a single consultation by ID
// ────────────────────────────────
export const getConsultationByIdService = async (
  consultationId: number
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
): Promise<SanitizedConsultation | null> => {
  const result = await db.query.consultations.findFirst({
    where: eq(consultations.appointment_id, appointmentId),
    with: {
      appointment: true,
      doctor: true,
      patient: true,
    },
  });

  if (!result) return null;

  return {
    ...result,
    patient: result.patient ? sanitizeUser(result.patient) : undefined,
  };
};

// ────────────────────────────────
// Delete consultation by ID
// ────────────────────────────────
export const deleteConsultationService = async (
  consultationId: number
): Promise<boolean> => {
  const deleted = await db
    .delete(consultations)
    .where(eq(consultations.consultation_id, consultationId));
  return (deleted?.rowCount ?? 0) > 0;
};
