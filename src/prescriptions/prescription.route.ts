import express from 'express'
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '@/prescriptions/prescription.controller'

import { adminAuth, doctorAuth, anyRoleAuth } from '@/middleware/bearAuth'

const prescriptionRouter = express.Router()

// Admin or doctor only
prescriptionRouter.get('/prescriptions', doctorAuth)

// Admin, doctor, or owner (ownership logic in controller)
prescriptionRouter.get('/prescriptions/:id', anyRoleAuth, getPrescriptionById)

// Doctor only
prescriptionRouter.post('/prescriptions', doctorAuth)

// Doctor or admin
prescriptionRouter.put('/prescriptions/:id', doctorAuth)

// Admin only
prescriptionRouter.delete('/prescriptions/:id', adminAuth)

export default prescriptionRouter
