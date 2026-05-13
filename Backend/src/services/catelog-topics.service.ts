import mongoose from 'mongoose';
import SubCategory from '../models/SubCategory';

export async function insertTopicRecord(primaryKey: string, categoryRef: string, label: string) {
  if (!mongoose.Types.ObjectId.isValid(categoryRef)) {
    throw new Error('Invalid category reference');
  }
  const row = new SubCategory({
    _id: primaryKey,
    category_id: categoryRef,
    name: label,
  });
  return row.save();
}

export async function listTopicsUnderBranch(branchId: string) {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return [];
  }
  return SubCategory.find({ category_id: branchId }).sort({ name: 1 }).lean().exec();
}
