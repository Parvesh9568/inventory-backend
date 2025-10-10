import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';
import Transaction from '../models/Transaction.js';

// Load environment variables
dotenv.config();

async function clearTestData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 Connected to MongoDB');

    // Clear all test data
    console.log('🧹 Clearing test data...');
    
    await Promise.all([
      VendorItemPrice.deleteMany({}),
      Transaction.deleteMany({}),
      Vendor.deleteMany({}),
      Item.deleteMany({})
    ]);

    console.log('✅ All test data cleared successfully!');
    console.log('📊 Database is now clean and ready for user-created data');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error clearing test data:', error.message);
    process.exit(1);
  }
}

clearTestData();
