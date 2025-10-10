import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  assignedWires: [{
    wireName: {
      type: String,
      required: true
    },
    payalType: {
      type: String,
      required: true
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Vendor', vendorSchema);
