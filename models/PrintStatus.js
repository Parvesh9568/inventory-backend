import mongoose from 'mongoose';

const printStatusSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  printedAt: {
    type: Date,
    default: Date.now
  },
  isPrinted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique vendor-page combination
printStatusSchema.index({ vendorName: 1, pageNumber: 1 }, { unique: true });

const PrintStatus = mongoose.model('PrintStatus', printStatusSchema);

export default PrintStatus;
