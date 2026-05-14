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
    return next(new HttpError('Missing required fields (category_id).', 400));
  }

  const body_user_id = optional_trimmed_string(req.body?.user_id);
  const authed = req as Request & { user?: { _id: string } };
  const learnerSubjectId = authed.user?._id || body_user_id;

  if (!learnerSubjectId) {
    return next(new HttpError('User not identified.', 401));
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
    return next(
      new HttpError('The lesson could not be generated due to an AI or persistence error. Please try again later.', 503),
    );
  }
};

export const listLearnerStudyTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const authed = req as Request & { user?: { _id: string; role: string } };
    const subject = String(user_id);
    if (authed.user?.role !== 'admin' && String(authed.user?._id) !== subject) {
      return next(new HttpError('You may only view your own learning history.', 403));
    }
    const history = await sessions.listTimelineForLearner(subject);
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
