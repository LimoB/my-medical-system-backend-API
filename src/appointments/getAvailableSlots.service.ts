// src/appointments/services/getAvailableSlots.service.ts

import db from '@/drizzle/db';
import { appointments, doctors } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/utils/AppError';
import { generateSlots } from '@/utils/timeUtils';

/**
 * Get free slots for a given doctor on a specific date
 */
export const getAvailableSlotsService = async (
  doctorId: number,
  appointmentDate: string
): Promise<string[]> => {
  // 1. Fetch doctor
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctorId),
  });

  if (!doctor) throw new AppError(404, 'Doctor not found');

  const availableHours = doctor.available_hours as string[] || [];
  const slotDuration = doctor.slot_duration_minutes ?? 60;

  if (availableHours.length === 0) {
    throw new AppError(400, 'Doctor has no available hours configured');
  }

  // 2. Generate all potential slots
  const allSlots = generateSlots(availableHours, slotDuration);

  // 3. Fetch existing appointments for that doctor and date
  const existingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctor_id, doctorId),
      eq(appointments.appointment_date, appointmentDate)
    ),
    columns: {
      time_slot: true,
    },
  });

  const bookedSlots = new Set(existingAppointments.map((a) => a.time_slot));

  // 4. Filter out booked slots
  const freeSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

  return freeSlots;
};
