import { eq } from "drizzle-orm";
import db from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sendHospitalEmail } from "@/middleware/googleMailer";
// ────────────────────────────────
// TYPES
// ────────────────────────────────

type UserInsert = InferInsertModel<typeof users>;
type UserSelect = InferSelectModel<typeof users>;

const allowedRoles = ["user", "admin", "doctor"] as const;
type AllowedRole = typeof allowedRoles[number];

function isAllowedRole(value: any): value is AllowedRole {
    return allowedRoles.includes(value);
}

// ────────────────────────────────
// USERS TABLE SERVICES
// ────────────────────────────────

export const createUserService = async (user: UserInsert): Promise<UserSelect> => {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
};

export const getUserByEmailService = async (
    email: string
): Promise<UserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.email, email),
    });
};

export const updateVerificationToken = async (
    email: string,
    token: string,
    expiry: Date
): Promise<void> => {
    await db
        .update(users)
        .set({
            verification_token: token,
            token_expiry: expiry,
            updated_at: new Date(),
        })
        .where(eq(users.email, email));
};

export const verifyUserEmail = async (
    email: string,
    code: string
): Promise<{ user: UserSelect; token: string }> => {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) throw new Error("User not found.");
    if (user.is_verified) throw new Error("User already verified.");
    if (user.verification_token !== code) throw new Error("Invalid verification code.");
    if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
        throw new Error("Verification code has expired.");
    }

    const [updatedUser] = await db
        .update(users)
        .set({
            is_verified: true,
            verification_token: null,
            token_expiry: null,
            updated_at: new Date(),
        })
        .where(eq(users.email, email))
        .returning();

    // 🔐 JWT Token
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign(
        {
            userId: updatedUser.user_id,
            email: updatedUser.email,
            role: updatedUser.role,
        },
        secret,
        { expiresIn: "1h" }
    );

    // 📧 Welcome Email
    const subject = "🎉 Welcome to Medicare!";

    const html = `
  <p>Your email has been verified successfully.</p>
  <p>You can now login and book appointments with doctors.</p>
  <p>Welcome to Medicare!</p>  <!-- Custom message inside the body, if you need it -->
`;

    await sendHospitalEmail(updatedUser.email, updatedUser.firstname, subject, html);

    return { user: updatedUser, token };
};

export const saveResetTokenService = async (
    userId: number,
    token: string | null,
    expiry: Date | null
): Promise<void> => {
    await db
        .update(users)
        .set({
            verification_token: token ?? null,
            token_expiry: expiry ?? null,
            updated_at: new Date(),
        })
        .where(eq(users.user_id, userId));
};

export const getUserByResetTokenService = async (
    token: string
): Promise<UserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.verification_token, token),
    });
};

export const resetUserPasswordService = async (
    userId: number,
    hashedPassword: string
): Promise<void> => {
    await db.update(users)
        .set({
            password: hashedPassword,
            updated_at: new Date(),
            verification_token: null,
            token_expiry: null,
        })
        .where(eq(users.user_id, userId));
};
