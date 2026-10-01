import mongoose from 'mongoose';

const systemEventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Blood Donation Camp', 
      'BloodNet Announcement', 
      'Hospital Event', 
      'Health Awareness', 
      'Community Event', 
      'Emergency Blood Alert', 
      'BloodNet Event'
    ],
    default: 'BloodNet Event'
  },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, default: '09:00 AM - 04:00 PM' },
  location: { type: String, required: true },
  venue: { type: String, default: '' },
  city: { type: String, required: true },
  organizer: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Published', 'Archived'],
    default: 'Upcoming'
  },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: String, default: () => new Date().toISOString() },
  campId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SystemEvent = mongoose.models.SystemEvent || mongoose.model('SystemEvent', systemEventSchema);
