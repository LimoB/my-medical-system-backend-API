import { eq, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import db from '@/drizzle/db';
import { users, doctors, appointments } from '@/drizzle/schema';

export async function getRecentAppointments(limit = 5) {
    // ✅ Use `as any` to safely bypass TS conflicts from aliasing
    const patientUser = alias(users, 'patient_user') as any;
    const doctorTable = alias(doctors, 'doctor') as any;
    const doctorUser = alias(users, 'doctor_user') as any;

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
        .leftJoin(doctorTable, eq(doctorTable.doctor_id, appointments.doctor_id))
        .leftJoin(doctorUser, eq(doctorUser.user_id, doctorTable.user_id))
        .orderBy(desc(appointments.created_at))
        .limit(limit);

    return rows.map((r: any) => {
        let formattedDate = 'Invalid Date';
        try {
            formattedDate = new Date(r.appointment_date).toISOString().slice(0, 10);
        } catch {
            // fallback already applied
        }

        return {
            patient: `${r.patient_first_name ?? ''} ${r.patient_last_name ?? ''}`.trim(),
            doctor:
                r.doctor_first_name && r.doctor_last_name
                    ? `${r.doctor_first_name} ${r.doctor_last_name}`
                    : 'Unknown Doctor',
            date: formattedDate,
            time: (r.time_slot as string)?.slice(0, 5) ?? 'N/A',
            status: r.appointment_status,
        };
    });
}