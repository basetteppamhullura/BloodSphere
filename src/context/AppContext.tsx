import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PatientVerification
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

interface AppContextType {
  activePage: PageTab;
  navigateTo: (tab: PageTab) => void;
  isLoading: boolean;
  requests: EmergencyRequest[];
  createEmergencyRequest: (req: Partial<EmergencyRequest>) => void;
  
  // Patient Verification API
  patientVerifications: PatientVerification[];
  createPatientVerification: (patientName: string, bloodGroup: any, hospitalName: string) => PatientVerification;
  verifyPatientCredentials: (patientId: string, code: string, bloodGroup: string) => { isValid: boolean; message: string; record?: PatientVerification };

  // Workflow Phase Handlers
  approveRequestByHospital: (requestId: string, notes?: string) => void;
  rejectRequestByHospital: (requestId: string, reason?: string) => void;
  donorAcceptRequest: (requestId: string, donorId: string) => void;
  donorDeclineRequest: (requestId: string, donorId: string) => void;
  scheduleDonationAppointment: (requestId: string, date: string, time: string, venue: string) => void;
  markDonationCompleted: (requestId: string) => void;

  donors: Donor[];
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
const VERIFICATIONS_STORAGE_KEY = 'bloodsphere_verifications_data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageTab>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [requests, setRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_EMERGENCY_REQUESTS;
      }
    }
    return MOCK_EMERGENCY_REQUESTS;
  });

  const [patientVerifications, setPatientVerifications] = useState<PatientVerification[]>(() => {
    const saved = localStorage.getItem(VERIFICATIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_PATIENT_VERIFICATIONS;
      }
    }
    return MOCK_PATIENT_VERIFICATIONS;
  });

  const [donors] = useState<Donor[]>(MOCK_DONORS);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(MOCK_BLOOD_BANKS);
  const [camps, setCamps] = useState<DonationCamp[]>(MOCK_CAMPS);
  const [groupCircles, setGroupCircles] = useState<GroupCircle[]>(MOCK_GROUP_CIRCLES);
  const [interCityTransfers] = useState<InterCityTransfer[]>(MOCK_INTERCITY_TRANSFERS);
  const [leaderboard] = useState(MOCK_LEADERBOARD);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [activeSmartMatchModal, setActiveSmartMatchModal] = useState<EmergencyRequest | null>(null);
  const [activeEmergencyPostModal, setActiveEmergencyPostModal] = useState<boolean>(false);
  const [activeCertificateModal, setActiveCertificateModal] = useState<any | null>(null);
  const [activeChatModal, setActiveChatModal] = useState<{ request: EmergencyRequest; donor: Donor } | null>(null);
  const [activeHealthPassportModal, setActiveHealthPassportModal] = useState<boolean>(false);
  const [activeCorporateImpactModal, setActiveCorporateImpactModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(patientVerifications));
  }, [patientVerifications]);

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

  // Requester creates request (Bypasses manual hospital approval if verified)
  const createEmergencyRequest = (newReq: Partial<EmergencyRequest>) => {
    const isPreVerified = newReq.isVerifiedByHospital ?? true;

    const created: EmergencyRequest = {
      id: `req_${Date.now()}`,
      patientName: newReq.patientName || "Emergency Patient",
      patientAge: newReq.patientAge,
      patientGender: newReq.patientGender,
      patientId: newReq.patientId || "BN-HUB-2026-00852",
      verificationCode: newReq.verificationCode || "739241",
      isVerifiedByHospital: isPreVerified,
      bloodGroup: newReq.bloodGroup || "O-",
      bloodComponent: newReq.bloodComponent || "Whole Blood",
      unitsNeeded: newReq.unitsNeeded || 1,
      unitsFulfilled: 0,
      urgency: newReq.urgency || "CRITICAL",
      hospitalName: newReq.hospitalName || "KIMS Teaching Hospital",
      city: newReq.city || "Hubballi",
      state: "Karnataka",
      contactPerson: newReq.contactPerson || "Attendant",
      maskedPhone: "+91 98*** **412",
      contactPhone: newReq.contactPhone || "+91 98765 43210",
      requestedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      requiredDate: newReq.requiredDate || new Date().toISOString().split('T')[0],
      requiredTime: newReq.requiredTime || "10:00 AM",
      reason: newReq.reason || "Urgent medical transfusion requirement",
      additionalNotes: newReq.additionalNotes || "Patient requires urgent blood assistance.",
      status: isPreVerified ? "VERIFIED_SEARCHING_DONORS" : "PENDING_HOSPITAL_APPROVAL",
      aiUrgencyScore: newReq.urgency === "CRITICAL" ? 98 : 84,
      decayScore: 95,
      trendingReason: isPreVerified ? "Patient Verified • Searching Nearby Donors" : "Pending Hospital Verification",
      sharesCount: 1,
      matchedDonorsCount: 4,
      lat: 15.3688,
      lng: 75.1274
    };

    setRequests(prev => [created, ...prev]);
    showToast(
      isPreVerified
        ? `Patient Verified! Request active — instant donor matching initiated for ${created.bloodGroup}.`
        : `Request submitted to ${created.hospitalName}.`
    );
  };

  // Step 2: Hospital Approves Request
  const approveRequestByHospital = (requestId: string, notes?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Request approved by hospital! Matching algorithms activated for ${r.bloodGroup} donors.`);
          return {
            ...r,
            status: "VERIFIED_SEARCHING_DONORS",
            hospitalNotes: notes || "Approved by Hospital Blood Desk.",
            trendingReason: "Hospital Verified • Matching Donors Search Active"
          };
        }
        return r;
      })
    );
  };

  // Step 2: Hospital Rejects Request
  const rejectRequestByHospital = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Request rejected by hospital.`);
          return {
            ...r,
            status: "REJECTED",
            hospitalNotes: reason || "Incomplete patient documentation."
          };
        }
        return r;
      })
    );
  };

  // Step 4/5: Donor Accepts Request
  const donorAcceptRequest = (requestId: string, donorId: string) => {
    const donorObj = donors.find(d => d.id === donorId) || donors[0];
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Donor ${donorObj.name} accepted! Requester and Hospital notified.`);
          return {
            ...r,
            status: "DONOR_CONFIRMED",
            assignedDonorId: donorObj.id,
            assignedDonorName: donorObj.name
          };
        }
        return r;
      })
    );

    // Push Notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: "✅ Donor Confirmed!",
        message: `${donorObj.name} accepted request for patient. Hospital scheduling appointment.`,
        time: "Just now",
        type: "success",
        read: false
      },
      ...prev
    ]);
  };

  // Step 4/5: Donor Declines Request (Radius Auto-Escalation)
  const donorDeclineRequest = (requestId: string, donorId: string) => {
    showToast(`Donor declined. Radius escalated (5km → 10km → 25km → 50km) searching next closest donor...`);
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            aiUrgencyScore: Math.min(r.aiUrgencyScore + 5, 99)
          };
        }
        return r;
      })
    );
  };

  // Step 6: Hospital Schedules Appointment
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

  // Step 7: Mark Donation Completed
  const markDonationCompleted = (requestId: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Donation completed! +250 reward points awarded to donor & stock updated.`);
          return {
            ...r,
            status: "COMPLETED",
            unitsFulfilled: r.unitsNeeded
          };
        }
        return r;
      })
    );

    // Auto-update regional blood bank inventory stock
    setBloodBanks(prev =>
      prev.map(bank => ({
        ...bank,
        inventory: bank.inventory.map(item =>
          item.group === "O-" ? { ...item, units: item.units + 1 } : item
        )
      }))
    );
  };

  const updateInventoryStock = (bankId: string, group: string, change: number) => {
    setBloodBanks(prev =>
      prev.map(bank => {
        if (bank.id === bankId) {
          return {
            ...bank,
            inventory: bank.inventory.map(item => {
              if (item.group === group) {
                const updated = Math.max(0, item.units + change);
                showToast(`Inventory updated: ${group} stock is now ${updated} units.`);
                return { ...item, units: updated };
              }
              return item;
            })
          };
        }
        return bank;
      })
    );
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
        patientVerifications,
        createPatientVerification,
        verifyPatientCredentials,
        approveRequestByHospital,
        rejectRequestByHospital,
        donorAcceptRequest,
        donorDeclineRequest,
        scheduleDonationAppointment,
        markDonationCompleted,
        donors,
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
