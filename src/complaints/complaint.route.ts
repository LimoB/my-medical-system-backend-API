// src/complaints/complaint.routes.ts
import express from 'express'
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from './complaint.controller'
import { anyRoleAuth, adminAuth } from '@/middleware/bearAuth'

const complaintsRouter = express.Router()

// Public creation
complaintsRouter.post('/complaints', anyRoleAuth, createComplaint)

// Admin-only
complaintsRouter.get('/complaints', adminAuth, getComplaints)
complaintsRouter.get('/complaints/:id', adminAuth, getComplaintById)
complaintsRouter.put('/complaints/:id', adminAuth, updateComplaintStatus)
complaintsRouter.delete('/complaints/:id', adminAuth, deleteComplaint)

export default complaintsRouter
