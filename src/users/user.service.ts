import { eq } from 'drizzle-orm'
import db from '@/drizzle/db'
import { users } from '@/drizzle/schema'
import type { TUserInsert, PopulatedUser } from '@/drizzle/types'

// Get all users with related data
export const getUsersService = async (): Promise<PopulatedUser[]> => {
  try {
    const result = await db.query.users.findMany({
      with: {
        appointments: true,
        prescriptions: true,
        complaints: true,
      },
    })
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Unable to fetch users')
  }
}

// Get single user by ID with related data
export const getUserByIdService = async (
  userId: number
): Promise<PopulatedUser | null> => {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.user_id, userId),
      with: {
        appointments: true,
        prescriptions: true,
        complaints: true,
      },
    })
    return result ?? null
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error)
    throw new Error('Unable to fetch user by ID')
  }
}

// Create a new user
export const createUserService = async (
  user: TUserInsert
): Promise<string> => {
  try {
    const result = await db.insert(users).values(user).returning()
    if (result.length > 0) {
      return 'User created successfully!'
    }
    throw new Error('User creation failed')
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Unable to create user')
  }
}

// Update an existing user
export const updateUserService = async (
  userId: number,
  user: Partial<TUserInsert>
): Promise<string> => {
  try {
    const result = await db
      .update(users)
      .set(user)
      .where(eq(users.user_id, userId))
      .returning()

    if (result.length > 0) {
      return 'User updated successfully!'
    }
    throw new Error('User update failed or user not found')
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error)
    throw new Error('Unable to update user')
  }
}

// Delete a user
export const deleteUserService = async (
  userId: number
): Promise<boolean> => {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.user_id, userId))
      .returning()

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error)
    throw new Error('Unable to delete user')
  }
}
