console.log('🔍 Testing API Endpoints');

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple schemas
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date() });
});

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    console.log(`📊 Found ${vendors.length} vendors`);
    res.json(vendors);
  } catch (error) {
    console.error('❌ Error fetching vendors:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendors/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    console.log(`📦 Found ${items.length} items`);
    res.json(items);
  } catch (error) {
    console.error('❌ Error fetching items:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { name } = req.body;
    const vendor = new Vendor({ name });
    await vendor.save();
    console.log(`✅ Added vendor: ${name}`);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('❌ Error adding vendor:', error.message);
    res.status(500).json({ error: error.message });
  }
});

async function startTestServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const PORT = 4002; // Different port to avoid conflicts
    app.listen(PORT, () => {
      console.log(`🚀 Test server running on http://localhost:${PORT}`);
      console.log('\n📋 Test these URLs in your browser:');
      console.log(`   http://localhost:${PORT}/api/test`);
      console.log(`   http://localhost:${PORT}/api/vendors`);
      console.log(`   http://localhost:${PORT}/api/vendors/items`);
      console.log('\n⏹️  Press Ctrl+C to stop the server');
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error.message);
  }
}

startTestServer();
