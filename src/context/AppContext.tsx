import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  PageTab,
  EmergencyRequest,
  Donor,
  BloodBank,
  DonationCamp,
  LeaderboardItem,
  NotificationItem,
  GroupCircle,
  InterCityTransfer,
  PatientVerification,
  RequestChannel,
  ChannelStatuses,
  DonorResponse,
  TimelineStep,
  BloodGroup,
  ComponentType,
  UnitLifecycleStatus,
  DetailedBloodUnit,
  BankNotificationItem,
  ImmutableActivityEntry,
  EmergencyChatMessage,
  EmergencyChatSession,
  EmergencyChatStatus,
  MessageType,
  UserRole
} from '../types';
import {
  MOCK_EMERGENCY_REQUESTS,
  MOCK_DONORS,
  MOCK_BLOOD_BANKS,
  MOCK_CAMPS,
  MOCK_LEADERBOARD,
  MOCK_NOTIFICATIONS,
  MOCK_GROUP_CIRCLES,
  MOCK_INTERCITY_TRANSFERS,
  MOCK_PATIENT_VERIFICATIONS
} from '../data/mockData.ts';
import { calculateSmartDonorMatches } from '../utils/matchingEngine';
import { socketManager } from '../utils/socketManager';

export interface AppContextType {
  activePage: PageTab;
  navigateTo: (tab: PageTab) => void;
  isLoading: boolean;
  requests: EmergencyRequest[];
  createEmergencyRequest: (req: Partial<EmergencyRequest>) => void;
  cancelEmergencyRequest: (requestId: string, reason?: string) => void;
  sendDirectRequestToDonor: (requestId: string, donorId: string) => void;
  donorRespondToRequest: (requestId: string, donorId: string, status: 'ACCEPTED' | 'DECLINED') => void;
  toggleDonorAvailability: (donorId: string, status: 'AVAILABLE' | 'NOT AVAILABLE' | 'TEMPORARILY UNAVAILABLE', emergencyAlerts?: boolean) => void;
  
  // Patient Verification API
  patientVerifications: PatientVerification[];
  createPatientVerification: (patientName: string, bloodGroup: any, hospitalName: string) => PatientVerification;
  verifyPatientCredentials: (patientId: string, code: string, bloodGroup: string) => { isValid: boolean; message: string; record?: PatientVerification };

  // Blood Bank Real-Time Operations API
  inventoryStockMap: Record<BloodGroup, Record<ComponentType, { available: number; reserved: number; issued: number; expired: number }>>;
  bloodUnitsList: DetailedBloodUnit[];
  activityLogs: ImmutableActivityEntry[];
  bankNotifications: BankNotificationItem[];
  reserveBloodBankUnits: (requestId: string, bankId: string, group: BloodGroup, component: ComponentType, units: number, staffName: string) => void;
  issueBloodBankUnits: (requestId: string, unitId: string, staffName: string) => void;
  rejectBloodBankRequest: (requestId: string, reason: string, staffName: string) => void;
  intakeBloodUnit: (unitData: Partial<DetailedBloodUnit>, staffName: string) => void;
  checkBloodUnitExpiries: () => void;
  detectDuplicateRequests: (patientId: string, group: string, hospitalName: string) => { isDuplicate: boolean; matchedReq?: EmergencyRequest };

  // Multi-Channel Handlers & Stock Reservation
  approveBloodBankReservation: (requestId: string, bankId: string) => void;

  // Workflow Phase Handlers
  approveRequestByHospital: (requestId: string, notes?: string) => void;
  rejectRequestByHospital: (requestId: string, reason?: string) => void;
  donorAcceptRequest: (requestId: string, donorId: string) => void;
  donorDeclineRequest: (requestId: string, donorId: string) => void;
  scheduleDonationAppointment: (requestId: string, date: string, time: string, venue: string) => void;
  markDonationCompleted: (requestId: string, donorId?: string) => void;

