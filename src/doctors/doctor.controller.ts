import { Request, Response, NextFunction } from 'express'
import {
  getDoctorsService,
  getDoctorByIdService,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from './doctor.service'
import { newUserSchema, newDoctorSchema } from '@/validation/zodSchemas'
import { z } from 'zod'

// 🔹 GET /api/doctors
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('[GET] /api/doctors')

  try {
    const doctors = await getDoctorsService()
    if (!doctors.length) {
      res.status(404).json({ message: 'No doctors found' })
      return
    }
    res.status(200).json(doctors)
  } catch (error) {
    console.error('getDoctors error:', error)
    next(error)
  }
}

// 🔹 GET /api/doctors/:id
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`[GET] /api/doctors/${req.params.id}`)

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
    console.error('getDoctorById error:', error)
    next(error)
  }
}

// 🔹 POST /api/doctors
export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('[POST] /api/doctors with body:', req.body)

  try {
    const userData = newUserSchema.parse(req.body)
    const doctorData = newDoctorSchema.parse(req.body)

    const message = await createDoctorService({ ...userData, ...doctorData })
    res.status(201).json({ message })
  } catch (error) {
    console.error('createDoctor error:', error)
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.flatten() })
    } else {
      next(error)
    }
  }
}

// 🔹 PUT /api/doctors/:id
export const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`[PUT] /api/doctors/${req.params.id} with:`, req.body)

  if (isNaN(doctorId)) {
    res.status(400).json({ error: 'Invalid doctor ID' })
    return
  }

  try {
    const parsedDoctor = newDoctorSchema.partial().parse(req.body)
    const parsedUser = newUserSchema.partial().parse(req.body)

    const message = await updateDoctorService(doctorId, {
      ...parsedUser,
      ...parsedDoctor,
    })

    res.status(200).json({ message })
  } catch (error) {
    console.error('updateDoctor error:', error)
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.flatten() })
    } else {
      next(error)
    }
  }
}

// 🔹 DELETE /api/doctors/:id
export const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const doctorId = parseInt(req.params.id, 10)
  console.log(`[DELETE] /api/doctors/${req.params.id}`)

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
    console.error('deleteDoctor error:', error)
    next(error)
  }
}
