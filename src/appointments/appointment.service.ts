import db from '@/drizzle/db';
import { appointments, users, doctors } from '@/drizzle/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import type {
  TAppointmentInsert,
  TAppointmentSelect,
  SanitizedAppointment,
} from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';

// 🔹 Get all appointments (admin use) WITH user and doctor (including doctor.user)
export const getAllAppointmentsService = async (): Promise<SanitizedAppointment[]> => {
  const appointmentsList = await db.query.appointments.findMany({
    orderBy: desc(appointments.created_at),
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  });

  // Collect doctor user_ids to fetch their user profiles
  const doctorUserIds = Array.from(
    new Set(
      appointmentsList
        .filter(a => a.doctor?.user_id)
        .map(a => a.doctor!.user_id)
    )
  );

  const doctorUsers = await db.query.users.findMany({
    where: inArray(users.user_id, doctorUserIds),
  });

  const doctorUserMap = new Map(
    doctorUsers.map(u => [u.user_id, sanitizeUser(u)])
  );

  return appointmentsList.map(appt => ({
    ...appt,
    user: appt.user ? sanitizeUser(appt.user) : undefined,
    doctor: appt.doctor
      ? {
          ...appt.doctor,
          user: appt.doctor.user_id ? doctorUserMap.get(appt.doctor.user_id) : undefined,
          available_hours: Array.isArray(appt.doctor.available_hours) ? appt.doctor.available_hours : [], // Ensure available_hours is always a string[]
        }
      : undefined,
  }));
};

// 🔹 Get appointments by user ID WITH user and doctor (including doctor.user)
export const getAppointmentsByUserIdService = async (
  userId: number
): Promise<SanitizedAppointment[]> => {
  const appointmentsList = await db.query.appointments.findMany({
    where: eq(appointments.user_id, userId),
    orderBy: desc(appointments.created_at),
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  });

  const doctorUserIds = Array.from(
    new Set(
      appointmentsList
        .filter(a => a.doctor?.user_id)
        .map(a => a.doctor!.user_id)
    )
  );

  const doctorUsers = await db.query.users.findMany({
    where: inArray(users.user_id, doctorUserIds),
  });

  const doctorUserMap = new Map(
    doctorUsers.map(u => [u.user_id, sanitizeUser(u)])
  );

  return appointmentsList.map(appt => ({
    ...appt,
    user: appt.user ? sanitizeUser(appt.user) : undefined,
    doctor: appt.doctor
      ? {
          ...appt.doctor,
          user: appt.doctor.user_id ? doctorUserMap.get(appt.doctor.user_id) : undefined,
          available_hours: Array.isArray(appt.doctor.available_hours) ? appt.doctor.available_hours : [], // Ensure available_hours is always a string[]
        }
      : undefined,
  }));
};

// 🔹 Get single appointment by ID
export const getAppointmentByIdService = async (
  id: number
): Promise<SanitizedAppointment | null> => {
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, id),
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  });

  if (!appointment) return null;

  let doctorUser = undefined;

  if (appointment.doctor?.user_id) {
    const doctorUserRaw = await db.query.users.findFirst({
      where: eq(users.user_id, appointment.doctor.user_id),
    });
    if (doctorUserRaw) {
      doctorUser = sanitizeUser(doctorUserRaw);
    }
  }

  return {
    ...appointment,
    user: appointment.user ? sanitizeUser(appointment.user) : undefined,
    doctor: appointment.doctor
      ? {
          ...appointment.doctor,
          user: doctorUser,
          available_hours: Array.isArray(appointment.doctor.available_hours)
            ? appointment.doctor.available_hours
            : [], // Ensure available_hours is always a string[]
        }
      : undefined,
  };
};

// 🔹 Create new appointment
export const createAppointmentService = async (
  data: TAppointmentInsert
): Promise<TAppointmentSelect> => {
  const { doctor_id, appointment_date, time_slot, payment_method } = data;

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctor_id),
  });

  if (!doctor) throw new Error('Doctor not found');

  const availableHours: string[] = doctor.available_hours as string[];
  const isSlotAvailable = availableHours.includes(time_slot);

  if (!isSlotAvailable) {
    throw new Error('This time slot is not available');
  }

  // Optional logging
  console.log(`Creating appointment with payment method: ${payment_method}`);

  const [inserted] = await db.insert(appointments).values(data).returning();

  await updateDoctorAvailability(doctor_id, appointment_date, time_slot);

  return inserted;
};


// 🔹 Update doctor's availability after appointment
export const updateDoctorAvailability = async (
  doctorId: number,
  appointmentDate: string,
  timeSlot: string
) => {
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctorId),
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const availableHours: string[] = doctor.available_hours as string[];
  const updatedAvailableHours = availableHours.filter(
    (slot: string) => slot !== timeSlot // Remove the booked time slot
  );

  await db.update(doctors)
    .set({
      available_hours: updatedAvailableHours,
    })
    .where(eq(doctors.doctor_id, doctorId));
};

// 🔹 Update appointment status
export const updateAppointmentStatusService = async (
  id: number,
  status: 'Pending' | 'Confirmed' | 'Cancelled'
): Promise<string> => {
  await db.update(appointments)
    .set({ appointment_status: status, updated_at: new Date() })
    .where(eq(appointments.appointment_id, id));

  return 'Appointment status updated';
};

// 🔹 Delete appointment
export const deleteAppointmentService = async (id: number): Promise<boolean> => {
  const deleted = await db.delete(appointments)
    .where(eq(appointments.appointment_id, id));

  return (deleted?.rowCount ?? 0) > 0;
};




// 🔹 Get appointments for a doctor by their user_id (i.e., authenticated doctor)
export const getAppointmentsByDoctorUserIdService = async (
  userId: number
): Promise<SanitizedAppointment[] | null> => {
  // 1. Find the doctor profile by user ID
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.user_id, userId),
  });

  if (!doctor) return null;

  // 2. Fetch appointments for the doctor
  const appointmentsList = await db.query.appointments.findMany({
    where: eq(appointments.doctor_id, doctor.doctor_id),
    orderBy: desc(appointments.created_at),
    with: {
      user: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  });

  // 3. Fetch & sanitize doctor.user
  const doctorUser = await db.query.users.findFirst({
    where: eq(users.user_id, userId),
  });

  const sanitizedDoctorUser = doctorUser ? sanitizeUser(doctorUser) : undefined;

  // 4. Format the result
  return appointmentsList.map((appt) => ({
    ...appt,
    user: appt.user ? sanitizeUser(appt.user) : undefined,
    doctor: {
      ...doctor,
      user: sanitizedDoctorUser,
      available_hours: Array.isArray(doctor.available_hours)
        ? doctor.available_hours
        : [],
    },
  }));
};
