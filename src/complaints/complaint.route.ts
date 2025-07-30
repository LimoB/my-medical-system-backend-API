import express from "express";
import {
  getComplaints,
  getComplaintById,
  getComplaintsByUserId,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from "./complaint.controller";

import { anyRoleAuth, adminAuth } from "@/middleware/bearAuth";
import validate from "@/middleware/validate";
import { newComplaintSchema, complaintStatusEnum } from "@/validation/zodSchemas";
import z from "zod";

const complaintsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management endpoints
 */

/**
 * @swagger
 * /complaints:
 *   post:
 *     summary: Submit a new complaint (any logged-in user)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               related_appointment_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Complaint submitted
 *       401:
 *         description: Unauthorized
 */
complaintsRouter.post(
  "/complaints",
  anyRoleAuth,
  validate({ body: newComplaintSchema }),
  createComplaint
);

/**
 * @swagger
 * /complaints:
 *   get:
 *     summary: Get all complaints (admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 *       403:
 *         description: Forbidden
 */
complaintsRouter.get("/complaints", adminAuth, getComplaints);

/**
 * @swagger
 * /complaints/user:
 *   get:
 *     summary: Get complaints by logged-in user (user only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints submitted by user
 *       403:
 *         description: Forbidden
 */
complaintsRouter.get("/complaints/user", anyRoleAuth, getComplaintsByUserId);

/**
 * @swagger
 * /complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID (admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint found
 *       404:
 *         description: Complaint not found
 */
complaintsRouter.get("/complaints/:id", adminAuth, getComplaintById);

/**
 * @swagger
 * /complaints/{id}:
 *   put:
 *     summary: Update complaint status (admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, In Progress, Resolved, Closed]
 *     responses:
 *       200:
 *         description: Complaint status updated
 *       404:
 *         description: Complaint not found
 */
complaintsRouter.put(
  "/complaints/:id",
  adminAuth,
  validate({
    body: z.object({
      status: complaintStatusEnum,
    }),
  }),
  updateComplaintStatus
);

/**
 * @swagger
 * /complaints/{id}:
 *   delete:
 *     summary: Delete a complaint by ID (admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Complaint deleted
 *       404:
 *         description: Complaint not found
 */
complaintsRouter.delete("/complaints/:id", adminAuth, deleteComplaint);

export default complaintsRouter;
