/**
 * Upserts a platform administrator (email + password + national ID fields).
 * Run: npx tsx src/seed-admin.ts   (from Backend folder)
 *
 * Override defaults with ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ID, ADMIN_NAME, ADMIN_PHONE in .env
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_learning';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@ailocal.test').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminLocal#2026';
const ADMIN_ID = process.env.ADMIN_ID || '900000001';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Miriam Garfunkel';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+15550000001';

async function seedAdmin(): Promise<void> {
  await mongoose.connect(mongoUri);
  console.log('Connected:', mongoUri);

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existingOtherId = await User.findOne({ email: ADMIN_EMAIL, _id: { $ne: ADMIN_ID } });
  if (existingOtherId) {
    console.error(`Refusing to run: email ${ADMIN_EMAIL} already belongs to another user (_id=${existingOtherId._id}).`);
    process.exitCode = 1;
    return;
  }

  await User.findOneAndUpdate(
    { _id: ADMIN_ID },
    {
      $set: {
        name: ADMIN_NAME,
        phone: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        password_hash,
        role: 'admin',
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  console.log('Admin user is ready. Use these credentials on the login screen (Admin login → email & password):');
  console.log('  Email:   ', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('Optional national-ID sign-in fields:', {
    nationalId: ADMIN_ID,
    fullName: ADMIN_NAME,
    phone: ADMIN_PHONE,
  });
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
