import { Router } from "express";
import { createUser } from "@/auth/controllers/authRegister.controller";
import { loginUser } from "@/auth/controllers/authLogin.controller";
import { verifyEmail } from "@/auth/controllers/authVerify.controller";
import { forgotPassword } from "@/auth/controllers/forgotPassword.controller";
import { resetPassword } from "@/auth/controllers/resetPassword.controller";
import { resendVerificationCode } from "@/auth/controllers/resendCode.controller";
import { adminCreateUser } from "@/auth/controllers/adminCreateUser.controller";

import { onlyAdmin } from "@/middleware/adminOnly";




const authRouter = Router(); // ✅ Correct usage

// ───────────────────────────────
// AUTH ROUTES
// ───────────────────────────────

authRouter.post("/auth/register", createUser);
authRouter.post("/auth/login", loginUser);
authRouter.post("/auth/verify-email", verifyEmail);
authRouter.post("/auth/forgot-password", forgotPassword);
authRouter.post("/auth/reset-password", resetPassword);
authRouter.post("/auth/resend-code", resendVerificationCode);
authRouter.post("/auth/admin/create-user", onlyAdmin, adminCreateUser);


export default authRouter;
