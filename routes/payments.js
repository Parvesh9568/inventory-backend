import express from 'express';
import Payment from '../models/Payment.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('vendor', 'name')
      .sort({ date: -1 });

    const formattedPayments = payments.map(p => ({
      id: p._id,
      vendor: p.vendor ? p.vendor.name : 'Unknown Vendor',
      wire: p.wire,
      payalType: p.payalType,
      amount: p.amount,
      date: p.date,
      notes: p.notes,
      createdAt: p.createdAt
    }));

    res.json(formattedPayments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payments for a specific vendor
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;

    const vendorDoc = await Vendor.findOne({ name: vendorName });
    if (!vendorDoc) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const payments = await Payment.find({ vendor: vendorDoc._id })
      .populate('vendor', 'name')
      .sort({ date: -1 });

    const formattedPayments = payments.map(p => ({
      id: p._id,
      vendor: p.vendor ? p.vendor.name : 'Unknown Vendor',
      wire: p.wire,
      payalType: p.payalType,
      amount: p.amount,
      date: p.date,
      notes: p.notes,
      createdAt: p.createdAt
    }));

    res.json(formattedPayments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor payments' });
  }
});

// Get payments for a specific vendor and wire
router.get('/vendor/:vendorName/wire/:wireName', async (req, res) => {
  try {
    const { vendorName, wireName } = req.params;

    const vendorDoc = await Vendor.findOne({ name: vendorName });
    if (!vendorDoc) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const payments = await Payment.find({ 
      vendor: vendorDoc._id,
      wire: wireName 
    })
      .populate('vendor', 'name')
      .sort({ date: -1 });

    const formattedPayments = payments.map(p => ({
      id: p._id,
      vendor: p.vendor ? p.vendor.name : 'Unknown Vendor',
      wire: p.wire,
      payalType: p.payalType,
      amount: p.amount,
      date: p.date,
      notes: p.notes,
      createdAt: p.createdAt
    }));

    res.json(formattedPayments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor wire payments' });
  }
});

// Add new payment
router.post('/', async (req, res) => {
  try {
    const { vendor, wire, payalType, amount, date, notes } = req.body;

    // Validate required fields
    if (!vendor || !wire || !payalType || !amount || !date) {
      return res.status(400).json({ 
        error: 'Vendor, wire, payalType, amount, and date are required' 
      });
    }

    // Find vendor
    const vendorDoc = await Vendor.findOne({ name: vendor });
    if (!vendorDoc) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Create payment
    const payment = new Payment({
      vendor: vendorDoc._id,
      wire,
      payalType,
      amount: paymentAmount,
      date: new Date(date),
      notes: notes || ''
    });

    await payment.save();

    // Populate vendor info for response
    await payment.populate('vendor', 'name');

    const formattedPayment = {
      id: payment._id,
      vendor: payment.vendor.name,
      wire: payment.wire,
      payalType: payment.payalType,
      amount: payment.amount,
      date: payment.date,
      notes: payment.notes,
      createdAt: payment.createdAt
    };

    res.status(201).json(formattedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor, wire, payalType, amount, date, notes } = req.body;

    // Find payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update fields if provided
    if (vendor) {
      const vendorDoc = await Vendor.findOne({ name: vendor });
      if (!vendorDoc) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      payment.vendor = vendorDoc._id;
    }

    if (wire) payment.wire = wire;
    if (payalType) payment.payalType = payalType;
    if (amount) {
      const paymentAmount = parseFloat(amount);
      if (paymentAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }
      payment.amount = paymentAmount;
    }
    if (date) payment.date = new Date(date);
    if (notes !== undefined) payment.notes = notes;

    await payment.save();
    await payment.populate('vendor', 'name');

    const formattedPayment = {
      id: payment._id,
      vendor: payment.vendor.name,
      wire: payment.wire,
      payalType: payment.payalType,
      amount: payment.amount,
      date: payment.date,
      notes: payment.notes,
      createdAt: payment.createdAt
    };

    res.json(formattedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const vendorStats = await Payment.aggregate([
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendor',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      { $unwind: '$vendorInfo' },
      {
        $group: {
          _id: '$vendorInfo.name',
          totalAmount: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      vendorStats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

export default router;
