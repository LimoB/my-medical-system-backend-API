import { eq, sql, desc } from 'drizzle-orm';
import { alias, PgTable } from 'drizzle-orm/pg-core';
import db from '@/drizzle/db';
import {
  users,
  doctors,
  appointments,
  complaints,
} from '@/drizzle/schema';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const APPOINTMENT_STATUS = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
} as const;

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
// Dashboard Stats
// ─────────────────────────────────────────────
export async function getDashboardStats() {
  const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = Number(totalUsersResult[0]?.count ?? 0);

  const totalDoctorsResult = await db.select({ count: sql<number>`count(*)` }).from(doctors);
  const totalDoctors = Number(totalDoctorsResult[0]?.count ?? 0);

  const todayDateStr = new Date().toISOString().slice(0, 10);

  const todaysAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.appointment_date, todayDateStr));

  const totalAppointmentsToday = todaysAppointments.length;

  const totalRevenueToday = todaysAppointments.reduce(
    (acc, appt) => acc + Number(appt.total_amount ?? 0),
    0
  );

  const openComplaintsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(complaints)
    .where(eq(complaints.status, COMPLAINT_STATUS.Open));

  const openComplaints = Number(openComplaintsResult[0]?.count ?? 0);

  return {
    totalUsers,
    totalDoctors,
    totalAppointmentsToday,
    totalRevenueToday,
    openComplaints,
  };
}

// ─────────────────────────────────────────────
// Weekly Appointments (Mon–Fri)
// ─────────────────────────────────────────────
export async function getWeeklyAppointments() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = now.getDay(); // Sunday = 0
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // adjust to Monday

  const results = [];

  for (let i = 0; i < 5; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = day.toISOString().slice(0, 10);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.appointment_date, dateStr));

    results.push({
      name: days[i],
      appointments: Number(countResult[0]?.count ?? 0),
    });
  }

  return results;
}

// ─────────────────────────────────────────────
// Appointment Status Distribution
// ─────────────────────────────────────────────
export async function getAppointmentStatusCounts() {
  const statuses = Object.values(APPOINTMENT_STATUS);
  const result = [];

  for (const status of statuses) {
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.appointment_status, status));

    result.push({
      name: status,
      value: Number(countResult[0]?.count ?? 0),
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// Patient Satisfaction (Placeholder)
// ─────────────────────────────────────────────
export async function getSatisfactionScore() {
  return 78; // TODO: replace with real calculation
}

// ─────────────────────────────────────────────
// Recent Appointments
// ─────────────────────────────────────────────
export async function getRecentAppointments(limit = 5) {
  const doctorUser = aliasTable(users, 'doctorUser') as any;
  const patientUser = aliasTable(users, 'patientUser') as any;

  const rows = await db
    .select({
      appointment_id: appointments.appointment_id,
      appointment_date: appointments.appointment_date,
      time_slot: appointments.time_slot,
      appointment_status: appointments.appointment_status,
      patient_first_name: patientUser.first_name,
      patient_last_name: patientUser.last_name,
      doctor_first_name: doctorUser.first_name,
      doctor_last_name: doctorUser.last_name,
    })
    .from(appointments)
    .leftJoin(patientUser, eq(patientUser.user_id, appointments.user_id))
    .leftJoin(doctors as any, eq(doctors.doctor_id, appointments.doctor_id))
    .leftJoin(doctorUser, eq(doctorUser.user_id, doctors.user_id))
    .orderBy(desc(appointments.created_at))
    .limit(limit);

  return rows.map((r: any) => {
    let formattedDate = null;
    try {
      formattedDate = new Date(r.appointment_date).toISOString().slice(0, 10);
    } catch {
      formattedDate = 'Invalid Date';
    }

    return {
      patient: `${r.patient_first_name ?? ''} ${r.patient_last_name ?? ''}`.trim(),
      doctor:
        r.doctor_first_name && r.doctor_last_name
          ? `${r.doctor_first_name} ${r.doctor_last_name}`
          : 'Unknown Doctor',
      date: formattedDate,
      time: r.time_slot?.toString().slice(0, 5) ?? 'N/A',
      status: r.appointment_status,
    };
  });
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
