
import { eq, sql, desc } from 'drizzle-orm';
import { alias, PgTable } from 'drizzle-orm/pg-core';
import db from '@/drizzle/db';
import {
  users,
  doctors,
  appointments,
  complaints,
} from '@/drizzle/schema';



const COMPLAINT_STATUS = {
  Open: 'Open',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Closed: 'Closed',
} as const;

function aliasTable<T extends PgTable<any>>(table: T, aliasName: string): PgTable<any> {
  return alias(table, aliasName) as any;
}


// ─────────────────────────────────────────────
// Recent Complaints
// ─────────────────────────────────────────────
export async function getRecentComplaints(limit = 5) {
  const patientUser = aliasTable(users, 'patientUser') as any;

  const rows = await db
    .select({
      complaint_id: complaints.complaint_id,
      subject: complaints.subject,
      description: complaints.description,
      status: complaints.status,
      created_at: complaints.created_at,  // Keep the created_at field
      patient_first_name: patientUser.first_name,
      patient_last_name: patientUser.last_name,
    })
    .from(complaints)
    .leftJoin(patientUser, eq(patientUser.user_id, complaints.user_id))
    .orderBy(desc(complaints.created_at))
    .limit(limit);

  return rows.map((r: any) => ({
    patient: `${r.patient_first_name ?? ''} ${r.patient_last_name ?? ''}`.trim(),
    issue: r.subject,
    description: r.description,
    status: r.status,
    created_at: r.created_at,  // Make sure to return the created_at field
  }));
}