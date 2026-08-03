import {
  User,
  EmergencyRequest,
  Donor,
  BloodBank,
  DonationCamp,
  LeaderboardItem,
  NotificationItem
} from '../types';

export const MOCK_CURRENT_USER: User = {
  id: "usr_donor_001",
  name: "Dr. Ananya Sharma",
  role: "donor",
  email: "ananya.sharma@example.com",
  phone: "+91 98765 43210",
  bloodGroup: "O-",
  city: "Hubballi",
  state: "Karnataka",
  address: "Vidyanagar, Near BVB College, Hubballi",
  lat: 15.3647,
  lng: 75.1240,
  lastDonationDate: "2026-03-10",
  totalDonations: 7,
  streak: 4,
  points: 1250,
  isEligible: true,
  verificationStatus: "Verified (Aadhaar OTP)",
  medicalFlags: {
    weight: 64,
    hbLevel: 14.2,
    recentTattoo: false,
    medications: "None",
    chronicIllness: false
  },
  badges: [
    { id: "b1", title: "Universal Lifesaver", icon: "🛡️", desc: "Donated rare O- blood 5+ times" },
    { id: "b2", title: "Fast Responder", icon: "⚡", desc: "Responded within 15 mins to emergency alert" },
    { id: "b3", title: "3x Donor 2026", icon: "🔥", desc: "Maintained 3+ donation streak in 2026" },
    { id: "b4", title: "Camp Champion", icon: "⛺", desc: "Attended 2 blood donation drives" }
  ],
  donationHistory: [
    { id: "dh_1", date: "2026-03-10", location: "KIMS Teaching Hospital Hubballi", units: 1, bloodGroup: "O-", certificateUrl: "#" },
    { id: "dh_2", date: "2025-11-15", location: "Rotary Regional Blood Center", units: 1, bloodGroup: "O-", certificateUrl: "#" },
    { id: "dh_3", date: "2025-07-20", location: "Red Cross Blood Center Bengaluru", units: 1, bloodGroup: "O-", certificateUrl: "#" }
  ]
};

export const MOCK_EMERGENCY_REQUESTS: EmergencyRequest[] = [
  {
    id: "req_101",
    patientName: "Rohan Deshmukh",
    bloodGroup: "O-",
    unitsNeeded: 2,
    unitsFulfilled: 1,
    urgency: "CRITICAL",
    hospitalName: "KIMS Hospital (ICU Bed 14)",
    city: "Hubballi",
    state: "Karnataka",
    contactPerson: "Dr. Anish K",
    maskedPhone: "+91 98*** **412",
    requestedAt: "2026-08-03T17:30:00Z",
    deadline: "2026-08-04T06:00:00Z",
    reason: "Emergency Trauma Surgery following highway accident.",
    status: "ACTIVE",
    aiUrgencyScore: 98,
    sharesCount: 42,
    matchedDonorsCount: 6,
    lat: 15.3688,
    lng: 75.1274
  },
  {
    id: "req_102",
    patientName: "Savitri Devi",
    bloodGroup: "AB-",
    unitsNeeded: 3,
    unitsFulfilled: 2,
    urgency: "CRITICAL",
    hospitalName: "SDM Medical College & Hospital",
    city: "Dharwad",
    state: "Karnataka",
    contactPerson: "Mahesh Devi (Son)",
    maskedPhone: "+91 97*** **901",
    requestedAt: "2026-08-03T15:10:00Z",
    deadline: "2026-08-04T12:00:00Z",
    reason: "Severe Anemia & Low Platelets treatment.",
    status: "ACTIVE",
    aiUrgencyScore: 92,
    sharesCount: 29,
    matchedDonorsCount: 4,
    lat: 15.4589,
    lng: 75.0078
  },
  {
    id: "req_103",
    patientName: "Kavita Rao",
    bloodGroup: "B+",
    unitsNeeded: 1,
    unitsFulfilled: 0,
    urgency: "HIGH",
    hospitalName: "Manipal Hospital",
    city: "Bengaluru",
    state: "Karnataka",
    contactPerson: "Suresh Rao",
    maskedPhone: "+91 94*** **554",
    requestedAt: "2026-08-03T12:00:00Z",
    deadline: "2026-08-04T18:00:00Z",
    reason: "Scheduled Cardiac Bypass Procedure.",
    status: "ACTIVE",
    aiUrgencyScore: 78,
    sharesCount: 18,
    matchedDonorsCount: 12,
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: "req_104",
    patientName: "Mohammed Farooq",
    bloodGroup: "A-",
    unitsNeeded: 2,
    unitsFulfilled: 2,
    urgency: "MODERATE",
    hospitalName: "Tatwadarsha Hospital",
    city: "Hubballi",
    state: "Karnataka",
    contactPerson: "Farooq Ali",
    maskedPhone: "+91 99*** **118",
    requestedAt: "2026-08-02T09:00:00Z",
    deadline: "2026-08-03T20:00:00Z",
    reason: "Thalassemia routine transfusion requirement.",
    status: "FULFILLED",
    aiUrgencyScore: 65,
    sharesCount: 35,
    matchedDonorsCount: 8,
    lat: 15.3500,
    lng: 75.1400
  }
];

