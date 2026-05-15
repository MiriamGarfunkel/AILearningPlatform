import mongoose from 'mongoose';
import Prompt from '../models/Prompt';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';
import { getLesson } from './ai.service';

export interface SaveLessonInput {
  readonly userId: string;
  readonly categoryId: string;
  readonly topic: string;
  readonly promptText: string;
}

export async function saveLesson(input: SaveLessonInput) {
  const category = await Category.findById(input.categoryId).lean();
  const subCategory = input.topic
    ? mongoose.Types.ObjectId.isValid(input.topic)
      ? await SubCategory.findById(input.topic).lean()
      : await SubCategory.findOne({ name: input.topic }).lean()
    : null;

  const disciplineLabel = category?.name ?? 'Unknown';
  const topicLabel = subCategory?.name ?? input.topic;

  const { payload, content_origin } = await getLesson(
    disciplineLabel,
    String(topicLabel),
    input.promptText,
  );

  const promptStored = (input.promptText || '').trim() || 'No prompt provided';

  const row = new Prompt({
    user_id: input.userId,
    category_id: input.categoryId,
    sub_category_id: topicLabel || 'General',
    prompt: promptStored,
    response: JSON.stringify(payload),
    content_origin,
  });

  await row.save();
  return row;
}

export async function getUserHistory(userId: string) {
  return Prompt.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export async function getAllHistory(page: number, limit: number) {
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
