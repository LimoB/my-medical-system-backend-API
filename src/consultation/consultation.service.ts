import db from '@/drizzle/db';
import { consultations, appointments } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import type {
  TConsultationInsert,
  TConsultationSelect,
  SanitizedConsultation,
} from '@/types';
import { sanitizeUser } from '@/utils/sanitize';
import { sanitizeDoctor } from '@/utils/sanitize';

// ────────────────────────────────
// Helper to generate a reference code
// ────────────────────────────────
const generateReferenceCode = (): string => {
  return 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

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

  // 2. Insert consultation
  const [inserted] = await db
    .insert(consultations)
    .values({
      ...data,
      status: data.status ?? 'Completed',
      consultation_date: data.consultation_date
        ? new Date(data.consultation_date).toISOString()
        : new Date().toISOString(),
      reference_code: data.reference_code ?? generateReferenceCode(),
    })
    .returning();


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
    doctor: consultation.doctor ? sanitizeDoctor(consultation.doctor) : undefined,
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
    patient: undefined, // Hide patient info intentionally
  }));
};

// ────────────────────────────────
// Get a single consultation by ID with authorization check
// ────────────────────────────────
export const getConsultationByIdService = async (
  consultationId: number,
  userId: number
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
  userId: number
): Promise<boolean> => {
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
  userId: number
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

  const updatedConsultation = await db
    .update(consultations)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(consultations.consultation_id, consultationId))
    .returning();

  return updatedConsultation[0] ?? null;
};




// import db from '@/drizzle/db';
import { doctors } from '@/drizzle/schema';
// import { eq } from 'drizzle-orm';
// import { sanitizeDoctor } from '@/utils/sanitize';
import type { SanitizedDoctor } from '@/types';

// ────────────────────────────────
// Get doctor by associated userId
// ────────────────────────────────
export const getDoctorByUserIdService = async (
  userId: number
): Promise<SanitizedDoctor | null> => {
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.user_id, userId),
    with: {
      user: true, // optional: join user info if needed
    },
  });

  if (!doctor) return null;

  return sanitizeDoctor(doctor);
};
