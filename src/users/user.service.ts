import { eq } from 'drizzle-orm';
import db from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import type { TUserInsert, PopulatedUser } from '@/drizzle/types';
import { sanitizeUser, sanitizeUsers } from '@/utils/sanitize';

type SanitizedUser = Omit<PopulatedUser, 'password' | 'verification_token' | 'token_expiry'>;

// 🔹 Get all users with related data (Admin only)
export const getUsersService = async (): Promise<SanitizedUser[]> => {
  try {
    const result = await db.query.users.findMany({
      with: {
        appointments: true,
        prescriptions: true,
        complaints: true,
        doctor: true,
      },
    });

    return sanitizeUsers(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Unable to fetch users');
  }
};

// 🔹 Get single user by ID with related data
export const getUserByIdService = async (
  userId: number
): Promise<SanitizedUser | null> => {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.user_id, userId),
      with: {
        appointments: true,
        prescriptions: true,
        complaints: true,
        doctor: true,
      },
    });

    return result ? sanitizeUser(result) : null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw new Error('Unable to fetch user by ID');
  }
};

// 🔹 Create a new user
export const createUserService = async (
  user: TUserInsert
): Promise<string> => {
  try {
    const safeUser = {
      ...user,
      // keep date_of_birth as string
      date_of_birth: user.date_of_birth || null,

      // convert only fields that are real Date columns in DB
      token_expiry: user.token_expiry
        ? new Date(user.token_expiry)
        : null,
      last_login: user.last_login
        ? new Date(user.last_login)
        : null,
    };

    const result = await db.insert(users).values(safeUser).returning();

    if (result.length > 0) {
      return 'User created successfully!';
    }

    throw new Error('User creation failed');
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Unable to create user');
  }
};




// 🔹 Update an existing user (image_url included)
export const updateUserService = async (
  userId: number,
  user: Partial<TUserInsert>
): Promise<string> => {
  try {
    const cleanedUser = Object.fromEntries(
      Object.entries(user).filter(([_, v]) => v !== undefined)
    );

    console.log('🧾 Final payload being saved to DB:', cleanedUser);
    console.log('🖼 image_url to update:', cleanedUser.image_url); // Optional

    const result = await db
      .update(users)
      .set(cleanedUser)
      .where(eq(users.user_id, userId))
      .returning();

    if (result.length > 0) {
      return 'User updated successfully!';
    }

    throw new Error('User update failed or user not found');
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw new Error('Unable to update user');
  }
};



// 🔹 Delete a user
export const deleteUserService = async (
  userId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.user_id, userId))
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw new Error('Unable to delete user');
  }
};
