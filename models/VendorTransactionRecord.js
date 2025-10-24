import mongoose from 'mongoose';

const vendorTransactionRecordSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true
  },
  wire: {
    type: String,
    required: true
  },
  design: {
    type: String,
    default: 'N/A'
  },
  payablePrice: {
    type: Number,
    default: 0
  },
  qtyOut: {
    type: Number,
    default: 0
  },
  qtyIn: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  pdfFile: {
    type: String,
    default: null
  },
  imgFile: {
    type: String,
    default: null
  },
  pdfPath: {
    type: String,
    default: null
  },
  imgPath: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
vendorTransactionRecordSchema.index({ vendor: 1, wire: 1 });
vendorTransactionRecordSchema.index({ date: -1 });

const VendorTransactionRecord = mongoose.model('VendorTransactionRecord', vendorTransactionRecordSchema);

export default VendorTransactionRecord;
