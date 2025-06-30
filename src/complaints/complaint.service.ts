// src/complaints/complaint.service.ts
import  db  from '@/drizzle/db'
import { complaints } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { TComplaintInsert, TComplaintSelect } from '@/drizzle/types'

export const getAllComplaintsService = async (): Promise<TComplaintSelect[]> => {
  return await db.select().from(complaints)
}

export const getComplaintByIdService = async (
  id: number
): Promise<TComplaintSelect | null> => {
  const result = await db.query.complaints.findFirst({
    where: eq(complaints.complaint_id, id),
  })
  return result ?? null
}

export const createComplaintService = async (
  data: TComplaintInsert
): Promise<TComplaintSelect> => {
  const [inserted] = await db.insert(complaints).values(data).returning()
  return inserted
}

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

export const deleteComplaintService = async (id: number): Promise<boolean> => {
  const deleted = await db
    .delete(complaints)
    .where(eq(complaints.complaint_id, id))

  return (deleted?.rowCount ?? 0) > 0
}

