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
  | 'login-donor-requester'
  | 'login-hospital'
  | 'login-bloodbank'
  | 'login-admin'
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

export interface DonorResponse {
  donorId: string;
  donorName: string;
  status: 'ACCEPTED' | 'DECLINED';
  distanceKm: number;
  respondedAt: string;
  unitsCommitted: number;
}

export type ComponentType = 'PRBC' | 'Whole Blood' | 'Plasma (FFP)' | 'Platelets (PRP)';

export type UnitLifecycleStatus =
  | 'DONATED'
  | 'COLLECTED'
  | 'TESTING'
  | 'APPROVED'
  | 'STORED'
  | 'RESERVED'
  | 'ISSUED'
  | 'TRANSFUSED'
  | 'EXPIRED'
  | 'DISCARDED';

export interface DetailedBloodUnit {
  unitId: string;
  donationId: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  collectionDate: string;
  expiryDate: string;
  storageLocation: string;
  status: UnitLifecycleStatus;
  donorRef: string;
  createdDate: string;
  lastUpdated: string;
  source?: string;
  receivedDate?: string;
  quantity?: number;
}

export interface BankNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'urgent' | 'success' | 'warning' | 'info';
  read: boolean;
}

export interface ImmutableActivityEntry {
  activityId: string;
  staff: string;
  action: string;
  requestId?: string;
  unitId?: string;
  bloodGroup?: BloodGroup;
  component?: string;
  units?: number;
  date: string;
  time: string;
  details: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending';
  description?: string;
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
  confirmedUnits?: number;
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
  status: RequestWorkflowStatus | 'SEARCHING_FOR_BLOOD' | 'BLOOD_SECURED' | 'EXPIRED' | 'CANCELLED';
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
  
  // Real-time tracking fields
  donorResponses?: DonorResponse[];
  requestTimeline?: TimelineStep[];
  searchRadiusKm?: number;
  isExpired?: boolean;
  matchScores?: Record<string, number>;
  requestedDonorsList?: string[]; // IDs of donors explicitly notified
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

  // Real-time donor portal fields
  availabilityStatus?: 'AVAILABLE' | 'NOT AVAILABLE' | 'TEMPORARILY UNAVAILABLE';
  emergencyAlertsEnabled?: boolean;
  nextEligibleDate?: string;
  eligibilityStatus?: 'ELIGIBLE' | 'TEMPORARILY_INELIGIBLE' | 'PERMANENTLY_INELIGIBLE';
  eligibilityReason?: string;
  acceptedRequests?: string[];
  reliabilityScore?: number;
  state?: string;
  escalationTier?: number;
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
  licenseNo?: string;
  verified?: boolean;
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
  sourceHospital?: string;
  sourceCity?: string;
  targetHospital?: string;
  targetCity?: string;
  bloodGroup: BloodGroup;
  component?: ComponentType;
  units: number;
  urgency?: UrgencyLevel;
  courierStatus?: 'In Transit' | 'Dispatch Pending' | 'Delivered' | string;
  status?: string;
  etaMinutes?: number;
  courierEtaMins?: number;
  fromCity?: string;
  toCity?: string;
  fromHospital?: string;
  toHospital?: string;
  estimatedTimeMins?: number;
  urgencyReason?: string;
}

// ==================================================
// PRIVATE REAL-TIME EMERGENCY CHAT TYPES
// ==================================================
export type MessageType = 
  | 'text' 
  | 'hospital_location' 
  | 'hospital_details' 
  | 'eta' 
  | 'appointment_details' 
  | 'confirm_availability' 
  | 'decline' 
  | 'report_issue';

export interface EmergencyChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  messageType: MessageType;
  timestamp: string;
  read: boolean;
  metadata?: {
    location?: { lat: number; lng: number; address: string };
    hospitalName?: string;
    etaMinutes?: number;
    appointmentDate?: string;
    appointmentTime?: string;
    venue?: string;
  };
}

export type EmergencyChatStatus = 'active' | 'completed' | 'cancelled' | 'closed';

export interface EmergencyChatSession {
  id: string; // "chat-{requestId}"
  requestId: string;
  requesterId: string;
  requesterName: string;
  donorId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  hospitalAddress?: string;
  messages: EmergencyChatMessage[];
  status: EmergencyChatStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageText?: string;
  lastMessageTimestamp?: string;
  isRequesterTyping?: boolean;
  isDonorTyping?: boolean;
  isRequesterOnline?: boolean;
  isDonorOnline?: boolean;
  unreadCountRequester?: number;
  unreadCountDonor?: number;
}

