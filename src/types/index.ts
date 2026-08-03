export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

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
  | 'profile';

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
  sharesCount: number;
  matchedDonorsCount: number;
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
  matchReasons?: string[];
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