export const MOCK_DONORS: Donor[] = [
  {
    id: "donor_201",
    name: "Dr. Ananya Sharma",
    bloodGroup: "O-",
    city: "Hubballi",
    state: "Karnataka",
    lat: 15.3647,
    lng: 75.1240,
    lastDonationDate: "2026-03-10",
    reliabilityScore: 99,
    totalDonations: 7,
    phone: "+91 98765 43210",
    isAvailable: true,
    distanceKm: 1.2
  },
  {
    id: "donor_202",
    name: "Praveen Kumar",
    bloodGroup: "O-",
    city: "Hubballi",
    state: "Karnataka",
    lat: 15.3520,
    lng: 75.1380,
    lastDonationDate: "2026-02-01",
    reliabilityScore: 95,
    totalDonations: 4,
    phone: "+91 98801 12233",
    isAvailable: true,
    distanceKm: 2.8
  },
  {
    id: "donor_203",
    name: "Sneha Hegde",
    bloodGroup: "AB-",
    city: "Dharwad",
    state: "Karnataka",
    lat: 15.4600,
    lng: 75.0120,
    lastDonationDate: "2026-01-20",
    reliabilityScore: 97,
    totalDonations: 9,
    phone: "+91 97412 88990",
    isAvailable: true,
    distanceKm: 18.5
  },
  {
    id: "donor_204",
    name: "Rajesh Kulkarni",
    bloodGroup: "A+",
    city: "Hubballi",
    state: "Karnataka",
    lat: 15.3610,
    lng: 75.1290,
    lastDonationDate: "2026-04-12",
    reliabilityScore: 92,
    totalDonations: 3,
    phone: "+91 94481 77665",
    isAvailable: true,
    distanceKm: 0.9
  },
  {
    id: "donor_205",
    name: "Vinayaka Bhat",
    bloodGroup: "B+",
    city: "Hubballi",
    state: "Karnataka",
    lat: 15.3700,
    lng: 75.1200,
    lastDonationDate: "2026-05-01",
    reliabilityScore: 88,
    totalDonations: 5,
    phone: "+91 99002 33445",
    isAvailable: true,
    distanceKm: 1.8
  },
  {
    id: "donor_206",
    name: "Deepa Nayak",
    bloodGroup: "O+",
    city: "Hubballi",
    state: "Karnataka",
    lat: 15.3580,
    lng: 75.1320,
    lastDonationDate: "2026-03-25",
    reliabilityScore: 96,
    totalDonations: 12,
    phone: "+91 96321 44556",
    isAvailable: true,
    distanceKm: 1.5
  }
];

export const MOCK_BLOOD_BANKS: BloodBank[] = [
  {
    id: "bb_1",
    name: "KIMS Teaching Hospital Blood Center",
    licenseNo: "KA-BB-2024-8891",
    city: "Hubballi",
    state: "Karnataka",
    address: "PB Road, Vidyanagar, Hubballi",
    phone: "+91 836 2378000",
    email: "bloodbank@kims.edu.in",
    lat: 15.3688,
    lng: 75.1274,
    distanceKm: 1.4,
    isOpen24Hours: true,
    verified: true,
    inventory: [
      { group: "A+", units: 28, status: "Adequate", minThreshold: 15, expiring7Days: 3 },
      { group: "A-", units: 6, status: "Low", minThreshold: 10, expiring7Days: 1 },
      { group: "B+", units: 42, status: "Optimal", minThreshold: 20, expiring7Days: 5 },
      { group: "B-", units: 4, status: "Low", minThreshold: 8, expiring7Days: 0 },
      { group: "AB+", units: 19, status: "Adequate", minThreshold: 10, expiring7Days: 2 },
      { group: "AB-", units: 2, status: "CRITICAL", minThreshold: 6, expiring7Days: 1 },
      { group: "O+", units: 55, status: "Optimal", minThreshold: 25, expiring7Days: 8 },
      { group: "O-", units: 3, status: "CRITICAL", minThreshold: 12, expiring7Days: 1 }
    ]
  },
  {
    id: "bb_2",
    name: "Rotary Regional Blood Center",
    licenseNo: "KA-BB-2023-4412",
    city: "Hubballi",
    state: "Karnataka",
    address: "Deshpande Nagar, Near Club Road, Hubballi",
    phone: "+91 836 2251122",
    email: "contact@rotaryblood.org",
    lat: 15.3520,
    lng: 75.1380,
    distanceKm: 3.1,
    isOpen24Hours: true,
    verified: true,
    inventory: [
      { group: "A+", units: 18, status: "Adequate", minThreshold: 10, expiring7Days: 2 },
      { group: "A-", units: 3, status: "CRITICAL", minThreshold: 8, expiring7Days: 0 },
      { group: "B+", units: 30, status: "Optimal", minThreshold: 15, expiring7Days: 4 },
      { group: "B-", units: 7, status: "Adequate", minThreshold: 6, expiring7Days: 1 },
      { group: "AB+", units: 12, status: "Adequate", minThreshold: 8, expiring7Days: 1 },
      { group: "AB-", units: 1, status: "CRITICAL", minThreshold: 5, expiring7Days: 0 },
      { group: "O+", units: 40, status: "Optimal", minThreshold: 20, expiring7Days: 6 },
      { group: "O-", units: 2, status: "CRITICAL", minThreshold: 10, expiring7Days: 1 }
    ]
  },
  {
    id: "bb_3",
    name: "SDM Hospital & Research Blood Bank",
    licenseNo: "KA-BB-2024-9011",
    city: "Dharwad",
    state: "Karnataka",
    address: "Sattur, Dharwad",
    phone: "+91 836 2477777",
    email: "sdmbloodbank@sdm.edu",
    lat: 15.4589,
    lng: 75.0078,
    distanceKm: 17.8,
    isOpen24Hours: true,
    verified: true,
    inventory: [
      { group: "A+", units: 25, status: "Adequate", minThreshold: 15, expiring7Days: 2 },
      { group: "A-", units: 5, status: "Low", minThreshold: 8, expiring7Days: 1 },
      { group: "B+", units: 38, status: "Optimal", minThreshold: 20, expiring7Days: 3 },
      { group: "B-", units: 6, status: "Low", minThreshold: 8, expiring7Days: 0 },
      { group: "AB+", units: 15, status: "Adequate", minThreshold: 10, expiring7Days: 2 },
      { group: "AB-", units: 3, status: "Low", minThreshold: 5, expiring7Days: 1 },
      { group: "O+", units: 48, status: "Optimal", minThreshold: 25, expiring7Days: 5 },
      { group: "O-", units: 5, status: "Low", minThreshold: 10, expiring7Days: 0 }
    ]
  }
];

