import { BloodDonationCamp } from '../models/BloodDonationCamp.js';
import { CampRegistration } from '../models/CampRegistration.js';
import { isDBConnected } from '../db.js';

// Clean initial camps for real backend store
const INITIAL_CAMPS = [
  {
    campId: 'CAMP-2026-001',
    id: 'CAMP-2026-001',
    title: 'KIMS Mega Voluntary Blood Donation Drive',
    description: 'Annual multi-department voluntary blood drive to support emergency trauma surgeries and thalassemia patients.',
    organizerType: 'Hospital',
    organizerId: 'hosp_kims_hubballi',
    organizer: 'KIMS Teaching Hospital',
    contactPerson: 'Dr. Ramesh Patil (Blood Bank In-Charge)',
    contactPhone: '9845012345',
    contactEmail: 'bloodbank@kims-hospital.org',
    date: '2026-10-15',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    time: '09:00 AM - 04:30 PM',
    venue: 'KIMS Medical College Auditorium, Vidyanagar',
    address: 'Vidyanagar Main Road',
    city: 'Hubballi',
    district: 'Dharwad',
    state: 'Karnataka',
    pincode: '580021',
    targetGroups: ['O-', 'O+', 'A-', 'B-', 'AB-'],
    expectedDonors: 150,
    availableSlots: 150,
    rsvpsCount: 42,
    instructions: 'Please bring a valid photo ID. Have a light meal prior to donation. Ensure you are well hydrated.',
    eligibilityInfo: 'Age: 18-65 years, Weight: >= 45kg, Hb level: >= 12.5 g/dL. No recent tattoos in past 6 months.',
    notes: 'Volunteers and medical staff on duty from 8:30 AM.',
    bannerUrl: '/bloodnet-hero-bg.jpg',
    category: 'Hospital Drive',
    amenities: ['Free Blood Group Testing', 'Refreshments & Juice', 'Digital Certificate', 'Donor Badge'],
    status: 'PUBLISHED',
    createdAt: new Date('2026-09-20'),
    updatedAt: new Date('2026-09-20')
  },
  {
    campId: 'CAMP-2026-002',
    id: 'CAMP-2026-002',
    title: 'Rotary Regional Blood Bank Community Camp',
    description: 'Community outreach drive in partnership with local corporate groups and colleges for rare blood preservation.',
    organizerType: 'Blood Bank',
    organizerId: 'bb_rotary_hubballi',
    organizer: 'Rotary Central Blood Bank',
    contactPerson: 'Suresh Hegde (Drive Coordinator)',
    contactPhone: '9448098765',
    contactEmail: 'drives@rotarybloodbank.org',
    date: '2026-10-22',
    startTime: '10:00 AM',
    endTime: '03:30 PM',
    time: '10:00 AM - 03:30 PM',
    venue: 'KLE Technological University Campus Gymkhana',
    address: 'B.V. Bhoomaraddi Campus',
    city: 'Hubballi',
    district: 'Dharwad',
    state: 'Karnataka',
    pincode: '580031',
    targetGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    expectedDonors: 200,
    availableSlots: 200,
    rsvpsCount: 68,
    instructions: 'All university students and faculty welcome. Special donor appreciation mementos provided.',
    eligibilityInfo: 'Standard voluntary donor criteria. Donors can check their vitals free of charge.',
    notes: 'Air-conditioned mobile blood collection bus will be stationed outside.',
    bannerUrl: '/bloodnet-hero-bg.jpg',
    category: 'Campus Drive',
    amenities: ['Hb Screening', 'Snacks & Fruit Kits', 'E-Certificate', 'Donor Life Badge'],
    status: 'PUBLISHED',
    createdAt: new Date('2026-09-25'),
    updatedAt: new Date('2026-09-25')
  },
  {
    campId: 'CAMP-2026-003',
    id: 'CAMP-2026-003',
    title: 'Civil Hospital Lifeline Voluntary Donation Camp',
    description: 'Emergency reserve replenishment camp organized for upcoming holiday season and hospital network buffer.',
    organizerType: 'Hospital',
    organizerId: 'hosp_civil_dharwad',
    organizer: 'District Civil Hospital',
    contactPerson: 'Dr. Sunita Kulkarni',
    contactPhone: '9844055566',
    contactEmail: 'contact@civilhospital-dharwad.gov.in',
    date: '2026-10-30',
    startTime: '08:30 AM',
    endTime: '02:00 PM',
    time: '08:30 AM - 02:00 PM',
    venue: 'District Hospital Grounds, Jubilee Circle',
    address: 'PB Road, Near Court Complex',
    city: 'Dharwad',
    district: 'Dharwad',
    state: 'Karnataka',
    pincode: '580001',
    targetGroups: ['O-', 'O+', 'B-'],
    expectedDonors: 100,
    availableSlots: 100,
    rsvpsCount: 25,
    instructions: 'Immediate issuance of government certified blood donor card.',
    eligibilityInfo: 'Age 18-60, weight 45kg+, minimum 3 months since previous whole blood donation.',
    notes: 'Supported by Red Cross volunteers.',
    bannerUrl: '/bloodnet-hero-bg.jpg',
    category: 'Public Health',
    amenities: ['Government Donor Card', 'Free Vitals Check', 'Energy Drinks', 'Priority Access Pass'],
    status: 'PUBLISHED',
    createdAt: new Date('2026-09-28'),
    updatedAt: new Date('2026-09-28')
  }
];

