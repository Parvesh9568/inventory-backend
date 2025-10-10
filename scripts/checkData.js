import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Current Vendors in Database:');
    const vendors = await Vendor.find().sort({ name: 1 });
    if (vendors.length === 0) {
      console.log('❌ No vendors found in database');
    } else {
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.name}`);
      });
    }

    console.log('\n📦 Current Items in Database:');
    const items = await Item.find().sort({ name: 1 });
    if (items.length === 0) {
      console.log('❌ No items found in database');
    } else {
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