  // Private Real-Time Emergency Chat API
  chatSessions: EmergencyChatSession[];
  activeChatSessionId: string | null;
  openEmergencyChat: (requestId: string, donorId?: string) => void;
  closeEmergencyChatModal: () => void;
  sendChatMessage: (payload: {
    sessionId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    messageType?: MessageType;
    metadata?: any;
  }) => void;
  markChatMessagesRead: (sessionId: string, userId: string) => void;
  closeEmergencyChatSession: (sessionId: string) => void;
  setTypingIndicator: (sessionId: string, userId: string, isTyping: boolean) => void;

  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  bloodBanks: BloodBank[];
  updateInventoryStock: (bankId: string, group: string, change: number) => void;
  camps: DonationCamp[];
  toggleCampRSVP: (campId: string) => void;
  groupCircles: GroupCircle[];
  toggleCircleJoin: (circleId: string) => void;
  interCityTransfers: InterCityTransfer[];
  leaderboard: { monthly: LeaderboardItem[]; allTime: LeaderboardItem[] };
  notifications: NotificationItem[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Real-Time Connection Status
  isRealtimeConnected: boolean;
  connectionStatus: 'ONLINE' | 'RECONNECTING' | 'OFFLINE';

  // Modals
  activeSmartMatchModal: EmergencyRequest | null;
  setActiveSmartMatchModal: (req: EmergencyRequest | null) => void;
  activeEmergencyPostModal: boolean;
  setActiveEmergencyPostModal: (open: boolean) => void;
  activeCertificateModal: any | null;
  setActiveCertificateModal: (cert: any | null) => void;
  activeChatModal: { request: EmergencyRequest; donor: Donor } | null;
  setActiveChatModal: (chat: { request: EmergencyRequest; donor: Donor } | null) => void;
  activeHealthPassportModal: boolean;
  setActiveHealthPassportModal: (open: boolean) => void;
  activeCorporateImpactModal: boolean;
  setActiveCorporateImpactModal: (open: boolean) => void;
  
  // Mobile Sidebar Drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

const REQUESTS_STORAGE_KEY = 'bloodsphere_requests_data';
const DONORS_STORAGE_KEY = 'bloodsphere_donors_data';
const BLOODBANKS_STORAGE_KEY = 'bloodsphere_bloodbanks_data';
const VERIFICATIONS_STORAGE_KEY = 'bloodsphere_verifications_data';
const NOTIFS_STORAGE_KEY = 'bloodsphere_notifications_data';
const UNITS_STORAGE_KEY = 'bloodsphere_units_data';
const LOGS_STORAGE_KEY = 'bloodsphere_logs_data';
const MATRIX_STORAGE_KEY = 'bloodsphere_matrix_data';
const CHATS_STORAGE_KEY = 'bloodsphere_chats_data';

const DEFAULT_TIMELINE: TimelineStep[] = [
  { id: 'step_created', label: 'Request Created', status: 'completed', description: 'Request registered in system' },
  { id: 'step_searching', label: 'Searching', status: 'current', description: 'Searching eligible donors, hospitals & blood banks' },
  { id: 'step_donors_notified', label: 'Donors Notified', status: 'pending', description: 'Emergency alerts sent to matching donors' },
  { id: 'step_hospital_notified', label: 'Hospital/Blood Bank Notified', status: 'pending', description: 'Inventory availability checked' },
  { id: 'step_response_received', label: 'Response Received', status: 'pending', description: 'Donor or facility responded' },
  { id: 'step_blood_reserved', label: 'Blood Reserved', status: 'pending', description: 'Required units confirmed & reserved' },
  { id: 'step_blood_issued', label: 'Blood Collected / Issued', status: 'pending', description: 'Transfusion coordination active' },
  { id: 'step_completed', label: 'Completed', status: 'pending', description: 'Workflow fully completed' }
];

const INITIAL_INVENTORY_MATRIX: Record<BloodGroup, Record<ComponentType, { available: number; reserved: number; issued: number; expired: number }>> = {
  'A+': {
    'Whole Blood': { available: 16, reserved: 2, issued: 10, expired: 0 },
    'PRBC': { available: 14, reserved: 2, issued: 8, expired: 0 },
    'Plasma (FFP)': { available: 12, reserved: 1, issued: 5, expired: 0 },
    'Platelets (PRP)': { available: 8, reserved: 1, issued: 4, expired: 0 }
  },
  'A-': {
    'Whole Blood': { available: 6, reserved: 1, issued: 4, expired: 0 },
    'PRBC': { available: 5, reserved: 0, issued: 3, expired: 0 },
    'Plasma (FFP)': { available: 4, reserved: 0, issued: 2, expired: 0 },
    'Platelets (PRP)': { available: 3, reserved: 0, issued: 1, expired: 0 }
  },
  'B+': {
    'Whole Blood': { available: 20, reserved: 3, issued: 15, expired: 0 },
    'PRBC': { available: 18, reserved: 2, issued: 12, expired: 0 },
    'Plasma (FFP)': { available: 15, reserved: 2, issued: 8, expired: 0 },
    'Platelets (PRP)': { available: 10, reserved: 1, issued: 6, expired: 0 }
  },
  'B-': {
    'Whole Blood': { available: 5, reserved: 1, issued: 3, expired: 0 },
    'PRBC': { available: 4, reserved: 1, issued: 2, expired: 0 },
    'Plasma (FFP)': { available: 3, reserved: 0, issued: 2, expired: 0 },
    'Platelets (PRP)': { available: 2, reserved: 0, issued: 1, expired: 0 }
  },
  'AB+': {
    'Whole Blood': { available: 10, reserved: 1, issued: 6, expired: 0 },
    'PRBC': { available: 8, reserved: 1, issued: 5, expired: 0 },
    'Plasma (FFP)': { available: 8, reserved: 1, issued: 4, expired: 0 },
    'Platelets (PRP)': { available: 5, reserved: 0, issued: 3, expired: 0 }
  },
  'AB-': {
    'Whole Blood': { available: 3, reserved: 0, issued: 2, expired: 0 },
    'PRBC': { available: 2, reserved: 0, issued: 1, expired: 0 },
    'Plasma (FFP)': { available: 2, reserved: 0, issued: 1, expired: 0 },
    'Platelets (PRP)': { available: 1, reserved: 0, issued: 1, expired: 0 }
  },
  'O+': {
    'Whole Blood': { available: 25, reserved: 4, issued: 20, expired: 0 },
    'PRBC': { available: 22, reserved: 3, issued: 16, expired: 0 },
    'Plasma (FFP)': { available: 18, reserved: 2, issued: 10, expired: 0 },
    'Platelets (PRP)': { available: 12, reserved: 2, issued: 8, expired: 0 }
  },
  'O-': {
    'Whole Blood': { available: 8, reserved: 2, issued: 6, expired: 0 },
    'PRBC': { available: 6, reserved: 1, issued: 5, expired: 0 },
    'Plasma (FFP)': { available: 5, reserved: 1, issued: 3, expired: 0 },
    'Platelets (PRP)': { available: 4, reserved: 1, issued: 2, expired: 0 }
  },
  'Bombay Phenotype (O-h)': {
    'Whole Blood': { available: 2, reserved: 0, issued: 1, expired: 0 },
    'PRBC': { available: 1, reserved: 0, issued: 1, expired: 0 },
    'Plasma (FFP)': { available: 1, reserved: 0, issued: 0, expired: 0 },
    'Platelets (PRP)': { available: 1, reserved: 0, issued: 0, expired: 0 }
  }
};

const INITIAL_UNITS_LIST: DetailedBloodUnit[] = [
  { unitId: 'U-2026-8801', donationId: 'DON-9901', bloodGroup: 'O-', component: 'PRBC', collectionDate: '2026-02-10', expiryDate: '2026-03-24', storageLocation: 'Bay A - Fridge 1', status: 'APPROVED', donorRef: 'Ananya Sharma', createdDate: '2026-02-10', lastUpdated: '2026-02-11' },
  { unitId: 'U-2026-8802', donationId: 'DON-9902', bloodGroup: 'O-', component: 'Whole Blood', collectionDate: '2026-02-12', expiryDate: '2026-03-19', storageLocation: 'Bay A - Fridge 2', status: 'RESERVED', donorRef: 'Rajesh Patil', createdDate: '2026-02-12', lastUpdated: '2026-02-13' },
  { unitId: 'U-2026-8803', donationId: 'DON-9903', bloodGroup: 'A+', component: 'Platelets (PRP)', collectionDate: '2026-02-17', expiryDate: '2026-02-22', storageLocation: 'Agitator Unit 1', status: 'APPROVED', donorRef: 'Vikram Joshi', createdDate: '2026-02-17', lastUpdated: '2026-02-17' },
  { unitId: 'U-2026-8804', donationId: 'DON-9904', bloodGroup: 'B+', component: 'Plasma (FFP)', collectionDate: '2026-01-15', expiryDate: '2027-01-15', storageLocation: 'Deep Freezer -25C', status: 'STORED', donorRef: 'Sneha Kulkarni', createdDate: '2026-01-15', lastUpdated: '2026-01-16' },
  { unitId: 'U-2026-8805', donationId: 'DON-9905', bloodGroup: 'Bombay Phenotype (O-h)', component: 'Whole Blood', collectionDate: '2026-02-05', expiryDate: '2026-03-12', storageLocation: 'Ultra Rare Vault', status: 'APPROVED', donorRef: 'Basavaraj H', createdDate: '2026-02-05', lastUpdated: '2026-02-06' }
];

const INITIAL_ACTIVITY_LOGS: ImmutableActivityEntry[] = [
  { activityId: 'ACT-9001', staff: 'Dr. Ramesh S', action: 'Stock Intake', unitId: 'U-2026-8801', bloodGroup: 'O-', component: 'PRBC', units: 1, date: '2026-02-11', time: '09:30 AM', details: 'Added 1 PRBC unit collected from voluntary drive.' },
  { activityId: 'ACT-9002', staff: 'Nurse Priya M', action: 'Stock Reserved', requestId: 'req_1', unitId: 'U-2026-8802', bloodGroup: 'O-', component: 'Whole Blood', units: 1, date: '2026-02-13', time: '11:15 AM', details: 'Reserved O- Whole Blood unit for emergency surgery req_1.' }
];

const SEED_CHAT_SESSIONS: EmergencyChatSession[] = [
  {
    id: 'chat-req_1',
    requestId: 'req_1',
    requesterId: 'user_req_1',
    requesterName: 'Dr. Anish K',
    donorId: 'd1',
    donorName: 'Ananya Sharma',
    donorBloodGroup: 'O-',
    patientName: 'Rohan Deshmukh',
    bloodGroup: 'O-',
    hospitalName: 'KIMS Teaching Hospital',
    hospitalAddress: 'PB Road, Vidyanagar, Hubballi',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessageText: '⏱ ETA: Arriving in 15 minutes.',
    lastMessageTimestamp: '10:30 AM',
    isRequesterOnline: true,
    isDonorOnline: true,
    messages: [
      {
        id: 'msg_1',
        senderId: 'd1',
        senderName: 'Ananya Sharma',
        senderRole: 'donor',
        message: 'Hello Dr. Anish, I accepted your O- emergency request. I am on my way to KIMS hospital.',
        messageType: 'text',
        timestamp: '10:15 AM',
        read: true
      },
      {
        id: 'msg_2',
        senderId: 'user_req_1',
        senderName: 'Dr. Anish K',
        senderRole: 'requester',
        message: 'Thank you Ananya! Please report directly to ICU Ward Bed 14. We have prepared the screening desk.',
        messageType: 'text',
        timestamp: '10:20 AM',
        read: true
      },
      {
        id: 'msg_3',
        senderId: 'user_req_1',
        senderName: 'Dr. Anish K',
        senderRole: 'requester',
        message: '📍 Hospital Location: KIMS Teaching Hospital, PB Road, Vidyanagar, Hubballi',
        messageType: 'hospital_location',
        timestamp: '10:22 AM',
        read: true,
        metadata: {
          location: { lat: 15.3647, lng: 75.1240, address: 'PB Road, Vidyanagar, Hubballi' }
        }
      },
      {
        id: 'msg_4',
        senderId: 'd1',
        senderName: 'Ananya Sharma',
        senderRole: 'donor',
        message: '⏱ ETA: Arriving in 15 minutes.',
        messageType: 'eta',
        timestamp: '10:30 AM',
        read: true,
        metadata: { etaMinutes: 15 }
      }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageTab>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRealtimeConnected] = useState<boolean>(true);
  const [connectionStatus] = useState<'ONLINE' | 'RECONNECTING' | 'OFFLINE'>('ONLINE');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // 1. Persistent Requests State
  const [requests, setRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved requests', e);
      }
    }
    return MOCK_EMERGENCY_REQUESTS;
  });

