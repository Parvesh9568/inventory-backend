import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';
import User from '../models/User.js';

// Connect to MongoDB
export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 Connected to MongoDB successfully');
    
    // Seed initial data
    await seedInitialData();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Initialize database with seed data
export const initDatabase = async () => {
  await connectDatabase();
};

// Seed initial data
const seedInitialData = async () => {
  try {
    // Check if data already exists
    const existingVendors = await Vendor.countDocuments();
    if (existingVendors > 0) {
      console.log('📊 Database already contains data, skipping seed');
      return;
    }

    console.log('🌱 Database initialized - no test data seeded');
    console.log('✅ Database ready for user-created vendors and items');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🍃 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
