export const MOCK_CURRENT_USER = {
  id: "usr_donor_001",
  name: "Dr. Ananya Sharma",
  role: "donor",
  email: "ananya.sharma@example.com",
  phone: "+91 98765 43210",
  bloodGroup: "O-",
  gender: "female",
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
  hbTrendHistory: [
    { date: "2025-03", hb: 13.6 },
    { date: "2025-07", hb: 13.9 },
    { date: "2025-11", hb: 14.0 },
    { date: "2026-03", hb: 14.2 }
  ],
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

export const MOCK_EMERGENCY_REQUESTS = [
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
    requestedAt: "2026-08-04T18:30:00Z",
    deadline: "2026-08-05T06:00:00Z",
    reason: "Emergency Trauma Surgery following highway accident.",
    status: "ACTIVE",
    aiUrgencyScore: 98,
    decayScore: 96,
    trendingReason: "42 shares in the last hour • Critical shortage in Hubballi",
    sharesCount: 42,
    matchedDonorsCount: 6,
    requiresHospitalCoSign: false,
    isCoSignedByHospital: true,
    lat: 15.3688,
    lng: 75.1274
  },
  {
    id: "req_102",
    patientName: "Savitri Devi",
    bloodGroup: "AB-",
    unitsNeeded: 5,
    unitsFulfilled: 2,
    urgency: "CRITICAL",
    hospitalName: "SDM Medical College & Hospital",
    city: "Dharwad",
    state: "Karnataka",
    contactPerson: "Mahesh Devi (Son)",
    maskedPhone: "+91 97*** **901",
    requestedAt: "2026-08-04T16:10:00Z",
    deadline: "2026-08-05T12:00:00Z",
    reason: "Severe Anemia & Low Platelets transfusion requiring high volume.",
    status: "ACTIVE",
    aiUrgencyScore: 92,
    decayScore: 88,
    trendingReason: "High unit volume requirement (>4 units)",
    sharesCount: 29,
    matchedDonorsCount: 4,
    requiresHospitalCoSign: true,
    isCoSignedByHospital: true,
    lat: 15.4589,
    lng: 75.0078
  },
  {
    id: "req_103",
    patientName: "Kavita Rao",
    bloodGroup: "Bombay Phenotype (O-h)",
    unitsNeeded: 1,
    unitsFulfilled: 0,
    urgency: "CRITICAL",
    hospitalName: "Manipal Hospital",
    city: "Bengaluru",
    state: "Karnataka",
    contactPerson: "Suresh Rao",
    maskedPhone: "+91 94*** **554",
    requestedAt: "2026-08-04T12:00:00Z",
    deadline: "2026-08-05T18:00:00Z",
    reason: "Rare Bombay Phenotype O-h required for specialized surgery.",
    status: "ACTIVE",
    aiUrgencyScore: 99,
    decayScore: 90,
    trendingReason: "Extremely Rare Blood Group (Bombay Phenotype)",
    sharesCount: 88,
    matchedDonorsCount: 2,
    requiresHospitalCoSign: true,
    isCoSignedByHospital: true,
    lat: 12.9716,
    lng: 77.5946
  }
];

export const MOCK_DONORS = [
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
    responseLikelihoodScore: 96,
    totalDonations: 7,
    phone: "+91 98765 43210",
    isAvailable: true,
    distanceKm: 1.2,
    escalationTier: 1
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
    responseLikelihoodScore: 91,
    totalDonations: 4,
    phone: "+91 98801 12233",
    isAvailable: true,
    distanceKm: 2.8,
    escalationTier: 1
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
    responseLikelihoodScore: 89,
    totalDonations: 9,
    phone: "+91 97412 88990",
    isAvailable: true,
    distanceKm: 18.5,
    escalationTier: 2
  },
  {
    id: "donor_204",
    name: "Vikram Bombay Donor",
    bloodGroup: "Bombay Phenotype (O-h)",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9750,
    lng: 77.5900,
    lastDonationDate: "2025-12-10",
    reliabilityScore: 100,
    responseLikelihoodScore: 99,
    totalDonations: 11,
    phone: "+91 91122 33445",
    isAvailable: true,
    distanceKm: 12.0,
    escalationTier: 1
  }
];

export const MOCK_GROUP_CIRCLES = [
  {
    id: "circle_1",
    name: "KLE Tech Campus Lifesavers Circle",
    category: "College",
    city: "Hubballi",
    membersCount: 420,
    activeRequests: 2,
    isVerified: true,
    joined: true
  },
  {
    id: "circle_2",
    name: "Infosys Hubballi Corporate Circle",
    category: "Corporate",
    city: "Hubballi",
    membersCount: 280,
    activeRequests: 1,
    isVerified: true,
    joined: true
  },
  {
    id: "circle_3",
    name: "Patil Family Emergency Blood Network",
    category: "Family",
    city: "Dharwad",
    membersCount: 18,
    activeRequests: 0,
    isVerified: true,
    joined: false
  }
];

export const MOCK_INTERCITY_TRANSFERS = [
  {
    id: "trans_1",
    fromCity: "Hubballi",
    toCity: "Dharwad",
    fromHospital: "Rotary Blood Center Hubballi (Surplus O-)",
    toHospital: "SDM Hospital Dharwad (Deficit O-)",
    bloodGroup: "O-",
    units: 2,
    estimatedTimeMins: 35,
    urgencyReason: "Trauma ICU Shortage in Dharwad",
    status: "RECOMMENDED"
  },
  {
    id: "trans_2",
    fromCity: "Belagavi",
    toCity: "Hubballi",
    fromHospital: "KLE Hospital Belagavi",
    toHospital: "KIMS Hospital Hubballi",
    bloodGroup: "AB-",
    units: 1,
    estimatedTimeMins: 90,
    urgencyReason: "Rare AB- Unit Inter-City Dispatch",
    status: "IN_TRANSIT"
  }
];

export const MOCK_BLOOD_BANKS = [
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
      { group: "O-", units: 3, status: "CRITICAL", minThreshold: 12, expiring7Days: 1 },
      { group: "Bombay Phenotype (O-h)", units: 1, status: "CRITICAL", minThreshold: 2, expiring7Days: 0 }
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
  }
];

export const MOCK_CAMPS = [
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
  }
];

export const MOCK_LEADERBOARD = {
  monthly: [
    { rank: 1, name: "Siddharth Rao", city: "Bengaluru", college: "RVCE", donations: 4, points: 1600, badge: "🏆 Monthly Legend" },
    { rank: 2, name: "Dr. Ananya Sharma", city: "Hubballi", college: "KIMS", donations: 3, points: 1250, badge: "🥇 Gold Donor" },
    { rank: 3, name: "Kiran Joshi", city: "Dharwad", college: "SDM Tech", donations: 3, points: 1100, badge: "🥈 Fast Responder" }
  ],
  allTime: [
    { rank: 1, name: "Capt. Ramesh Naik", city: "Belagavi", college: "Veterans Association", donations: 48, points: 19200, badge: "👑 Lifetime Centurion" },
    { rank: 2, name: "Dr. Ananya Sharma", city: "Hubballi", college: "KIMS Hospital", donations: 28, points: 11200, badge: "🛡️ O- Universal Guardian" }
  ]
};

export const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    title: "🚨 Urgent Blood Alert",
    message: "Critical O- blood needed at KIMS Hospital Hubballi. Escalation Tier 1 active!",
    time: "10m ago",
    read: false,
    requestId: "req_101"
  }
];
