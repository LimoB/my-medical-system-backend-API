import type { Request, Response } from 'express';
import {
    getAllMeetingsService,
    getMeetingByIdService,
    deleteMeetingService,
    updateMeetingAttendanceService,
    deleteMeetingAttendanceService,
} from '@/doctors/doctorMeeting.service';

import { doctorMeetingAttendance, doctorMeetings, doctors } from '@/drizzle/schema';
import db from '@/drizzle/db';
import { eq } from 'drizzle-orm';

// ────────────────────────────────
// 🔹 GET all meetings
// ────────────────────────────────
export const getAllMeetingsController = async (_req: Request, res: Response) => {
    try {
        const meetings = await getAllMeetingsService();
        res.status(200).json(meetings);
    } catch (error) {
        console.error('❌ getAllMeetingsController:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};

// ────────────────────────────────
// 🔹 GET single meeting
// ────────────────────────────────
export const getMeetingByIdController = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        if (isNaN(meetingId)) return res.status(400).json({ error: 'Invalid meeting ID' });

        const meeting = await getMeetingByIdService(meetingId);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

        res.status(200).json(meeting);
    } catch (error) {
        console.error('❌ getMeetingByIdController:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
};



// ────────────────────────────────
// 🔹 POST create meeting (global or individual)
// ────────────────────────────────
export const createDoctorMeetingController = async (req: Request, res: Response) => {
    try {
        const { title, description, meeting_date, meeting_time, is_global } = req.body;

        if (!title || !meeting_date || !meeting_time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const createdAt = new Date();
        const meetingBase = {
            title,
            description,
            meeting_date,
            meeting_time,
            is_global: !!is_global,
            created_at: createdAt,
            updated_at: createdAt,
        };

        // 1️⃣ Global meeting: Insert one record into doctorMeetings and attendance for each doctor
        if (is_global) {
            // Insert meeting
            const [globalMeeting] = await db.insert(doctorMeetings).values(meetingBase).returning();

            // Fetch all doctors
            const allDoctors = await db.select().from(doctors);

            // Insert attendance record for each doctor
            const attendanceValues = allDoctors.map((doctor) => ({
                doctor_id: doctor.doctor_id, // ✅ Correct property
                meeting_id: globalMeeting.meeting_id,
                status: null,
                attended: null,
            }));


            await db.insert(doctorMeetingAttendance).values(attendanceValues);

            return res.status(201).json({
                message: 'Global meeting created for all doctors',
                meeting: globalMeeting,
            });
        }

        // 2️⃣ Non-global meeting: Insert basic meeting only
        const [result] = await db.insert(doctorMeetings).values(meetingBase).returning();

        if (!result) {
            return res.status(500).json({ error: 'Failed to create meeting' });
        }

        return res.status(201).json({
            message: 'Meeting created successfully',
            meeting: result,
        });
    } catch (error) {
        console.error('❌ createDoctorMeetingController:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
};


// ────────────────────────────────
// 🔹 PUT update attendance record
// ────────────────────────────────
export const updateMeetingAttendanceController = async (req: Request, res: Response) => {
    try {
        const attendanceId = Number(req.params.id);
        if (isNaN(attendanceId)) {
            return res.status(400).json({ error: 'Invalid attendance ID' });
        }

        const { status, attended } = req.body;

        const message = await updateMeetingAttendanceService(attendanceId, { status, attended });
        res.status(200).json({ message });
    } catch (error) {
        console.error('❌ updateMeetingAttendanceController:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
};

// ────────────────────────────────
// 🔹 DELETE attendance record
// ────────────────────────────────
export const deleteMeetingAttendanceController = async (req: Request, res: Response) => {
    try {
        const attendanceId = Number(req.params.id);
        if (isNaN(attendanceId)) {
            return res.status(400).json({ error: 'Invalid attendance ID' });
        }

        const success = await deleteMeetingAttendanceService(attendanceId);
        if (!success) return res.status(404).json({ error: 'Attendance record not found' });

        res.status(200).json({ message: 'Attendance record deleted' });
    } catch (error) {
        console.error('❌ deleteMeetingAttendanceController:', error);
        res.status(500).json({ error: 'Failed to delete attendance record' });
    }
};

// ────────────────────────────────
// 🔹 DELETE meeting + attendance
// ────────────────────────────────
export const deleteDoctorMeetingController = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        if (isNaN(meetingId)) return res.status(400).json({ error: 'Invalid meeting ID' });

        const success = await deleteMeetingService(meetingId);
        if (!success) return res.status(404).json({ error: 'Meeting not found' });

        res.status(200).json({ message: 'Meeting and related attendance records deleted' });
    } catch (error) {
        console.error('❌ deleteDoctorMeetingController:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
};
