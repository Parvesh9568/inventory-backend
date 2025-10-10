import mongoose from 'mongoose';

const payalPriceChartSchema = new mongoose.Schema({
  wireThickness: {
    type: String,
    required: true,
    enum: ['22mm', '28mm', '30mm', '32mm']
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
}, {
  timestamps: true
});

// Create compound index to ensure unique combination of wireThickness and payalType
payalPriceChartSchema.index({ wireThickness: 1, payalType: 1 }, { unique: true });

export default mongoose.model('PayalPriceChart', payalPriceChartSchema);
