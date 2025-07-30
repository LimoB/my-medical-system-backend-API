// src/appointments/services/rescheduleAppointment.service.ts

import db from '@/drizzle/db';
import { appointments, doctors } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/utils/AppError';
import { generateSlots } from '@/utils/timeUtils';

/**
 * Reschedules an existing appointment to a new slot (if available)
 */
export const rescheduleAppointmentService = async ({
  appointmentId,
  userId,
  newDate,
  newTimeSlot,
}: {
  appointmentId: number;
  userId: number; // You can skip this if admins are allowed to reschedule freely
  newDate: string;
  newTimeSlot: string;
}): Promise<string> => {
  // 1. Find appointment
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, appointmentId),
  });

  if (!appointment) throw new AppError(404, 'Appointment not found');

  // Optionally restrict users from changing others' appointments
  if (appointment.user_id !== userId) {
    throw new AppError(403, 'Unauthorized to reschedule this appointment');
  }

  // 2. Check doctor & availability
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, appointment.doctor_id),
  });

  if (!doctor) throw new AppError(404, 'Doctor not found');

  const availableHours = doctor.available_hours as string[] || [];
  const slotDuration = doctor.slot_duration_minutes ?? 60;
  const validSlots = generateSlots(availableHours, slotDuration);

  if (!validSlots.includes(newTimeSlot)) {
    throw new AppError(400, 'Requested time slot is not valid for this doctor');
  }

  // 3. Check if that new slot is already taken
  const conflicting = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.doctor_id, doctor.doctor_id),
      eq(appointments.appointment_date, newDate),
      eq(appointments.time_slot, newTimeSlot)
    ),
  });

  if (conflicting) {
    throw new AppError(409, 'This time slot is already booked');
  }

  // 4. Update appointment
  await db
    .update(appointments)
    .set({
      appointment_date: newDate,
      time_slot: newTimeSlot,
      updated_at: new Date(),
      was_rescheduled: true,
    })
    .where(eq(appointments.appointment_id, appointmentId));

  return 'Appointment successfully rescheduled';
};
