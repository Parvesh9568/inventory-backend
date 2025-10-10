import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';

// Load environment variables
dotenv.config();

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Vendor.deleteMany({});
    await Item.deleteMany({});
    await VendorItemPrice.deleteMany({});
    console.log('Cleared existing data');

    // Create sample vendors
    const vendors = await Vendor.create([
      { name: 'Vendor A' },
      { name: 'Vendor B' },
      { name: 'Vendor C' }
    ]);
    console.log('Created vendors:', vendors.map(v => v.name));

    // Create sample items
    const items = await Item.create([
      { name: 'Item 1' },
      { name: 'Item 2' },
      { name: 'Item 3' }
    ]);
    console.log('Created items:', items.map(i => i.name));

    // Create sample vendor-item prices
    const prices = [];
    for (const vendor of vendors) {
      for (const item of items) {
        prices.push({
          vendor: vendor._id,
          item: item._id,
          price: Math.floor(Math.random() * 100) + 10 // Random price between 10-110
        });
      }
    }

    await VendorItemPrice.create(prices);
    console.log('Created vendor-item prices');

    console.log('✅ Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
