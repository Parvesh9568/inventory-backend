console.log('🚀 Starting Working Test Server...');

import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ 
    status: 'OK', 
    message: 'Working server is running',
    timestamp: new Date().toISOString()
  });
});

// Get vendors
app.get('/api/vendors', (req, res) => {
  console.log('✅ GET vendors');
  res.json([
    { _id: '1', name: 'Anuj' },
    { _id: '2', name: 'Parvesh' },
    { _id: '3', name: 'Neeraj' },
    { _id: '4', name: 'Avinash' }
  ]);
});

// Add vendor
app.post('/api/vendors', (req, res) => {
  console.log('✅ POST vendor with body:', req.body);
  const { name } = req.body;
  
  if (!name) {
    console.log('❌ No name provided');
    return res.status(400).json({ error: 'Vendor name is required' });
  }
  
  const newVendor = {
    _id: Date.now().toString(),
    name: name,
    createdAt: new Date().toISOString()
  };
  
  console.log('✅ Created vendor:', newVendor);
  res.status(201).json(newVendor);
});

// Get items
app.get('/api/vendors/items', (req, res) => {
  console.log('✅ GET items');
  res.json([
    { _id: '1', name: '22m' },
    { _id: '2', name: '28m' },
    { _id: '3', name: '32m' },
    { _id: '4', name: '38m' }
  ]);
});

// Add item
app.post('/api/vendors/items', (req, res) => {
  console.log('✅ POST item with body:', req.body);
  const { name } = req.body;
  
  if (!name) {
    console.log('❌ No name provided');
    return res.status(400).json({ error: 'Item name is required' });
  }
  
  const newItem = {
    _id: Date.now().toString(),
    name: name,
    createdAt: new Date().toISOString()
  };
  
  console.log('✅ Created item:', newItem);
  res.status(201).json(newItem);
});

// Get vendor prices (empty object for now)
app.get('/api/vendors/prices', (req, res) => {
  console.log('✅ GET vendor prices');
  res.json({
    "Anuj": { "22m": 100, "28m": 120, "32m": 140, "38m": 160 },
    "Parvesh": { "22m": 95, "28m": 115, "32m": 135, "38m": 155 },
    "Neeraj": { "22m": 105, "28m": 125, "32m": 145, "38m": 165 },
    "Avinash": { "22m": 90, "28m": 110, "32m": 130, "38m": 150 }
  });
});

// Get transactions by type (empty arrays for now)
app.get('/api/items/transactions/:type', (req, res) => {
  console.log('✅ GET transactions for type:', req.params.type);
  res.json([]); // Empty array - no transactions yet
});

// Get all transactions
app.get('/api/items/transactions', (req, res) => {
  console.log('✅ GET all transactions');
  res.json([]); // Empty array - no transactions yet
});

// Add transaction
app.post('/api/items/transactions', (req, res) => {
  console.log('✅ POST transaction with body:', req.body);
  const { type, vendor, item, qty, price } = req.body;
  
  const newTransaction = {
    id: Date.now().toString(),
    type: type,
    vendor: vendor,
    item: item,
    qty: parseFloat(qty),
    price: parseFloat(price),
    total: parseFloat(qty) * parseFloat(price),
    timestamp: new Date().toISOString()
  };
  
  console.log('✅ Created transaction:', newTransaction);
  res.status(201).json(newTransaction);
});

// Delete transaction
app.delete('/api/items/transactions/:id', (req, res) => {
  console.log('✅ DELETE transaction:', req.params.id);
  res.json({ message: 'Transaction deleted successfully' });
});

// Get available inventory
app.get('/api/items/inventory/available', (req, res) => {
  console.log('✅ GET available inventory');
  res.json([]); // Empty array - no inventory yet
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /api/test',
      'GET /api/health', 
      'GET /api/vendors',
      'POST /api/vendors',
      'GET /api/vendors/items',
      'POST /api/vendors/items',
      'GET /api/vendors/prices',
      'GET /api/items/transactions',
      'GET /api/items/transactions/:type',
      'POST /api/items/transactions',
      'DELETE /api/items/transactions/:id',
      'GET /api/items/inventory/available'
    ]
  });
});

const PORT = 4003;

app.listen(PORT, () => {
  console.log(`✅ Working server started successfully!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Test URLs:`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/vendors`);
  console.log(`   POST http://localhost:${PORT}/api/vendors`);
  console.log(`   GET  http://localhost:${PORT}/api/vendors/items`);
  console.log(`   POST http://localhost:${PORT}/api/vendors/items`);
  console.log(`\n🎯 Frontend should connect to: http://localhost:${PORT}/api`);
  console.log(`📱 Your frontend is at: http://localhost:5173`);
});
