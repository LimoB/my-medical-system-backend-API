// --- src/appointments/appointment.service.ts ---
import db from '@/drizzle/db'
import { appointments } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import type { TAppointmentInsert, TAppointmentSelect, PopulatedAppointment } from '@/drizzle/types'

// 🔹 Get all appointments (admin use) WITH user and doctor
export const getAllAppointmentsService = async (): Promise<PopulatedAppointment[]> => {
  return await db.query.appointments.findMany({
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  })
}

// 🔹 Get appointments by user ID WITH user and doctor
export const getAppointmentsByUserIdService = async (
  userId: number
): Promise<PopulatedAppointment[]> => {
  return await db.query.appointments.findMany({
    where: eq(appointments.user_id, userId),
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  })
}

// 🔹 Get appointment by ID WITH user and doctor
export const getAppointmentByIdService = async (
  id: number
): Promise<PopulatedAppointment | null> => {
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, id),
    with: {
      user: true,
      doctor: true,
      prescriptions: true,
      payments: true,
      complaints: true,
    },
  })

  return appointment ?? null
}


// 🔹 Create appointment
export const createAppointmentService = async (
  data: TAppointmentInsert
): Promise<TAppointmentSelect> => {
  const [inserted] = await db.insert(appointments).values(data).returning()
  return inserted
}

// 🔹 Update status
export const updateAppointmentStatusService = async (
  id: number,
  status: 'Pending' | 'Confirmed' | 'Cancelled'
): Promise<string> => {
  await db
    .update(appointments)
    .set({ appointment_status: status, updated_at: new Date() })
    .where(eq(appointments.appointment_id, id))
  return 'Appointment status updated'
}

// 🔹 Delete appointment
export const deleteAppointmentService = async (
  id: number
): Promise<boolean> => {
  const deleted = await db
    .delete(appointments)
    .where(eq(appointments.appointment_id, id))

  return (deleted?.rowCount ?? 0) > 0
}
