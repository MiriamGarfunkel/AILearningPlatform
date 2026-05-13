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
 */
router.post('/generate', require_bearer_user, submitEducationalGenerationRequest);

/**
 * @swagger
 * /api/ai/history/{user_id}:
 *   get:
 *     summary: Get user learning history
 *     tags: [AI]
 */
router.get('/history/:user_id', require_bearer_user, listLearnerStudyTimeline);

/**
 * @swagger
 * /api/ai/all:
 *   get:
 *     summary: Get all prompts (Admin only)
 *     tags: [AI]
 */
router.get('/all', require_bearer_user, restrict_to_roles('admin'), listOperatorStudyLedger);

export default router;
