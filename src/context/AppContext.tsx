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
} from '../data/mockData';

interface AppContextType {
  activePage: PageTab;
  navigateTo: (tab: PageTab) => void;
  isLoading: boolean;
  requests: EmergencyRequest[];
  createEmergencyRequest: (req: Partial<EmergencyRequest>) => void;
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
  const [notifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

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

  const createEmergencyRequest = (newReq: Partial<EmergencyRequest>) => {
    const units = newReq.unitsNeeded || 1;
    const requiresCoSign = units > 4;

    const created: EmergencyRequest = {
      id: `req_${Date.now()}`,
      patientName: newReq.patientName || "Emergency Patient",
      bloodGroup: newReq.bloodGroup || "O-",
      unitsNeeded: units,
      unitsFulfilled: 0,
      urgency: newReq.urgency || "CRITICAL",
      hospitalName: newReq.hospitalName || "City Civil Hospital",
      city: newReq.city || "Hubballi",
      state: "Karnataka",
      contactPerson: newReq.contactPerson || "Attendant",
      maskedPhone: "+91 98*** **412",
      requestedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      reason: newReq.reason || "Urgent medical transfusion requirement",
      status: "ACTIVE",
      aiUrgencyScore: newReq.urgency === "CRITICAL" ? 98 : 84,
      decayScore: 95,
      trendingReason: requiresCoSign ? "High Unit Demand (>4 units) • Hospital Verified" : "Urgent Regional Request",
      sharesCount: 1,
      matchedDonorsCount: 6,
      requiresHospitalCoSign: requiresCoSign,
      isCoSignedByHospital: true,
      lat: 15.3688,
      lng: 75.1274
    };

    setRequests(prev => [created, ...prev]);
    showToast(requiresCoSign
      ? `Request submitted! Hospital co-sign verified for >4 units.`
      : `Emergency Request published! 6 nearby donors notified.`
    );
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
