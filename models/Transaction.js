import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['IN', 'OUT']
  },
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
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  payalType: {
    type: String,
    required: function() { return this.type === 'IN'; }
  },
  price_per_unit: {
    type: Number,
    required: true,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  inDate: {
    type: Date,
    required: function() { return this.type === 'IN'; }
  },
  outDate: {
    type: Date,
    required: function() { return this.type === 'OUT'; }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
transactionSchema.index({ type: 1, createdAt: 1 }); // For filtering by type and sorting by date
transactionSchema.index({ vendor: 1 }); // For vendor-specific queries
transactionSchema.index({ item: 1 }); // For item-specific queries
transactionSchema.index({ type: 1, vendor: 1, item: 1 }); // Compound index for common queries

// Auto-increment srNo before saving
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.srNo) {
    try {
      const lastTransaction = await this.constructor.findOne({}, {}, { sort: { 'srNo': -1 } });
      this.srNo = lastTransaction && lastTransaction.srNo ? lastTransaction.srNo + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual for formatted data
transactionSchema.virtual('qty').get(function() {
  return this.quantity;
});

transactionSchema.virtual('price').get(function() {
  return this.price_per_unit;
});

transactionSchema.virtual('total').get(function() {
  return this.total_amount;
});

transactionSchema.virtual('timestamp').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Transaction', transactionSchema);
