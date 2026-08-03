import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USER_PROFILES,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_DONORS,
  INITIAL_BLOOD_BANK_INVENTORY,
  INITIAL_CAMPS,
  CITY_SHORTAGE_HEATMAP,
  LEADERBOARD_DATA,
  SOCIAL_PROOF_FEED
} from '../data/mockData';
import { rankMatchedDonors, predictEligibility } from '../services/aiEngine';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Active Role state: 'donor', 'requester', 'hospital', 'admin'
  const [currentRole, setCurrentRole] = useState('donor');
  const [userProfiles, setUserProfiles] = useState(INITIAL_USER_PROFILES);

  // Main Entities State
  const [requests, setRequests] = useState(INITIAL_EMERGENCY_REQUESTS);
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [inventory, setInventory] = useState(INITIAL_BLOOD_BANK_INVENTORY);
  const [camps, setCamps] = useState(INITIAL_CAMPS);
  const [cityShortages, setCityShortages] = useState(CITY_SHORTAGE_HEATMAP);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD_DATA);
  const [socialFeed, setSocialFeed] = useState(SOCIAL_PROOF_FEED);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: "notif_1",
      title: "🚨 Urgent Blood Alert",
      message: "Critical O- blood needed at KIMS Hospital Hubballi (ICU Bed 14). You are a 98% matched donor!",
      time: "10m ago",
      read: false,
      requestId: "req_101"
    },
    {
      id: "notif_2",
      title: "🏆 Badge Earned!",
      message: "Congratulations! You unlocked the '3x Donor 2026' badge.",
      time: "2h ago",
      read: true
    }
  ]);

  // Active Modal States
  const [activeChatModal, setActiveChatModal] = useState(null); // { request, donor }
  const [activeCertificateModal, setActiveCertificateModal] = useState(null); // donation record
  const [activeSmartMatchModal, setActiveSmartMatchModal] = useState(null); // request object
  const [activeAIPostModal, setActiveAIPostModal] = useState(false);
  const [activeAIChatbotDrawer, setActiveAIChatbotDrawer] = useState(false);

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Switch Active User Role
  const switchRole = (roleKey) => {
    setCurrentRole(roleKey);
    addToastNotification(`Switched role view to ${roleKey.toUpperCase()}`);
  };

  // Create Emergency Request
  const createEmergencyRequest = (newReq) => {
    const formattedReq = {
      id: `req_${Date.now()}`,
      patientName: newReq.patientName || "Emergency Patient",
      bloodGroup: newReq.bloodGroup || "O-",
      unitsNeeded: parseInt(newReq.unitsNeeded || 1, 10),
      unitsFulfilled: 0,
      urgency: newReq.urgency || "CRITICAL",
      hospitalName: newReq.hospitalName || "City Hospital",
      city: newReq.city || "Hubballi",
      state: "Karnataka",
      contactPerson: newReq.contactPerson || "Attendant",
      maskedPhone: "+91 98*** **" + Math.floor(100 + Math.random() * 900),
      requestedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      reason: newReq.reason || "Urgent transfusion required",
      status: "ACTIVE",
      aiUrgencyScore: newReq.urgency === "CRITICAL" ? 98 : 85,
      sharesCount: 1,
      matchedDonorsCount: 5,
      lat: 15.3688,
      lng: 75.1274
    };

    setRequests(prev => [formattedReq, ...prev]);

    // Send simulated high priority notification to compatible donors
    const matched = rankMatchedDonors(formattedReq, donors);
    if (matched.length > 0) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `🚨 Emergency Alert: ${formattedReq.bloodGroup} Needed`,
          message: `${formattedReq.unitsNeeded} units of ${formattedReq.bloodGroup} blood urgently requested at ${formattedReq.hospitalName}, ${formattedReq.city}.`,
          time: "Just now",
          read: false,
          requestId: formattedReq.id
        },
        ...prev
      ]);
    }

    // Add to social proof feed
    setSocialFeed(prev => [
      `🚨 New ${formattedReq.urgency} ${formattedReq.bloodGroup} blood request posted at ${formattedReq.hospitalName} ${formattedReq.city}`,
      ...prev
    ]);

    addToastNotification(`Emergency request created! AI matched ${matched.length} nearby donors.`);
    return formattedReq;
  };

  // RSVP to Camp
  const toggleCampRSVP = (campId) => {
    setCamps(prev =>
      prev.map(c => {
        if (c.id === campId) {
          const isJoined = !c.isJoined;
          addToastNotification(isJoined ? `RSVP confirmed for ${c.title}!` : `RSVP cancelled for ${c.title}`);
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

  // Update Inventory Stock (Hospital View)
  const updateInventoryStock = (bloodGroup, changeAmount) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.group === bloodGroup) {
          const newUnits = Math.max(0, item.units + changeAmount);
          let newStatus = "Optimal";
          if (newUnits < item.minThreshold) newStatus = "CRITICAL";
          else if (newUnits < item.minThreshold + 5) newStatus = "Low";
          else newStatus = "Adequate";

          addToastNotification(`Updated ${bloodGroup} stock to ${newUnits} units (${newStatus})`);
          return {
            ...item,
            units: newUnits,
            status: newStatus
          };
        }
        return item;
      })
    );
  };

  // Respond to Emergency Request
  const respondToRequest = (request, donor) => {
    setActiveChatModal({ request, donor });
  };

  // Toast message helper
  const [toastMessage, setToastMessage] = useState(null);
  const addToastNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const currentUser = userProfiles[currentRole];

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        currentRole,
        switchRole,
        currentUser,
        requests,
        createEmergencyRequest,
        donors,
        inventory,
        updateInventoryStock,
        camps,
        toggleCampRSVP,
        cityShortages,
        leaderboard,
        socialFeed,
        notifications,
        toastMessage,
        addToastNotification,
        activeChatModal,
        setActiveChatModal,
        activeCertificateModal,
        setActiveCertificateModal,
        activeSmartMatchModal,
        setActiveSmartMatchModal,
        activeAIPostModal,
        setActiveAIPostModal,
        activeAIChatbotDrawer,
        setActiveAIChatbotDrawer,
        respondToRequest
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
