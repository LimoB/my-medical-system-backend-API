import type { PopulatedPrescription } from '@/drizzle/types'; // adjust path
import { sanitizeUser, sanitizeDoctor } from './sanitize'; // adjust path
import type { SanitizedPrescription } from '@/drizzle/types'; // adjust path

export const sanitizePrescription = (
  prescription: PopulatedPrescription
): SanitizedPrescription => {
  return {
    ...prescription,
    doctor: prescription.doctor ? sanitizeDoctor(prescription.doctor) : undefined,
    patient: prescription.patient ? sanitizeUser(prescription.patient) : undefined,
    appointment: prescription.appointment || undefined,
  };
};
