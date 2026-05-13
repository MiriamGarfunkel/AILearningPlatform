import express from 'express';
import { createSubCategory, getSubCategories } from '../controllers/catalog-topics.controller';

const router = express.Router();

router.post('/', createSubCategory);
router.get('/:categoryId', getSubCategories);

export default router;
