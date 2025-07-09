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

// Main dashboard summary stats
dashboardRouter.get('/stats', getStats);

// Weekly appointments chart data
dashboardRouter.get('/appointments/weekly', getWeeklyAppointmentsHandler);

// Appointment status pie chart data
dashboardRouter.get('/appointments/status', getAppointmentStatusHandler);

// Patient satisfaction gauge data
dashboardRouter.get('/satisfaction', getSatisfactionHandler);

// Recent appointments list
dashboardRouter.get('/appointments/recent', getRecentAppointmentsHandler);

// Recent complaints list
dashboardRouter.get('/complaints/recent', getRecentComplaintsHandler);

export default dashboardRouter;
