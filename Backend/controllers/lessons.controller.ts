import { Request, Response, NextFunction } from 'express';
import * as sessions from '../services/educational-sessions.service';
import HttpError from '../shared/http-error';
import { optional_trimmed_string, require_non_empty_string } from '../shared/input-sanitize';

export const submitEducationalGenerationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let category_id: string;
  let sub_category_id: string;
  let prompt: string;
  try {
    category_id = require_non_empty_string(req.body?.category_id, 'category_id');
    sub_category_id = optional_trimmed_string(req.body?.sub_category_id) ?? '';
    prompt = optional_trimmed_string(req.body?.prompt) ?? '';
  } catch {
    return next(new HttpError('חסרים שדות חובה (category_id)', 400));
  }

  const body_user_id = optional_trimmed_string(req.body?.user_id);
  const authed = req as Request & { user?: { _id: string } };
  const learnerSubjectId = authed.user?._id || body_user_id;

  if (!learnerSubjectId) {
    return next(new HttpError('משתמש לא מזוהה', 401));
  }

  try {
    const saved = await sessions.persistLearnerContentAttempt({
      learnerSubjectId,
      branchDocumentId: category_id,
      topicDescriptor: sub_category_id,
      learnerPromptText: prompt,
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Educational session persistence failure:', error);
    return next(new HttpError('השיעור לא נמסר עקב בעיות בחיבור ל-AI. אנא נסה שוב מאוחר יותר.', 503));
  }
};

export const listLearnerStudyTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const history = await sessions.listTimelineForLearner(user_id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

export const listOperatorStudyLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));

    const { rows, total } = await sessions.listOperatorStudyLedger(page, limit);

    res.status(200).json({
      success: true,
      count: rows.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};
