import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  wire: {
    type: String,
    required: true
  },
  payalType: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ vendor: 1, wire: 1, payalType: 1 });
paymentSchema.index({ date: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
