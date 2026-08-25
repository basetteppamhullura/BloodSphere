import mongoose from 'mongoose';

const bloodStockSchema = new mongoose.Schema({
  bankId: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  component: { type: String, required: true },
  available: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  issued: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export const BloodStock = mongoose.models.BloodStock || mongoose.model('BloodStock', bloodStockSchema);
