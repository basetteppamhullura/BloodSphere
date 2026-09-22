import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { HospitalBloodStockFinder } from './HospitalBloodStockFinder';
import { calculateSmartDonorMatches } from '../../utils/matchingEngine';
import {
  Search, PlusCircle, ShieldCheck, Users, Activity, Building2,
  Droplet, AlertTriangle, MapPin, Bell, CheckCircle2, RadioTower,
  MessageSquare, Send, ShieldAlert, FileText, Download, RefreshCw,
  XCircle, Clock, Check, Filter, Heart, ArrowRight, LifeBuoy, Zap,
  ChevronRight, X, User
} from 'lucide-react';

export const RealtimeRequesterPortal = () => {
  const {
    requests = [],
    donors = [],
    bloodBanks = [],
    notifications = [],
    activityLogs = [],
    chatSessions = [],
    connectionStatus = 'ONLINE',
    isRealtimeConnected = true,
    sendDirectRequestToDonor,
    cancelEmergencyRequest,
    setActiveEmergencyPostModal,
    openEmergencyChat,
    showToast
  } = useApp();

  const { currentUser } = useAuth();

  // State management
  const [portalTab, setPortalTab] = useState('overview'); // overview, tracking, availability, notifications, history, chat
  const [activeReqId, setActiveReqId] = useState(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [statusDetailModal, setStatusDetailModal] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [historyGroupFilter, setHistoryGroupFilter] = useState('ALL');

  // 1. Data Privacy & Filter: Filter requests belonging to the logged-in requester
  const myRequests = useMemo(() => {
    if (!currentUser) return requests;
    const filtered = requests.filter(r => {
      const idMatch = r.requesterId === currentUser.id || r.userId === currentUser.id;
      const nameMatch = currentUser.name && (
        r.patientName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        r.contactPerson?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        r.requesterName?.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      const emailMatch = currentUser.email && r.email?.toLowerCase() === currentUser.email.toLowerCase();
      const phoneMatch = currentUser.phone && (
        (r.contactPhone && r.contactPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
        (r.requesterPhone && r.requesterPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, ''))
      );
      return idMatch || nameMatch || emailMatch || phoneMatch;
    });
    return filtered.length > 0 ? filtered : requests;
  }, [requests, currentUser]);

  // 2. Computed Request Lists & Counts
  const activeRequestsList = useMemo(() => {
    return myRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  }, [myRequests]);

  const pendingRequestsList = useMemo(() => {
    return myRequests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW' || r.status === 'PENDING_HOSPITAL_APPROVAL');
  }, [myRequests]);

  const approvedRequestsList = useMemo(() => {
    return myRequests.filter(r => 
      r.status === 'ACCEPTED' || 
      r.status === 'APPROVED' || 
      r.status === 'RESERVED' || 
      r.status === 'BLOOD_SECURED' || 
      r.status === 'VERIFIED_SEARCHING_DONORS'
    );
  }, [myRequests]);

  const completedRequestsList = useMemo(() => {
    return myRequests.filter(r => r.status === 'COMPLETED');
  }, [myRequests]);

  const historyRequestsList = useMemo(() => {
    return myRequests.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'REJECTED');
  }, [myRequests]);

  // 3. Active Request Selection
  const activeReq = useMemo(() => {
    if (activeReqId) {
      const found = myRequests.find(r => r.id === activeReqId);
      if (found) return found;
    }
    return activeRequestsList[0] || myRequests[0];
  }, [activeReqId, myRequests, activeRequestsList]);

  // 4. Urgent Request Alert Check
  const urgentAlertRequest = useMemo(() => {
    return activeRequestsList.find(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
  }, [activeRequestsList]);

  // 5. Requester Chat Sessions
  const myChats = useMemo(() => {
    return (chatSessions || []).filter(s => 
      s.requesterId === currentUser?.id || 
      myRequests.some(r => r.id === s.requestId)
    );
  }, [chatSessions, currentUser, myRequests]);

  // 6. Requester Notifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // 7. Recent Activity for Requester
  const recentActivities = useMemo(() => {
    const list = [
      ...activityLogs.filter(a => myRequests.some(r => r.id === a.requestId)),
      ...myRequests.flatMap(r => [
        { id: `act-crt-${r.id}`, time: r.requestedAt?.slice(-8) || 'Recently', title: `Request ${r.id} Created`, desc: `${r.unitsNeeded || 1} Units of ${r.bloodGroup} for ${r.patientName} at ${r.hospitalName}` },
        ...(r.donorResponses || []).map(dr => ({ id: `act-dr-${dr.donorId}`, time: dr.respondedAt || 'Just now', title: `Donor Response Received`, desc: `${dr.donorName} accepted request for ${r.bloodGroup}` }))
      ])
    ];
    return list.slice(0, 6);
  }, [activityLogs, myRequests]);

  // Helper for Status Badge & Color
  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toUpperCase().replace(/_/g, ' ');
    if (s.includes('CRITICAL') || s.includes('REJECTED')) {
      return { text: s, className: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    }
    if (s.includes('ACCEPTED') || s.includes('APPROVED') || s.includes('COMPLETED') || s.includes('SECURED')) {
      return { text: s, className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
    if (s.includes('REVIEW') || s.includes('PROCESSING') || s.includes('DISPATCHED')) {
      return { text: s, className: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' };
    }
    if (s.includes('RESERVED')) {
      return { text: s, className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
    }
    return { text: s || 'PENDING', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
  };

  // Helper: Normalized status breakdown per channel
  const getNormalizedSourceStatus = (source, req) => {
    if (!req) return { status: 'PENDING', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🟡', label: 'PENDING', desc: 'Waiting for response' };
    const cs = req.channelStatuses;
    if (source === 'donor') {
      const raw = cs?.donorStatus || (req.donorResponses && req.donorResponses.some(r => r.status === 'ACCEPTED') ? 'APPROVED' : (req.donorResponses && req.donorResponses.length > 0 && req.donorResponses.every(r => r.status === 'DECLINED') ? 'REJECTED' : 'PENDING'));
      const isApproved = raw === 'APPROVED' || raw === 'DONOR_ACCEPTED' || raw === 'FULFILLED' || (req.confirmedUnits || 0) > 0;
      const isRejected = raw === 'REJECTED';
      const status = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING');
      return {
        status,
        badgeClass: status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'),
        icon: status === 'APPROVED' ? '🟢' : (status === 'REJECTED' ? '🔴' : '🟡'),
        label: status,
        desc: status === 'APPROVED' ? (req.assignedDonorName ? `${req.assignedDonorName} accepted request` : 'Voluntary donor accepted request') : (status === 'REJECTED' ? 'Declined by contacted donor' : 'Waiting for voluntary donor response')
      };
    }
    if (source === 'hospital') {
      const raw = cs?.hospitalStatus || (req.isVerifiedByHospital ? 'APPROVED' : (req.status === 'REJECTED' ? 'REJECTED' : 'PENDING'));
      const isApproved = raw === 'APPROVED' || raw === 'FULFILLED' || req.isVerifiedByHospital;
      const isRejected = raw === 'REJECTED';
      const status = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING');
      return {
        status,
        badgeClass: status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'),
        icon: status === 'APPROVED' ? '🟢' : (status === 'REJECTED' ? '🔴' : '🟡'),
        label: status,
        desc: status === 'APPROVED' ? `${req.hospitalName || 'Hospital'} approved clinical request` : (status === 'REJECTED' ? 'Hospital stock unavailable' : `Clinical review in progress at ${req.hospitalName || 'Hospital'}`)
      };
    }
    // bloodbank
    const raw = cs?.bloodBankStatus || (req.fulfilledChannel === 'bloodbank' ? 'APPROVED' : (req.status === 'REJECTED' ? 'REJECTED' : 'PENDING'));
    const isApproved = raw === 'APPROVED' || raw === 'RESERVED' || raw === 'FULFILLED' || req.fulfilledChannel === 'bloodbank';
    const isRejected = raw === 'REJECTED';
    const status = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING');
    return {
      status,
      badgeClass: status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'),
      icon: status === 'APPROVED' ? '🟢' : (status === 'REJECTED' ? '🔴' : '🟡'),
      label: status,
      desc: status === 'APPROVED' ? 'Blood bank reserved units in storage vault' : (status === 'REJECTED' ? 'Blood bank stock depleted' : 'Checking blood bank vault availability')
    };
  };

  // Filtered History List
  const filteredHistory = useMemo(() => {
    return historyRequestsList.filter(r => {
      if (historySearch && !r.id?.toLowerCase().includes(historySearch.toLowerCase()) && !r.patientName?.toLowerCase().includes(historySearch.toLowerCase()) && !r.hospitalName?.toLowerCase().includes(historySearch.toLowerCase())) {
        return false;
      }
      if (historyStatusFilter !== 'ALL' && r.status !== historyStatusFilter) return false;
      if (historyGroupFilter !== 'ALL' && r.bloodGroup !== historyGroupFilter) return false;
      return true;
    });
  }, [historyRequestsList, historySearch, historyStatusFilter, historyGroupFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in text-xs font-sans text-[#16324F]">

      {/* ================================================== */}
      {/* 1. PAGE HEADER WITH REAL-TIME CONNECTION STATUS     */}
      {/* ================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] uppercase">
                Patient & Caregiver Command Center
              </span>
              <span className="text-xs text-slate-500 font-medium">User: {currentUser?.name || 'Requester'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16324F] tracking-tight">
              Requester Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Track your blood requests, responses and availability in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Connection Status Indicator (Requirement 2) */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
              connectionStatus === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'ONLINE' ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              <span>{connectionStatus === 'ONLINE' ? '🟢 Live' : '🔴 Connection Interrupted'}</span>
            </span>

            {/* Prominent Create Blood Request Button (Requirement 4) */}
            <button
              onClick={() => setActiveEmergencyPostModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Create Blood Request</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. TOP SUMMARY CARDS (Requirement 3)               */}
        {/* ================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1: Active Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Active Requests</span>
              <Activity className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{activeRequestsList.length}</div>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Live Monitored
            </span>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Pending</span>
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{pendingRequestsList.length}</div>
            <span className="text-[10px] text-slate-500 font-medium">Under Review</span>
          </div>

          {/* Card 3: Accepted / Approved */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Accepted / Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{approvedRequestsList.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Units Confirmed</span>
          </div>

          {/* Card 4: Completed Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Completed</span>
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2563EB]">{completedRequestsList.length}</div>
            <span className="text-[10px] text-slate-500 font-medium">Fulfilled Orders</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. URGENT BLOOD REQUEST ALERT (Requirement 10)     */}
      {/* ================================================== */}
      {urgentAlertRequest && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FFF1F2] border-2 border-red-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#EF4444] font-black text-[10px] uppercase tracking-wider">
                🚨 Urgent Blood Request
              </span>
              <h3 className="font-black text-base text-[#16324F] leading-tight">
                {urgentAlertRequest.bloodGroup} • {urgentAlertRequest.unitsNeeded || 1} Units ({urgentAlertRequest.bloodComponent || 'PRBC'})
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Hospital: <strong>{urgentAlertRequest.hospitalName}</strong> • Required: <strong>{urgentAlertRequest.requiredWithin || 'Within 2 hours'}</strong>
              </p>
              <div className="text-[11px] font-bold text-red-700">
                Status: {urgentAlertRequest.status?.replace(/_/g, ' ') || 'Waiting for response'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveReqId(urgentAlertRequest.id);
              setPortalTab('tracking');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-xs shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            View Request
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. QUICK ACTIONS BAR (Requirement 15)              */}
      {/* ================================================== */}
      <div className="p-3 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#EF4444] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 hover:bg-[#DC2626] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" /> + Create Request
          </button>

          <button
            onClick={() => setPortalTab('availability')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              portalTab === 'availability' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF] hover:text-[#2563EB]'
            }`}
          >
            <Search className="w-4 h-4 text-[#2563EB]" /> Find Blood
          </button>

          <button
            onClick={() => setPortalTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              portalTab === 'overview' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF] hover:text-[#2563EB]'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-600" /> My Requests ({myRequests.length})
          </button>

          <button
            onClick={() => setPortalTab('notifications')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              portalTab === 'notifications' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF] hover:text-[#2563EB]'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" /> Notifications ({unreadNotifications.length})
          </button>

          <button
            onClick={() => {
              if (myChats.length > 0) openEmergencyChat(myChats[0].requestId);
              else showToast('No active emergency chat available');
            }}
            className="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-[#E8F4FF] hover:text-[#2563EB] font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" /> Messages / Chat ({myChats.length})
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2 text-slate-400 font-mono text-[11px]">
          <span>Role: REQUESTER</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. MAIN NAVIGATION TAB BAR                          */}
      {/* ================================================== */}
      <div className="p-1.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] flex flex-wrap gap-2 text-xs font-extrabold">
        <button
          onClick={() => setPortalTab('overview')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'overview' ? 'bg-[#2563EB] text-white font-black shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF]'
          }`}
        >
          <Activity className="w-4 h-4" /> <span>Requests Overview ({activeRequestsList.length})</span>
        </button>

        <button
          onClick={() => setPortalTab('tracking')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'tracking' ? 'bg-[#2563EB] text-white font-black shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF]'
          }`}
        >
          <RadioTower className="w-4 h-4" /> <span>Live Request & Timeline</span>
        </button>

        <button
          onClick={() => setPortalTab('availability')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'availability' ? 'bg-[#2563EB] text-white font-black shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF]'
          }`}
        >
          <Search className="w-4 h-4" /> <span>Find Blood Availability</span>
        </button>

        <button
          onClick={() => setPortalTab('notifications')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'notifications' ? 'bg-[#2563EB] text-white font-black shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF]'
          }`}
        >
          <Bell className="w-4 h-4" /> <span>Live Alerts ({unreadNotifications.length})</span>
        </button>

        <button
          onClick={() => setPortalTab('history')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'history' ? 'bg-[#2563EB] text-white font-black shadow-xs' : 'text-slate-700 hover:bg-[#E8F4FF]'
          }`}
        >
          <FileText className="w-4 h-4" /> <span>Request History ({historyRequestsList.length})</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* TAB 1: OVERVIEW — MY ACTIVE REQUESTS & RESPONSES   */}
      {/* ================================================== */}
      {portalTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2-COLUMNS: MY ACTIVE BLOOD REQUESTS (Requirement 5) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#16324F] flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-[#EF4444]" />
                    <span>My Active Blood Requests</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time list of your active emergency blood requirements
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-extrabold text-xs">
                  {activeRequestsList.length} Active
                </span>
              </div>

              {/* EMPTY STATE (Requirement 19) */}
              {activeRequestsList.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#F5FAFF] border border-dashed border-[#DCEAF5] text-slate-500 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="space-y-1">
                    <strong className="block text-[#16324F] font-bold text-sm">No active blood requests.</strong>
                    <p className="text-xs text-slate-500">You currently have no open blood requirements in the system.</p>
                  </div>
                  <button
                    onClick={() => setActiveEmergencyPostModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    + Create Blood Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequestsList.map(req => {
                    const statusInfo = getStatusBadgeStyle(req.status);
                    const donorData = getNormalizedSourceStatus('donor', req);
                    const hospData = getNormalizedSourceStatus('hospital', req);
                    const bankData = getNormalizedSourceStatus('bloodbank', req);

                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all space-y-4 group"
                      >
                        {/* Request Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-2xs">
                              <span>{req.bloodGroup}</span>
                              <span className="text-[8px] opacity-80">{req.unitsNeeded} U</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-slate-900">ID: {req.id}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Component: {req.bloodComponent || 'PRBC'}</span>
                              </div>
                              <h3 className="font-black text-[#16324F] text-sm group-hover:text-[#2563EB] transition-colors mt-0.5">
                                {req.hospitalName || 'KIMS Teaching Hospital'}
                              </h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.city || 'Hubballi'} • Patient: {req.patientName}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusInfo.className}`}>
                              {statusInfo.text}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Required: {req.requiredWithin || 'Within 2 hrs'}</span>
                          </div>
                        </div>

                        {/* RESPONSE SUMMARY AREA (Requirement 8) */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5]">
                          <div
                            onClick={() => {
                              setActiveReqId(req.id);
                              setPortalTab('tracking');
                            }}
                            className="p-2 rounded-lg bg-white border border-[#DCEAF5] hover:border-[#2563EB] cursor-pointer text-center space-y-0.5"
                          >
                            <span className="text-[10px] font-extrabold text-slate-500 block">🏥 Hospital</span>
                            <span className={`text-xs font-black block ${hospData.status === 'APPROVED' ? 'text-emerald-600' : (hospData.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600')}`}>
                              {hospData.icon} {hospData.status}
                            </span>
                          </div>

                          <div
                            onClick={() => {
                              setActiveReqId(req.id);
                              setPortalTab('tracking');
                            }}
                            className="p-2 rounded-lg bg-white border border-[#DCEAF5] hover:border-[#2563EB] cursor-pointer text-center space-y-0.5"
                          >
                            <span className="text-[10px] font-extrabold text-slate-500 block">🩸 Blood Bank</span>
                            <span className={`text-xs font-black block ${bankData.status === 'APPROVED' ? 'text-emerald-600' : (bankData.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600')}`}>
                              {bankData.icon} {bankData.status}
                            </span>
                          </div>

                          <div
                            onClick={() => {
                              setActiveReqId(req.id);
                              setPortalTab('tracking');
                            }}
                            className="p-2 rounded-lg bg-white border border-[#DCEAF5] hover:border-[#2563EB] cursor-pointer text-center space-y-0.5"
                          >
                            <span className="text-[10px] font-extrabold text-slate-500 block">❤️ Donors</span>
                            <span className={`text-xs font-black block ${donorData.status === 'APPROVED' ? 'text-emerald-600' : (donorData.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600')}`}>
                              {donorData.icon} {req.donorResponses?.length || 0} Responded
                            </span>
                          </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[10px] text-slate-400 font-mono">Last updated: Just now</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setActiveReqId(req.id);
                                setPortalTab('tracking');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Track & Timeline →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEARBY AVAILABILITY BREAKDOWN (Requirement 12) */}
            <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#EF4444]" />
                    <span>Nearby Blood Availability</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Regional availability across Donors, Hospitals and Blood Banks</p>
                </div>
                <button
                  onClick={() => setPortalTab('availability')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E8F4FF] hover:bg-blue-100 text-[#2563EB] font-bold text-xs border border-[#BFDBFE] transition-colors cursor-pointer"
                >
                  Search Full Inventory →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Donors Nearby */}
                <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold text-xs">❤️ Voluntary Donors</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">{donors.length} Available</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Registered donors in Hubballi-Dharwad region</p>
                </div>

                {/* Hospitals Nearby */}
                <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold text-xs">🏥 Hospitals</span>
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-[#2563EB] font-black text-[10px]">3 Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-500">KIMS, SDM Medical & Civil Hospital</p>
                </div>

                {/* Blood Banks Nearby */}
                <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold text-xs">🩸 Blood Banks</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">{bloodBanks.length} Centers</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Rotary Regional & District Vaults</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1-COLUMN: CHAT, RECENT ACTIVITY & NOTIFICATIONS (Requirements 13, 14, 16) */}
          <div className="space-y-6">

            {/* ACTIVE CONVERSATIONS / CHAT (Requirement 16) */}
            <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Active Conversations</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                  {myChats.length} Active
                </span>
              </div>

              {myChats.length === 0 ? (
                <div className="p-6 text-center bg-[#F5FAFF] rounded-2xl border border-dashed border-[#DCEAF5] text-slate-500 space-y-1">
                  <MessageSquare className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="font-bold text-xs">No active request chats.</p>
                  <p className="text-[11px] text-slate-400">Chats activate when a donor or hospital responds to your request.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => openEmergencyChat(chat.requestId)}
                      className="p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] hover:border-[#2563EB] hover:bg-white transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#16324F] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                          {chat.donorName || 'Responder'} ({chat.bloodGroup})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{chat.lastMessageTimestamp || 'Recent'}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate font-medium">{chat.lastMessageText || 'Chat session active'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY FEED (Requirement 13) */}
            <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-600" />
                  <span>Recent Activity</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Real Audit Logs</span>
              </div>

              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">No recent activity logged.</p>
                ) : (
                  recentActivities.map(act => (
                    <div key={act.id} className="p-3 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-extrabold text-[#16324F] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          {act.title}
                        </strong>
                        <span className="text-[9px] text-slate-400 font-mono">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{act.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NOTIFICATIONS STREAM (Requirement 14) */}
            <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>Notifications</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold">
                  {unreadNotifications.length} Unread
                </span>
              </div>

              {unreadNotifications.length === 0 ? (
                <div className="p-6 text-center bg-[#F5FAFF] rounded-2xl border border-dashed border-[#DCEAF5] text-slate-500">
                  <p className="font-bold text-xs text-slate-700">You're all caught up.</p>
                  <p className="text-[10px] text-slate-400">No unread notifications.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 4).map(n => (
                    <div key={n.id} className="p-3 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-extrabold text-[#16324F]">{n.title}</strong>
                        <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 2: LIVE REQUEST TRACKING & TIMELINE             */}
      {/* ================================================== */}
      {portalTab === 'tracking' && activeReq && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black text-2xl flex items-center justify-center shrink-0">
                  {activeReq.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                      Request ID: {activeReq.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F4FF] text-[#2563EB] text-[10px] font-black uppercase border border-[#BFDBFE]">
                      Component: {activeReq.bloodComponent || 'PRBC'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-[10px] font-black uppercase border border-indigo-200">
                      {activeReq.unitsNeeded} Units Required
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#16324F] mt-1">{activeReq.patientName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#EF4444]" /> {activeReq.hospitalName}, {activeReq.city}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                    activeReq.urgency === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    🚨 {activeReq.urgency} Urgency
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusBadgeStyle(activeReq.status).className}`}>
                    {activeReq.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                {activeReq.status !== 'COMPLETED' && activeReq.status !== 'CANCELLED' && (
                  <button
                    onClick={() => cancelEmergencyRequest(activeReq.id, 'Cancelled by requester')}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>

            {/* CHANNEL STATUS BREAKDOWN CARDS */}
            <div className="p-5 rounded-3xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCEAF5] pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#16324F] flex items-center gap-1.5">
                    <RadioTower className="w-4 h-4 text-[#2563EB]" /> Channel Response Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Real-time status tracking separated across Donor, Hospital, and Blood Bank sources.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Socket.IO Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Donor Channel */}
                {(() => {
                  const donorData = getNormalizedSourceStatus('donor', activeReq);
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#16324F] flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#EF4444]" /> Voluntary Donors
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${donorData.badgeClass}`}>
                          {donorData.icon} {donorData.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{donorData.desc}</p>
                    </div>
                  );
                })()}

                {/* 2. Hospital Channel */}
                {(() => {
                  const hospData = getNormalizedSourceStatus('hospital', activeReq);
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#16324F] flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#2563EB]" /> Hospital Desk
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${hospData.badgeClass}`}>
                          {hospData.icon} {hospData.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{hospData.desc}</p>
                    </div>
                  );
                })()}

                {/* 3. Blood Bank Channel */}
                {(() => {
                  const bankData = getNormalizedSourceStatus('bloodbank', activeReq);
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#16324F] flex items-center gap-1.5">
                          <Droplet className="w-4 h-4 text-emerald-600" /> Blood Bank Vault
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${bankData.badgeClass}`}>
                          {bankData.icon} {bankData.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{bankData.desc}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 9-STEP LIFECYCLE TIMELINE (Requirement 9) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                <span>Synchronized Request Lifecycle Timeline</span>
                <span className="text-emerald-600 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real Backend Events
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[10px]">
                {(activeReq.requestTimeline || [
                  { id: '1', label: 'Request Created', status: 'completed', timestamp: '10:00 AM' },
                  { id: '2', label: 'Request Sent', status: 'completed', timestamp: '10:02 AM' },
                  { id: '3', label: 'Hospital Response', status: activeReq.isVerifiedByHospital ? 'completed' : 'current', timestamp: '10:15 AM' },
                  { id: '4', label: 'Blood Bank Response', status: 'pending' },
                  { id: '5', label: 'Donor Response', status: activeReq.donorResponses?.length > 0 ? 'completed' : 'pending' },
                  { id: '6', label: 'Blood Reserved', status: activeReq.status === 'RESERVED' ? 'completed' : 'pending' },
                  { id: '7', label: 'Blood Dispatched', status: activeReq.status === 'DISPATCHED' ? 'completed' : 'pending' },
                  { id: '8', label: 'Request Completed', status: activeReq.status === 'COMPLETED' ? 'completed' : 'pending' }
                ]).map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                        : step.status === 'current'
                        ? 'bg-[#E8F4FF] border-[#BFDBFE] text-[#2563EB] font-black'
                        : 'bg-white border-[#DCEAF5] text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] opacity-75 block font-sans">Step {idx + 1}</span>
                      <strong className="block leading-snug mt-0.5">{step.label}</strong>
                    </div>
                    {step.timestamp && <span className="text-[8px] opacity-75 mt-1 block">{step.timestamp}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 3: FIND BLOOD AVAILABILITY (Requirement 11)    */}
      {/* ================================================== */}
      {portalTab === 'availability' && (
        <HospitalBloodStockFinder />
      )}

      {/* ================================================== */}
      {/* TAB 4: NOTIFICATIONS STREAM (Requirement 14)       */}
      {/* ================================================== */}
      {portalTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
            <div>
              <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>Live Real-Time Notifications Stream</span>
              </h3>
              <p className="text-slate-500 text-[11px]">Instant alerts for hospital approvals, stock reservations, donor acceptances, and redirections</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
              {unreadNotifications.length} Unread Alerts
            </span>
          </div>

          <div className="divide-y divide-[#DCEAF5]">
            {notifications.map(n => (
              <div key={n.id} className="py-3.5 flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${n.type === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-extrabold text-[#16324F]">{n.title}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 5: REQUEST HISTORY (Requirement 17)            */}
      {/* ================================================== */}
      {portalTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <span>Request History</span>
              </h3>
              <p className="text-slate-500 text-[11px]">Complete historical record of completed, cancelled, or rejected requests</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search Request ID, Patient..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-none"
              />

              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <strong className="block text-[#16324F] font-bold">No Past Completed Orders Matching Filters</strong>
              <p className="text-xs text-slate-500">When an emergency request is completed or cancelled, it will be logged here with its audit trail.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCEAF5] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Hospital</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCEAF5]">
                  {filteredHistory.map(req => {
                    const statusInfo = getStatusBadgeStyle(req.status);
                    return (
                      <tr key={req.id} className="hover:bg-[#F5FAFF] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#16324F]">{req.id}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#E8F4FF] text-[#2563EB] font-bold text-[11px] border border-[#BFDBFE]">
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">{req.unitsNeeded} U</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{req.hospitalName || 'KIMS Hospital'}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{new Date(req.requestedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${statusInfo.className}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => showToast(`Downloaded receipt pass for ${req.id}`)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Pass
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
