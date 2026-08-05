import React, { createContext, useContext, useState } from 'react';
import {
  PageTab,
  EmergencyRequest,
  Donor,
  BloodBank,
  DonationCamp,
  LeaderboardItem,
  NotificationItem,
  GroupCircle,
  InterCityTransfer
} from '../types';
import {
  MOCK_EMERGENCY_REQUESTS,
  MOCK_DONORS,
  MOCK_BLOOD_BANKS,
  MOCK_CAMPS,
  MOCK_LEADERBOARD,
  MOCK_NOTIFICATIONS,
  MOCK_GROUP_CIRCLES,
  MOCK_INTERCITY_TRANSFERS
} from '../data/mockData.ts';

interface AppContextType {
  activePage: PageTab;
  navigateTo: (tab: PageTab) => void;
  isLoading: boolean;
  requests: EmergencyRequest[];
  createEmergencyRequest: (req: Partial<EmergencyRequest>) => void;
  
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageTab>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [requests, setRequests] = useState<EmergencyRequest[]>(MOCK_EMERGENCY_REQUESTS);
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

  // Step 1: Requester creates request
  const createEmergencyRequest = (newReq: Partial<EmergencyRequest>) => {
    const created: EmergencyRequest = {
      id: `req_${Date.now()}`,
      patientName: newReq.patientName || "Emergency Patient",
      bloodGroup: newReq.bloodGroup || "O-",
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
      reason: newReq.reason || "Urgent medical transfusion requirement",
      additionalNotes: newReq.additionalNotes || "Patient requires urgent blood assistance.",
      status: "PENDING_HOSPITAL_APPROVAL", // Initial Step 1 Status
      aiUrgencyScore: newReq.urgency === "CRITICAL" ? 98 : 84,
      decayScore: 95,
      trendingReason: "Pending Hospital Verification",
      sharesCount: 1,
      matchedDonorsCount: 4,
      lat: 15.3688,
      lng: 75.1274
    };

    setRequests(prev => [created, ...prev]);
    showToast(`Request submitted! Sent to ${created.hospitalName} for hospital verification.`);
  };

  // Step 2: Hospital Approves Request
  const approveRequestByHospital = (requestId: string, notes?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          showToast(`Request approved by hospital! Matching algorithms activated for ${r.bloodGroup} donors.`);
          return {
            ...r,
            status: "APPROVED",
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
        read: false,
        requestId
      },
      ...prev
    ]);
  };

  // Step 4: Donor Declines Request -> Auto-notifies next donor
  const donorDeclineRequest = (requestId: string, donorId: string) => {
    showToast(`Donor declined. Escalation queue auto-notifying next tier donor.`);
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: "⚡ Auto-Escalation Active",
        message: `Donor declined. Escalation engine notified next Tier 2 matching donor.`,
        time: "Just now",
        read: false,
        requestId
      },
      ...prev
    ]);
  };

  // Step 6: Hospital Schedules Appointment
  const scheduleDonationAppointment = (requestId: string, date: string, time: string, venue: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const donorName = r.assignedDonorName || "Dr. Ananya Sharma";
          showToast(`Appointment scheduled for ${date} at ${time}!`);
          return {
            ...r,
            status: "APPOINTMENT_SCHEDULED",
            appointmentDetails: {
              date,
              time,
              venue: venue || `${r.hospitalName} Blood Bank Unit`,
              assignedDonorId: r.assignedDonorId || "usr_donor_001",
              assignedDonorName: donorName,
              assignedDonorPhone: "+91 98765 43210"
            }
          };
        }
        return r;
      })
    );
  };

  // Step 7: Mark Donation Completed
  const markDonationCompleted = (requestId: string) => {
    let targetReq: EmergencyRequest | undefined;
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          targetReq = r;
          showToast(`🎉 Donation completed! Awarded +250 pts, certificate generated, and inventory stock updated!`);
          return {
            ...r,
            status: "COMPLETED",
            unitsFulfilled: r.unitsNeeded
          };
        }
        return r;
      })
    );

    // Auto-update Blood Inventory stock (+units)
    if (targetReq) {
      const hospitalName = targetReq.hospitalName;
      setBloodBanks(prevBanks =>
        prevBanks.map(bank => {
          if (bank.name.toLowerCase().includes(hospitalName.toLowerCase()) || bank.id === 'bb_1') {
            const updatedInv = bank.inventory.map(item => {
              if (item.group === targetReq?.bloodGroup) {
                return { ...item, units: item.units + (targetReq?.unitsNeeded || 1) };
              }
              return item;
            });
            return { ...bank, inventory: updatedInv };
          }
          return bank;
        })
      );
    }
  };

  const toggleCampRSVP = (campId: string) => {
    setCamps(prev =>
      prev.map(c => {
        if (c.id === campId) {
          const isJoined = !c.isJoined;
          showToast(isJoined ? `RSVP Confirmed for ${c.title}!` : `RSVP Cancelled for ${c.title}`);
          return {
            ...c,
            isJoined,
            rsvpsCount: isJoined ? c.rsvpsCount + 1 : c.rsvpsCount - 1
          };
        }
        return c;
      })
    );
  };

  const toggleCircleJoin = (circleId: string) => {
    setGroupCircles(prev =>
      prev.map(cir => {
        if (cir.id === circleId) {
          const joined = !cir.joined;
          showToast(joined ? `Joined ${cir.name}!` : `Left ${cir.name}`);
          return { ...cir, joined, membersCount: joined ? cir.membersCount + 1 : cir.membersCount - 1 };
        }
        return cir;
      })
    );
  };

  const updateInventoryStock = (bankId: string, group: string, change: number) => {
    setBloodBanks(prev =>
      prev.map(bank => {
        if (bank.id === bankId) {
          const updatedInv = bank.inventory.map(item => {
            if (item.group === group) {
              const newUnits = Math.max(0, item.units + change);
              let newStatus: 'Optimal' | 'Adequate' | 'Low' | 'CRITICAL' = 'Optimal';
              if (newUnits < item.minThreshold) newStatus = 'CRITICAL';
              else if (newUnits < item.minThreshold + 5) newStatus = 'Low';
              else newStatus = 'Adequate';
              return { ...item, units: newUnits, status: newStatus };
            }
            return item;
          });
          showToast(`Updated ${group} stock at ${bank.name}`);
          return { ...bank, inventory: updatedInv };
        }
        return bank;
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
