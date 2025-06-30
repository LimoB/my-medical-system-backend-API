// --- src/appointments/appointment.service.ts ---
import db from '@/drizzle/db'
import { appointments } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { TAppointmentInsert, TAppointmentSelect } from '@/drizzle/types'

export const getAllAppointmentsService = async (): Promise<TAppointmentSelect[]> => {
  return await db.select().from(appointments)
}

export const getAppointmentByIdService = async (
  id: number
): Promise<TAppointmentSelect | null> => {
  const result = await db.query.appointments.findFirst({
    where: eq(appointments.appointment_id, id),
  })
  return result ?? null
}

export const createAppointmentService = async (
  data: TAppointmentInsert
): Promise<TAppointmentSelect> => {
  const [inserted] = await db.insert(appointments).values(data).returning()
  return inserted
}

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

export const deleteAppointmentService = async (id: number): Promise<boolean> => {
  const deleted = await db.delete(appointments).where(eq(appointments.appointment_id, id))
  return (deleted?.rowCount ?? 0) > 0
}