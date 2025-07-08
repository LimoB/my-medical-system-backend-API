import { Request, Response, NextFunction } from 'express'
import {
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from '@/users/user.service'
import { sanitizeUser } from '@/utils/sanitize'

// 🔹 GET /api/users - Admin only
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('GET /api/users hit')

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const users = await getUsersService()
    if (!users || users.length === 0) {
      res.status(404).json({ message: 'No users found' })
      return
    }

    res.status(200).json(users) // Already sanitized in service
  } catch (error) {
    console.error('Error in getUsersController:', error)
    next(error)
  }
}

// 🔹 GET /api/users/:id - Admin or owner
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.id, 10)
  console.log(`GET /api/users/${req.params.id} hit`)

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' })
    return
  }

  try {
    if (
      req.user?.role !== 'admin' &&
      req.user?.userId !== req.params.id &&
      req.user?.userId !== userId.toString()
    ) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const user = await getUserByIdService(userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.status(200).json(user) // Already sanitized in service
  } catch (error) {
    console.error('Error in getUserByIdController:', error)
    next(error)
  }
}

// 🔹 POST /api/users - Public registration
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userData = req.body
  console.log('POST /api/users hit with:', userData)

  if (!userData.email || !userData.password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const message = await createUserService(userData)
    res.status(201).json({ message })
  } catch (error) {
    console.error('Error in createUserController:', error)
    next(error)
  }
}

// 🔹 PUT /api/users/:id - Admin or user themself
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.id, 10)
  const updates = req.body
  console.log(`PUT /api/users/${req.params.id} hit with:`, updates)

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' })
    return
  }

  try {
    if (
      req.user?.role !== 'admin' &&
      req.user?.userId !== req.params.id &&
      req.user?.userId !== userId.toString()
    ) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const message = await updateUserService(userId, updates)
    res.status(200).json({ message })
  } catch (error) {
    console.error('Error in updateUserController:', error)
    next(error)
  }
}

// 🔹 DELETE /api/users/:id - Admin only
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = parseInt(req.params.id, 10)
  console.log(`DELETE /api/users/${req.params.id} hit`)

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' })
    return
  }

  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const deleted = await deleteUserService(userId)
    if (deleted) {
      res.status(200).json({ message: 'User deleted successfully' })
    } else {
      res.status(404).json({ message: 'User not found or could not be deleted' })
    }
  } catch (error) {
    console.error('Error in deleteUserController:', error)
    next(error)
  }
}
