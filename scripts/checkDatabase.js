import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';

// Load environment variables
dotenv.config();

async function checkDatabase() {
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

    // Check existing data
    console.log('\n📊 Database Status:');
    
    const userCount = await User.countDocuments();
    const vendorCount = await Vendor.countDocuments();
    const itemCount = await Item.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Vendors: ${vendorCount}`);
    console.log(`Items: ${itemCount}`);
    
    if (userCount > 0) {
      console.log('\n👥 Existing Users:');
      const users = await User.find().limit(5);
      users.forEach(user => {
        console.log(`- ID: ${user._id}`);
        console.log(`  Vendor Name: ${user.vendorName || 'MISSING'}`);
        console.log(`  Item Name: ${user.itemName || 'MISSING'}`);
        console.log(`  Phone: ${user.phone || 'MISSING'}`);
        console.log(`  Address: ${user.address || 'MISSING'}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('---');
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkDatabase();
