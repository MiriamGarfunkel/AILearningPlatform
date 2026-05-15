import Category from '../models/Category';

export async function createCategory(name: string) {
  const row = new Category({ name });
  return row.save();
}

export async function getCategories() {
  return Category.find({}).sort({ name: 1 }).lean().exec();
}

export async function findCategoryByName(name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Category.findOne({ name: new RegExp(`^${escaped}$`, 'i') }).exec();
}
