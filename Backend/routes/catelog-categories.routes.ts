import express from 'express';
import { createCategory, getCategories } from '../controllers/catalog-categories.controller';

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);

export default router;
