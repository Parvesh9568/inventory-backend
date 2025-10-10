import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';

// Load environment variables
dotenv.config();

async function addSpecificData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the specific vendors and items
    const vendorNames = ['Anuj', 'Parvesh', 'Neeraj', 'Avinash'];
    const itemNames = ['22m', '28m', '32m', '38m'];

    // Create vendors (skip if already exists)
    const vendors = [];
    for (const name of vendorNames) {
      let vendor = await Vendor.findOne({ name });
      if (!vendor) {
        vendor = await Vendor.create({ name });
        console.log(`✅ Created vendor: ${name}`);
      } else {
        console.log(`ℹ️  Vendor already exists: ${name}`);
      }
      vendors.push(vendor);
    }

    // Create items (skip if already exists)
    const items = [];
    for (const name of itemNames) {
      let item = await Item.findOne({ name });
      if (!item) {
        item = await Item.create({ name });
        console.log(`✅ Created item: ${name}`);
      } else {
        console.log(`ℹ️  Item already exists: ${name}`);
      }
      items.push(item);
    }

    // Create vendor-item price combinations
    let pricesCreated = 0;
    for (const vendor of vendors) {
      for (const item of items) {
        // Check if price combination already exists
        const existingPrice = await VendorItemPrice.findOne({
          vendor: vendor._id,
          item: item._id
        });

        if (!existingPrice) {
          // Create price with random value between 50-200
          const price = Math.floor(Math.random() * 150) + 50;
          await VendorItemPrice.create({
            vendor: vendor._id,
            item: item._id,
            price: price
          });
          pricesCreated++;
          console.log(`✅ Created price: ${vendor.name} - ${item.name} = ₹${price}`);
        }
      }
    }

    console.log(`\n🎉 Data setup complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Vendors: ${vendorNames.join(', ')}`);
    console.log(`   - Items: ${itemNames.join(', ')}`);
    console.log(`   - New prices created: ${pricesCreated}`);
    console.log(`\n✅ Your IN/OUT panels now have access to this data!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding data:', error);
    process.exit(1);
  }
}

addSpecificData();
