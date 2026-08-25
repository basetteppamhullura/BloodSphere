import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['donor', 'requester', 'hospital', 'bloodbank', 'admin'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, default: 'Karnataka' },
  contactPerson: { type: String, default: '' },
  status: { type: String, enum: ['Pending Verification', 'Verified', 'Disabled'], default: 'Verified' },
  bloodGroup: { type: String, default: 'O+' },
  isAvailable: { type: Boolean, default: true },
  totalDonations: { type: Number, default: 0 },
  lastDonationDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
