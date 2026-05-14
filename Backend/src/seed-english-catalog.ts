/**
 * Replaces catalog categories and subcategories with an English-only seed set.
 * WARNING: deletes all Category and SubCategory documents (development reset).
 *
 * Run from Backend: npm run seed:catalog:english
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';
import SubCategory from './models/SubCategory';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform';

async function seedEnglishCatalog(): Promise<void> {
  await mongoose.connect(mongoUri);
  console.log('Connected:', mongoUri);

  await Category.deleteMany({});
  await SubCategory.deleteMany({});

  const categories = [
    { name: 'Mathematics' },
    { name: 'History' },
    { name: 'Science' },
    { name: 'Languages' },
    { name: 'Arts' },
  ];

  const createdCategories = await Category.insertMany(categories);

  const subCategories = [
    { name: 'Addition and subtraction', category_id: createdCategories[0]._id },
    { name: 'Multiplication and division', category_id: createdCategories[0]._id },
    { name: 'Geometry', category_id: createdCategories[0]._id },
    { name: 'Ancient history', category_id: createdCategories[1]._id },
    { name: 'Modern history', category_id: createdCategories[1]._id },
    { name: 'Physics', category_id: createdCategories[2]._id },
    { name: 'Chemistry', category_id: createdCategories[2]._id },
    { name: 'Biology', category_id: createdCategories[2]._id },
    { name: 'English', category_id: createdCategories[3]._id },
    { name: 'Hebrew language', category_id: createdCategories[3]._id },
    { name: 'Drawing', category_id: createdCategories[4]._id },
    { name: 'Music', category_id: createdCategories[4]._id },
  ];

  await SubCategory.insertMany(subCategories);

  console.log('English-only catalog seeded. Categories:', categories.length, 'Subcategories:', subCategories.length);
}

seedEnglishCatalog()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