// In-Memory store for reliable instant access
let inMemoryCamps = [...INITIAL_CAMPS];

// Normalize camp object so both `id` and `campId` are always present
function normalizeCamp(camp) {
  if (!camp) return null;
  const obj = typeof camp.toObject === 'function' ? camp.toObject() : { ...camp };
  obj.id = obj.campId || obj._id?.toString() || obj.id;
  obj.campId = obj.id;
  return obj;
}

export const campRepository = {
  // 1. Get all published/upcoming camps (or all camps with optional filters)
  async getAllCamps(filter = {}) {
    if (isDBConnected()) {
      try {
        const camps = await BloodDonationCamp.find(filter).sort({ date: 1 }).lean();
        if (camps && camps.length > 0) {
          return camps.map(normalizeCamp);
        }
      } catch (err) {
        console.warn('[campRepository] DB read error, using in-memory store:', err.message);
      }
    }

    // In-memory query filter
    let list = [...inMemoryCamps];
    if (filter.status) {
      if (typeof filter.status === 'object' && filter.status.$in) {
        list = list.filter(c => filter.status.$in.includes(c.status));
      } else if (typeof filter.status === 'string') {
        list = list.filter(c => c.status === filter.status);
      }
    }
    if (filter.organizerType) {
      list = list.filter(c => c.organizerType === filter.organizerType);
    }
    if (filter.organizerId) {
      list = list.filter(c => c.organizerId === filter.organizerId);
    }

    // Sort nearest upcoming date first
    return list.sort((a, b) => new Date(a.date) - new Date(b.date)).map(normalizeCamp);
  },

  // 2. Get camp by ID
  async getCampById(campId) {
    if (isDBConnected()) {
      try {
        const camp = await BloodDonationCamp.findOne({
          $or: [{ campId }, { id: campId }, { _id: campId }]
        }).lean();
        if (camp) return normalizeCamp(camp);
      } catch (err) {
        console.warn('[campRepository] DB find error:', err.message);
      }
    }
    const found = inMemoryCamps.find(c => c.campId === campId || c.id === campId);
    return found ? normalizeCamp(found) : null;
  },

  // 3. Create a new camp
  async createCamp(campData) {
    const totalCount = inMemoryCamps.length;
    const dynamicId = campData.campId || `CAMP-2026-${String(totalCount + 101).padStart(3, '0')}`;

    const newCamp = {
      ...campData,
      campId: dynamicId,
      id: dynamicId,
      time: campData.time || `${campData.startTime || '09:00 AM'} - ${campData.endTime || '04:00 PM'}`,
      rsvpsCount: 0,
      status: campData.status || 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDBConnected()) {
      try {
        const created = await BloodDonationCamp.create(newCamp);
        const norm = normalizeCamp(created);
        inMemoryCamps.unshift(norm);
        return norm;
      } catch (err) {
        console.warn('[campRepository] DB create failed, saving to in-memory:', err.message);
      }
    }

    inMemoryCamps.unshift(newCamp);
    return normalizeCamp(newCamp);
  },

  // 4. Update an existing camp
  async updateCamp(campId, updateData, user) {
    const existing = await this.getCampById(campId);
    if (!existing) {
      throw new Error('Camp not found.');
    }

    // Check authorization: must be creator or super admin
    const isAdmin = user?.role === 'admin' || user?.role === 'SUPER ADMIN';
    const isOwner = user?.id && existing.organizerId === user.id;
    if (!isAdmin && !isOwner) {
      // allow match by organizer name if IDs were generated during session
      const nameMatch = user?.name && existing.organizer && existing.organizer.toLowerCase().includes(user.name.toLowerCase());
      if (!nameMatch) {
        throw new Error('Unauthorized: You can only edit camps organized by your organization.');
      }
    }

    const updatedPayload = {
      ...updateData,
      updatedAt: new Date()
    };
    if (updateData.startTime || updateData.endTime) {
      const s = updateData.startTime || existing.startTime || '09:00 AM';
      const e = updateData.endTime || existing.endTime || '04:00 PM';
      updatedPayload.time = `${s} - ${e}`;
    }

    if (isDBConnected()) {
      try {
        const doc = await BloodDonationCamp.findOneAndUpdate(
          { $or: [{ campId }, { id: campId }] },
          { $set: updatedPayload },
          { new: true }
        ).lean();
        if (doc) {
          const norm = normalizeCamp(doc);
          const idx = inMemoryCamps.findIndex(c => c.campId === campId || c.id === campId);
          if (idx !== -1) inMemoryCamps[idx] = norm;
          return norm;
        }
      } catch (err) {
        console.warn('[campRepository] DB update failed:', err.message);
      }
    }

    const idx = inMemoryCamps.findIndex(c => c.campId === campId || c.id === campId);
    if (idx !== -1) {
      inMemoryCamps[idx] = { ...inMemoryCamps[idx], ...updatedPayload };
      return normalizeCamp(inMemoryCamps[idx]);
    }
    throw new Error('Camp not found for update.');
  },

  // 5. Cancel a camp
  async cancelCamp(campId, reason = 'Cancelled by Organizer', user) {
    const existing = await this.getCampById(campId);
    if (!existing) {
      throw new Error('Camp not found.');
    }

    const isAdmin = user?.role === 'admin' || user?.role === 'SUPER ADMIN';
    const isOwner = user?.id && existing.organizerId === user.id;
    if (!isAdmin && !isOwner) {
      const nameMatch = user?.name && existing.organizer && existing.organizer.toLowerCase().includes(user.name.toLowerCase());
      if (!nameMatch) {
        throw new Error('Unauthorized: You can only cancel camps organized by your organization.');
      }
    }

    const cancelPayload = {
      status: 'CANCELLED',
      cancelReason: reason,
      updatedAt: new Date()
    };

    if (isDBConnected()) {
      try {
        const doc = await BloodDonationCamp.findOneAndUpdate(
          { $or: [{ campId }, { id: campId }] },
          { $set: cancelPayload },
          { new: true }
        ).lean();
        if (doc) {
          const norm = normalizeCamp(doc);
          const idx = inMemoryCamps.findIndex(c => c.campId === campId || c.id === campId);
          if (idx !== -1) inMemoryCamps[idx] = norm;
          return norm;
        }
      } catch (err) {
        console.warn('[campRepository] DB cancel error:', err.message);
      }
    }

    const idx = inMemoryCamps.findIndex(c => c.campId === campId || c.id === campId);
    if (idx !== -1) {
      inMemoryCamps[idx] = { ...inMemoryCamps[idx], ...cancelPayload };
      return normalizeCamp(inMemoryCamps[idx]);
    }
    throw new Error('Camp not found to cancel.');
  },

  // 6. Update RSVP count when a registration occurs
  async incrementRsvpsCount(campId, increment = 1) {
    const idx = inMemoryCamps.findIndex(c => c.campId === campId || c.id === campId);
    let newCount = 1;
    if (idx !== -1) {
      inMemoryCamps[idx].rsvpsCount = Math.max(0, (inMemoryCamps[idx].rsvpsCount || 0) + increment);
      newCount = inMemoryCamps[idx].rsvpsCount;
    }

    if (isDBConnected()) {
      try {
        const updated = await BloodDonationCamp.findOneAndUpdate(
          { $or: [{ campId }, { id: campId }] },
          { $inc: { rsvpsCount: increment }, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (updated) {
          newCount = updated.rsvpsCount;
        }
      } catch (err) {
        console.warn('[campRepository] DB rsvpsCount increment error:', err.message);
      }
    }

    return newCount;
  }
};
