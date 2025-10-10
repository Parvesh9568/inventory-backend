import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vendor from './models/Vendor.js';

// Load environment variables
dotenv.config();

async function testVendorCreation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a new vendor
    console.log('\n📝 Test 1: Creating new vendor...');
    const testVendor = new Vendor({
      name: 'Test Vendor ' + Date.now(),
      phone: '9999999999',
      address: 'Test Address',
      assignedWires: [
        { wireName: '22mm', payalType: 'Golden', pricePerKg: 400 }
      ]
    });

    const savedVendor = await testVendor.save();
    console.log('✅ Vendor created successfully:', {
      id: savedVendor._id,
      name: savedVendor.name,
      phone: savedVendor.phone,
      address: savedVendor.address,
      assignedWires: savedVendor.assignedWires
    });

    // Test 2: Verify vendor is stored in database
    console.log('\n🔍 Test 2: Verifying vendor in database...');
    const foundVendor = await Vendor.findById(savedVendor._id);
    if (foundVendor) {
      console.log('✅ Vendor found in database:', foundVendor.name);
      console.log('📊 Assigned wires:', foundVendor.assignedWires);
    } else {
      console.log('❌ Vendor not found in database');
    }

    // Test 3: List all vendors
    console.log('\n📋 Test 3: All vendors in database...');
    const allVendors = await Vendor.find();
    console.log(`Total vendors: ${allVendors.length}`);
    allVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.name} (${vendor.phone}) - ${vendor.assignedWires.length} assigned wires`);
    });

    // Test 4: Test API endpoint simulation
    console.log('\n🌐 Test 4: Simulating API call...');
    const vendorData = {
      name: 'API Test Vendor ' + Date.now(),
      phone: '8888888888',
      address: 'API Test Address',
      assignedWires: [
        { wireName: '28mm', payalType: 'Silver', pricePerKg: 280 }
      ]
    };

    const apiVendor = new Vendor(vendorData);
    const apiSavedVendor = await apiVendor.save();
    console.log('✅ API simulation successful:', apiSavedVendor.name);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Vendor.findByIdAndDelete(savedVendor._id);
    await Vendor.findByIdAndDelete(apiSavedVendor._id);
    console.log('✅ Test data cleaned up');

    await mongoose.disconnect();
    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 Conclusion: Vendor creation and MongoDB storage is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
    process.exit(1);
  }
}

testVendorCreation();
