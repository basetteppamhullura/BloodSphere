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
  BloodGroup
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

interface AppContextType {
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

  // Multi-Channel Handlers & Stock Reservation
  approveBloodBankReservation: (requestId: string, bankId: string) => void;

  // Workflow Phase Handlers
  approveRequestByHospital: (requestId: string, notes?: string) => void;
  rejectRequestByHospital: (requestId: string, reason?: string) => void;
  donorAcceptRequest: (requestId: string, donorId: string) => void;
  donorDeclineRequest: (requestId: string, donorId: string) => void;
  scheduleDonationAppointment: (requestId: string, date: string, time: string, venue: string) => void;
  markDonationCompleted: (requestId: string, donorId?: string) => void;

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
}

const REQUESTS_STORAGE_KEY = 'bloodsphere_requests_data';
const DONORS_STORAGE_KEY = 'bloodsphere_donors_data';
const BLOODBANKS_STORAGE_KEY = 'bloodsphere_bloodbanks_data';
const VERIFICATIONS_STORAGE_KEY = 'bloodsphere_verifications_data';
const NOTIFS_STORAGE_KEY = 'bloodsphere_notifications_data';

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageTab>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize requests with enriched real-time data
  const [requests, setRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_EMERGENCY_REQUESTS.map(req => ({
      ...req,
      bloodComponent: req.bloodComponent || 'PRBC',
      confirmedUnits: req.unitsFulfilled || 0,
      donorResponses: req.donorResponses || [],
      requestTimeline: req.requestTimeline || DEFAULT_TIMELINE,
      searchRadiusKm: req.searchRadiusKm || 25,
      isExpired: false
    }));
  });

  // Initialize donors with real-time portal attributes
  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem(DONORS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_DONORS.map(d => ({
      ...d,
      availabilityStatus: d.availabilityStatus || 'AVAILABLE',
      emergencyAlertsEnabled: d.emergencyAlertsEnabled ?? true,
      eligibilityStatus: d.eligibilityStatus || (d.isEligible ? 'ELIGIBLE' : 'TEMPORARILY_INELIGIBLE'),
      nextEligibleDate: d.nextEligibleDate || '2026-06-10',
      acceptedRequests: d.acceptedRequests || []
    }));
  });

  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(() => {
    const saved = localStorage.getItem(BLOODBANKS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_BLOOD_BANKS;
  });

  const [patientVerifications, setPatientVerifications] = useState<PatientVerification[]>(() => {
    const saved = localStorage.getItem(VERIFICATIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_PATIENT_VERIFICATIONS;
  });

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

  // Hospital generates Patient Verification credentials (Patient ID & Code)
  const createPatientVerification = (patientName: string, bloodGroup: any, hospitalName: string): PatientVerification => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newRecord: PatientVerification = {
      id: `pv_${Date.now()}`,
      patientId: `BN-HUB-2026-${randomNum}`,
      verificationCode: randomCode,
      patientName,
      bloodGroup,
      hospitalName,
      expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      isActive: true
    };

    setPatientVerifications(prev => [newRecord, ...prev]);
    showToast(`Patient Verification record created! Patient ID: ${newRecord.patientId}, Code: ${newRecord.verificationCode}`);
    return newRecord;
  };

  // Requester verifies Patient ID & Code
  const verifyPatientCredentials = (patientId: string, code: string, bloodGroup: string) => {
    const record = patientVerifications.find(
      p => p.patientId.toUpperCase().trim() === patientId.toUpperCase().trim() && p.isActive
    );

    if (!record) {
      return { isValid: false, message: "Patient ID not found or expired. Please contact hospital desk." };
    }

    if (record.verificationCode.trim() !== code.trim()) {
      return { isValid: false, message: "Verification Code is incorrect. Please re-check hospital slip." };
    }

    return { isValid: true, message: "Patient verified successfully.", record };
  };

  // Create Emergency Request with real-time matching & notifications
  const createEmergencyRequest = (newReq: Partial<EmergencyRequest>) => {
    const isPreVerified = newReq.isVerifiedByHospital ?? true;
    const channels: RequestChannel[] = newReq.selectedChannels?.length ? newReq.selectedChannels : ['hospital', 'donors', 'bloodbank'];

    const reqId = `BR-${Math.floor(1000 + Math.random() * 9000)}`;
    const reqLat = newReq.lat || 15.3647;
    const reqLng = newReq.lng || 75.124;

    // Run backend smart donor matching algorithm to identify eligible donors
    const matchedDonorResults = calculateSmartDonorMatches(
      donors,
      (newReq.bloodGroup as BloodGroup) || 'O+',
      reqLat,
      reqLng,
      50,
      newReq.urgency || 'CRITICAL'
    );

    const matchScoresMap: Record<string, number> = {};
    matchedDonorResults.forEach(res => {
      matchScoresMap[res.donor.id] = res.matchScore;
    });

    const initialTimeline: TimelineStep[] = [
      { id: 'step_created', label: 'Request Created', status: 'completed', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: 'Emergency request registered' },
      { id: 'step_searching', label: 'Searching', status: 'completed', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: `Matching ${matchedDonorResults.length} eligible donors & nearby facilities` },
      { id: 'step_donors_notified', label: 'Donors Notified', status: 'current', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: `Alert dispatched to ${matchedDonorResults.length} eligible donors` },
      { id: 'step_hospital_notified', label: 'Hospital/Blood Bank Notified', status: 'current', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), description: 'Live inventory stock checked' },
      { id: 'step_response_received', label: 'Response Received', status: 'pending', description: 'Awaiting donor / facility acceptances' },
      { id: 'step_blood_reserved', label: 'Blood Reserved', status: 'pending', description: 'Units allocation confirmation' },
      { id: 'step_blood_issued', label: 'Blood Collected / Issued', status: 'pending', description: 'Transfusion coordination active' },
      { id: 'step_completed', label: 'Completed', status: 'pending', description: 'Request fully fulfilled' }
    ];

    const initialChannelStatuses: ChannelStatuses = {
      hospitalStatus: channels.includes('hospital') ? 'PENDING' : undefined,
      donorStatus: channels.includes('donors') ? 'SEARCHING' : undefined,
      bloodBankStatus: channels.includes('bloodbank') ? 'PENDING' : undefined
    };

    const created: EmergencyRequest = {
      id: reqId,
      patientName: newReq.patientName || "Emergency Patient",
      patientAge: newReq.patientAge || 35,
      patientGender: newReq.patientGender || "Male",
      patientId: newReq.patientId || `BN-HUB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      verificationCode: newReq.verificationCode || `${Math.floor(100000 + Math.random() * 900000)}`,
      isVerifiedByHospital: isPreVerified,
      selectedChannels: channels,
      channelStatuses: initialChannelStatuses,
      bloodGroup: (newReq.bloodGroup as BloodGroup) || "O+",
      bloodComponent: newReq.bloodComponent || "PRBC",
      unitsNeeded: newReq.unitsNeeded || 2,
      unitsFulfilled: 0,
      confirmedUnits: 0,
      urgency: newReq.urgency || "CRITICAL",
      hospitalName: newReq.hospitalName || "KIMS Teaching Hospital",
      city: newReq.city || "Hubballi",
      state: "Karnataka",
      contactPerson: newReq.contactPerson || "Attendant",
      maskedPhone: "+91 98*** **412",
      contactPhone: newReq.contactPhone || "+91 98765 43210",
      requestedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      requiredDate: newReq.requiredDate || new Date().toISOString().split('T')[0],
      requiredTime: newReq.requiredTime || "Within 2 Hours",
      reason: newReq.reason || "Urgent transfusion requirement",
      additionalNotes: newReq.additionalNotes || "Patient in urgent need of blood.",
      status: "SEARCHING_FOR_BLOOD",
      aiUrgencyScore: newReq.urgency === "CRITICAL" ? 98 : 85,
      decayScore: 95,
      trendingReason: `Real-time search active across ${matchedDonorResults.length} eligible donors`,
      sharesCount: 1,
      matchedDonorsCount: matchedDonorResults.length,
      lat: reqLat,
      lng: reqLng,
      donorResponses: [],
      requestTimeline: initialTimeline,
      searchRadiusKm: 25,
      isExpired: false,
      matchScores: matchScoresMap,
      requestedDonorsList: matchedDonorResults.map(r => r.donor.id)
    };

    setRequests(prev => [created, ...prev]);

    // Send notifications to eligible matched donors
    const newNotifications: NotificationItem[] = matchedDonorResults.map(res => ({
      id: `notif_donor_${res.donor.id}_${Date.now()}`,
      title: `🚨 BLOOD REQUEST: ${created.bloodGroup} ${created.bloodComponent}`,
      message: `${created.unitsNeeded} Units needed for ${created.patientName} at ${created.hospitalName} (${res.distanceKm} km away). Required ${created.requiredTime}.`,
      time: "Just now",
      type: "urgent",
      read: false,
      requestId: created.id
    }));

    // Add requester notification
    newNotifications.unshift({
      id: `notif_req_${Date.now()}`,
      title: `Request ${created.id} Created`,
      message: `Searching for ${created.bloodGroup} ${created.bloodComponent} (${created.unitsNeeded} Units). ${matchedDonorResults.length} eligible donors notified.`,
      time: "Just now",
      type: "info",
      read: false,
      requestId: created.id
    });

    setNotifications(prev => [...newNotifications, ...prev]);
    showToast(`Blood Request ${created.id} created! Real-time search dispatched to ${matchedDonorResults.length} eligible donors.`);
  };

  // Requester sends direct emergency alert to a specific donor
  const sendDirectRequestToDonor = (requestId: string, donorId: string) => {
    const req = requests.find(r => r.id === requestId);
    const donorObj = donors.find(d => d.id === donorId);
    if (!req || !donorObj) return;

    // Push notification to donor
    setNotifications(prev => [
      {
        id: `notif_direct_${Date.now()}`,
        title: `🚨 DIRECT BLOOD REQUEST: ${req.bloodGroup} ${req.bloodComponent || 'PRBC'}`,
        message: `Requester sent you an emergency blood alert! ${req.unitsNeeded} Units needed at ${req.hospitalName}.`,
        time: "Just now",
        type: "urgent",
        read: false,
        requestId: req.id
      },
      ...prev
    ]);

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const list = r.requestedDonorsList || [];
          return {
            ...r,
            requestedDonorsList: list.includes(donorId) ? list : [...list, donorId]
          };
        }
        return r;
      })
    );

    showToast(`Real-time emergency notification dispatched to ${donorObj.name}!`);
  };

  // Donor accepts or declines a request in real time
  const donorRespondToRequest = (requestId: string, donorId: string, responseStatus: 'ACCEPTED' | 'DECLINED') => {
    const donorObj = donors.find(d => d.id === donorId) || donors[0];

    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const existingResponses = req.donorResponses || [];
          // Avoid duplicate responses from same donor
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

          // Update timeline
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

    // Update donor accepted requests list
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
    }

    // Push Notification to Requester
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

    showToast(responseStatus === 'ACCEPTED' ? `You accepted request ${requestId}! Requester notified automatically.` : `Declined request ${requestId}.`);
  };

  // Toggle donor availability
  const toggleDonorAvailability = (
    donorId: string,
    status: 'AVAILABLE' | 'NOT AVAILABLE' | 'TEMPORARILY UNAVAILABLE',
    emergencyAlerts?: boolean
  ) => {
    setDonors(prev =>
      prev.map(d => {
        if (d.id === donorId) {
          const isAvail = status === 'AVAILABLE';
          return {
            ...d,
            availabilityStatus: status,
            isAvailable: isAvail,
            emergencyAlertsEnabled: emergencyAlerts !== undefined ? emergencyAlerts : d.emergencyAlertsEnabled
          };
        }
        return d;
      })
    );
    showToast(`Donor availability updated to ${status}.`);
  };

  // Cancel Emergency Request
  const cancelEmergencyRequest = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = (r.requestTimeline || DEFAULT_TIMELINE).map(s => ({
            ...s,
            status: s.id === 'step_completed' ? ('pending' as const) : s.status
          }));

          return {
            ...r,
            status: 'CANCELLED',
            trendingReason: `Cancelled: ${reason || 'Cancelled by requester'}`,
            requestTimeline: updatedTimeline
          };
        }
        return r;
      })
    );

    setNotifications(prev => [
      {
        id: `notif_cancel_${Date.now()}`,
        title: `Request ${requestId} Cancelled`,
        message: `Blood request ${requestId} was cancelled.`,
        time: "Just now",
        type: "info",
        read: false,
        requestId
      },
      ...prev
    ]);

    showToast(`Request ${requestId} cancelled.`);
  };

  // Blood Bank Approves Stock Reservation
  const approveBloodBankReservation = (requestId: string, bankId: string) => {
    const matchedBank = bloodBanks.find(b => b.id === bankId) || bloodBanks[0];
    
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Stock Reserved! ${r.unitsNeeded} units of ${r.bloodGroup} reserved at ${matchedBank.name}.`);
          return {
            ...r,
            status: "COMPLETED",
            fulfilledChannel: 'bloodbank',
            unitsFulfilled: r.unitsNeeded,
            channelStatuses: {
              hospitalStatus: r.channelStatuses?.hospitalStatus ? 'CANCELLED' : undefined,
              donorStatus: r.channelStatuses?.donorStatus ? 'CANCELLED' : undefined,
              bloodBankStatus: 'RESERVED'
            },
            trendingReason: `Fulfilled via Blood Bank Stock Reservation (${matchedBank.name})`
          };
        }
        return r;
      })
    );

    // Reserve stock from Blood Bank inventory
    setBloodBanks(prev =>
      prev.map(bank => {
        if (bank.id === bankId) {
          return {
            ...bank,
            inventory: bank.inventory.map(item =>
              item.group === "O-" ? { ...item, units: Math.max(0, item.units - 1) } : item
            )
          };
        }
        return bank;
      })
    );
  };

  const approveRequestByHospital = (requestId: string, notes?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Request approved by hospital! Matching algorithms activated for ${r.bloodGroup} donors.`);
          return {
            ...r,
            status: "VERIFIED_SEARCHING_DONORS",
            channelStatuses: {
              ...r.channelStatuses,
              hospitalStatus: 'APPROVED'
            },
            hospitalNotes: notes || "Approved by Hospital Blood Desk.",
            trendingReason: "Hospital Verified • Matching Donors Search Active"
          };
        }
        return r;
      })
    );
  };

  const rejectRequestByHospital = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Request rejected by hospital.`);
          return {
            ...r,
            status: "REJECTED",
            channelStatuses: {
              ...r.channelStatuses,
              hospitalStatus: 'REJECTED'
            },
            hospitalNotes: reason || "Incomplete patient documentation."
          };
        }
        return r;
      })
    );
  };

  const donorAcceptRequest = (requestId: string, donorId: string) => {
    donorRespondToRequest(requestId, donorId, 'ACCEPTED');
  };

  const donorDeclineRequest = (requestId: string, donorId: string) => {
    donorRespondToRequest(requestId, donorId, 'DECLINED');
  };

  const scheduleDonationAppointment = (requestId: string, date: string, time: string, venue: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Appointment scheduled at ${venue} on ${date} ${time}!`);
          return {
            ...r,
            status: "APPOINTMENT_SCHEDULED",
            appointmentDetails: {
              date,
              time,
              venue,
              assignedDonorName: r.assignedDonorName || "Dr. Ananya Sharma"
            }
          };
        }
        return r;
      })
    );
  };

  const markDonationCompleted = (requestId: string, donorId?: string) => {
    const targetDonorId = donorId || "usr_donor_001";
    
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const completedTimeline = (r.requestTimeline || DEFAULT_TIMELINE).map(s => ({ ...s, status: 'completed' as const }));
          return {
            ...r,
            status: "COMPLETED",
            fulfilledChannel: 'donors',
            unitsFulfilled: r.unitsNeeded,
            confirmedUnits: r.unitsNeeded,
            requestTimeline: completedTimeline,
            trendingReason: "Donation Completed • Verified by Hospital"
          };
        }
        return r;
      })
    );

    // Update Donor Profile Stats
    setDonors(prev =>
      prev.map(d => {
        if (d.id === targetDonorId) {
          const todayStr = new Date().toISOString().split('T')[0];
          const nextEligible = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];
          return {
            ...d,
            totalDonations: d.totalDonations + 1,
            lastDonationDate: todayStr,
            nextEligibleDate: nextEligible,
            points: d.points + 250,
            eligibilityStatus: 'TEMPORARILY_INELIGIBLE',
            eligibilityReason: `Donated on ${todayStr}. Next eligible date is ${nextEligible}.`
          };
        }
        return d;
      })
    );

    // Push notification to requester and donor
    setNotifications(prev => [
      {
        id: `notif_comp_${Date.now()}`,
        title: "🎉 Donation Completed!",
        message: `Blood donation completed for request ${requestId}. Verified by Hospital Blood Desk. +250 Points awarded!`,
        time: "Just now",
        type: "success",
        read: false,
        requestId
      },
      ...prev
    ]);

    showToast(`Donation completed & verified by hospital! Donor awarded +250 pts.`);
  };

  const updateInventoryStock = (bankId: string, group: string, change: number) => {
    let newlyAvailable = false;
    let bankName = "";

    setBloodBanks(prev =>
      prev.map(bank => {
        if (bank.id === bankId) {
          bankName = bank.name;
          return {
            ...bank,
            inventory: bank.inventory.map(item => {
              if (item.group === group) {
                const prevUnits = item.units;
                const updated = Math.max(0, item.units + change);
                if (prevUnits === 0 && updated > 0) {
                  newlyAvailable = true;
                }
                return { ...item, units: updated, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
              }
              return item;
            })
          };
        }
        return bank;
      })
    );

    // If stock became available, notify active requesters searching for this blood group
    if (newlyAvailable || change > 0) {
      const activeMatchingReqs = requests.filter(r => r.bloodGroup === group && r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
      
      if (activeMatchingReqs.length > 0) {
        setNotifications(prev => [
          {
            id: `notif_stock_${Date.now()}`,
            title: `🔔 NEW BLOOD AVAILABLE: ${group}`,
            message: `${group} stock updated at ${bankName}. Live stock available for immediate reservation!`,
            time: "Just now",
            type: "success",
            read: false
          },
          ...prev
        ]);
        showToast(`🔔 NEW BLOOD AVAILABLE: ${group} stock updated at ${bankName}! Requesters notified in real time.`);
      } else {
        showToast(`Inventory updated: ${group} stock at ${bankName} changed by ${change > 0 ? '+' : ''}${change}.`);
      }
    }
  };

  const toggleCampRSVP = (campId: string) => {
    setCamps(prev =>
      prev.map(camp => {
        if (camp.id === campId) {
          const isRSVP = camp.isUserRegistered;
          showToast(isRSVP ? `RSVP cancelled for ${camp.title}` : `RSVP confirmed for ${camp.title}!`);
          return {
            ...camp,
            isUserRegistered: !isRSVP,
            registeredDonorsCount: isRSVP ? camp.registeredDonorsCount - 1 : camp.registeredDonorsCount + 1
          };
        }
        return camp;
      })
    );
  };

  const toggleCircleJoin = (circleId: string) => {
    setGroupCircles(prev =>
      prev.map(c => {
        if (c.id === circleId) {
          const isJoined = c.isUserMember;
          showToast(isJoined ? `Left circle ${c.name}` : `Joined circle ${c.name}!`);
          return {
            ...c,
            isUserMember: !isJoined,
            membersCount: isJoined ? c.membersCount - 1 : c.membersCount + 1
          };
        }
        return c;
      })
    );
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
        donorRespondToRequest,
        toggleDonorAvailability,
        patientVerifications,
        createPatientVerification,
        verifyPatientCredentials,
        approveBloodBankReservation,
        approveRequestByHospital,
        rejectRequestByHospital,
        donorAcceptRequest,
        donorDeclineRequest,
        scheduleDonationAppointment,
        markDonationCompleted,
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
        setActiveCorporateImpactModal
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
