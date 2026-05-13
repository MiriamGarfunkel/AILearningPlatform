import express from 'express';
import { createSubCategory, getSubCategories } from '../controllers/catalog-topics.controller';

const router = express.Router();

/**
 * @swagger
 * /api/sub-categories:
 *   post:
 *     summary: Create a sub-category
 *     tags: [SubCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id, name]
 *             properties:
 *               category_id:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *               name:
 *                 type: string
 *                 example: "אלגברה"
 *     responses:
 *       201:
 *         description: Sub-category created
 * /api/sub-categories/{categoryId}:
 *   get:
 *     summary: List sub-categories for a category
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *     responses:
 *       200:
 *         description: List of sub-categories
 */
router.post('/', createSubCategory);
router.get('/:categoryId', getSubCategories);

export default router;
