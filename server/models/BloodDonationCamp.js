import mongoose from 'mongoose';

const bloodDonationCampSchema = new mongoose.Schema({
  campId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  organizerType: {
    type: String,
    enum: ['Hospital', 'Blood Bank'],
    required: true,
    default: 'Hospital'
  },
  organizerId: { type: String, required: true },
  organizer: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '04:00 PM' },
  time: { type: String, default: '09:00 AM - 04:00 PM' },
  venue: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, required: true },
  district: { type: String, default: '' },
  state: { type: String, default: 'Karnataka' },
  pincode: { type: String, default: '' },
  targetGroups: {
    type: [String],
    default: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  expectedDonors: { type: Number, default: 100 },
  availableSlots: { type: Number, default: 100 },
  rsvpsCount: { type: Number, default: 0 },
  instructions: { type: String, default: '' },
  eligibilityInfo: { type: String, default: '' },
  notes: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  category: { type: String, default: 'Voluntary Drive' },
  amenities: {
    type: [String],
    default: ['Free Health Checkup', 'Refreshments', 'Digital Certificate', 'Donor Badge']
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'REJECTED'],
    default: 'PUBLISHED'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const BloodDonationCamp = mongoose.models.BloodDonationCamp || mongoose.model('BloodDonationCamp', bloodDonationCampSchema);
