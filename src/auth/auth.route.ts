import { Router } from "express";
import { createUser } from "@/auth/controllers/authRegister.controller";
import { loginUser } from "@/auth/controllers/authLogin.controller";
import { verifyEmail } from "@/auth/controllers/authVerify.controller";
import { forgotPassword } from "@/auth/controllers/forgotPassword.controller";
import { resetPassword } from "@/auth/controllers/resetPassword.controller";
import { resendVerificationCode } from "@/auth/controllers/resendCode.controller";
import { adminCreateUser } from "@/auth/controllers/adminCreateUser.controller";

import { onlyAdmin } from "@/middleware/adminOnly";
import validate from "@/middleware/validate";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendCodeSchema,
  adminCreateUserSchema,
} from "@/validation/authSchemas";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account operations
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
authRouter.post("/auth/register", validate({body: registerSchema}), createUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/auth/login", validate({body:loginSchema}), loginUser);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email using code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid code or email
 */
authRouter.post("/auth/verify-email", validate({body:  verifyEmailSchema}), verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset code sent
 *       404:
 *         description: Email not found
 */
authRouter.post("/auth/forgot-password", validate({ body: forgotPasswordSchema}), forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid code or email
 */
authRouter.post("/auth/reset-password", validate({body: resetPasswordSchema}), resetPassword);

/**
 * @swagger
 * /auth/resend-code:
 *   post:
 *     summary: Resend email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code resent
 */
authRouter.post("/auth/resend-code", validate({body:resendCodeSchema}), resendVerificationCode);

/**
 * @swagger
 * /auth/admin/create-user:
 *   post:
 *     summary: Admin creates a new user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, doctor]
 *     responses:
 *       201:
 *         description: User created by admin
 *       403:
 *         description: Forbidden – only admins allowed
 */
authRouter.post("/auth/admin/create-user", onlyAdmin, validate({body:adminCreateUserSchema}), adminCreateUser);

export default authRouter;
