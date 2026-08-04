export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Bombay Phenotype (O-h)';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MODERATE';

export type UserRole = 'donor' | 'requester' | 'hospital' | 'admin';

export type PageTab = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'donor-search' 
  | 'emergency-requests' 
  | 'blood-banks' 
  | 'camps' 
  | 'leaderboard' 
  | 'profile'
  | 'rare-registry'
  | 'group-circles'
  | 'blood-bridge';

export interface Badge {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export interface DonationHistoryRecord {
  id: string;
  date: string;
  location: string;
  units: number;
  bloodGroup: BloodGroup;
  certificateUrl: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  address: string;
  gender?: 'male' | 'female' | 'other';
  lat: number;
  lng: number;
  lastDonationDate: string;
  totalDonations: number;
  streak: number;
  points: number;
  isEligible: boolean;
  verificationStatus: string;
  badges: Badge[];
  donationHistory: DonationHistoryRecord[];
  medicalFlags?: {
    weight: number;
    hbLevel: number;
    recentTattoo: boolean;
    medications: string;
    chronicIllness: boolean;
  };
  hbTrendHistory?: { date: string; hb: number }[];
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  hospitalName: string;
  city: string;
  state: string;
  contactPerson: string;
  maskedPhone: string;
  requestedAt: string;
  deadline: string;
  reason: string;
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED';
  aiUrgencyScore: number;
  decayScore?: number;
  trendingReason?: string;
  sharesCount: number;
  matchedDonorsCount: number;
  requiresHospitalCoSign?: boolean;
  isCoSignedByHospital?: boolean;
  lat: number;
  lng: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  lat: number;
  lng: number;
  lastDonationDate: string;
  reliabilityScore: number;
  totalDonations: number;
  phone: string;
  isAvailable: boolean;
  distanceKm: number;
  matchPercentage?: number;
  responseLikelihoodScore?: number;
  matchReasons?: string[];
  escalationTier?: 1 | 2;
}

export interface BloodStockItem {
  group: BloodGroup;
  units: number;
  status: 'Optimal' | 'Adequate' | 'Low' | 'CRITICAL';
  minThreshold: number;
  expiring7Days: number;
}

export interface BloodBank {
  id: string;
  name: string;
  licenseNo: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isOpen24Hours: boolean;
  verified: boolean;
  inventory: BloodStockItem[];
}

export interface DonationCamp {
  id: string;
  title: string;
  organizer: string;
  venue: string;
  date: string;
  time: string;
  expectedDonors: number;
  rsvpsCount: number;
  city: string;
  bannerUrl: string;
  amenities: string[];
  isJoined: boolean;
}

export interface LeaderboardItem {
  rank: number;
  name: string;
  city: string;
  college: string;
  donations: number;
  points: number;
  badge: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  requestId?: string;
}

export interface GroupCircle {
  id: string;
  name: string;
  category: 'Family' | 'Corporate' | 'College';
  city: string;
  membersCount: number;
  activeRequests: number;
  isVerified: boolean;
  joined: boolean;
}

export interface InterCityTransfer {
  id: string;
  fromCity: string;
  toCity: string;
  fromHospital: string;
  toHospital: string;
  bloodGroup: BloodGroup;
  units: number;
  estimatedTimeMins: number;
  urgencyReason: string;
  status: 'RECOMMENDED' | 'IN_TRANSIT' | 'COMPLETED';
}
