import express from 'express';
import Transaction from '../models/Transaction.js';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';

const router = express.Router();

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('vendor', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      type: t.type,
      vendor: t.vendor ? t.vendor.name : 'Unknown Vendor',
      item: t.item ? t.item.name : 'Unknown Item',
      qty: t.quantity,
      price: t.price_per_unit,
      payalType: t.payalType || '',
      total: t.total_amount,
      timestamp: t.createdAt,
      inDate: t.inDate,
      outDate: t.outDate,
      createdAt: t.createdAt
    }));

    res.json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by type (IN or OUT)
router.get('/transactions/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['IN', 'OUT'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Type must be IN or OUT' });
    }

    const transactions = await Transaction.find({ type: type.toUpperCase() })
      .populate('vendor', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      type: t.type,
      vendor: t.vendor ? t.vendor.name : 'Unknown Vendor',
      item: t.item ? t.item.name : 'Unknown Item',
      qty: t.quantity,
      price: t.price_per_unit,
      payalType: t.payalType || '',
      total: t.total_amount,
      timestamp: t.createdAt,
      inDate: t.inDate,
      outDate: t.outDate,
      createdAt: t.createdAt
    }));

    res.json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { type, vendor, item, qty, price, payalType, inDate, outDate } = req.body;

    // Validation
    if (!type || !vendor || !item || !qty) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, vendor, item, qty' 
      });
    }

    if (type.toUpperCase() === 'IN' && !payalType) {
      return res.status(400).json({ 
        error: 'PayalType is required for IN transactions' 
      });
    }

    if (type.toUpperCase() === 'IN' && !price) {
      return res.status(400).json({ 
        error: 'Price is required for IN transactions' 
      });
    }

    if (!['IN', 'OUT'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Type must be IN or OUT' });
    }

    // Find vendor and item
    const vendorDoc = await Vendor.findOne({ name: vendor });
    const itemDoc = await Item.findOne({ name: item });

    if (!vendorDoc || !itemDoc) {
      return res.status(400).json({ 
        error: 'Vendor or item not found' 
      });
    }

    // For IN transactions, check inventory availability
    if (type.toUpperCase() === 'IN') {
      const isAvailable = await checkInventoryAvailability(vendorDoc._id, itemDoc._id, qty);
      if (!isAvailable.available) {
        return res.status(400).json({ error: isAvailable.message });
      }
    }

    // Use provided price or default to 0 for OUT transactions
    const pricePerUnit = price ? parseFloat(price) : 0;
    const total = parseFloat(qty) * pricePerUnit;

    // Prepare transaction data
    const transactionData = {
      type: type.toUpperCase(),
      vendor: vendorDoc._id,
      item: itemDoc._id,
      quantity: parseFloat(qty),
      price_per_unit: pricePerUnit,
      total_amount: total,
      payalType: type.toUpperCase() === 'IN' ? payalType : undefined
    };

    // Add date fields based on transaction type
    if (type.toUpperCase() === 'IN') {
      transactionData.inDate = inDate ? new Date(inDate) : new Date();
    } else {
      transactionData.outDate = outDate ? new Date(outDate) : new Date();
    }

    // Create transaction
    const transaction = new Transaction(transactionData);

    await transaction.save();

    // Populate and return the created transaction
    await transaction.populate('vendor', 'name');
    await transaction.populate('item', 'name');

    const formattedTransaction = {
      id: transaction._id,
      type: transaction.type,
      vendor: transaction.vendor ? transaction.vendor.name : 'Unknown Vendor',
      item: transaction.item ? transaction.item.name : 'Unknown Item',
      qty: transaction.quantity,
      price: transaction.price_per_unit,
      payalType: transaction.payalType || '',
      total: transaction.total_amount,
      timestamp: transaction.createdAt,
      inDate: transaction.inDate,
      outDate: transaction.outDate,
      createdAt: transaction.createdAt
    };

    res.status(201).json(formattedTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available inventory for IN operations
router.get('/inventory/available', async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendor',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'itemInfo'
        }
      },
      {
        $unwind: '$vendorInfo'
      },
      {
        $unwind: '$itemInfo'
      },
      {
        $group: {
          _id: {
            vendor: '$vendorInfo.name',
            item: '$itemInfo.name'
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0]
            }
          },
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0]
            }
            
        }
      },
        $match: {
          $expr: { $gt: [{ $subtract: ['$totalOut', '$totalIn'] }, 0] }
        }
      },
      {
        $project: {
          _id: 0,
          vendor: '$_id.vendor',
          item: '$_id.item',
          totalOut: 1,
          totalIn: 1
        }
      },
      {
        $sort: { vendor: 1, item: 1 }
      }
    ];

    const inventory = await Transaction.aggregate(pipeline);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check inventory availability
async function checkInventoryAvailability(vendorId, itemId, requestedQty) {
  try {
    const pipeline = [
      {
        $match: {
          vendor: vendorId,
          item: itemId
        }
      },
      {
        $group: {
          _id: null,
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0]
            }
          },
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0]
            }
          }
        }
      }
    ];

    const result = await Transaction.aggregate(pipeline);
    
    if (result.length === 0) {
      return {
        available: false,
        message: 'Item not available for import. Please export it first.'
      };
    }

    const { totalOut, totalIn } = result[0];
    const availableQty = totalOut - totalIn;
    
    if (availableQty <= 0) {
      return {
        available: false,
        message: 'Item not available for import. Please export it first.'
      };
    }

    if (requestedQty > availableQty) {
      return {
        available: false,
        message: `Only ${availableQty} units available. You requested ${requestedQty} units.`
      };
    }

    return { available: true };
  } catch (error) {
    return {
      available: false,
      message: error.message
    };
  }
}

export default router;
