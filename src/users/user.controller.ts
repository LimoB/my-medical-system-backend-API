import type { Request, Response, NextFunction } from 'express';
import {
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from '@/users/user.service';
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

    console.log(`✅ Fetched ${users.length} users`);
    return res.status(200).json(users);
  } catch (error) {
    console.error('❌ Error in getUsers:', error);
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
    const currentRole = req.user?.role;

    const user = await getUserByIdService(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAdmin = currentRole === 'admin';
    const isSelf = currentUserId === userId;
    const isDoctorViewingPatient = currentRole === 'doctor' && user.role === 'user';

    if (!isAdmin && !isSelf && !isDoctorViewingPatient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`✅ Found user ${userId}:`, user);
    return res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error in getUserById:', error);
    return next(error);
  }
};

// 🔹 POST /api/users
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('POST /api/users hit');
  console.log('Payload:', req.body);

  try {
    const validated = newUserSchema.parse(req.body);
    console.log('✅ Validated new user:', validated);

    const userToCreate = {
      ...validated,
      date_of_birth: validated.date_of_birth ?? null, // leave as string or null
      token_expiry: validated.token_expiry ?? undefined,
      last_login: validated.last_login ?? undefined,
    };

    const message = await createUserService(userToCreate);
    return res.status(201).json({ message });
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn('⚠️ Validation failed:', error.flatten().fieldErrors);
      return res.status(400).json({
        error: 'Validation failed',
        details: error.flatten().fieldErrors,
      });
    }

    console.error('❌ Error in createUser:', error);
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
  console.log('🔄 Payload:', req.body);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const isAdmin = currentUserRole === 'admin';
  const isSelf = currentUserId === userId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const {
    first_name,
    last_name,
    email,
    contact_phone,
    address,
    role,
    is_verified,
    image_url,
  } = req.body;

  console.log('🧪 Extracted Fields:', {
    first_name,
    last_name,
    email,
    contact_phone,
    address,
    role,
    is_verified,
    image_url,
  });

  if (role && !isAdmin) {
    return res.status(403).json({ error: 'Only admins can change roles' });
  }

  const updateFields = {
    first_name,
    last_name,
    email,
    contact_phone,
    address,
    role,
    is_verified,
    image_url,
  };

  const hasFields = Object.values(updateFields).some((v) => v !== undefined);
  if (!hasFields) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  try {
    console.log('🧾 Sending fields to updateUserService:', updateFields);
    const result = await updateUserService(userId, updateFields);
    console.log(`✅ User ${userId} updated successfully`);
    return res.status(200).json({ message: result });
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
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
      return res
        .status(404)
        .json({ message: 'User not found or failed to delete' });
    }

    console.log(`✅ User ${userId} deleted`);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    return next(error);
  }
};
