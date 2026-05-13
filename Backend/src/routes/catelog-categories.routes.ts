import express from 'express';
import { createCategory, getCategories } from '../controllers/catelog-categories.controller';

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "מתמטיקה"
 *     responses:
 *       201:
 *         description: Category created
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.post('/', createCategory);
router.get('/', getCategories);

export default router;
