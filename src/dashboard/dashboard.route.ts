import express from 'express';
import {
  getStats,
  getWeeklyAppointmentsHandler,
  getAppointmentStatusHandler,
  getSatisfactionHandler,
  getRecentAppointmentsHandler,
  getRecentComplaintsHandler,
} from './dashboard.controller';

const dashboardRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard analytics endpoints
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary stats returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalDoctors:
 *                   type: number
 *                 totalAppointmentsToday:
 *                   type: number
 *                 totalRevenueToday:
 *                   type: number
 *                 openComplaints:
 *                   type: number
 */
dashboardRouter.get('/dashboard/stats', getStats);

/**
 * @swagger
 * /dashboard/appointments/weekly:
 *   get:
 *     summary: Get weekly appointment data (Mon-Fri)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly appointment chart data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   appointments:
 *                     type: number
 */
dashboardRouter.get('/dashboard/appointments/weekly', getWeeklyAppointmentsHandler);

/**
 * @swagger
 * /dashboard/appointments/status:
 *   get:
 *     summary: Get appointment status distribution
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pie chart data for appointment statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   value:
 *                     type: number
 */
dashboardRouter.get('/dashboard/appointments/status', getAppointmentStatusHandler);

/**
 * @swagger
 * /dashboard/satisfaction:
 *   get:
 *     summary: Get patient satisfaction score
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Satisfaction score as percentage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   description: Percentage value (0-100)
 */
dashboardRouter.get('/dashboard/satisfaction', getSatisfactionHandler);

/**
 * @swagger
 * /dashboard/appointments/recent:
 *   get:
 *     summary: Get recent appointments list
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent appointment data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   patient:
 *                     type: string
 *                   doctor:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   time:
 *                     type: string
 *                   status:
 *                     type: string
 */
dashboardRouter.get('/dashboard/appointments/recent', getRecentAppointmentsHandler);

/**
 * @swagger
 * /dashboard/complaints/recent:
 *   get:
 *     summary: Get recent complaints list
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent complaints data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   patient:
 *                     type: string
 *                   issue:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 */
dashboardRouter.get('/dashboard/complaints/recent', getRecentComplaintsHandler);

export default dashboardRouter;
