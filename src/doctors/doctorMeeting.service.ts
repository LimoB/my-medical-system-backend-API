import db from '@/drizzle/db';
import {
    doctorMeetings,
    doctorMeetingAttendance,
    doctors,
    users,
} from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import type {
    TDoctorMeetingSelect,
    TDoctorMeetingAttendanceSelect,
    SanitizedDoctorMeeting,
} from '@/drizzle/types';
import { sanitizeUser } from '@/utils/sanitize';

// ────────────────────────────────
// 🧼 Utility to sanitize meeting
// ────────────────────────────────
const sanitizeMeeting = async (
    meeting: TDoctorMeetingSelect
): Promise<SanitizedDoctorMeeting> => {
    const attendanceRecords = await db.query.doctorMeetingAttendance.findMany({
        where: eq(doctorMeetingAttendance.meeting_id, meeting.meeting_id),
        with: {
            doctor: {
                with: {
                    user: true,
                },
            },
        },
    });

    return {
        ...meeting,
        attendees: attendanceRecords.map((att) => ({
            id: att.id,
            doctor_id: att.doctor_id,
            meeting_id: att.meeting_id,
            status: att.status,
            attended: att.attended,
            created_at: att.created_at ?? null, // ✅ add this
            doctor: att.doctor
                ? {
                    ...att.doctor,
                    user: att.doctor.user ? sanitizeUser(att.doctor.user) : undefined,
                }
                : undefined,
        })),

    };
};

// ────────────────────────────────
// 🔹 Get all meetings
// ────────────────────────────────
export const getAllMeetingsService = async (): Promise<SanitizedDoctorMeeting[]> => {
    try {
        const meetings = await db.query.doctorMeetings.findMany({
            orderBy: [desc(doctorMeetings.meeting_date)],
        });

        const sanitized = await Promise.all(meetings.map(sanitizeMeeting));
        return sanitized;
    } catch (error) {
        console.error('❌ Error fetching meetings:', error);
        throw new Error('Failed to fetch meetings');
    }
};

// ────────────────────────────────
// 🔹 Get meeting by ID
// ────────────────────────────────
export const getMeetingByIdService = async (
    meetingId: number
): Promise<SanitizedDoctorMeeting | null> => {
    try {
        const meeting = await db.query.doctorMeetings.findFirst({
            where: eq(doctorMeetings.meeting_id, meetingId),
        });

        if (!meeting) return null;
        return await sanitizeMeeting(meeting);
    } catch (error) {
        console.error(`❌ Error fetching meeting ${meetingId}:`, error);
        throw new Error('Failed to fetch meeting');
    }
};

// ────────────────────────────────
// 🔹 Delete meeting (and attendance)
// ────────────────────────────────
export const deleteMeetingService = async (meetingId: number): Promise<boolean> => {
    try {
        await db
            .delete(doctorMeetingAttendance)
            .where(eq(doctorMeetingAttendance.meeting_id, meetingId));

        const result = await db
            .delete(doctorMeetings)
            .where(eq(doctorMeetings.meeting_id, meetingId))
            .returning();

        return result.length > 0;
    } catch (error) {
        console.error(`❌ Error deleting meeting ${meetingId}:`, error);
        throw new Error('Failed to delete meeting');
    }
};

// ────────────────────────────────
// 🔹 Update meeting attendance
// ────────────────────────────────
export const updateMeetingAttendanceService = async (
    attendanceId: number,
    updates: Partial<Pick<TDoctorMeetingAttendanceSelect, 'status' | 'attended'>>
): Promise<string> => {
    try {
        const result = await db
            .update(doctorMeetingAttendance)
            .set(updates)
            .where(eq(doctorMeetingAttendance.id, attendanceId))
            .returning();

        if (result.length === 0) {
            throw new Error('Attendance update failed or not found');
        }

        return 'Attendance updated successfully!';
    } catch (error) {
        console.error(`❌ Error updating attendance ${attendanceId}:`, error);
        throw new Error('Failed to update attendance');
    }
};

// ────────────────────────────────
// 🔹 Delete meeting attendance
// ────────────────────────────────
export const deleteMeetingAttendanceService = async (
    attendanceId: number
): Promise<boolean> => {
    try {
        const result = await db
            .delete(doctorMeetingAttendance)
            .where(eq(doctorMeetingAttendance.id, attendanceId))
            .returning();

        return result.length > 0;
    } catch (error) {
        console.error(`❌ Error deleting attendance ${attendanceId}:`, error);
        throw new Error('Failed to delete attendance record');
    }
};
