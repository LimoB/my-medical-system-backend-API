import express from 'express'
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from './appointment.controller'

const appointmentsRouter = express.Router()

appointmentsRouter.get('/appointments', getAppointments)
appointmentsRouter.get('/appointments:id', getAppointmentById)
appointmentsRouter.post('/appointments', createAppointment)
appointmentsRouter.put('/appointments:id/status', updateAppointmentStatus)
appointmentsRouter.delete('/appointments:id', deleteAppointment)

export default appointmentsRouter
