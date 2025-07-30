import type { Request, Response } from 'express';
import {
  getDashboardStats,
  getWeeklyAppointments,
  getAppointmentStatusCounts,
  getSatisfactionScore,
  
} from './dashboard.service';


import { getRecentAppointments } from "./services/recentAppointments";
import { getRecentComplaints } from "./services/RecentComplaints";


export async function getStats(req: Request, res: Response) {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getWeeklyAppointmentsHandler(req: Request, res: Response) {
  try {
    const data = await getWeeklyAppointments();
    res.json(data);
  } catch (error) {
    console.error('Error getting weekly appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAppointmentStatusHandler(req: Request, res: Response) {
  try {
    const data = await getAppointmentStatusCounts();
    res.json(data);
  } catch (error) {
    console.error('Error getting appointment status counts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSatisfactionHandler(req: Request, res: Response) {
  try {
    const score = await getSatisfactionScore();
    res.json({ satisfaction: score });
  } catch (error) {
    console.error('Error getting satisfaction score:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getRecentAppointmentsHandler(req: Request, res: Response) {
  try {
    const data = await getRecentAppointments();
    res.json(data);
  } catch (error) {
    console.error('Error getting recent appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getRecentComplaintsHandler(req: Request, res: Response) {
  try {
    const data = await getRecentComplaints();
    res.json(data);
  } catch (error) {
    console.error('Error getting recent complaints:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
