import express from 'express';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import VendorItemPrice from '../models/VendorItemPrice.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new vendor
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, assignedWires } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ name });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists' });
    }

    const vendor = new Vendor({ 
      name,
      phone: phone || '',
      address: address || '',
      assignedWires: assignedWires || []
    });
    
    const savedVendor = await vendor.save();
    res.status(201).json(savedVendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new item
router.post('/items', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Check if item already exists
    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return res.status(400).json({ error: 'Item already exists' });
    }

    const item = new Item({ name });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/items/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Find and delete the item
    const item = await Item.findOneAndDelete({ name });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: `Item "${name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor-item prices
router.get('/prices', async (req, res) => {
  try {
    const prices = await VendorItemPrice.find()
      .populate('vendor', 'name')
      .populate('item', 'name')
      .sort({ 'vendor.name': 1, 'item.name': 1 });

    // Convert to nested object format
    const pricesObject = {};
    prices.forEach(price => {
      const vendorName = price.vendor ? price.vendor.name : 'Unknown Vendor';
      const itemName = price.item ? price.item.name : 'Unknown Item';
      
      if (!pricesObject[vendorName]) {
        pricesObject[vendorName] = {};
      }
      pricesObject[vendorName][itemName] = price.price;
    });

    res.json(pricesObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price for specific vendor-item combination
router.get('/:vendor/items/:item/price', async (req, res) => {
  try {
    const { vendor, item } = req.params;

    const vendorDoc = await Vendor.findOne({ name: vendor });
    const itemDoc = await Item.findOne({ name: item });

    if (!vendorDoc || !itemDoc) {
      return res.status(404).json({ 
        error: 'Vendor or item not found' 
      });
    }

    const priceDoc = await VendorItemPrice.findOne({
      vendor: vendorDoc._id,
      item: itemDoc._id
    });

    if (!priceDoc) {
      return res.status(404).json({ 
        error: 'Price not found for this vendor-item combination' 
      });
    }

    res.json({ vendor, item, price: priceDoc.price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor summary (transactions and totals)
router.get('/:vendor/summary', async (req, res) => {
  try {
    const { vendor } = req.params;

    const vendorDoc = await Vendor.findOne({ name: vendor });
    if (!vendorDoc) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const pipeline = [
      {
        $match: { vendor: vendorDoc._id }
      },
      {
        $group: {
          _id: '$type',
          transaction_count: { $sum: 1 },
          total_amount: { $sum: '$total_amount' }
        }
      }
    ];

    const results = await Transaction.aggregate(pipeline);

    const summary = {
      vendor,
      in_total: 0,
      out_total: 0,
      in_count: 0,
      out_count: 0,
      net_amount: 0
    };

    results.forEach(result => {
      if (result._id === 'IN') {
        summary.in_total = result.total_amount || 0;
        summary.in_count = result.transaction_count || 0;
      } else if (result._id === 'OUT') {
        summary.out_total = result.total_amount || 0;
        summary.out_count = result.transaction_count || 0;
      }
    });

    summary.net_amount = summary.in_total - summary.out_total;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions for a specific vendor
router.get('/:vendor/transactions', async (req, res) => {
  try {
    const { vendor } = req.params;

    const vendorDoc = await Vendor.findOne({ name: vendor });
    if (!vendorDoc) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const transactions = await Transaction.find({ vendor: vendorDoc._id })
      .populate('vendor', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      type: t.type,
      vendor: t.vendor ? t.vendor.name : 'Unknown Vendor',
      wireThickness: t.wireThickness || (t.item ? t.item.name : 'Unknown Wire'),
      item: t.item ? t.item.name : (t.wireThickness || 'Unknown Item'),
      qty: t.quantity,
      weight: t.quantity, // Add weight field mapping
      price: t.price_per_unit,
      payalType: t.payalType || 'Unknown',
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

// Add wire assignment to vendor
router.post('/:vendorId/wires', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { wireName, payalType, pricePerKg } = req.body;
    
    if (!wireName || !payalType || !pricePerKg) {
      return res.status(400).json({ error: 'Wire name, payal type, and price are required' });
    }
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if this wire-payal combination already exists
    const existingAssignment = vendor.assignedWires.find(
      w => w.wireName === wireName && w.payalType === payalType
    );
    
    if (existingAssignment) {
      return res.status(400).json({ error: 'This wire-payal combination already exists for this vendor' });
    }
    
    vendor.assignedWires.push({ wireName, payalType, pricePerKg });
    await vendor.save();
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove wire assignment from vendor
router.delete('/:vendorId/wires/:assignmentId', async (req, res) => {
  try {
    const { vendorId, assignmentId } = req.params;
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if wire assignment exists
    const wireExists = vendor.assignedWires.some(
      wire => wire._id.toString() === assignmentId
    );
    
    if (!wireExists) {
      return res.status(404).json({ error: 'Wire assignment not found' });
    }
    
    // Remove the wire assignment using pull (Mongoose method)
    vendor.assignedWires.pull(assignmentId);
    await vendor.save();
    
    res.json({ 
      message: 'Wire assignment removed successfully',
      vendor 
    });
  } catch (error) {
    console.error('Error removing wire assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update vendor details
router.put('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { name, phone, address } = req.body;
    
    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // If name is being changed, check if new name already exists
    if (name && name !== vendor.name) {
      const existingVendor = await Vendor.findOne({ name });
      if (existingVendor) {
        return res.status(400).json({ error: 'A vendor with this name already exists' });
      }
      vendor.name = name;
    }

    // Update phone and address if provided
    if (phone !== undefined) vendor.phone = phone;
    if (address !== undefined) vendor.address = address;

    await vendor.save();
    
    res.json({ 
      message: `Vendor updated successfully`,
      vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vendor
router.delete('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor has any transactions
    const transactionCount = await Transaction.countDocuments({ vendor: vendorId });
    if (transactionCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete vendor "${vendor.name}" because they have ${transactionCount} transaction(s). Please delete all transactions first.` 
      });
    }

    // Delete the vendor
    await Vendor.findByIdAndDelete(vendorId);
    
    res.json({ 
      message: `Vendor "${vendor.name}" deleted successfully`,
      deletedVendor: {
        id: vendor._id,
        name: vendor.name,
        phone: vendor.phone,
        address: vendor.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
