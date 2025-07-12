import { Request, Response, NextFunction } from 'express';
import {
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from '@/users/user.service';
import { sanitizeUser } from '@/utils/sanitize';
import {
  newUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
} from '@/validation/zodSchemas';
import { ZodError } from 'zod';

// 🔹 GET /api/users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('GET /api/users hit');

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await getUsersService();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    return next(error);
  }
};

// 🔹 GET /api/users/:id
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = parseInt(req.params.id);
  console.log(`GET /api/users/${userId} hit`);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const currentUserId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    const isSelf = currentUserId === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await getUserByIdService(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    return next(error);
  }
};

// 🔹 POST /api/users
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('POST /api/users', req.body);

  try {
    const validated = newUserSchema.parse(req.body); // includes image_url
    const message = await createUserService(validated);
    return res.status(201).json({ message });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.flatten().fieldErrors,
      });
    }

    console.error('Error in createUser:', error);
    return next(error);
  }
};

// 🔹 PUT /api/users/:id
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.user?.userId;
  const currentUserRole = req.user?.role;

  console.log(`PUT /api/users/${userId} hit`);
  console.log('Payload:', req.body);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const isAdmin = currentUserRole === 'admin';
  const isSelf = String(currentUserId) === String(userId);

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const isRoleOnlyUpdate = Object.keys(req.body).length === 1 && 'role' in req.body;

  if (isRoleOnlyUpdate && !isAdmin) {
    return res.status(403).json({ error: 'Only admins can change roles' });
  }

  try {
    const validated = isRoleOnlyUpdate
      ? updateUserRoleSchema.parse(req.body)
      : updateUserSchema.parse(req.body); // includes image_url

    const message = await updateUserService(userId, validated);
    return res.status(200).json({ message });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.flatten().fieldErrors,
      });
    }

    console.error('Error in updateUser:', error);
    return next(error);
  }
};

// 🔹 DELETE /api/users/:id
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = parseInt(req.params.id);
  console.log(`DELETE /api/users/${userId} hit`);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await deleteUserService(userId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found or failed to delete' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return next(error);
  }
};
