// Comprehensive Mock Database for Blood Donor Network Platform

export const INITIAL_USER_PROFILES = {
  donor: {
    id: "usr_donor_001",
    name: "Dr. Ananya Sharma",
    role: "donor",
    email: "ananya.sharma@example.com",
    phone: "+91 98765 43210",
    bloodGroup: "O-", // Universal donor / Rare
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
      weight: 64, // kg
      hbLevel: 14.2, // g/dL
      recentTattoo: false,
      medications: "None",
      chronicIllness: false
    },
    badges: [
      { id: "badge_1", title: "Universal Lifesaver", icon: "🛡️", desc: "Donated rare O- blood 5+ times" },
      { id: "badge_2", title: "Fast Responder", icon: "⚡", desc: "Responded within 15 mins to emergency request" },
      { id: "badge_3", title: "3x Donor 2026", icon: "🔥", desc: "Maintained 3+ donation streak in 2026" },
      { id: "badge_4", title: "Camp Champion", icon: "⛺", desc: "Attended 2 blood donation camps" }
    ],
    donationHistory: [
      { id: "don_1", date: "2026-03-10", location: "KIMS Hospital Hubballi", units: 1, bloodGroup: "O-", certificateUrl: "#" },
      { id: "don_2", date: "2025-11-15", location: "Rotary Blood Bank Hubballi", units: 1, bloodGroup: "O-", certificateUrl: "#" },
      { id: "don_3", date: "2025-07-20", location: "Red Cross Blood Center Bengaluru", units: 1, bloodGroup: "O-", certificateUrl: "#" }
    ]
  },
  requester: {
    id: "usr_req_002",
    name: "Vikram Patil",
    role: "requester",
    email: "vikram.patil@example.com",
    phone: "+91 91234 56789",
    city: "Hubballi",
    state: "Karnataka",
    activeRequests: 1
  },
  hospital: {
    id: "usr_hosp_003",
    name: "KIMS Teaching Hospital & Blood Center",
    role: "hospital",
    email: "bloodbank@kims.edu.in",
    phone: "+91 836 2378000",
    city: "Hubballi",
    state: "Karnataka",
    licenseNo: "KA-BB-2024-8891",
    verificationStatus: "Verified Hospital Admin",
    lat: 15.3688,
    lng: 75.1274
  },
  admin: {
    id: "usr_admin_004",
    name: "Super Admin (Karnataka Health Network)",
    role: "admin",
    email: "admin@blooddonornet.org"
  }
};

export const INITIAL_EMERGENCY_REQUESTS = [
  {
    id: "req_101",
    patientName: "Rohan Deshmukh",
    bloodGroup: "O-",
    unitsNeeded: 2,
    unitsFulfilled: 1,
    urgency: "CRITICAL", // CRITICAL, HIGH, MODERATE
    hospitalName: "KIMS Hospital (ICU Bed 14)",
    city: "Hubballi",
    state: "Karnataka",
    contactPerson: "Dr. Anish K",
    maskedPhone: "+91 98*** **412",
    requestedAt: "2026-08-03T17:30:00Z",
    deadline: "2026-08-04T06:00:00Z",
    reason: "Emergency Trauma Surgery following highway accident.",
    status: "ACTIVE", // ACTIVE, FULFILLED, EXPIRED
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
    reason: "Thalassemia transfusion requirement.",
    status: "FULFILLED",
    aiUrgencyScore: 65,
    sharesCount: 35,
    matchedDonorsCount: 8,
    lat: 15.3500,
    lng: 75.1400
  }
];

export const INITIAL_DONORS = [
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

export const INITIAL_BLOOD_BANK_INVENTORY = [
  { group: "A+", units: 28, status: "Adequate", minThreshold: 15, expiring7Days: 3 },
  { group: "A-", units: 6, status: "Low", minThreshold: 10, expiring7Days: 1 },
  { group: "B+", units: 42, status: "Optimal", minThreshold: 20, expiring7Days: 5 },
  { group: "B-", units: 4, status: "Low", minThreshold: 8, expiring7Days: 0 },
  { group: "AB+", units: 19, status: "Adequate", minThreshold: 10, expiring7Days: 2 },
  { group: "AB-", units: 2, status: "CRITICAL", minThreshold: 6, expiring7Days: 1 },
  { group: "O+", units: 55, status: "Optimal", minThreshold: 25, expiring7Days: 8 },
  { group: "O-", units: 3, status: "CRITICAL", minThreshold: 12, expiring7Days: 1 }
];

export const INITIAL_CAMPS = [
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

export const CITY_SHORTAGE_HEATMAP = [
  { city: "Hubballi", criticalGroups: ["O-", "AB-"], shortageLevel: "High", activeRequests: 14 },
  { city: "Dharwad", criticalGroups: ["AB-", "A-"], shortageLevel: "High", activeRequests: 9 },
  { city: "Bengaluru", criticalGroups: ["O-", "B-", "AB-"], shortageLevel: "Severe", activeRequests: 68 },
  { city: "Belagavi", criticalGroups: ["O-"], shortageLevel: "Moderate", activeRequests: 11 },
  { city: "Mangaluru", criticalGroups: ["A-", "B-"], shortageLevel: "Moderate", activeRequests: 15 },
  { city: "Mysuru", criticalGroups: ["O-", "AB-"], shortageLevel: "High", activeRequests: 22 }
];

export const LEADERBOARD_DATA = {
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

export const SOCIAL_PROOF_FEED = [
  "🎉 18 people donated blood in Hubballi today!",
  "🚨 Critical O- request for KIMS Hospital was matched in 4 minutes!",
  "⛺ 184 donors RSVP'd for KLE Tech Mega Blood Drive!",
  "🏆 Dr. Ananya Sharma earned the 'Universal Lifesaver' badge!",
  "🩸 3 units of AB- dispatched to SDM Hospital Dharwad."
];
