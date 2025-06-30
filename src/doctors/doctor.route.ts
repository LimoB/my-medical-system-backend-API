import express from 'express'
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from './doctor.controller'
import { adminAuth } from '@/middleware/bearAuth'

const doctorRouter = express.Router()

// Public access
doctorRouter.get('/doctors', getDoctors)
doctorRouter.get('/doctors/:id', getDoctorById)

// Admin-only
doctorRouter.post('/doctors', adminAuth, createDoctor)
doctorRouter.put('/doctors/:id', adminAuth, updateDoctor)
doctorRouter.delete('/doctors/:id', adminAuth, deleteDoctor)

export default doctorRouter
