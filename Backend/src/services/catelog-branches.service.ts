import Category from '../models/Category';

export async function insertBranchRecord(name: string) {
  const row = new Category({ name });
  return row.save();
}

export async function listBranchesAlphabetical() {
  return Category.find({}).sort({ name: 1 }).lean().exec();
}

export async function locateBranchByLabelCaseInsensitive(name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Category.findOne({ name: new RegExp(`^${escaped}$`, 'i') }).exec();
}
