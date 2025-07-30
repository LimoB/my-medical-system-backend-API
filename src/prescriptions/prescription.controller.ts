import type { Request, Response, NextFunction } from 'express'
import {
  getPrescriptionsService,
  getPrescriptionByIdService,
  createPrescriptionService,
  updatePrescriptionService,
  deletePrescriptionService,
} from '@/prescriptions/prescription.service'
import { getPrescriptionsByUserIdService } from '@/prescriptions/prescription.service';


// 🔹 GET /api/prescriptions/user/:userId - Only the user themselves, doctor, or admin
export const getPrescriptionsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  console.log(`GET /api/prescriptions/user/${userId} hit`);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const requesterId = req.user?.userId;
  const requesterRole = req.user?.role;

  if (
    requesterRole !== 'admin' &&
    requesterRole !== 'doctor' &&
    requesterId !== userId
  ) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  try {
    const prescriptions = await getPrescriptionsByUserIdService(userId);

    if (!prescriptions || prescriptions.length === 0) {
      res.status(404).json({ message: 'No prescriptions found for user' });
      return;
    }

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error(`Error in getPrescriptionsByUserIdController:`, error);
    next(error);
  }
};


// 🔹 GET /api/prescriptions - Admin or doctor only
export const getPrescriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('GET /api/prescriptions hit')

  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'doctor') {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const prescriptions = await getPrescriptionsService()
    if (!prescriptions || prescriptions.length === 0) {
      res.status(404).json({ message: 'No prescriptions found' })
      return
    }

    res.status(200).json(prescriptions)
  } catch (error) {
    console.error('Error in getPrescriptionsController:', error)
    next(error)
  }
}

// 🔹 GET /api/prescriptions/:id - Admin, doctor, or owner
export const getPrescriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const prescriptionId = parseInt(req.params.id, 10)
  console.log(`GET /api/prescriptions/${req.params.id} hit`)

  if (isNaN(prescriptionId)) {
    res.status(400).json({ error: 'Invalid prescription ID' })
    return
  }

  try {
    const prescription = await getPrescriptionByIdService(prescriptionId)
    if (!prescription) {
      res.status(404).json({ message: 'Prescription not found' })
      return
    }

    const userId = req.user?.userId?.toString()

    if (
      req.user?.role !== 'admin' &&
      req.user?.role !== 'doctor' &&
      prescription.patient?.user_id?.toString() !== userId
    ) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    res.status(200).json(prescription)
  } catch (error) {
    console.error('Error in getPrescriptionByIdController:', error)
    next(error)
  }
}

// 🔹 POST /api/prescriptions - Doctor only
export const createPrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const prescriptionData = req.body
  console.log('POST /api/prescriptions hit with:', prescriptionData)

  if (req.user?.role !== 'doctor') {
    res.status(403).json({ error: 'Only doctors can create prescriptions' })
    return
  }

  try {
    const message = await createPrescriptionService(prescriptionData)
    res.status(201).json({ message })
  } catch (error) {
    console.error('Error in createPrescriptionController:', error)
    next(error)
  }
}

// 🔹 PUT /api/prescriptions/:id - Doctor or admin
export const updatePrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const prescriptionId = parseInt(req.params.id, 10)
  const updates = req.body
  console.log(`PUT /api/prescriptions/${req.params.id} hit with:`, updates)

  if (isNaN(prescriptionId)) {
    res.status(400).json({ error: 'Invalid prescription ID' })
    return
  }

  if (req.user?.role !== 'admin' && req.user?.role !== 'doctor') {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  try {
    const message = await updatePrescriptionService(prescriptionId, updates)
    res.status(200).json({ message })
  } catch (error) {
    console.error('Error in updatePrescriptionController:', error)
    next(error)
  }
}

// 🔹 DELETE /api/prescriptions/:id - Admin only
export const deletePrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const prescriptionId = parseInt(req.params.id, 10)
  console.log(`DELETE /api/prescriptions/${req.params.id} hit`)

  if (isNaN(prescriptionId)) {
    res.status(400).json({ error: 'Invalid prescription ID' })
    return
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  try {
    const deleted = await deletePrescriptionService(prescriptionId)
    if (deleted) {
      res.status(200).json({ message: 'Prescription deleted successfully' })
    } else {
      res.status(404).json({ message: 'Prescription not found or could not be deleted' })
    }
  } catch (error) {
    console.error('Error in deletePrescriptionController:', error)
    next(error)
  }
}
