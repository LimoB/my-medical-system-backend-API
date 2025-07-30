import type { Request, Response, NextFunction } from 'express';
import {
  getAllComplaintsService,
  getComplaintByIdService,
  getComplaintsByUserIdService,
  createComplaintService,
  updateComplaintStatusService,
  deleteComplaintService,
} from './complaint.service';
import { getAppointmentByIdService } from '@/appointments/appointment.service';

// 🔹 GET /api/complaints - Admin only
export const getComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('➡️ GET /api/complaints hit');

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const complaints = await getAllComplaintsService();
    if (!complaints || complaints.length === 0) {
      res.status(404).json({ message: 'No complaints found' });
      return;
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error('❌ Error in getComplaints:', error);
    next(error);
  }
};

// 🔹 GET /api/complaints/user - Authenticated user only
export const getComplaintsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('➡️ GET /api/complaints/user hit');

  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const complaints = await getComplaintsByUserIdService(userId);

    res.status(200).json(complaints);
  } catch (error) {
    console.error('❌ Error in getComplaintsByUserId:', error);
    next(error);
  }
};

// 🔹 GET /api/complaints/:id - Admin or complaint owner
export const getComplaintById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10);
  console.log(`➡️ GET /api/complaints/${req.params.id} hit`);

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' });
    return;
  }

  try {
    const complaint = await getComplaintByIdService(complaintId);

    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found' });
      return;
    }

    if (
      req.user?.role !== 'admin' &&
      req.user?.userId !== complaint.user_id
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error('❌ Error in getComplaintById:', error);
    next(error);
  }
};



// 🔹 POST /api/complaints - Any logged-in user
// 🔹 POST /api/complaints - Any logged-in user
export const createComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { subject, description, related_appointment_id } = req.body;
  const userId = req.user?.userId;

  console.log('➡️ [POST] /api/complaints');
  console.log('📥 Request body:', req.body);
  console.log('🧠 Extracted userId:', userId);

  if (!userId || !subject || !description) {
    console.warn('⚠️ Missing required fields');
    res.status(400).json({ error: 'Subject, description, and authenticated user ID are required' });
    return;
  }

  try {
    if (related_appointment_id) {
      console.log('🔗 Validating related appointment:', related_appointment_id);
      const appointment = await getAppointmentByIdService(related_appointment_id);

      if (!appointment) {
        console.warn('🚫 Appointment not found');
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      if (appointment.user_id !== userId) {
        console.warn(`🚫 Unauthorized complaint link attempt by user ${userId} on appointment ${related_appointment_id}`);
        res.status(403).json({ error: 'You can only link complaints to your own appointments' });
        return;
      }
    }

    console.log('✅ Creating complaint with data:', {
      user_id: userId,
      subject,
      description,
      related_appointment_id: related_appointment_id ?? null,
    });

    const complaint = await createComplaintService({
      user_id: userId,
      subject,
      description,
      related_appointment_id: related_appointment_id ?? null,
    });

    console.log('🎉 Complaint created successfully:', complaint);
    res.status(201).json(complaint);
  } catch (error) {
    console.error('❌ Error in createComplaint:', error);
    next(error);
  }
};





// 🔹 PUT /api/complaints/:id - Admin only (update status)
export const updateComplaintStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10);
  const { status } = req.body;
  console.log(`➡️ PUT /api/complaints/${req.params.id} hit with status: ${status}`);

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' });
    return;
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  try {
    const message = await updateComplaintStatusService(complaintId, status);
    res.status(200).json({ message });
  } catch (error) {
    console.error('❌ Error in updateComplaintStatus:', error);
    next(error);
  }
};

// 🔹 DELETE /api/complaints/:id - Admin only
export const deleteComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const complaintId = parseInt(req.params.id, 10);
  console.log(`➡️ DELETE /api/complaints/${req.params.id} hit`);

  if (isNaN(complaintId)) {
    res.status(400).json({ error: 'Invalid complaint ID' });
    return;
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  try {
    const deleted = await deleteComplaintService(complaintId);
    if (deleted) {
      res.status(200).json({ message: 'Complaint deleted successfully' });
    } else {
      res.status(404).json({ message: 'Complaint not found or could not be deleted' });
    }
  } catch (error) {
    console.error('❌ Error in deleteComplaint:', error);
    next(error);
  }
};
