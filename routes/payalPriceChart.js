import express from 'express';
import PayalPriceChart from '../models/PayalPriceChart.js';

const router = express.Router();

// Get all payal price chart data
router.get('/', async (req, res) => {
  try {
    const priceChart = await PayalPriceChart.find().sort({ wireThickness: 1, payalType: 1 });
    
    // Convert to nested object format for frontend compatibility
    const chartObject = {};
    priceChart.forEach(item => {
      if (!chartObject[item.wireThickness]) {
        chartObject[item.wireThickness] = {};
      }
      chartObject[item.wireThickness][item.payalType] = item.pricePerKg;
    });

    res.json(chartObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price for specific wire thickness and payal type
router.get('/:wireThickness/:payalType', async (req, res) => {
  try {
    const { wireThickness, payalType } = req.params;
    
    const priceItem = await PayalPriceChart.findOne({ 
      wireThickness, 
      payalType 
    });

    if (!priceItem) {
      return res.status(404).json({ 
        error: 'Price not found for this combination' 
      });
    }

    res.json({ 
      wireThickness, 
      payalType, 
      pricePerKg: priceItem.pricePerKg 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update price chart entry
router.post('/', async (req, res) => {
  try {
    const { wireThickness, payalType, pricePerKg } = req.body;

    if (!wireThickness || !payalType || pricePerKg === undefined || pricePerKg === null) {
      return res.status(400).json({ 
        error: 'Missing required fields: wireThickness, payalType, pricePerKg' 
      });
    }

    // Use upsert to update if exists, create if not
    const priceItem = await PayalPriceChart.findOneAndUpdate(
      { wireThickness, payalType },
      { pricePerKg: parseFloat(pricePerKg) },
      { upsert: true, new: true }
    );

    res.status(201).json(priceItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update price chart entry
router.put('/:wireThickness/:payalType', async (req, res) => {
  try {
    const { wireThickness, payalType } = req.params;
    const { pricePerKg } = req.body;

    if (pricePerKg === undefined || pricePerKg === null) {
      return res.status(400).json({ 
        error: 'Missing required field: pricePerKg' 
      });
    }

    const priceItem = await PayalPriceChart.findOneAndUpdate(
      { wireThickness, payalType },
      { pricePerKg: parseFloat(pricePerKg) },
      { new: true }
    );

    if (!priceItem) {
      return res.status(404).json({ 
        error: 'Price entry not found' 
      });
    }

    res.json(priceItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete price chart entry
router.delete('/:wireThickness/:payalType', async (req, res) => {
  try {
    const { wireThickness, payalType } = req.params;

    const priceItem = await PayalPriceChart.findOneAndDelete({ 
      wireThickness, 
      payalType 
    });

    if (!priceItem) {
      return res.status(404).json({ 
        error: 'Price entry not found' 
      });
    }

    res.json({ message: 'Price entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all entries for a specific wire thickness
router.delete('/wire/:wireThickness', async (req, res) => {
  try {
    const { wireThickness } = req.params;

    const result = await PayalPriceChart.deleteMany({ wireThickness });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'No price entries found for this wire thickness' 
      });
    }

    res.json({ 
      message: `All price entries for ${wireThickness} deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk seed initial data
router.post('/seed', async (req, res) => {
  try {
    const initialData = [
      { wireThickness: '22mm', payalType: 'Moorni', pricePerKg: 120 },
      { wireThickness: '22mm', payalType: 'Silver', pricePerKg: 200 },
      { wireThickness: '22mm', payalType: 'Golden', pricePerKg: 350 },
      { wireThickness: '22mm', payalType: 'Diamond', pricePerKg: 700 },
      { wireThickness: '28mm', payalType: 'Moorni', pricePerKg: 150 },
      { wireThickness: '28mm', payalType: 'Silver', pricePerKg: 250 },
      { wireThickness: '28mm', payalType: 'Golden', pricePerKg: 400 },
      { wireThickness: '28mm', payalType: 'Diamond', pricePerKg: 800 },
      { wireThickness: '30mm', payalType: 'Moorni', pricePerKg: 180 },
      { wireThickness: '30mm', payalType: 'Silver', pricePerKg: 280 },
      { wireThickness: '30mm', payalType: 'Golden', pricePerKg: 450 },
      { wireThickness: '30mm', payalType: 'Diamond', pricePerKg: 850 },
      { wireThickness: '32mm', payalType: 'Moorni', pricePerKg: 200 },
      { wireThickness: '32mm', payalType: 'Silver', pricePerKg: 300 },
      { wireThickness: '32mm', payalType: 'Golden', pricePerKg: 500 },
      { wireThickness: '32mm', payalType: 'Diamond', pricePerKg: 900 }
    ];

    // Clear existing data and insert new data
    await PayalPriceChart.deleteMany({});
    const result = await PayalPriceChart.insertMany(initialData);

    res.json({ 
      message: 'Price chart seeded successfully', 
      count: result.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