  // 2. Persistent Donors State
  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem(DONORS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved donors', e);
      }
    }
    return MOCK_DONORS;
  });

  // 3. Persistent Blood Banks State
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(() => {
    const saved = localStorage.getItem(BLOODBANKS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved blood banks', e);
      }
    }
    return MOCK_BLOOD_BANKS;
  });

  // 4. Persistent Patient Verifications
  const [patientVerifications, setPatientVerifications] = useState<PatientVerification[]>(() => {
    const saved = localStorage.getItem(VERIFICATIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved verifications', e);
      }
    }
    return MOCK_PATIENT_VERIFICATIONS;
  });

  // 5. Persistent Inventory Stock Matrix State
  const [inventoryStockMap, setInventoryStockMap] = useState<Record<BloodGroup, Record<ComponentType, { available: number; reserved: number; issued: number; expired: number }>>>(() => {
    const saved = localStorage.getItem(MATRIX_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse matrix data', e);
      }
    }
    return INITIAL_INVENTORY_MATRIX;
  });

  // 6. Persistent Blood Units List State
  const [bloodUnitsList, setBloodUnitsList] = useState<DetailedBloodUnit[]>(() => {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse units list', e);
      }
    }
    return INITIAL_UNITS_LIST;
  });

  // 7. Persistent Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ImmutableActivityEntry[]>(() => {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse logs data', e);
      }
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // 8. Persistent Emergency Chat Sessions State
  const [chatSessions, setChatSessions] = useState<EmergencyChatSession[]>(() => {
    const saved = localStorage.getItem(CHATS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse chats data', err);
      }
    }
    return SEED_CHAT_SESSIONS;
  });

  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

  const [bankNotifications, setBankNotifications] = useState<BankNotificationItem[]>([]);
  const [camps, setCamps] = useState<DonationCamp[]>(MOCK_CAMPS);
  const [groupCircles, setGroupCircles] = useState<GroupCircle[]>(MOCK_GROUP_CIRCLES);
  const [interCityTransfers] = useState<InterCityTransfer[]>(MOCK_INTERCITY_TRANSFERS);
  const [leaderboard] = useState(MOCK_LEADERBOARD);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_NOTIFICATIONS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [activeSmartMatchModal, setActiveSmartMatchModal] = useState<EmergencyRequest | null>(null);
  const [activeEmergencyPostModal, setActiveEmergencyPostModal] = useState<boolean>(false);
  const [activeCertificateModal, setActiveCertificateModal] = useState<any | null>(null);
  const [activeChatModal, setActiveChatModal] = useState<{ request: EmergencyRequest; donor: Donor } | null>(null);
  const [activeHealthPassportModal, setActiveHealthPassportModal] = useState<boolean>(false);
  const [activeCorporateImpactModal, setActiveCorporateImpactModal] = useState<boolean>(false);

  // Native BroadcastChannel for real-time multi-tab state sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bloodsphere_realtime');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_REQUESTS' && payload) {
          setRequests(payload);
        } else if (type === 'SYNC_DONORS' && payload) {
          setDonors(payload);
        } else if (type === 'SYNC_BLOODBANKS' && payload) {
          setBloodBanks(payload);
        } else if (type === 'SYNC_NOTIFICATIONS' && payload) {
          setNotifications(payload);
        } else if (type === 'SYNC_MATRIX' && payload) {
          setInventoryStockMap(payload);
        } else if (type === 'SYNC_UNITS' && payload) {
          setBloodUnitsList(payload);
        } else if (type === 'SYNC_LOGS' && payload) {
          setActivityLogs(payload);
        } else if (type === 'SYNC_CHATS' && payload) {
          setChatSessions(payload);
        } else if (type === 'REALTIME_TOAST' && payload) {
          setToastMessage(payload);
          setTimeout(() => setToastMessage(null), 3500);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const broadcastSync = (type: string, payload: any) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type, payload });
      } catch (err) {
        console.error('Broadcast error:', err);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    broadcastSync('SYNC_REQUESTS', requests);
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(DONORS_STORAGE_KEY, JSON.stringify(donors));
    broadcastSync('SYNC_DONORS', donors);
  }, [donors]);

  useEffect(() => {
    localStorage.setItem(BLOODBANKS_STORAGE_KEY, JSON.stringify(bloodBanks));
    broadcastSync('SYNC_BLOODBANKS', bloodBanks);
  }, [bloodBanks]);

  useEffect(() => {
    localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(patientVerifications));
  }, [patientVerifications]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    broadcastSync('SYNC_NOTIFICATIONS', notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(inventoryStockMap));
    broadcastSync('SYNC_MATRIX', inventoryStockMap);

    setBloodBanks(prev =>
      prev.map(b => {
        if (b.id === 'bb_1' || b.id === 'acc_bb_001') {
          return {
            ...b,
            inventory: Object.entries(inventoryStockMap).map(([group, comps]) => ({
              group: group as BloodGroup,
              units: comps['PRBC']?.available || comps['Whole Blood']?.available || 0,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          };
        }
        return b;
      })
    );
  }, [inventoryStockMap]);

  useEffect(() => {
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(bloodUnitsList));
    broadcastSync('SYNC_UNITS', bloodUnitsList);
  }, [bloodUnitsList]);

  useEffect(() => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(activityLogs));
    broadcastSync('SYNC_LOGS', activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chatSessions));
    broadcastSync('SYNC_CHATS', chatSessions);
  }, [chatSessions]);

  // Socket.IO Room & Message Event Listeners
  useEffect(() => {
    const handleSocketMessage = (data: any) => {
      if (data.message && data.requestId) {
        setChatSessions(prev =>
          prev.map(session => {
            if (session.requestId === data.requestId) {
              const msgExists = session.messages.some(m => m.id === data.message.id);
              if (msgExists) return session;
              return {
                ...session,
                messages: [...session.messages, data.message],
                lastMessageText: data.message.message,
                lastMessageTimestamp: data.message.timestamp,
                updatedAt: new Date().toISOString()
              };
            }
            return session;
          })
        );
      }
    };

    const handleSocketTyping = (data: any) => {
      if (data.requestId && data.userId) {
        setChatSessions(prev =>
          prev.map(session => {
            if (session.requestId === data.requestId) {
              if (data.userId === session.donorId) {
                return { ...session, isDonorTyping: data.isTyping };
              } else if (data.userId === session.requesterId) {
                return { ...session, isRequesterTyping: data.isTyping };
              }
            }
            return session;
          })
        );
      }
    };

    const handleSocketOnline = (data: any) => {
      if (data.requestId) {
        setChatSessions(prev =>
          prev.map(session => {
            if (session.requestId === data.requestId) {
              if (data.userId === session.donorId) {
                return { ...session, isDonorOnline: data.status === 'ONLINE' };
              } else if (data.userId === session.requesterId) {
                return { ...session, isRequesterOnline: data.status === 'ONLINE' };
              }
            }
            return session;
          })
        );
      }
    };

    socketManager.on('receiveMessage', handleSocketMessage);
    socketManager.on('typing', handleSocketTyping);
    socketManager.on('userOnline', handleSocketOnline);
    socketManager.on('userOffline', handleSocketOnline);

    return () => {
      socketManager.off('receiveMessage', handleSocketMessage);
      socketManager.off('typing', handleSocketTyping);
      socketManager.off('userOnline', handleSocketOnline);
      socketManager.off('userOffline', handleSocketOnline);
    };
  }, []);

  const navigateTo = (tab: PageTab) => {
    setIsLoading(true);
    setActivePage(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    broadcastSync('REALTIME_TOAST', msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper: Find or Create Emergency Chat Session
  const createOrGetEmergencyChatSession = (requestId: string, donorId?: string): EmergencyChatSession => {
    const existing = chatSessions.find(s => s.requestId === requestId);
    if (existing) return existing;

    const req = requests.find(r => r.id === requestId);
    const donorObj = donors.find(d => d.id === donorId) || donors[0];

    const newSession: EmergencyChatSession = {
      id: `chat-${requestId}`,
      requestId,
      requesterId: req?.contactPhone || 'requester_id',
      requesterName: req?.contactPerson || 'Patient Requester',
      donorId: donorObj.id,
      donorName: donorObj.name,
      donorBloodGroup: donorObj.bloodGroup,
      patientName: req?.patientName || 'Patient',
      bloodGroup: req?.bloodGroup || 'O-',
      hospitalName: req?.hospitalName || 'KIMS Hospital',
      hospitalAddress: req?.hospitalAddress || 'PB Road, Vidyanagar, Hubballi',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageText: 'Emergency private chat initiated.',
      lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRequesterOnline: true,
      isDonorOnline: true,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          senderId: donorObj.id,
          senderName: donorObj.name,
          senderRole: 'donor',
          message: `Hello ${req?.contactPerson || 'Requester'}, I accepted your ${req?.bloodGroup || 'O-'} emergency request. Private real-time channel established.`,
          messageType: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: true
        }
      ]
    };

    setChatSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const openEmergencyChat = (requestId: string, donorId?: string) => {
    const session = createOrGetEmergencyChatSession(requestId, donorId);
    setActiveChatSessionId(session.id);
    socketManager.joinRoom(requestId, donorId || 'user_id', 'donor');
  };

  const closeEmergencyChatModal = () => {
    setActiveChatSessionId(null);
  };

  const sendChatMessage = (payload: {
    sessionId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    messageType?: MessageType;
    metadata?: any;
  }) => {
    const session = chatSessions.find(s => s.id === payload.sessionId);
    if (!session || session.status === 'closed') return;

    const newMsg: EmergencyChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      message: payload.message,
      messageType: payload.messageType || 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      metadata: payload.metadata
    };

    setChatSessions(prev =>
      prev.map(s => {
        if (s.id === payload.sessionId) {
          return {
            ...s,
            messages: [...s.messages, newMsg],
            lastMessageText: payload.message,
            lastMessageTimestamp: newMsg.timestamp,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );

    socketManager.emitMessage(session.requestId, newMsg);
  };

  const markChatMessagesRead = (sessionId: string, userId: string) => {
    setChatSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const updated = s.messages.map(m => (m.senderId !== userId ? { ...m, read: true } : m));
          return { ...s, messages: updated };
        }
        return s;
      })
    );
  };

  const closeEmergencyChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setChatSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, status: 'closed' as const } : s))
      );
      socketManager.emitCloseChat(session.requestId, 'user');
      showToast(`Emergency chat for request ${session.requestId} closed.`);
    }
  };

  const setTypingIndicator = (sessionId: string, userId: string, isTyping: boolean) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      socketManager.emitTyping(session.requestId, userId, isTyping);
    }
  };

  const createPatientVerification = (
    patientName: string,
    bloodGroup: BloodGroup,
    hospitalName: string
  ): PatientVerification => {
    const randomId = Math.floor(100 + Math.random() * 900);
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const patientId = `BN-HUB-2026-00${randomId}`;

    const newRecord: PatientVerification = {
      id: `verif_${Date.now()}`,
      patientId,
      verificationCode: randomCode,
      patientName,
      bloodGroup,
      hospitalName,
      expiryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      isActive: true
    };

    setPatientVerifications(prev => [newRecord, ...prev]);
    showToast(`Issued credentials for ${patientName}: ID ${patientId}, Passcode: ${randomCode}`);
    return newRecord;
  };

  const verifyPatientCredentials = (
    patientId: string,
    code: string,
    bloodGroup: string
  ): { isValid: boolean; message: string; record?: PatientVerification } => {
    const match = patientVerifications.find(
      v => v.patientId.toLowerCase().trim() === patientId.toLowerCase().trim() && v.isActive
    );

    if (!match) {
      return { isValid: false, message: 'Invalid Patient ID or expired record.' };
    }

    if (match.verificationCode !== code.trim()) {
      return { isValid: false, message: 'Invalid 6-Digit Passcode.' };
    }

    return {
      isValid: true,
      message: `Verified: ${match.patientName} (${match.bloodGroup}) at ${match.hospitalName}`,
      record: match
    };
  };

  const detectDuplicateRequests = (
    patientId: string,
    group: string,
    hospitalName: string
  ): { isDuplicate: boolean; matchedReq?: EmergencyRequest } => {
    if (!patientId && !hospitalName) return { isDuplicate: false };

    const matched = requests.find(r => {
      const matchPatient = patientId && r.patientId && r.patientId.toLowerCase().trim() === patientId.toLowerCase().trim();
      const matchHospitalGroup = r.hospitalName.toLowerCase().trim() === hospitalName.toLowerCase().trim() && r.bloodGroup === group;
      return (matchPatient || matchHospitalGroup) && r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
    });

    return { isDuplicate: !!matched, matchedReq: matched };
  };

  const createEmergencyRequest = (newReqData: Partial<EmergencyRequest>) => {
    const newId = `req_${Date.now()}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const isVerified = !!newReqData.isVerifiedByHospital;

    const newRequest: EmergencyRequest = {
      id: newId,
      patientName: newReqData.patientName || 'Emergency Patient',
      patientAge: newReqData.patientAge || 30,
      patientGender: newReqData.patientGender || 'Male',
      patientId: newReqData.patientId || `BN-HUB-2026-00${Math.floor(100 + Math.random() * 900)}`,
      verificationCode: newReqData.verificationCode || '739241',
      isVerifiedByHospital: isVerified,
      selectedChannels: newReqData.selectedChannels || ['hospital', 'donors'],
      channelStatuses: {
        hospitalStatus: isVerified ? 'APPROVED' : 'PENDING',
        donorStatus: 'SEARCHING',
        bloodBankStatus: newReqData.selectedChannels?.includes('bloodbank') ? 'PENDING' : undefined
      },
      bloodGroup: newReqData.bloodGroup || 'O+',
      bloodComponent: newReqData.bloodComponent || 'Whole Blood',
      unitsNeeded: newReqData.unitsNeeded || 1,
      unitsFulfilled: 0,
      confirmedUnits: 0,
      urgency: newReqData.urgency || 'HIGH',
      hospitalName: newReqData.hospitalName || 'KIMS Hospital',
      hospitalAddress: newReqData.hospitalAddress || 'PB Road, Vidyanagar, Hubballi',
      wardDept: newReqData.wardDept || 'ICU Bed 12',
      city: newReqData.city || 'Hubballi',
      state: newReqData.state || 'Karnataka',
      pincode: newReqData.pincode || '580031',
      contactPerson: newReqData.contactPerson || 'Requester',
      contactPhone: newReqData.contactPhone || '9876543210',
      maskedPhone: '98765*****',
      contactEmail: newReqData.contactEmail || 'contact@example.com',
      relationship: newReqData.relationship || 'Family',
      requestedAt: `${dateStr} 10:00 AM`,
      deadline: newReqData.requiredDate ? `${newReqData.requiredDate} ${newReqData.requiredTime || ''}` : `${dateStr} 06:00 PM`,
      requiredDate: newReqData.requiredDate || dateStr,
      requiredTime: newReqData.requiredTime || '10:00 AM',
      reason: newReqData.reason || 'Emergency Trauma Requirement',
      additionalNotes: newReqData.additionalNotes || 'Urgent transfusion needed.',
      doctorName: newReqData.doctorName || 'Dr. Mahesh Kulkarni',
      status: isVerified ? 'VERIFIED_SEARCHING_DONORS' : 'PENDING_HOSPITAL_APPROVAL',
      aiUrgencyScore: newReqData.urgency === 'CRITICAL' ? 98 : 85,
      decayScore: 0.95,
      trendingReason: isVerified ? 'Hospital Verified • Donor Alert Dispatched' : 'Pending Hospital Review',
      sharesCount: 1,
      matchedDonorsCount: 4,
      lat: newReqData.lat || 15.3647,
      lng: newReqData.lng || 75.124,
      donorResponses: [],
      requestTimeline: DEFAULT_TIMELINE
    };

    setRequests(prev => [newRequest, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: isVerified ? "🚨 Instant Donor Alert Broadcast!" : "🏥 Hospital Review Required",
      message: `Emergency request created for ${newRequest.patientName} (${newRequest.bloodGroup}, ${newRequest.unitsNeeded} Units) at ${newRequest.hospitalName}.`,
      time: "Just now",
      type: "urgent",
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Emergency Blood Request #${newId} created successfully!`);
  };

  const cancelEmergencyRequest = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'CANCELLED' as const } : r))
    );
    showToast(`Request ${requestId} has been cancelled.`);
  };

  const sendDirectRequestToDonor = (requestId: string, donorId: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const list = req.requestedDonorsList || [];
          return {
            ...req,
            requestedDonorsList: list.includes(donorId) ? list : [...list, donorId]
          };
        }
        return req;
      })
    );

    const targetDonor = donors.find(d => d.id === donorId);
    showToast(`Direct Emergency Alert sent to ${targetDonor?.name || 'Donor'}!`);
  };

  const respondToEmergencyRequest = (
    requestId: string,
    donorId: string,
    responseStatus: 'ACCEPTED' | 'DECLINED'
  ) => {
    const donorObj = donors.find(d => d.id === donorId) || donors[0];

    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const existingResponses = req.donorResponses || [];
          const filtered = existingResponses.filter(res => res.donorId !== donorId);
          
          const newResponse: DonorResponse = {
            donorId,
            donorName: donorObj.name,
            status: responseStatus,
            distanceKm: donorObj.distanceKm || 2.5,
            respondedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unitsCommitted: responseStatus === 'ACCEPTED' ? 1 : 0
          };

          const updatedResponses = [...filtered, newResponse];
          const acceptedCount = updatedResponses.filter(r => r.status === 'ACCEPTED').length;
          const isFullySecured = acceptedCount >= req.unitsNeeded;

          const updatedTimeline = (req.requestTimeline || DEFAULT_TIMELINE).map(step => {
            if (step.id === 'step_response_received') {
              return { ...step, status: 'completed' as const, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: `${acceptedCount} donor(s) responded` };
            }
            if (step.id === 'step_blood_reserved' && isFullySecured) {
              return { ...step, status: 'completed' as const, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: `Required ${req.unitsNeeded} units confirmed & secured!` };
            }
            return step;
          });

          const nextStatus = isFullySecured ? 'BLOOD_SECURED' : (acceptedCount > 0 ? 'DONOR_CONFIRMED' : req.status);

          return {
            ...req,
            donorResponses: updatedResponses,
            confirmedUnits: acceptedCount,
            unitsFulfilled: acceptedCount,
            status: nextStatus,
            assignedDonorId: isFullySecured ? donorId : req.assignedDonorId,
            assignedDonorName: isFullySecured ? donorObj.name : req.assignedDonorName,
            requestTimeline: updatedTimeline,
            trendingReason: isFullySecured ? `Blood Secured (${acceptedCount}/${req.unitsNeeded} Units Confirmed)` : `${acceptedCount} Donor Accepted`
          };
        }
        return req;
      })
    );

    if (responseStatus === 'ACCEPTED') {
      setDonors(prev =>
        prev.map(d => {
          if (d.id === donorId) {
            const list = d.acceptedRequests || [];
            return {
              ...d,
              acceptedRequests: list.includes(requestId) ? list : [...list, requestId]
            };
          }
          return d;
        })
      );

      // AUTOMATICALLY CREATE OR ACTIVATE REAL-TIME PRIVATE EMERGENCY CHAT
      createOrGetEmergencyChatSession(requestId, donorId);
    }

    const notifTitle = responseStatus === 'ACCEPTED' ? "✅ Donor Accepted Your Request!" : "ℹ️ Donor Declined Request";
    const notifMsg = responseStatus === 'ACCEPTED'
      ? `${donorObj.name} has accepted your blood request for ${requestId}. Coordination active.`
      : `${donorObj.name} declined request ${requestId}. System searching next closest donor.`;

    setNotifications(prev => [
      {
        id: `notif_resp_${Date.now()}`,
        title: notifTitle,
        message: notifMsg,
        time: "Just now",
        type: responseStatus === 'ACCEPTED' ? "success" : "info",
        read: false,
        requestId
      },
      ...prev
    ]);

    showToast(responseStatus === 'ACCEPTED' ? `You accepted request ${requestId}! Private real-time chat channel opened.` : `Declined request ${requestId}.`);
  };

  const toggleDonorAvailability = (
    donorId: string,
    status: 'AVAILABLE' | 'NOT AVAILABLE' | 'TEMPORARILY UNAVAILABLE',
    emergencyAlerts?: boolean
  ) => {
    setDonors(prev =>
      prev.map(d => {
        if (d.id === donorId) {
          return {
            ...d,
            availabilityStatus: status,
            isAvailable: status === 'AVAILABLE',
            emergencyAlertsEnabled: emergencyAlerts !== undefined ? emergencyAlerts : d.emergencyAlertsEnabled
          };
        }
        return d;
      })
    );
    showToast(`Donor status updated to ${status}.`);
  };

  const reserveBloodBankUnits = (
    requestId: string,
    bankId: string,
    group: BloodGroup,
    component: ComponentType,
    units: number,
    staffName: string
  ) => {
    setInventoryStockMap(prev => {
      const groupData = prev[group] || {};
      const compData = groupData[component] || { available: 0, reserved: 0, issued: 0, expired: 0 };
      const newAvail = Math.max(0, compData.available - units);
      const newRes = compData.reserved + units;

      return {
        ...prev,
        [group]: {
          ...groupData,
          [component]: {
            ...compData,
            available: newAvail,
            reserved: newRes
          }
        }
      };
    });

    const newLog: ImmutableActivityEntry = {
      activityId: `ACT-${Date.now()}`,
      staff: staffName,
      action: 'Stock Reserved',
      requestId,
      bloodGroup: group,
      component,
      units,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: `Reserved ${units} unit(s) of ${group} ${component} for request ${requestId}.`
    };

    setActivityLogs(prev => [newLog, ...prev]);

    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'BLOOD_SECURED',
            channelStatuses: {
              ...req.channelStatuses,
              bloodBankStatus: 'RESERVED'
            },
            fulfilledChannel: 'bloodbank'
          };
        }
        return req;
      })
    );

    showToast(`Reserved ${units} unit(s) of ${group} ${component} for ${requestId}!`);
  };

  const issueBloodBankUnits = (requestId: string, unitId: string, staffName: string) => {
    const unit = bloodUnitsList.find(u => u.unitId === unitId);
    if (unit) {
      setBloodUnitsList(prev =>
        prev.map(u => (u.unitId === unitId ? { ...u, status: 'ISSUED' as const } : u))
      );

      if (unit.bloodGroup && unit.component) {
        setInventoryStockMap(prev => {
          const groupData = prev[unit.bloodGroup] || {};
          const compData = groupData[unit.component] || { available: 0, reserved: 0, issued: 0, expired: 0 };
          const newRes = Math.max(0, compData.reserved - 1);
          const newIss = compData.issued + 1;

          return {
            ...prev,
            [unit.bloodGroup]: {
              ...groupData,
              [unit.component]: {
                ...compData,
                reserved: newRes,
                issued: newIss
              }
            }
          };
        });
      }

      const newLog: ImmutableActivityEntry = {
        activityId: `ACT-${Date.now()}`,
        staff: staffName,
        action: 'Blood Issued',
        requestId,
        unitId,
        bloodGroup: unit.bloodGroup,
        component: unit.component,
        units: 1,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: `Issued blood unit ${unitId} to requester for request ${requestId}.`
      };

      setActivityLogs(prev => [newLog, ...prev]);
      showToast(`Blood Unit ${unitId} issued successfully!`);
    }
  };

  const rejectBloodBankRequest = (requestId: string, reason: string, staffName: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            channelStatuses: {
              ...req.channelStatuses,
              bloodBankStatus: 'REJECTED'
            }
          };
        }
        return req;
      })
    );

    showToast(`Blood Bank request ${requestId} declined: ${reason}`);
  };

  const intakeBloodUnit = (unitData: Partial<DetailedBloodUnit>, staffName: string) => {
    const newUnitId = `U-2026-${Math.floor(8800 + Math.random() * 1000)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newUnit: DetailedBloodUnit = {
      unitId: newUnitId,
      donationId: `DON-${Math.floor(9900 + Math.random() * 1000)}`,
      bloodGroup: unitData.bloodGroup || 'O+',
      component: unitData.component || 'PRBC',
      collectionDate: dateStr,
      expiryDate: new Date(Date.now() + 35 * 3600 * 24 * 1000).toISOString().split('T')[0],
      storageLocation: unitData.storageLocation || 'Bay A - Fridge 1',
      status: 'APPROVED',
      donorRef: unitData.donorRef || 'Voluntary Donor',
      createdDate: dateStr,
      lastUpdated: dateStr
    };

    setBloodUnitsList(prev => [newUnit, ...prev]);

    setInventoryStockMap(prev => {
      const groupData = prev[newUnit.bloodGroup] || {};
      const compData = groupData[newUnit.component] || { available: 0, reserved: 0, issued: 0, expired: 0 };

      return {
        ...prev,
        [newUnit.bloodGroup]: {
          ...groupData,
          [newUnit.component]: {
            ...compData,
            available: compData.available + 1
          }
        }
      };
    });

    const newLog: ImmutableActivityEntry = {
      activityId: `ACT-${Date.now()}`,
      staff: staffName,
      action: 'Stock Intake',
      unitId: newUnitId,
      bloodGroup: newUnit.bloodGroup,
      component: newUnit.component,
      units: 1,
      date: dateStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: `Added new ${newUnit.bloodGroup} ${newUnit.component} unit ${newUnitId} into inventory.`
    };

    setActivityLogs(prev => [newLog, ...prev]);
    showToast(`Added Unit ${newUnitId} (${newUnit.bloodGroup} ${newUnit.component}) into inventory.`);
  };

  const checkBloodUnitExpiries = () => {
    const today = new Date().toISOString().split('T')[0];
    let expiredCount = 0;

    setBloodUnitsList(prev =>
      prev.map(u => {
        if (u.status !== 'EXPIRED' && u.expiryDate < today) {
          expiredCount++;
          return { ...u, status: 'EXPIRED' as const };
        }
        return u;
      })
    );

    if (expiredCount > 0) {
      showToast(`Scan complete: ${expiredCount} unit(s) flagged as expired.`);
    } else {
      showToast('Scan complete: All inventory units are within expiration dates.');
    }
  };

  const approveBloodBankReservation = (requestId: string, bankId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      reserveBloodBankUnits(requestId, bankId, req.bloodGroup, (req.bloodComponent as ComponentType) || 'PRBC', req.unitsNeeded, 'Regional Admin');
    }
  };

  const approveRequestByHospital = (requestId: string, notes?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'VERIFIED_SEARCHING_DONORS',
            isVerifiedByHospital: true,
            channelStatuses: {
              ...r.channelStatuses,
              hospitalStatus: 'APPROVED'
            },
            additionalNotes: notes ? `${r.additionalNotes} (Hospital Note: ${notes})` : r.additionalNotes
          };
        }
        return r;
      })
    );
    showToast(`Request ${requestId} approved by hospital.`);
  };

  const rejectRequestByHospital = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'REJECTED' as const } : r))
    );
    showToast(`Request ${requestId} rejected by hospital.`);
  };

  const donorAcceptRequest = (requestId: string, donorId: string) => {
    respondToEmergencyRequest(requestId, donorId, 'ACCEPTED');
    openEmergencyChat(requestId, donorId);
  };

  const donorDeclineRequest = (requestId: string, donorId: string) => {
    respondToEmergencyRequest(requestId, donorId, 'DECLINED');
  };

  const scheduleDonationAppointment = (requestId: string, date: string, time: string, venue: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'APPOINTMENT_SCHEDULED',
            appointmentDetails: {
              date,
              time,
              venue,
              assignedDonorName: r.assignedDonorName || 'Voluntary Donor'
            }
          };
        }
        return r;
      })
    );

    showToast(`Scheduled appointment for ${requestId} at ${venue} (${date} ${time})`);
  };

  const markDonationCompleted = (requestId: string, donorId?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'COMPLETED',
            unitsFulfilled: r.unitsNeeded
          };
        }
        return r;
      })
    );

    // Also close the emergency chat session
    const matchingChat = chatSessions.find(s => s.requestId === requestId);
    if (matchingChat) {
      closeEmergencyChatSession(matchingChat.id);
    }

    showToast(`Emergency Blood Donation #${requestId} marked as COMPLETED!`);
  };

  const updateInventoryStock = (bankId: string, group: string, change: number) => {
    showToast(`Inventory updated for ${group}: ${change > 0 ? '+' : ''}${change} units.`);
  };

  const toggleCampRSVP = (campId: string) => {
    setCamps(prev =>
      prev.map(c => {
        if (c.id === campId) {
          const isReg = !c.isUserRegistered;
          return {
            ...c,
            isUserRegistered: isReg,
            registeredDonorsCount: isReg ? c.registeredDonorsCount + 1 : c.registeredDonorsCount - 1
          };
        }
        return c;
      })
    );
    showToast('Updated blood drive RSVP.');
  };

  const toggleCircleJoin = (circleId: string) => {
    setGroupCircles(prev =>
      prev.map(c => {
        if (c.id === circleId) {
          const isMem = !c.isUserMember;
          return {
            ...c,
            isUserMember: isMem,
            membersCount: isMem ? c.membersCount + 1 : c.membersCount - 1
          };
        }
        return c;
      })
    );
    showToast('Updated Group Circle membership.');
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        navigateTo,
        isLoading,
        requests,
        createEmergencyRequest,
        cancelEmergencyRequest,
        sendDirectRequestToDonor,
        donorRespondToRequest: respondToEmergencyRequest,
        toggleDonorAvailability,
        patientVerifications,
        createPatientVerification,
        verifyPatientCredentials,
        inventoryStockMap,
        bloodUnitsList,
        activityLogs,
        bankNotifications,
        reserveBloodBankUnits,
        issueBloodBankUnits,
        rejectBloodBankRequest,
        intakeBloodUnit,
        checkBloodUnitExpiries,
        detectDuplicateRequests,
        approveBloodBankReservation,
        approveRequestByHospital,
        rejectRequestByHospital,
        donorAcceptRequest,
        donorDeclineRequest,
        scheduleDonationAppointment,
        markDonationCompleted,

        // Private Real-Time Emergency Chat API
        chatSessions,
        activeChatSessionId,
        openEmergencyChat,
        closeEmergencyChatModal,
        sendChatMessage,
        markChatMessagesRead,
        closeEmergencyChatSession,
        setTypingIndicator,

        donors,
        setDonors,
        bloodBanks,
        updateInventoryStock,
        camps,
        toggleCampRSVP,
        groupCircles,
        toggleCircleJoin,
        interCityTransfers,
        leaderboard,
        notifications,
        toastMessage,
        showToast,
        isRealtimeConnected,
        connectionStatus,
        activeSmartMatchModal,
        setActiveSmartMatchModal,
        activeEmergencyPostModal,
        setActiveEmergencyPostModal,
        activeCertificateModal,
        setActiveCertificateModal,
        activeChatModal,
        setActiveChatModal,
        activeHealthPassportModal,
        setActiveHealthPassportModal,
        activeCorporateImpactModal,
        setActiveCorporateImpactModal,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
