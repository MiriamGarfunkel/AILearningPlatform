import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
   
    const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/_learning_platform_db_';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1); 
  }
};

export default connectDB;