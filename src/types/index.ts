export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Bombay Phenotype (O-h)';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type UserRole = 'donor' | 'requester' | 'hospital' | 'bloodbank' | 'admin';

export type AccountVerificationStatus = 'Pending Verification' | 'Verified' | 'Disabled';

export type RequestChannel = 'hospital' | 'donors' | 'bloodbank';

export interface ChannelStatuses {
  hospitalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
  donorStatus?: 'SEARCHING' | 'DONOR_ACCEPTED' | 'FULFILLED' | 'CANCELLED';
  bloodBankStatus?: 'PENDING' | 'RESERVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
}

export interface PortalAccount {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  licenseNumber?: string;
  address?: string;
  city: string;
  state?: string;
  contactPerson?: string;
  status: AccountVerificationStatus;
}

export type RequestWorkflowStatus = 
  | 'PENDING_HOSPITAL_APPROVAL'
  | 'VERIFIED_SEARCHING_DONORS'
  | 'APPROVED'
  | 'DONOR_CONFIRMED'
  | 'APPOINTMENT_SCHEDULED'
  | 'COMPLETED'
  | 'REJECTED';

export type PageTab = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'donor-search' 
  | 'emergency-requests' 
  | 'rare-registry'
  | 'group-circles'
  | 'blood-bridge'
  | 'blood-banks' 
  | 'camps' 
  | 'leaderboard' 
  | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  city: string;
  phone: string;
  totalDonations?: number;
  lastDonationDate?: string;
  points?: number;
  streak?: number;
  badges?: string[];
  isVerified?: boolean;
}

export interface PatientVerification {
  id: string;
  patientId: string; // e.g. "BN-HUB-2026-00852"
  verificationCode: string; // e.g. "739241"
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  expiryDate: string;
  isActive: boolean;
}

export interface AppointmentDetails {
  date: string;
  time: string;
  venue: string;
  assignedDonorName: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientId?: string;
  verificationCode?: string;
  isVerifiedByHospital?: boolean;
  selectedChannels?: RequestChannel[];
  channelStatuses?: ChannelStatuses;
  fulfilledChannel?: RequestChannel;
  bloodGroup: BloodGroup;
  bloodComponent?: string;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  hospitalName: string;
  hospitalAddress?: string;
  wardDept?: string;
  city: string;
  state?: string;
  pincode?: string;
  contactPerson: string;
  maskedPhone: string;
  contactPhone: string;
  contactEmail?: string;
  relationship?: string;
  requestedAt: string;
  deadline: string;
  requiredDate?: string;
  requiredTime?: string;
  reason: string;
  additionalNotes: string;
  doctorName?: string;
  prescriptionFileName?: string;
  status: RequestWorkflowStatus;
  aiUrgencyScore: number;
  decayScore: number;
  trendingReason: string;
  sharesCount: number;
  matchedDonorsCount: number;
  assignedDonorId?: string;
  assignedDonorName?: string;
  appointmentDetails?: AppointmentDetails;
  lat: number;
  lng: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  distanceKm: number;
  phone: string;
  maskedPhone: string;
  totalDonations: number;
  lastDonationDate: string;
  points: number;
  responseLikelihoodScore: number;
  isAvailable: boolean;
  isEligible: boolean;
  isRareGroup: boolean;
  lat: number;
  lng: number;
}

export interface InventoryItem {
  group: BloodGroup;
  units: number;
  lastUpdated: string;
}

export interface BloodBank {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  inventory: InventoryItem[];
  lat: number;
  lng: number;
}

export interface DonationCamp {
  id: string;
  title: string;
  organizer: string;
  location: string;
  city: string;
  date: string;
  time: string;
  targetUnits: number;
  registeredDonorsCount: number;
  isUserRegistered?: boolean;
}

export interface LeaderboardItem {
  rank: number;
  donorId: string;
  name: string;
  city: string;
  bloodGroup: BloodGroup;
  donationsCount: number;
  points: number;
  badgeTitle: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'urgent' | 'success' | 'info';
  read: boolean;
}

export interface GroupCircle {
  id: string;
  name: string;
  type: 'Campus' | 'Corporate' | 'Family';
  location: string;
  membersCount: number;
  totalUnitsDonated: number;
  isUserMember?: boolean;
}

export interface InterCityTransfer {
  id: string;
  sourceCity: string;
  targetCity: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: UrgencyLevel;
  courierStatus: 'In Transit' | 'Dispatch Pending' | 'Delivered';
  etaMinutes: number;
}
