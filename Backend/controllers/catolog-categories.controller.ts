import { Request, Response, NextFunction } from 'express';
import * as branches from '../services/catalog-branches.service';
import HttpError from '../shared/http-error';
import { require_non_empty_string } from '../shared/input-sanitize';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = require_non_empty_string(req.body?.name, 'name');
    const existing = await branches.locateBranchByLabelCaseInsensitive(name);

    if (existing) {
      return res.status(200).json(existing);
    }

    const category = await branches.insertBranchRecord(name);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('שם הקטגוריה חסר', 400));
    }
    next(error);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await branches.listBranchesAlphabetical();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
