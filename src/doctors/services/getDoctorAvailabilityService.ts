import { eq, and } from 'drizzle-orm';
import db from '@/drizzle/db';
import { doctors, appointments } from '@/drizzle/schema';
import dayjs from 'dayjs';

export const getDoctorAvailabilityService = async (
  doctorId: number,
  date: string // format: YYYY-MM-DD
): Promise<{
  length: number;
  date: string;
  availableSlots: string[];
  fullyBooked: boolean;
  notAvailableToday: boolean;
}> => {
  if (!doctorId || doctorId <= 0) throw new Error('Invalid doctor ID');
  if (!date || typeof date !== 'string' || isNaN(Date.parse(date))) {
    throw new Error('Invalid or missing date');
  }

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctorId),
  });

  if (!doctor) throw new Error('Doctor not found');

  const dayName = dayjs(date).format('dddd'); // e.g., "Monday"
  const workingDays = doctor.available_days.split(',').map(d => d.trim());

  const notAvailableToday = !workingDays.includes(dayName);
  if (notAvailableToday) {
    console.log('🚫 Doctor does not work on this day:', dayName);
    return {
      length: 0,
      date,
      availableSlots: [],
      fullyBooked: false,
      notAvailableToday: true,
    };
  }

  const hours = Array.isArray(doctor.available_hours)
    ? doctor.available_hours
    : [];

  const slotDuration = doctor.slot_duration_minutes || 60;

  const bookedAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctor_id, doctorId),
      eq(appointments.appointment_date, date)
    ),
    columns: { time_slot: true },
  });

  const bookedSlots = new Set(bookedAppointments.map(appt => appt.time_slot));

  const generatedSlots: string[] = [];

  for (const time of hours) {
    const start = dayjs(`${date} ${time}`);
    const formatted = start.format('HH:mm');
    if (!bookedSlots.has(formatted)) {
      generatedSlots.push(formatted);
    }
  }

  const fullyBooked = generatedSlots.length === 0;

  // ✅ LOGS FOR DEBUGGING
  console.log('🧠 Day:', dayName);
  console.log('📅 Doctor working days:', workingDays);
  console.log('⏰ Available hours:', hours);
  console.log('📆 Booked appointments on', date, ':', Array.from(bookedSlots));
  console.log('✅ Final available slots:', generatedSlots);

  return {
    length: generatedSlots.length,
    date,
    availableSlots: generatedSlots,
    fullyBooked,
    notAvailableToday: false,
  };
};
