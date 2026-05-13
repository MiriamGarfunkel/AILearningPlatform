import express from 'express';
import {
  submitEducationalGenerationRequest,
  listLearnerStudyTimeline,
  listOperatorStudyLedger,
} from '../controllers/lessons.controller';
import { require_bearer_user, restrict_to_roles } from '../middleware/jwt-access.guard';

const router = express.Router();

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: Generate AI lesson content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id]
 *             properties:
 *               category_id:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *               sub_category_id:
 *                 type: string
 *                 example: "אלגברה"
 *               prompt:
 *                 type: string
 *                 example: "תסביר לי מה זה משוואה"
 *     responses:
 *       201:
 *         description: Lesson generated successfully
 */
router.post('/generate', require_bearer_user, submitEducationalGenerationRequest);

/**
 * @swagger
 * /api/ai/history/{user_id}:
 *   get:
 *     summary: Get user learning history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "123456789"
 *     responses:
 *       200:
 *         description: Learning history
 */
router.get('/history/:user_id', require_bearer_user, listLearnerStudyTimeline);

/**
 * @swagger
 * /api/ai/all:
 *   get:
 *     summary: Get all prompts (Admin only)
 *     tags: [AI]
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
 *         description: All prompts paginated
 */
router.get('/all', require_bearer_user, restrict_to_roles('admin'), listOperatorStudyLedger);

export default router;
