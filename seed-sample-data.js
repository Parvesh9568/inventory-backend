import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vendor from './models/Vendor.js';
import Transaction from './models/Transaction.js';
import PayalPriceChart from './models/PayalPriceChart.js';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

async function seedSampleData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Vendor.deleteMany({});
    await Transaction.deleteMany({});
    await PayalPriceChart.deleteMany({});
    await Payment.deleteMany({});

    // 1. Create Payal Price Chart
    console.log('💰 Creating payal price chart...');
    const priceChartData = [
      { wireThickness: '22mm', payalType: 'Moorni', pricePerKg: 120 },
      { wireThickness: '22mm', payalType: 'Silver', pricePerKg: 250 },
      { wireThickness: '22mm', payalType: 'Golden', pricePerKg: 400 },
      { wireThickness: '22mm', payalType: 'Diamond', pricePerKg: 600 },
      
      { wireThickness: '28mm', payalType: 'Moorni', pricePerKg: 150 },
      { wireThickness: '28mm', payalType: 'Silver', pricePerKg: 280 },
      { wireThickness: '28mm', payalType: 'Golden', pricePerKg: 450 },
      { wireThickness: '28mm', payalType: 'Diamond', pricePerKg: 650 },
      
      { wireThickness: '30mm', payalType: 'Moorni', pricePerKg: 180 },
      { wireThickness: '30mm', payalType: 'Silver', pricePerKg: 320 },
      { wireThickness: '30mm', payalType: 'Golden', pricePerKg: 500 },
      { wireThickness: '30mm', payalType: 'Diamond', pricePerKg: 700 }
    ];

    await PayalPriceChart.insertMany(priceChartData);
    console.log(`✅ Created ${priceChartData.length} price chart entries`);

    // 2. Create Vendors with Vendor-Specific Assigned Prices
    console.log('👥 Creating vendors with assigned wire prices...');
    const vendors = await Vendor.insertMany([
      { 
        name: 'Anuj Kumar', 
        phone: '9876543210', 
        address: 'Delhi',
        assignedWires: [
          { wireName: '22mm', payalType: 'Golden', pricePerKg: 380 }, // Custom price: ₹380 (vs ₹400 standard)
          { wireName: '28mm', payalType: 'Silver', pricePerKg: 260 }  // Custom price: ₹260 (vs ₹280 standard)
        ]
      },
      { 
        name: 'Rajesh Singh', 
        phone: '9876543211', 
        address: 'Mumbai',
        assignedWires: [
          { wireName: '22mm', payalType: 'Moorni', pricePerKg: 110 }, // Custom price: ₹110 (vs ₹120 standard)
          { wireName: '30mm', payalType: 'Diamond', pricePerKg: 720 } // Custom price: ₹720 (vs ₹700 standard)
        ]
      },
      { 
        name: 'Priya Sharma', 
        phone: '9876543212', 
        address: 'Bangalore',
        assignedWires: [
          { wireName: '28mm', payalType: 'Golden', pricePerKg: 420 }  // Custom price: ₹420 (vs ₹450 standard)
        ]
      }
    ]);
    console.log(`✅ Created ${vendors.length} vendors`);

    // 3. Create Transactions
    console.log('📋 Creating transactions...');
    const transactions = [];
    
    // Anuj Kumar transactions
    transactions.push(
      {
        vendorName: 'Anuj Kumar',
        type: 'OUT',
        wireThickness: '22mm',
        payalType: 'Golden',
        quantity: 25,
        outDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15')
      },
      {
        vendorName: 'Anuj Kumar',
        type: 'IN',
        wireThickness: '22mm',
        payalType: 'Golden',
        quantity: 10,
        inDate: new Date('2024-01-20'),
        createdAt: new Date('2024-01-20')
      },
      {
        vendorName: 'Anuj Kumar',
        type: 'IN',
        wireThickness: '22mm',
        payalType: 'Golden',
        quantity: 5,
        inDate: new Date('2024-01-25'),
        createdAt: new Date('2024-01-25')
      }
    );

    // Rajesh Singh transactions
    transactions.push(
      {
        vendorName: 'Rajesh Singh',
        type: 'OUT',
        wireThickness: '22mm',
        payalType: 'Moorni',
        quantity: 50,
        outDate: new Date('2024-01-10'),
        createdAt: new Date('2024-01-10')
      },
      {
        vendorName: 'Rajesh Singh',
        type: 'IN',
        wireThickness: '22mm',
        payalType: 'Moorni',
        quantity: 30,
        inDate: new Date('2024-01-18'),
        createdAt: new Date('2024-01-18')
      }
    );

    // Priya Sharma transactions
    transactions.push(
      {
        vendorName: 'Priya Sharma',
        type: 'OUT',
        wireThickness: '28mm',
        payalType: 'Golden',
        quantity: 15,
        outDate: new Date('2024-01-12'),
        createdAt: new Date('2024-01-12')
      },
      {
        vendorName: 'Priya Sharma',
        type: 'IN',
        wireThickness: '28mm',
        payalType: 'Golden',
        quantity: 8,
        inDate: new Date('2024-01-22'),
        createdAt: new Date('2024-01-22')
      }
    );

    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} transactions`);

    // 4. Create Sample Payments
    console.log('💳 Creating sample payments...');
    const payments = [
      {
        vendor: vendors[0]._id, // Anuj Kumar
        wire: '22mm',
        payalType: 'Golden',
        amount: 2000, // Partial payment for 15kg remaining * ₹400 = ₹6000
        date: new Date('2024-01-30'),
        notes: 'Partial payment'
      },
      {
        vendor: vendors[1]._id, // Rajesh Singh
        wire: '22mm',
        payalType: 'Moorni',
        amount: 2400, // Full payment for 20kg remaining * ₹120 = ₹2400
        date: new Date('2024-01-25'),
        notes: 'Full payment'
      }
    ];

    await Payment.insertMany(payments);
    console.log(`✅ Created ${payments.length} payments`);

    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Vendors: ${vendors.length}`);
    console.log(`- Transactions: ${transactions.length}`);
    console.log(`- Price Chart Entries: ${priceChartData.length}`);
    console.log(`- Payments: ${payments.length}`);
    
    console.log('\n💡 Expected Payment Calculations (Using Vendor-Specific Assigned Prices):');
    console.log('- Anuj Kumar (22mm Golden): 15kg remaining * ₹380 = ₹5700 payable, ₹2000 paid, ₹3700 remaining');
    console.log('- Rajesh Singh (22mm Moorni): 20kg remaining * ₹110 = ₹2200 payable, ₹2400 paid, ₹-200 overpaid');
    console.log('- Priya Sharma (28mm Golden): 7kg remaining * ₹420 = ₹2940 payable, ₹0 paid, ₹2940 remaining');
    console.log('\n🎯 Key Feature: Uses vendor-assigned prices, NOT general payal price chart!');
    console.log('📊 Standard vs Vendor Prices:');
    console.log('  - Anuj Kumar Golden: ₹400 (standard) vs ₹380 (assigned) = ₹20 discount');
    console.log('  - Rajesh Singh Moorni: ₹120 (standard) vs ₹110 (assigned) = ₹10 discount');
    console.log('  - Priya Sharma Golden: ₹450 (standard) vs ₹420 (assigned) = ₹30 discount');

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedSampleData();
