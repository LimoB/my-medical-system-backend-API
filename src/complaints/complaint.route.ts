import express from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from './complaint.controller';
import { anyRoleAuth, adminAuth } from '@/middleware/bearAuth';

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
 *               - message
 *               - userId
 *             properties:
 *               message:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint submitted
 *       401:
 *         description: Unauthorized
 */
complaintsRouter.post('/complaints', anyRoleAuth, createComplaint);

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
complaintsRouter.get('/complaints', adminAuth, getComplaints);

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
complaintsRouter.get('/complaints/:id', adminAuth, getComplaintById);

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
 *                 enum: [open, resolved, rejected]
 *     responses:
 *       200:
 *         description: Complaint status updated
 *       404:
 *         description: Complaint not found
 */
complaintsRouter.put('/complaints/:id', adminAuth, updateComplaintStatus);

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
complaintsRouter.delete('/complaints/:id', adminAuth, deleteComplaint);

export default complaintsRouter;
