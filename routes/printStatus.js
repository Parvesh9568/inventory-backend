import express from 'express';
import PrintStatus from '../models/PrintStatus.js';

const router = express.Router();

// Get all print statuses
router.get('/', async (req, res) => {
  try {
    const statuses = await PrintStatus.find().sort({ vendorName: 1, pageNumber: 1 });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get print status for a specific vendor
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;
    const statuses = await PrintStatus.find({ vendorName }).sort({ pageNumber: 1 });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a page as printed
router.post('/mark-printed', async (req, res) => {
  try {
    const { vendorName, pageNumber } = req.body;

    if (!vendorName || pageNumber === undefined) {
      return res.status(400).json({ error: 'vendorName and pageNumber are required' });
    }

    // Use findOneAndUpdate with upsert to create or update
    const status = await PrintStatus.findOneAndUpdate(
      { vendorName, pageNumber },
      { 
        vendorName, 
        pageNumber, 
        isPrinted: true,
        printedAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark multiple pages as printed (batch operation)
router.post('/mark-printed-batch', async (req, res) => {
  try {
    const { pages } = req.body; // Array of { vendorName, pageNumber }

    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ error: 'pages array is required' });
    }

    const operations = pages.map(({ vendorName, pageNumber }) => ({
      updateOne: {
        filter: { vendorName, pageNumber },
        update: { 
          vendorName, 
          pageNumber, 
          isPrinted: true,
          printedAt: new Date()
        },
        upsert: true
      }
    }));

    const result = await PrintStatus.bulkWrite(operations);
    res.status(201).json({ 
      message: 'Pages marked as printed',
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unmark a page (mark as not printed)
router.delete('/:vendorName/:pageNumber', async (req, res) => {
  try {
    const { vendorName, pageNumber } = req.params;

    const result = await PrintStatus.findOneAndDelete({ 
      vendorName, 
      pageNumber: parseInt(pageNumber) 
    });

    if (!result) {
      return res.status(404).json({ error: 'Print status not found' });
    }

    res.json({ message: 'Print status removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all print statuses
router.delete('/clear/all', async (req, res) => {
  try {
    const result = await PrintStatus.deleteMany({});
    res.json({ 
      message: 'All print statuses cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear print statuses for a specific vendor
router.delete('/clear/vendor/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;
    const result = await PrintStatus.deleteMany({ vendorName });
    res.json({ 
      message: `Print statuses cleared for vendor: ${vendorName}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
