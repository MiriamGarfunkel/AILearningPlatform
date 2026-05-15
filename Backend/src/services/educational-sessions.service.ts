import mongoose from 'mongoose';
import Prompt from '../models/Prompt';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';
import { resolveEducationalPayloadForLabels } from './educational-delivery.facade';
import { stripHebrewScript } from '../shared/strip-hebrew-script';

export interface PersistAttemptInput {
  readonly learnerSubjectId: string;
  readonly branchDocumentId: string;
  readonly topicDescriptor: string;
  readonly learnerPromptText: string;
}

export async function persistLearnerContentAttempt(input: PersistAttemptInput) {
  const category = await Category.findById(input.branchDocumentId).lean();
  const subCategory = input.topicDescriptor
    ? mongoose.Types.ObjectId.isValid(input.topicDescriptor)
      ? await SubCategory.findById(input.topicDescriptor).lean()
      : await SubCategory.findOne({ name: input.topicDescriptor }).lean()
    : null;

  const disciplineLabel = category?.name ?? 'Unknown';
  const topicLabel = subCategory?.name ?? input.topicDescriptor;

  const { payload, content_origin } = await resolveEducationalPayloadForLabels(
    disciplineLabel,
    String(topicLabel),
    input.learnerPromptText,
  );

  const payloadEnglishOnly = {
    ...payload,
    explanation: typeof payload.explanation === 'string' ? payload.explanation : payload.explanation,
    task: typeof payload.task === 'string' ? payload.task : payload.task,
  };
  const promptStored = (input.learnerPromptText || '').trim() || 'No prompt provided';

  const row = new Prompt({
    user_id: input.learnerSubjectId,
    category_id: input.branchDocumentId,
    sub_category_id: topicLabel || 'General',
    prompt: promptStored,
    response: JSON.stringify(payloadEnglishOnly),
    content_origin,
  });

  await row.save();
  return row;
}

export async function listTimelineForLearner(learnerSubjectId: string) {
  return Prompt.find({ user_id: learnerSubjectId }).sort({ created_at: -1 }).lean();
}

export async function listOperatorStudyLedger(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Prompt.find()
      .populate('user_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Prompt.countDocuments(),
  ]);
  return { rows, total };
}
