// --- src/appointments/appointment.service.ts ---
import db from '@/drizzle/db'
import { appointments } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { TAppointmentInsert, TAppointmentSelect } from '@/drizzle/types'

// 🔹 Get all appointments (admin use)
export const getAllAppointmentsService = async (): Promise<TAppointmentSelect[]> => {
  return await db.select().from(appointments)
}

// 🔹 Get appointments by user ID
export const getAppointmentsByUserIdService = async (
  userId: number
): Promise<TAppointmentSelect[]> => {
  return await db.query.appointments.findMany({
    where: eq(appointments.user_id, userId),
  })
}

// 🔹 Get appointment by ID
export const getAppointmentByIdService = async (
  id: number
): Promise<TAppointmentSelect | null> => {
  const result = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, id),
  })
  return result ?? null
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
  const deleted = await db.delete(appointments).where(eq(appointments.appointment_id, id))
  return (deleted?.rowCount ?? 0) > 0
}
