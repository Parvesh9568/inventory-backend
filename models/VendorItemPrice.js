import mongoose from 'mongoose';

const vendorItemPriceSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure unique vendor-item combination
vendorItemPriceSchema.index({ vendor: 1, item: 1 }, { unique: true });

export default mongoose.model('VendorItemPrice', vendorItemPriceSchema);
