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
      { name: 'Mathematics' },
      { name: 'History' },
      { name: 'Science' },
      { name: 'Languages' },
      { name: 'Arts' },
    ];

    const createdCategories = await Category.insertMany(categories);

    // Create subcategories
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

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
