import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';
import SubCategory from './models/SubCategory';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await SubCategory.deleteMany({});

    // Create categories
    const categories = [
      { name: 'מתמטיקה' },
      { name: 'היסטוריה' },
      { name: 'מדעים' },
      { name: 'שפות' },
      { name: 'אמנות' }
    ];

    const createdCategories = await Category.insertMany(categories);

    // Create subcategories
    const subCategories = [
      { name: 'חיבור וחיסור', category_id: createdCategories[0]._id },
      { name: 'כפל וחילוק', category_id: createdCategories[0]._id },
      { name: 'גיאומטריה', category_id: createdCategories[0]._id },
      { name: 'היסטוריה עתיקה', category_id: createdCategories[1]._id },
      { name: 'היסטוריה מודרנית', category_id: createdCategories[1]._id },
      { name: 'פיזיקה', category_id: createdCategories[2]._id },
      { name: 'כימיה', category_id: createdCategories[2]._id },
      { name: 'ביולוגיה', category_id: createdCategories[2]._id },
      { name: 'אנגלית', category_id: createdCategories[3]._id },
      { name: 'עברית', category_id: createdCategories[3]._id },
      { name: 'ציור', category_id: createdCategories[4]._id },
      { name: 'מוזיקה', category_id: createdCategories[4]._id }
    ];

    await SubCategory.insertMany(subCategories);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();