import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

async function testUserCreation() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Test creating a user
    const testUser = new User({
      vendorName: 'Test Vendor',
      itemName: 'Test Item',
      phone: '1234567890',
      address: '123 Main Street, City, State 12345'
    });

    const savedUser = await testUser.save();
    console.log('✅ User created successfully:', {
      id: savedUser._id,
      vendorName: savedUser.vendorName,
      itemName: savedUser.itemName,
      phone: savedUser.phone,
      address: savedUser.address
    });

    // Test fetching users
    const users = await User.find({ isActive: true });
    console.log(`✅ Found ${users.length} active user(s)`);

    // Clean up test user
    await User.findByIdAndDelete(savedUser._id);
    console.log('✅ Test user cleaned up');

    console.log('🎉 User model test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUserCreation();
