import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './config/database.js';
import itemRoutes from './routes/items.js';
import vendorRoutes from './routes/vendors.js';
import userRoutes from './routes/users.js';
import payalPriceChartRoutes from './routes/payalPriceChart.js';
import paymentRoutes from './routes/payments.js';
import vendorTransactionRecordRoutes from './routes/vendorTransactionRecords.js';
import printStatusRoutes from './routes/printStatus.js';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
try {
  await initDatabase();
} catch (error) {
}

// Debug middleware to log all requests
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payal-price-chart', payalPriceChartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vendor-transaction-records', vendorTransactionRecordRoutes);
app.use('/api/print-status', printStatusRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IN/OUT Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IN/OUT Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
});
