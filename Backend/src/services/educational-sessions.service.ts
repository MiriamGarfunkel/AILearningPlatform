import mongoose from 'mongoose';
import Prompt from '../models/Prompt';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';
import { resolveEducationalPayloadForLabels } from './educational-delivery.facade';

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

  const disciplineLabel = category?.name ?? 'לא ידוע';
  const topicLabel = subCategory?.name ?? input.topicDescriptor;

  const { payload, content_origin } = await resolveEducationalPayloadForLabels(
    disciplineLabel,
    String(topicLabel),
    input.learnerPromptText,
  );

  const row = new Prompt({
    user_id: input.learnerSubjectId,
    category_id: input.branchDocumentId,
    sub_category_id: input.topicDescriptor || 'General',
    prompt: input.learnerPromptText || 'No prompt provided',
    response: JSON.stringify(payload),
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
