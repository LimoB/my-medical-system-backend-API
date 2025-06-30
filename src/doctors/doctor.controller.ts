import { Request, Response, NextFunction } from 'express'
import {
  getDoctorsService,
  getDoctorByIdService,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from './doctor.service'

// 🔹 GET /api/doctors - Get all doctors
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('➡️ [GET] /api/doctors')

  try {
    const doctors = await getDoctorsService()
    if (!doctors.length) {
      res.status(404).json({ message: 'No doctors found' })
      return
    }
    res.status(200).json(doctors)
  } catch (error) {
    console.error('❌ getDoctors error:', error)
    next(error)
  }
}

// 🔹 GET /api/doctors/:id - Get doctor by ID
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`➡️ [GET] /api/doctors/${req.params.id}`)

  if (isNaN(doctorId)) {
    res.status(400).json({ error: 'Invalid doctor ID' })
    return
  }

  try {
    const doctor = await getDoctorByIdService(doctorId)
    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' })
      return
    }
    res.status(200).json(doctor)
  } catch (error) {
    console.error('❌ getDoctorById error:', error)
    next(error)
  }
}

// 🔹 POST /api/doctors - Create new doctor
export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { first_name, last_name, specialization } = req.body
  console.log('➡️ [POST] /api/doctors with body:', req.body)

  if (!first_name || !last_name || !specialization) {
    res.status(400).json({
      error: 'first_name, last_name, and specialization are required',
    })
    return
  }

  try {
    const message = await createDoctorService(req.body)
    res.status(201).json({ message })
  } catch (error) {
    console.error('❌ createDoctor error:', error)
    next(error)
  }
}

// 🔹 PUT /api/doctors/:id - Update doctor
export const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`➡️ [PUT] /api/doctors/${req.params.id} with:`, req.body)

  if (isNaN(doctorId)) {
    res.status(400).json({ error: 'Invalid doctor ID' })
    return
  }

  try {
    const message = await updateDoctorService(doctorId, req.body)
    res.status(200).json({ message })
  } catch (error) {
    console.error('❌ updateDoctor error:', error)
    next(error)
  }
}

// 🔹 DELETE /api/doctors/:id - Delete doctor
export const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`➡️ [DELETE] /api/doctors/${req.params.id}`)

  if (isNaN(doctorId)) {
    res.status(400).json({ error: 'Invalid doctor ID' })
    return
  }

  try {
    const deleted = await deleteDoctorService(doctorId)
    if (deleted) {
      res.status(200).json({ message: 'Doctor deleted successfully' })
    } else {
      res.status(404).json({ message: 'Doctor not found or not deleted' })
    }
  } catch (error) {
    console.error('❌ deleteDoctor error:', error)
    next(error)
  }
}
