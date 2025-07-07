// src/complaints/complaint.service.ts
import db from '@/drizzle/db'
import { complaints } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { TComplaintInsert, TComplaintSelect } from '@/drizzle/types'

// 🔹 Get all complaints WITH user and appointment
export const getAllComplaintsService = async () => {
  return await db.query.complaints.findMany({
    with: {
      user: true,
      appointment: true,
    },
  })
}

// 🔹 Get complaint by ID WITH user and appointment
export const getComplaintByIdService = async (
  id: number
) => {
  return await db.query.complaints.findFirst({
    where: eq(complaints.complaint_id, id),
    with: {
      user: true,
      appointment: true,
    },
  })
}

// 🔹 Create complaint
export const createComplaintService = async (
  data: TComplaintInsert
): Promise<TComplaintSelect> => {
  const [inserted] = await db.insert(complaints).values(data).returning()
  return inserted
}

// 🔹 Update complaint status
export const updateComplaintStatusService = async (
  id: number,
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
): Promise<string> => {
  await db
    .update(complaints)
    .set({ status, updated_at: new Date() })
    .where(eq(complaints.complaint_id, id))
  return 'Complaint status updated'
}

// 🔹 Delete complaint
export const deleteComplaintService = async (
  id: number
): Promise<boolean> => {
  const deleted = await db
    .delete(complaints)
    .where(eq(complaints.complaint_id, id))

  return (deleted?.rowCount ?? 0) > 0
}
