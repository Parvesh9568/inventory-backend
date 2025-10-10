import express from 'express';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { vendorName, itemName, phone, address } = req.body;
    
    
    // Create user
    const user = new User({
      vendorName,
      itemName,
      phone,
      address
    });
    
    const savedUser = await user.save();
    
    // Create or update vendor if it doesn't exist
    await Vendor.findOneAndUpdate(
      { name: vendorName },
      { name: vendorName },
      { upsert: true, new: true }
    );
    
    // Create or update item if it doesn't exist
    await Item.findOneAndUpdate(
      { name: itemName },
      { name: itemName },
      { upsert: true, new: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully with vendor and item',
      data: savedUser
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { vendorName, itemName, address, phone, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(vendorName && { vendorName }),
        ...(itemName && { itemName }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(isActive !== undefined && { isActive })
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-__v');
    
    // Update vendor if provided
    if (vendorName) {
      await Vendor.findOneAndUpdate(
        { name: vendorName },
        { name: vendorName },
        { upsert: true, new: true }
      );
    }
    
    // Update item if provided
    if (itemName) {
      await Item.findOneAndUpdate(
        { name: itemName },
        { name: itemName },
        { upsert: true, new: true }
      );
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Delete user (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});


export default router;
