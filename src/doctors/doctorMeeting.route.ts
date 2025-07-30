import { Router } from 'express';
import {
  createDoctorMeetingController,
  getAllMeetingsController,
  getMeetingByIdController,
  updateMeetingAttendanceController,
  deleteMeetingAttendanceController,
  deleteDoctorMeetingController,
} from '@/doctors/controllers/doctorMeeting.controller';
import { adminAuth } from '@/middleware/bearAuth';

const meetingRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Doctor Meetings
 *   description: Manage doctor meetings and attendance
 */

/**
 * @swagger
 * /doctor-meetings:
 *   post:
 *     summary: Create a new doctor meeting (admin only)
 *     tags: [Doctor Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - meeting_date
 *               - meeting_time
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               meeting_date:
 *                 type: string
 *                 format: date
 *               meeting_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Meeting created
 */
meetingRouter.post('/doctor-meetings', adminAuth, createDoctorMeetingController);

/**
 * @swagger
 * /doctor-meetings/{id}:
 *   delete:
 *     summary: Delete a meeting (admin only)
 *     tags: [Doctor Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Meeting deleted
 */
meetingRouter.delete('/doctor-meetings/:id', adminAuth, deleteDoctorMeetingController);

/**
 * @swagger
 * /doctor-meetings/attendance/{id}:
 *   put:
 *     summary: Update attendance status for a doctor
 *     tags: [Doctor Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attended:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 example: "present"
 *     responses:
 *       200:
 *         description: Attendance updated
 */
meetingRouter.put('/doctor-meetings/attendance/:id', adminAuth, updateMeetingAttendanceController);

/**
 * @swagger
 * /doctor-meetings/attendance/{id}:
 *   delete:
 *     summary: Delete a doctor's attendance record (admin only)
 *     tags: [Doctor Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Attendance record deleted
 */
meetingRouter.delete('/doctor-meetings/attendance/:id', adminAuth, deleteMeetingAttendanceController);

/**
 * @swagger
 * /doctor-meetings:
 *   get:
 *     summary: Get all doctor meetings (admin/public)
 *     tags: [Doctor Meetings]
 *     responses:
 *       200:
 *         description: List of meetings
 */
meetingRouter.get('/doctor-meetings', getAllMeetingsController);

/**
 * @swagger
 * /doctor-meetings/{id}:
 *   get:
 *     summary: Get a meeting by ID (admin/public)
 *     tags: [Doctor Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 */
meetingRouter.get('/doctor-meetings/:id', getMeetingByIdController);

export default meetingRouter;
