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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name, phone]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "123456789"
 *               name:
 *                 type: string
 *                 example: "Jane Learner"
 *               phone:
 *                 type: string
 *                 example: "+15551234567"
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Use either (email + password) OR (id + name + phone).
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@ailocal.test"
 *               password:
 *                 type: string
 *                 example: "AdminLocal#2026"
 *               id:
 *                 type: string
 *                 example: "123456789"
 *               name:
 *                 type: string
 *                 example: "Jane Learner"
 *               phone:
 *                 type: string
 *                 example: "+15551234567"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', require_bearer_user, restrict_to_roles('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "123456789"
 *     responses:
 *       200:
 *         description: User found
 */
router.get('/:id', require_bearer_user, getUserById);

export default router;
