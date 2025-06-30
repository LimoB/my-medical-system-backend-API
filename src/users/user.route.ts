import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '@/users/user.controller'

import { adminAuth, userAuth, anyRoleAuth } from '@/middleware/bearAuth'

const userRouter = express.Router()

// Admin-only
userRouter.get('/users', adminAuth, getUsers)
userRouter.delete('/users/:id', adminAuth, getUserById)

// Public (signup)
userRouter.post('/users', createUser, createUser)

// Logged-in user or admin (with ownership check in controller)
userRouter.get('/users/:id', anyRoleAuth, getUserById)
userRouter.put('/users/:id', anyRoleAuth, updateUser)

export default userRouter
