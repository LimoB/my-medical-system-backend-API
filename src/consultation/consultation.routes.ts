import express from 'express';
import {
    createConsultation,
    getAllConsultations,
    getDoctorConsultations,
    getPatientConsultations,
    getConsultationById,
    getConsultationByAppointmentId,
    deleteConsultation,
} from './consultation.controller';

import {
    adminAuth,
    anyRoleAuth,
    doctorAuth,
} from '@/middleware/bearAuth';

import validate from '@/middleware/validate';
import { newConsultationSchema } from '@/validation/zodSchemas';

const consultationsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Consultations
 *   description: Consultation management
 */

// 🔹 Get all consultations (Admin only)
consultationsRouter.get(
    '/consultations',
    adminAuth,
    (req, res, next) => {
        console.log('Accessing GET /consultations by user:', req.user);
        next();
    },
    getAllConsultations
);

// 🔹 Get consultations for logged-in doctor
consultationsRouter.get(
    '/consultations/doctor',
    doctorAuth,
    (req, res, next) => {
        console.log('Accessing GET /consultations/doctor by user:', req.user);
        next();
    },
    getDoctorConsultations
);

// 🔹 Get consultations for a specific patient (admin or patient themself)
consultationsRouter.get(
    '/consultations/patient/:id',
    anyRoleAuth,
    (req, res, next) => {
        console.log(`Accessing GET /consultations/patient/${req.params.id} by:`, req.user);
        next();
    },
    getPatientConsultations
);

// 🔹 Get a consultation by consultation ID
consultationsRouter.get(
    '/consultations/:id',
    anyRoleAuth,
    (req, res, next) => {
        console.log(`Accessing GET /consultations/${req.params.id} by:`, req.user);
        next();
    },
    getConsultationById
);

// 🔹 Get consultation by appointment ID (after appointment is completed)
consultationsRouter.get(
    '/consultations/appointment/:appointmentId',
    anyRoleAuth,
    (req, res, next) => {
        console.log(`Accessing GET /consultations/appointment/${req.params.appointmentId} by:`, req.user);
        next();
    },
    getConsultationByAppointmentId
);

// 🔹 Create consultation (Doctor only)
consultationsRouter.post(
    '/consultations',
    doctorAuth,
    validate({ body: newConsultationSchema }),
    (req, res, next) => {
        console.log('Creating consultation by doctor:', req.user);
        next();
    },
    createConsultation
);

// 🔹 Delete consultation (Admin only)
consultationsRouter.delete(
    '/consultations/:id',
    adminAuth,
    (req, res, next) => {
        console.log(`Deleting consultation ${req.params.id} by admin:`, req.user);
        next();
    },
    deleteConsultation
);

import { getDoctorByUserId } from './consultation.controller'; // adjust path if needed


// 🔹 Get doctor by associated user ID
consultationsRouter.get(
    '/doctors/user/:userId',
    // anyRoleAuth,
    (req, res, next) => {
        console.log(`Accessing GET /doctors/user/${req.params.userId} by:`, req.user);
        next();
    },
    getDoctorByUserId
);



export default consultationsRouter;
