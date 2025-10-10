import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';

// Load environment variables
dotenv.config();

async function insertData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define the data
    const vendorNames = ['Anuj', 'Parvesh', 'Neeraj', 'Avinash'];
    const itemNames = ['22m', '28m', '32m', '38m'];

    console.log('\n📝 Adding vendors...');
    const vendors = [];
    for (const name of vendorNames) {
      try {
        let vendor = await Vendor.findOne({ name });
        if (!vendor) {
          vendor = new Vendor({ name });
          await vendor.save();
          console.log(`✅ Added vendor: ${name}`);
        } else {
          console.log(`ℹ️  Vendor already exists: ${name}`);
        }
        vendors.push(vendor);
      } catch (error) {
        console.log(`❌ Error with vendor ${name}: ${error.message}`);
      }
    }

    console.log('\n📦 Adding items...');
    const items = [];
    for (const name of itemNames) {
      try {
        let item = await Item.findOne({ name });
        if (!item) {
          item = new Item({ name });
          await item.save();
          console.log(`✅ Added item: ${name}`);
        } else {
          console.log(`ℹ️  Item already exists: ${name}`);
        }
        items.push(item);
      } catch (error) {
        console.log(`❌ Error with item ${name}: ${error.message}`);
      }
    }

    console.log('\n💰 Adding vendor-item prices...');
    let pricesAdded = 0;
    for (const vendor of vendors) {
      for (const item of items) {
        try {
          const existingPrice = await VendorItemPrice.findOne({
            vendor: vendor._id,
            item: item._id
          });

          if (!existingPrice) {
            const price = Math.floor(Math.random() * 100) + 50; // Random price 50-150
            const vendorItemPrice = new VendorItemPrice({
              vendor: vendor._id,
              item: item._id,
              price: price
            });
            await vendorItemPrice.save();
            console.log(`✅ Added price: ${vendor.name} - ${item.name} = ₹${price}`);
            pricesAdded++;
          }
        } catch (error) {
          console.log(`❌ Error adding price for ${vendor.name} - ${item.name}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Data insertion complete!');
    console.log('📊 Summary:');
    console.log(`   - Vendors: ${vendorNames.join(', ')}`);
    console.log(`   - Items: ${itemNames.join(', ')}`);
    console.log(`   - Prices added: ${pricesAdded}`);
    console.log('\n✅ Your IN/OUT panels now have access to this data!');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertData();
