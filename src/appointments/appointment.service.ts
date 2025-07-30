import db from '@/drizzle/db';
import { appointments, users, doctors } from '@/drizzle/schema';
import { eq, desc, inArray, and } from 'drizzle-orm';
import type {
  TAppointmentInsert,
  TAppointmentSelect,
  SanitizedAppointment,
} from '@/types';
import { sanitizeUser } from '@/utils/sanitize';
import { AppError } from '@/utils/AppError';
import { generateSlots } from '@/utils/timeUtils';

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
  const {
    doctor_id,
    appointment_date,
    time_slot,
    payment_method,
    user_id,
    total_amount,
    reason,
  } = data;

  // 1. Check if doctor exists
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.doctor_id, doctor_id),
  });

  if (!doctor) {
    throw new AppError(404, 'Doctor not found');
  }

  const availableHours: string[] = doctor.available_hours as string[];

  // 🔁 Use generateSlots to support flexible durations (default to 60 or configure per doctor later)
  const generatedSlots = generateSlots(availableHours, 30); // 30-min slot assumed here

  // 2. Validate selected time slot
  if (!generatedSlots.includes(time_slot)) {
    throw new AppError(400, "Selected time slot is invalid or unavailable.");
  }

  // 3. Fetch existing appointments
  const existingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctor_id, doctor_id),
      eq(appointments.appointment_date, appointment_date)
    ),
  });

  // 4. Check for slot collision
  const existingSlot = existingAppointments.find(
    (a) => a.time_slot === time_slot
  );

  if (existingSlot) {
    throw new AppError(409, "This time slot is already booked. Please choose another.");
  }

  // 5. Optional: check max appointments for the day
  if (existingAppointments.length >= generatedSlots.length) {
    throw new AppError(409, "Doctor is fully booked for this day.");
  }

  // 6. ✅ Insert new appointment
  const [inserted] = await db.insert(appointments).values({
    doctor_id,
    appointment_date,
    time_slot,
    payment_method,
    user_id,
    total_amount,
    reason,
    appointment_status: 'Pending',
    is_cash_delivered: false,
    failure_reason: null,
    was_rescheduled: false,
    created_at: new Date(),
    updated_at: new Date(),
  }).returning();

  return inserted;
};



// 🔹 Update doctor's availability after appointment
// export const updateDoctorAvailability = async (
//   doctorId: number,
//   appointmentDate: string,
//   timeSlot: string
// ) => {
//   const doctor = await db.query.doctors.findFirst({
//     where: eq(doctors.doctor_id, doctorId),
//   });

//   if (!doctor) {
//     throw new Error('Doctor not found');
//   }

//   const availableHours: string[] = doctor.available_hours as string[];
//   const updatedAvailableHours = availableHours.filter(
//     (slot: string) => slot !== timeSlot // Remove the booked time slot
//   );

//   await db.update(doctors)
//     .set({
//       available_hours: updatedAvailableHours,
//     })
//     .where(eq(doctors.doctor_id, doctorId));
// };

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
