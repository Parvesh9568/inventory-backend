console.log('🚀 Quick Test - Adding Data to Database');

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Simple schemas
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);

async function quickTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Add vendors
    const vendors = ['Anuj', 'Parvesh', 'Neeraj', 'Avinash'];
    console.log('\n📝 Adding vendors...');
    
    for (const name of vendors) {
      try {
        const vendor = new Vendor({ name });
        await vendor.save();
        console.log(`✅ Added: ${name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️  Already exists: ${name}`);
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      }
    }

    // Add items
    const items = ['22m', '28m', '32m', '38m'];
    console.log('\n📦 Adding items...');
    
    for (const name of items) {
      try {
        const item = new Item({ name });
        await item.save();
        console.log(`✅ Added: ${name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️  Already exists: ${name}`);
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      }
    }

    // Verify data
    console.log('\n📊 Verification:');
    const vendorCount = await Vendor.countDocuments();
    const itemCount = await Item.countDocuments();
    
    console.log(`Vendors in database: ${vendorCount}`);
    console.log(`Items in database: ${itemCount}`);

    if (vendorCount > 0) {
      const allVendors = await Vendor.find();
      console.log('Vendor names:', allVendors.map(v => v.name).join(', '));
    }

    if (itemCount > 0) {
      const allItems = await Item.find();
      console.log('Item names:', allItems.map(i => i.name).join(', '));
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

quickTest();
