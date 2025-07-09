import { eq, sql } from 'drizzle-orm';
import { alias, PgTable } from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';




import db from '@/drizzle/db';
import {
    users,
    doctors,
    appointments,
    complaints,
} from '@/drizzle/schema';

// Enums for status strings (must match DB enum values exactly)
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

// Alias helper to create table aliases and avoid TS errors on joins
function aliasTable<T extends PgTable<any>>(table: T, aliasName: string): PgTable<any> {
    return alias(table, aliasName) as any;  // cast alias as any to avoid conflicts
}

// Dashboard summary stats
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

// Weekly appointments count for Mon-Fri
export async function getWeeklyAppointments() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // find Monday

    const results = [];

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const dateStr = dayDate.toISOString().slice(0, 10);

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

// Count appointments by status
export async function getAppointmentStatusCounts() {
    const statuses = [
        APPOINTMENT_STATUS.Pending,
        APPOINTMENT_STATUS.Confirmed,
        APPOINTMENT_STATUS.Cancelled,
    ];

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

// Mock satisfaction score (replace with your logic)
export async function getSatisfactionScore() {
    return 78;
}

// Fetch recent appointments with patient and doctor names
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

    return rows.map((r: any) => ({
        patient: `${r.patient_first_name} ${r.patient_last_name}`,
        doctor:
            r.doctor_first_name && r.doctor_last_name
                ? `${r.doctor_first_name} ${r.doctor_last_name}`
                : 'Unknown Doctor',
        date: (r.appointment_date as Date).toISOString().slice(0, 10),
        time: r.time_slot.toString().slice(0, 5),
        status: r.appointment_status,
    }));
}

// Fetch recent complaints with patient names
export async function getRecentComplaints(limit = 5) {
    const patientUser = aliasTable(users, 'patientUser') as any;

    const rows = await db
        .select({
            complaint_id: complaints.complaint_id,
            subject: complaints.subject,
            description: complaints.description,
            status: complaints.status,
            created_at: complaints.created_at,
            patient_first_name: patientUser.first_name,
            patient_last_name: patientUser.last_name,
        })
        .from(complaints)
        .leftJoin(patientUser, eq(patientUser.user_id, complaints.user_id))
        .orderBy(desc(complaints.created_at))
        .limit(limit);

    return rows.map((r: any) => ({
        patient: `${r.patient_first_name} ${r.patient_last_name}`,
        issue: r.subject,
        description: r.description,
        status: r.status,
    }));
}
