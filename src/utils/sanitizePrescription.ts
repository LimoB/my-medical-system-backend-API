import type { PopulatedPrescription } from '@/types'; // adjust path
import { sanitizeUser, sanitizeDoctor, sanitizePayment } from './sanitize'; // adjust path
import type { SanitizedPrescription } from '@/types'; // adjust path

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
