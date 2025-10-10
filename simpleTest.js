import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Test routes
app.get('/api/test', (req, res) => {
  console.log('✅ GET /api/test called');
  res.json({ message: 'Test route working!', timestamp: new Date() });
});

app.post('/api/vendors', (req, res) => {
  console.log('✅ POST /api/vendors called with body:', req.body);
  res.status(201).json({ 
    _id: 'test123',
    name: req.body.name,
    message: 'Test vendor created!'
  });
});

app.post('/api/vendors/items', (req, res) => {
  console.log('✅ POST /api/vendors/items called with body:', req.body);
  res.status(201).json({ 
    _id: 'test456',
    name: req.body.name,
    message: 'Test item created!'
  });
});

app.get('/api/vendors', (req, res) => {
  console.log('✅ GET /api/vendors called');
  res.json([
    { _id: '1', name: 'Test Vendor 1' },
    { _id: '2', name: 'Test Vendor 2' }
  ]);
});

app.get('/api/vendors/items', (req, res) => {
  console.log('✅ GET /api/vendors/items called');
  res.json([
    { _id: '1', name: 'Test Item 1' },
    { _id: '2', name: 'Test Item 2' }
  ]);
});

const PORT = 4003;
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
  console.log('📋 Test these URLs:');
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/vendors`);
  console.log(`   GET  http://localhost:${PORT}/api/vendors/items`);
  console.log(`   POST http://localhost:${PORT}/api/vendors (with JSON body)`);
  console.log(`   POST http://localhost:${PORT}/api/vendors/items (with JSON body)`);
});
