// src/complaints/complaint.service.ts
import db from '@/drizzle/db';
import { complaints } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type {
  TComplaintInsert,
  SanitizedPopulatedComplaint,
} from '@/types';
import { sanitizeUser } from '@/utils/sanitize';

// 🔹 Get all complaints WITH sanitized user and appointment
export const getAllComplaintsService = async (): Promise<SanitizedPopulatedComplaint[]> => {
  const complaintsList = await db.query.complaints.findMany({
    with: {
      user: true,
      appointment: true,
    },
  });

  return complaintsList.map((complaint) => ({
    ...complaint,
    user: complaint.user ? sanitizeUser(complaint.user) : undefined,
    appointment: complaint.appointment ?? undefined,
  }));
};

// 🔹 Get complaint by ID WITH sanitized user and appointment
export const getComplaintByIdService = async (
  id: number
): Promise<SanitizedPopulatedComplaint | null> => {
  const complaint = await db.query.complaints.findFirst({
    where: eq(complaints.complaint_id, id),
    with: {
      user: true,
      appointment: true,
    },
  });

  if (!complaint) return null;

  return {
    ...complaint,
    user: complaint.user ? sanitizeUser(complaint.user) : undefined,
    appointment: complaint.appointment ?? undefined,
  };
};

// 🔹 Create complaint (minimal return, could also populate if needed)
export const createComplaintService = async (
  data: TComplaintInsert
): Promise<SanitizedPopulatedComplaint> => {
  const [inserted] = await db.insert(complaints).values(data).returning();

  return {
    ...inserted,
    user: undefined,
    appointment: undefined,
  };
};

// 🔹 Update complaint status
export const updateComplaintStatusService = async (
  id: number,
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
): Promise<string> => {
  await db
    .update(complaints)
    .set({ status, updated_at: new Date() })
    .where(eq(complaints.complaint_id, id));

  return 'Complaint status updated';
};

// 🔹 Delete complaint
export const deleteComplaintService = async (
  id: number
): Promise<boolean> => {
  const deleted = await db
    .delete(complaints)
    .where(eq(complaints.complaint_id, id));

  return (deleted?.rowCount ?? 0) > 0;
};

// 🔹 Get complaints by user ID WITH sanitized user and appointment
export const getComplaintsByUserIdService = async (
  userId: number
): Promise<SanitizedPopulatedComplaint[]> => {
  const userComplaints = await db.query.complaints.findMany({
    where: (complaints, { eq }) => eq(complaints.user_id, userId),
    with: {
      appointment: true,
      user: true,
    },
    orderBy: (complaints, { desc }) => desc(complaints.created_at),
  });

  return userComplaints.map((complaint) => ({
    ...complaint,
    user: complaint.user ? sanitizeUser(complaint.user) : undefined,
    appointment: complaint.appointment ?? undefined,
  }));
};
