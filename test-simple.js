import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongoUri ? 'Found' : 'Missing');
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Available Collections:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

    // Check specific collections
    const vendorCount = await db.collection('vendors').countDocuments();
    const transactionCount = await db.collection('transactions').countDocuments();
    const paymentCount = await db.collection('payments').countDocuments();
    const priceChartCount = await db.collection('payalpricecharts').countDocuments();

    console.log('\n📈 Data Counts:');
    console.log(`Vendors: ${vendorCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Payments: ${paymentCount}`);
    console.log(`Price Chart Entries: ${priceChartCount}`);

    if (vendorCount > 0) {
      console.log('\n👥 Sample Vendors:');
      const vendors = await db.collection('vendors').find().limit(3).toArray();
      vendors.forEach(vendor => {
        console.log(`- ${vendor.name} (${vendor.phone || 'No phone'})`);
      });
    }

    if (transactionCount > 0) {
      console.log('\n📋 Sample Transactions:');
      const transactions = await db.collection('transactions').find().limit(3).toArray();
      transactions.forEach(tx => {
        console.log(`- ${tx.type} | ${tx.wireThickness || tx.item} | ${tx.payalType} | ${tx.quantity || tx.weight}kg`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
