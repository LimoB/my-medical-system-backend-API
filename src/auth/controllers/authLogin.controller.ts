import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmailService } from "@/auth/auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log("loginUser called", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await getUserByEmailService(email);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({ error: "Email not verified. Please verify your email." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const payload = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      image_url: user.image_url || '',
      contact_phone: user.contact_phone || '',
      address: user.address || '',
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: payload, // 👈 Frontend Redux receives full user object
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: (error as Error).message || "Login failed." });
  }
};