export const MOCK_CAMPS: DonationCamp[] = [
  {
    id: "camp_1",
    title: "Mega Independence Day Blood Drive",
    organizer: "Rotary Club & KIMS Blood Bank",
    venue: "KLE Technological University Campus, Hubballi",
    date: "2026-08-15",
    time: "09:00 AM - 04:00 PM",
    expectedDonors: 250,
    rsvpsCount: 184,
    city: "Hubballi",
    bannerUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80",
    amenities: ["Free Refreshments", "Health Checkup", "Digital Certificate", "Donor T-Shirt"],
    isJoined: false
  },
  {
    id: "camp_2",
    title: "Community Lifesavers Camp Dharwad",
    organizer: "Red Cross Society Karnataka",
    venue: "Karnaataka College Ground (KCD), Dharwad",
    date: "2026-08-20",
    time: "10:00 AM - 05:00 PM",
    expectedDonors: 150,
    rsvpsCount: 92,
    city: "Dharwad",
    bannerUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    amenities: ["Juice & Snacks", "Donor Badge", "Doctor Consultation"],
    isJoined: true
  }
];

export const MOCK_LEADERBOARD: { monthly: LeaderboardItem[]; allTime: LeaderboardItem[] } = {
  monthly: [
    { rank: 1, name: "Siddharth Rao", city: "Bengaluru", college: "RVCE", donations: 4, points: 1600, badge: "🏆 Monthly Legend" },
    { rank: 2, name: "Dr. Ananya Sharma", city: "Hubballi", college: "KIMS", donations: 3, points: 1250, badge: "🥇 Gold Donor" },
    { rank: 3, name: "Kiran Joshi", city: "Dharwad", college: "SDM Tech", donations: 3, points: 1100, badge: "🥈 Fast Responder" },
    { rank: 4, name: "Priya V", city: "Mysuru", college: "SJCE", donations: 2, points: 950, badge: "🥉 Lifesaver" },
    { rank: 5, name: "Abhishek N", city: "Hubballi", college: "KLE Tech", donations: 2, points: 880, badge: "⭐ Hero" }
  ],
  allTime: [
    { rank: 1, name: "Capt. Ramesh Naik", city: "Belagavi", college: "Veterans Association", donations: 48, points: 19200, badge: "👑 Lifetime Centurion" },
    { rank: 2, name: "Dr. Ananya Sharma", city: "Hubballi", college: "KIMS Hospital", donations: 28, points: 11200, badge: "🛡️ O- Universal Guardian" },
    { rank: 3, name: "Deepa Nayak", city: "Hubballi", college: "Rotary Club", donations: 24, points: 9600, badge: "🔥 10x Hero" }
  ]
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "🚨 Urgent Blood Alert",
    message: "Critical O- blood needed at KIMS Hospital Hubballi (ICU Bed 14). You are a 98% matched donor!",
    time: "10m ago",
    read: false,
    requestId: "req_101"
  },
  {
    id: "n2",
    title: "🏆 Badge Earned!",
    message: "Congratulations! You unlocked the '3x Donor 2026' badge.",
    time: "2h ago",
    read: true
  }
];
