import express from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
} from '../controllers/users.controller';
import { require_bearer_user, restrict_to_roles } from '../middleware/jwt-access.guard';

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 */
router.get('/', require_bearer_user, restrict_to_roles('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 */
router.get('/:id', require_bearer_user, getUserById);

export default router;
