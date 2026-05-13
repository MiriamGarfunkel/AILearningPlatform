import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import * as topics from '../services/catelog-topics.service';
import HttpError from '../shared/http-error';
import { require_non_empty_string } from '../shared/input-sanitize';

export const createSubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = require_non_empty_string(req.body?._id, '_id');
    const category_id = require_non_empty_string(req.body?.category_id, 'category_id');
    const name = require_non_empty_string(req.body?.name, 'name');

    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      return next(new HttpError('מזהה קטגוריה לא תקין', 400));
    }

    const subCategory = await topics.insertTopicRecord(_id, category_id, name);
    res.status(201).json(subCategory);
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('כל השדות (_id, category_id, name) נדרשים', 400));
    }
    if (error instanceof Error && error.message === 'Invalid category reference') {
      return next(new HttpError('מזהה קטגוריה לא תקין', 400));
    }
    next(error);
  }
};

export const getSubCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = String(req.params.categoryId ?? '');
    const subCategories = await topics.listTopicsUnderBranch(String(categoryId));
    res.status(200).json(subCategories);
  } catch (error) {
    next(error);
  }
};
