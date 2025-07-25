import { eq, and } from 'drizzle-orm';
import db from '@/drizzle/db';
import { doctors, appointments } from '@/drizzle/schema';

export const getDoctorAvailabilityService = async (
  doctorId: number,
  date: string // format: YYYY-MM-DD
): Promise<{
  length: number;
  date: string;
  availableSlots: string[];
  fullyBooked: boolean;
}> => {
  if (!doctorId || doctorId <= 0) throw new Error('Invalid doctor ID');
  if (!date || typeof date !== 'string' || isNaN(Date.parse(date))) {
    throw new Error('Invalid or missing date');
  }

  // Fetch doctor and their available hours
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctorId),
  });

  if (!doctor) throw new Error('Doctor not found');

  const allSlots = Array.isArray(doctor.available_hours)
    ? doctor.available_hours
    : [];

  // Early return if doctor has no available hours
  if (allSlots.length === 0) {
    return {
      length: 0,
      date,
      availableSlots: [],
      fullyBooked: true,
    };
  }

  // Fetch all booked slots for that doctor on the given date
  const bookedAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctor_id, doctorId),
      eq(appointments.appointment_date, date)
    ),
    columns: { time_slot: true },
  });

  const bookedSlots = bookedAppointments.map((appt) => appt.time_slot);
  const availableSlots = allSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  return {
    length: availableSlots.length,
    date,
    availableSlots,
    fullyBooked: availableSlots.length === 0,
  };
};
