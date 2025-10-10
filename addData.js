import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Simple schemas
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

const priceSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);
const VendorItemPrice = mongoose.model('VendorItemPrice', priceSchema);

async function addData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');

    // Add vendors
    const vendorNames = ['Anuj', 'Parvesh', 'Neeraj', 'Avinash'];
    console.log('\n📝 Adding vendors...');
    
    for (const name of vendorNames) {
      try {
        await Vendor.create({ name });
        console.log(`✅ Added vendor: ${name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️  Vendor already exists: ${name}`);
        } else {
          console.log(`❌ Error adding vendor ${name}: ${error.message}`);
        }
      }
    }

    // Add items
    const itemNames = ['22m', '28m', '32m', '38m'];
    console.log('\n📦 Adding items...');
    
    for (const name of itemNames) {
      try {
        await Item.create({ name });
        console.log(`✅ Added item: ${name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️  Item already exists: ${name}`);
        } else {
          console.log(`❌ Error adding item ${name}: ${error.message}`);
        }
      }
    }

    // Add prices
    console.log('\n💰 Adding prices...');
    const vendors = await Vendor.find();
    const items = await Item.find();
    
    for (const vendor of vendors) {
      for (const item of items) {
        try {
          const price = Math.floor(Math.random() * 100) + 50;
          await VendorItemPrice.create({
            vendor: vendor._id,
            item: item._id,
            price: price
          });
          console.log(`✅ Added price: ${vendor.name} - ${item.name} = ₹${price}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`ℹ️  Price already exists: ${vendor.name} - ${item.name}`);
          } else {
            console.log(`❌ Error adding price: ${error.message}`);
          }
        }
      }
    }

    console.log('\n🎉 Data addition complete!');
    console.log('📊 Verification:');
    
    const vendorCount = await Vendor.countDocuments();
    const itemCount = await Item.countDocuments();
    const priceCount = await VendorItemPrice.countDocuments();
    
    console.log(`   - Vendors in DB: ${vendorCount}`);
    console.log(`   - Items in DB: ${itemCount}`);
    console.log(`   - Prices in DB: ${priceCount}`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addData();
