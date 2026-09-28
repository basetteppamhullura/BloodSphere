import mongoose from 'mongoose';

const campRegistrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  campId: { type: String, required: true },
  campTitle: { type: String, required: true },
  campDate: { type: String, default: '' },
  campTime: { type: String, default: '' },
  campVenue: { type: String, default: '' },
  campCity: { type: String, default: '' },
  participantUserId: { type: String, default: '' },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, default: '' },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, default: '' },
  state: { type: String, default: 'Karnataka' },
  pincode: { type: String, default: '' },
  bloodGroup: { type: String, required: true },
  previousDonation: { type: Boolean, default: false },
  lastDonationDate: { type: String, default: '' },
  preferredTime: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  eligibilityConfirmed: { type: Boolean, default: true },
  consent: { type: Boolean, default: true },
  registrationStatus: {
    type: String,
    enum: ['REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'COMPLETED', 'NO_SHOW'],
    default: 'REGISTERED'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CampRegistration = mongoose.models.CampRegistration || mongoose.model('CampRegistration', campRegistrationSchema);
