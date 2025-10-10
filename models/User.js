import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    minlength: [2, 'Vendor name must be at least 2 characters long'],
    maxlength: [50, 'Vendor name cannot exceed 50 characters']
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters long'],
    maxlength: [50, 'Item name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number (digits only)'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [5, 'Address must be at least 5 characters long'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ vendorName: 1 });
userSchema.index({ itemName: 1 });
userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);

export default User;
