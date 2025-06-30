import { Request, Response, NextFunction } from 'express'
import {
  getAllComplaintsService,
  getComplaintByIdService,
  createComplaintService,
  updateComplaintStatusService,
  deleteComplaintService,
} from './complaint.service'

// 🔹 GET /api/complaints - Admin only
export const getComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('➡️ GET /api/complaints hit')

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const complaints = await getAllComplaintsService()
    if (!complaints || complaints.length === 0) {
      res.status(404).json({ message: 'No complaints found' })
      return
    }

    res.status(200).json(complaints)
  } catch (error) {
    console.error('❌ Error in getComplaintsController:', error)
    next(error)
  }
}

// 🔹 GET /api/complaints/:id - Admin or complaint owner
export const getComplaintById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10)
  console.log(`➡️ GET /api/complaints/${req.params.id} hit`)

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' })
    return
  }

  try {
    const complaint = await getComplaintByIdService(complaintId)

    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found' })
      return
    }

    if (
      req.user?.role !== 'admin' &&
      req.user?.userId !== complaint.user_id.toString()
    ) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    res.status(200).json(complaint)
  } catch (error) {
    console.error('❌ Error in getComplaintByIdController:', error)
    next(error)
  }
}

// 🔹 POST /api/complaints - Any logged-in user
export const createComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { subject, description, related_appointment_id } = req.body
  const userId = req.user?.userId

  console.log('➡️ POST /api/complaints hit with:', req.body)

  if (!userId || !subject || !description) {
    res.status(400).json({ error: 'Subject, description, and user ID are required' })
    return
  }

  try {
    const complaint = await createComplaintService({
      user_id: parseInt(userId),
      subject,
      description,
      related_appointment_id: related_appointment_id || null,
    })

    res.status(201).json(complaint)
  } catch (error) {
    console.error('❌ Error in createComplaintController:', error)
    next(error)
  }
}

// 🔹 PUT /api/complaints/:id - Admin only (update status)
export const updateComplaintStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10)
  const { status } = req.body
  console.log(`➡️ PUT /api/complaints/${req.params.id} hit with status: ${status}`)

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' })
    return
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  try {
    const message = await updateComplaintStatusService(complaintId, status)
    res.status(200).json({ message })
  } catch (error) {
    console.error('❌ Error in updateComplaintStatusController:', error)
    next(error)
  }
}

// 🔹 DELETE /api/complaints/:id - Admin only
export const deleteComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10)
  console.log(`➡️ DELETE /api/complaints/${req.params.id} hit`)

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' })
    return
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  try {
    const deleted = await deleteComplaintService(complaintId)
    if (deleted) {
      res.status(200).json({ message: 'Complaint deleted successfully' })
    } else {
      res.status(404).json({ message: 'Complaint not found or could not be deleted' })
    }
  } catch (error) {
    console.error('❌ Error in deleteComplaintController:', error)
    next(error)
  }
}
