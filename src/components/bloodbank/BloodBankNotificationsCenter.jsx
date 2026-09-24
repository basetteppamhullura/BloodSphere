import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Package,
  Boxes,
  Clock,
  Building2,
  Droplet,
  Shield,
  ShieldAlert,
  Search,
  CheckCheck,
  RotateCcw,
  Sliders,
  Eye,
  Archive,
  ArrowRight,
  Send,
  X,
  Radio,
  SlidersHorizontal,
  Check,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const BloodBankNotificationsCenter = ({ onNavigateTab, onSelectRequest }) => {
  const {
    notifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    archiveNotification,
    requests,
    inventoryStockMap,
    bloodUnitsList,
    activityLogs,
    isRealtimeConnected,
    connectionStatus,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Blood Bank Staff';

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState('ALL');
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  // Date Filter
  const [dateFilter, setDateFilter] = useState('ALL');
  // Selected Notification for Detail View (Right Column / Modal)
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  // Notification Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  // Real-time last updated timestamp
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());

  // Settings State
  const [notificationPreferences, setNotificationPreferences] = useState({
    emergencyAlerts: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    bloodRequests: true,
    hospitalRequests: true,
    donorResponses: true,
    bloodTransfers: true,
    systemNotifications: true,
    inAppChannel: true,
    emailChannel: false,
    smsChannel: false,
    pushChannel: false
  });

  // Keep last updated time fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Set initial selected notification on load
  useEffect(() => {
    if (notifications && notifications.length > 0 && !selectedNotificationId) {
      setSelectedNotificationId(notifications[0].id);
    }
  }, [notifications]);

  // Handle Refresh Action
  const handleRefresh = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      showToast('Notifications synced with real-time server.');
    }, 600);
  };

  // 1. DYNAMIC CATEGORIES DEFINITION (10 Operational Categories)
  const categories = [
    { id: 'ALL', label: 'All', icon: Bell, badgeColor: 'bg-slate-100 text-slate-800' },
    { id: 'UNREAD', label: 'Unread', icon: CheckCircle2, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'Emergency', label: 'Emergency', icon: Flame, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'Requests', label: 'Blood Requests', icon: Package, badgeColor: 'bg-[#E8F4FF] text-[#2563EB]' },
    { id: 'Inventory', label: 'Inventory', icon: Boxes, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'Expiry', label: 'Expiry', icon: Clock, badgeColor: 'bg-amber-100 text-amber-900' },
    { id: 'Low Stock', label: 'Low Stock', icon: AlertTriangle, badgeColor: 'bg-amber-100 text-amber-900' },
    { id: 'Hospital', label: 'Hospital', icon: Building2, badgeColor: 'bg-sky-100 text-sky-800' },
    { id: 'Donor', label: 'Donor', icon: Droplet, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'Blood Bank', label: 'Blood Bank', icon: Boxes, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'System', label: 'System', icon: Shield, badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'Security', label: 'Security', icon: ShieldAlert, badgeColor: 'bg-purple-100 text-purple-800' },
  ];

  // 2. ENRICH NOTIFICATIONS WITH REAL METADATA & CATEGORIES
  const enrichedNotifications = useMemo(() => {
    return (notifications || []).map(n => {
      const titleLower = (n.title || '').toLowerCase();
      const msgLower = (n.message || '').toLowerCase();

      // Category derivation
      let category = n.category || 'System';
      if (titleLower.includes('emergency') || titleLower.includes('critical') || n.type === 'urgent') {
        category = 'Emergency';
      } else if (titleLower.includes('expiry') || titleLower.includes('expired') || msgLower.includes('expire')) {
        category = 'Expiry';
      } else if (titleLower.includes('low stock') || msgLower.includes('low stock') || msgLower.includes('threshold')) {
        category = 'Low Stock';
      } else if (titleLower.includes('hospital') || msgLower.includes('hospital')) {
        category = 'Hospital';
      } else if (titleLower.includes('donor') || msgLower.includes('donor')) {
        category = 'Donor';
      } else if (titleLower.includes('transfer') || titleLower.includes('inter-bank') || msgLower.includes('transfer')) {
        category = 'Blood Bank';
      } else if (titleLower.includes('inventory') || titleLower.includes('stock') || msgLower.includes('intake') || msgLower.includes('vault')) {
        category = 'Inventory';
      } else if (titleLower.includes('request') || msgLower.includes('request')) {
        category = 'Requests';
      }

      // Priority derivation
      let priority = n.priority || 'MEDIUM';
      if (category === 'Emergency' || titleLower.includes('critical')) {
        priority = 'CRITICAL';
      } else if (category === 'Low Stock' || category === 'Expiry' || titleLower.includes('urgent')) {
        priority = 'HIGH';
      } else if (category === 'Requests' || category === 'Hospital' || category === 'Donor' || category === 'Inventory') {
        priority = 'MEDIUM';
      } else {
        priority = 'LOW';
      }

      // Related request/unit lookup
      let relatedRequest = null;
      if (n.requestId) {
        relatedRequest = requests.find(r => r.id === n.requestId);
      }

      return {
        ...n,
        category,
        priority,
        timestamp: n.time || 'Just now',
        createdAt: n.createdAt || new Date().toISOString(),
        relatedRequest
      };
    });
  }, [notifications, requests]);

  // 3. REAL DATASET COUNTS SUMMARY
  const counts = useMemo(() => {
    const list = enrichedNotifications;
    return {
      all: list.length,
      unread: list.filter(n => !n.read).length,
      emergency: list.filter(n => n.category === 'Emergency' || n.priority === 'CRITICAL').length,
      lowStock: list.filter(n => n.category === 'Low Stock').length,
      expiry: list.filter(n => n.category === 'Expiry').length
    };
  }, [enrichedNotifications]);

  // 4. FILTERING & SEARCHING DATASET
  const filteredNotifications = useMemo(() => {
    return enrichedNotifications.filter(n => {
      // Archived filter
      if (n.archived) return false;

      // Category filter
      if (activeCategory === 'UNREAD' && n.read) return false;
      if (activeCategory !== 'ALL' && activeCategory !== 'UNREAD' && n.category !== activeCategory) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (n.title || '').toLowerCase().includes(q);
        const matchesMsg = (n.message || '').toLowerCase().includes(q);
        const matchesReqId = n.requestId ? String(n.requestId).toLowerCase().includes(q) : false;
        const matchesUnitId = n.unitId ? String(n.unitId).toLowerCase().includes(q) : false;
        const matchesGroup = n.bloodGroup ? String(n.bloodGroup).toLowerCase().includes(q) : false;
        const matchesHospital = n.source ? String(n.source).toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesMsg && !matchesReqId && !matchesUnitId && !matchesGroup && !matchesHospital) {
          return false;
        }
      }

      // Date Filter
      if (dateFilter !== 'ALL') {
        const notifDate = new Date(n.createdAt);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          if (notifDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'YESTERDAY') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          if (notifDate.toDateString() !== yesterday.toDateString()) return false;
        } else if (dateFilter === '7DAYS') {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (notifDate < sevenDaysAgo) return false;
        } else if (dateFilter === '30DAYS') {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (notifDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [enrichedNotifications, activeCategory, searchQuery, dateFilter]);

  // Selected Notification details object
  const selectedNotification = useMemo(() => {
    return enrichedNotifications.find(n => n.id === selectedNotificationId) || filteredNotifications[0] || null;
  }, [enrichedNotifications, filteredNotifications, selectedNotificationId]);

  // Handle Mark Single Notification as Read
  const handleMarkRead = (id) => {
    markNotificationAsRead(id);
    showToast('Notification marked as read.');
  };

  // Handle Mark Single Notification as Unread
  const handleMarkUnread = (id) => {
    markNotificationAsUnread(id);
    showToast('Notification marked as unread.');
  };

  // Handle Mark All as Read
  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    showToast('All notifications marked as read across database.');
  };

  // Handle Action Button Click (e.g. View Request / View Inventory)
  const handleNotificationAction = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.requestId && onNavigateTab) {
      onNavigateTab('direct-queue');
      if (onSelectRequest && notif.relatedRequest) {
        onSelectRequest(notif.relatedRequest);
      }
    } else if (notif.category === 'Inventory' || notif.category === 'Low Stock') {
      if (onNavigateTab) onNavigateTab('inventory');
    } else if (notif.category === 'Expiry') {
      if (onNavigateTab) onNavigateTab('preservation');
    } else if (notif.category === 'Blood Bank') {
      if (onNavigateTab) onNavigateTab('bloodbank-queue');
    } else if (notif.category === 'Hospital') {
      if (onNavigateTab) onNavigateTab('hospital-queue');
    } else {
      showToast(`Navigating to ${notif.title}...`);
    }
  };

  // Priority Visual Badges
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-wider animate-pulse">🔴 CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-black uppercase tracking-wider">🟠 HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider">🔵 MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">⚪ LOW</span>;
    }
  };

  // Category Icon & Styling Helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Emergency': return <Flame className="w-4 h-4 text-rose-600" />;
      case 'Requests': return <Package className="w-4 h-4 text-[#2563EB]" />;
      case 'Inventory': return <Boxes className="w-4 h-4 text-emerald-600" />;
      case 'Expiry': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Low Stock': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Hospital': return <Building2 className="w-4 h-4 text-sky-600" />;
      case 'Donor': return <Droplet className="w-4 h-4 text-rose-600" />;
      case 'Blood Bank': return <Boxes className="w-4 h-4 text-indigo-600" />;
      case 'Security': return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      default: return <Shield className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ================================================== */}
      {/* 1. HEADER SECTION & REALTIME CONNECTION BANNER     */}
      {/* ================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEAF5] shadow-sm space-y-4">
        
        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#E8F4FF] border border-[#DCEAF5] flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#16324F] tracking-tight">
                Blood Bank Notifications
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium pl-11">
              "Real-time alerts and updates for blood bank operations"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-[#E8F4FF] hover:bg-[#DCEAF5] text-[#2563EB] font-bold text-xs border border-[#DCEAF5] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Mark all as read</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#16324F] font-bold text-xs border border-[#DCEAF5] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Configure notification rules and preferences"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#64748B]" />
              <span>Notification Settings</span>
            </button>

            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#16324F] font-bold text-xs border border-[#DCEAF5] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh notifications dataset"
            >
              <RefreshCw className={`w-4 h-4 text-[#64748B] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Real-time Connection Status & Timestamp Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-[#64748B] bg-[#F5FAFF] p-3 rounded-2xl border border-[#DCEAF5]">
          <div className="flex items-center gap-2">
            {isRealtimeConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#22C55E] border border-emerald-200 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                ● Live
              </span>
            ) : connectionStatus === 'RECONNECTING' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#F59E0B] border border-amber-200 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                ● Reconnecting
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#EF4444] border border-red-200 text-xs font-black">
                ● Offline
              </span>
            )}
            <span>Last updated: <strong className="font-mono text-[#16324F]">{lastUpdatedTime}</strong></span>
          </div>

          {!isRealtimeConnected && (
            <span className="text-[11px] text-[#EF4444] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Notifications may be delayed while connection is restored.
            </span>
          )}

          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-mono text-[#64748B]">Staff: <strong className="text-[#16324F]">{staffName}</strong></span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. REAL COUNTS SUMMARY BAR                        */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#DCEAF5] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#64748B]">All Notifications</span>
          <strong className="text-2xl font-black text-[#16324F] block">{counts.all}</strong>
          <span className="text-[10px] text-[#64748B]">Total dataset size</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#2563EB]">Unread Alerts</span>
          <strong className="text-2xl font-black text-[#2563EB] block">{counts.unread}</strong>
          <span className="text-[10px] text-[#2563EB] font-bold">Action required</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#EF4444]">Emergency Requests</span>
          <strong className="text-2xl font-black text-[#EF4444] block">{counts.emergency}</strong>
          <span className="text-[10px] text-[#EF4444] font-bold">Critical priority</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#F59E0B]">Low Stock Warnings</span>
          <strong className="text-2xl font-black text-[#F59E0B] block">{counts.lowStock}</strong>
          <span className="text-[10px] text-amber-800 font-medium">Safety threshold</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-[#F59E0B]">Expiry Alerts</span>
          <strong className="text-2xl font-black text-[#F59E0B] block">{counts.expiry}</strong>
          <span className="text-[10px] text-amber-800 font-medium">Cold chain lifecycle</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. FILTERS & SEARCH TOOLBAR                        */}
      {/* ================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-sm space-y-4">
        
        {/* Search Input & Date Range Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search notifications by Request ID, Unit ID, Hospital, Group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-bold text-[#16324F] focus:outline-none focus:border-[#2563EB]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#64748B] hover:text-[#16324F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#64748B] hidden sm:inline">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-bold text-[#16324F] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map(cat => {
            const IconComp = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-[#F5FAFF] hover:bg-[#E8F4FF] text-[#16324F] border-[#DCEAF5]'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#2563EB]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. MAIN WORKSPACE: TWO-COLUMN (DESKTOP) / LIST (MOBILE) */}
      {/* ================================================== */}
      {isLoading ? (
        // Loading State Skeleton
        <div className="p-10 rounded-3xl bg-white border border-[#DCEAF5] text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B] font-bold">Loading real-time notifications dataset...</p>
        </div>
      ) : errorMessage ? (
        // Error State
        <div className="p-8 rounded-3xl bg-[#FFF1F2] border border-red-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto" />
          <strong className="text-sm font-black text-[#16324F] block">Unable to load notifications</strong>
          <p className="text-xs text-[#64748B]">{errorMessage}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-[#EF4444] text-white font-bold text-xs shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        // Empty State
        <div className="p-12 rounded-3xl bg-white border border-[#DCEAF5] text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#E8F4FF] text-[#2563EB] flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <strong className="text-base font-black text-[#16324F] block">No notifications found</strong>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You're all caught up! No operational notifications match your selected filter parameters.
          </p>
          {(activeCategory !== 'ALL' || searchQuery || dateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
                setDateFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#E8F4FF] text-[#2563EB] font-bold text-xs border border-[#DCEAF5] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        // Main Notifications View (Two Column Desktop / Single Column Mobile)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: NOTIFICATION CARDS LIST */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-[#64748B] font-bold">
              <span>Showing {filteredNotifications.length} notifications</span>
              <span>Sorted by Most Recent</span>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map(notif => {
                const isSelected = selectedNotification?.id === notif.id;
                const isEmergency = notif.category === 'Emergency';
                const isUnread = !notif.read;

                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotificationId(notif.id)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isEmergency
                        ? 'bg-[#FFF1F2] border-rose-200 hover:border-rose-300'
                        : isUnread
                        ? 'bg-[#E8F4FF]/70 border-[#BFDBFE] hover:border-[#2563EB]'
                        : isSelected
                        ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md'
                        : 'bg-white border-[#DCEAF5] hover:border-[#2563EB]/50 shadow-2xs'
                    }`}
                  >
                    {/* Unread Small Blue Indicator */}
                    {isUnread && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
                        <span className="text-[10px] font-black text-[#2563EB] uppercase">Unread</span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {/* Category & Priority Header */}
                      <div className="flex flex-wrap items-center gap-2 pr-16">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#DCEAF5] text-[11px] font-black text-[#16324F] shadow-2xs">
                          {getCategoryIcon(notif.category)}
                          <span>{notif.category}</span>
                        </span>

                        {getPriorityBadge(notif.priority)}

                        {notif.requestId && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-extrabold">
                            REQ-{notif.requestId}
                          </span>
                        )}

                        {notif.unitId && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-extrabold">
                            UNIT-{notif.unitId}
                          </span>
                        )}
                      </div>

                      {/* Title & Short Description */}
                      <div>
                        <strong className="text-sm font-black text-[#16324F] block leading-snug">
                          {notif.title}
                        </strong>
                        <p className="text-xs text-[#64748B] font-medium line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>

                      {/* Blood Group / Component / Units & Timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-[#DCEAF5]/60">
                        {notif.bloodGroup ? (
                          <span className="font-extrabold text-[#EF4444] bg-white px-2 py-0.5 rounded-md border border-rose-200">
                            🩸 {notif.bloodGroup} {notif.component ? `(${notif.component})` : ''} {notif.units ? `• ${notif.units} Units` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#64748B] font-medium">{notif.source || 'BloodNet Operational System'}</span>
                        )}

                        <span className="text-[11px] text-[#64748B] font-mono font-medium">
                          {notif.timestamp}
                        </span>
                      </div>

                      {/* Action Button Row */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notif);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <span>{notif.requestId ? 'View Request' : notif.category === 'Inventory' || notif.category === 'Low Stock' ? 'View Inventory' : notif.category === 'Expiry' ? 'View Unit' : 'View Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1">
                          {isUnread ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notif.id);
                              }}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#E8F4FF] transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkUnread(notif.id);
                              }}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-slate-100 transition-colors"
                              title="Mark as unread"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notif.id);
                              showToast('Notification archived.');
                            }}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 transition-colors"
                            title="Archive notification"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: NOTIFICATION DETAILS PANEL (DESKTOP STICKY) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-20">
            {selectedNotification ? (
              <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-md space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                  <span className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">
                    Notification Details
                  </span>
                  {getPriorityBadge(selectedNotification.priority)}
                </div>

                {/* Main Card Overview */}
                <div className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#DCEAF5] flex items-center justify-center">
                      {getCategoryIcon(selectedNotification.category)}
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">{selectedNotification.category} Alert</span>
                      <strong className="text-sm font-black text-[#16324F] block leading-tight">{selectedNotification.title}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Metadata Details Table */}
                <div className="space-y-2 text-xs">
                  <span className="font-extrabold text-[#16324F] block">Operational Parameters</span>

                  <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Category</span>
                      <strong className="text-xs font-bold text-[#16324F]">{selectedNotification.category}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Priority Rating</span>
                      <strong className="text-xs font-bold text-[#16324F]">{selectedNotification.priority}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Blood Group & Comp</span>
                      <strong className="text-xs font-bold text-[#EF4444]">
                        {selectedNotification.bloodGroup || 'General'} {selectedNotification.component ? `(${selectedNotification.component})` : ''}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Units Specified</span>
                      <strong className="text-xs font-bold text-[#16324F]">{selectedNotification.units || 1} Units</strong>
                    </div>

                    {selectedNotification.requestId && (
                      <div>
                        <span className="text-[10px] text-[#64748B] font-bold uppercase block">Request Reference</span>
                        <strong className="text-xs font-mono font-bold text-[#2563EB]">REQ-{selectedNotification.requestId}</strong>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Timestamp</span>
                      <strong className="text-xs font-mono text-[#64748B]">{selectedNotification.timestamp}</strong>
                    </div>
                  </div>
                </div>

                {/* Read Status & Audit Trail */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider block">Audit Traceability</span>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Status:</span>
                    <span className={`font-bold ${selectedNotification.read ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                      {selectedNotification.read ? '✓ Read' : '● Unread'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Target Audience:</span>
                    <span className="font-bold text-[#16324F]">Blood Bank Regional Portal</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Event Source:</span>
                    <span className="font-mono text-[11px] text-[#16324F]">BloodNet Socket Gateway</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleNotificationAction(selectedNotification)}
                    className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Execute Primary Action</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedNotification.read ? (
                      <button
                        onClick={() => handleMarkUnread(selectedNotification.id)}
                        className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#16324F] font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                      >
                        Mark Unread
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkRead(selectedNotification.id)}
                        className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#22C55E] font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() => {
                        archiveNotification(selectedNotification.id);
                        showToast('Notification archived.');
                      }}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-[#EF4444] font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      Archive
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#DCEAF5] text-center space-y-2">
                <p className="text-xs text-[#64748B]">Select a notification from the left list to view full details and audit trace.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* 5. NOTIFICATION SETTINGS MODAL                     */}
      {/* ================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#DCEAF5] rounded-3xl p-6 space-y-5 text-xs shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-extrabold text-base text-[#16324F]">
                  Notification Settings & Alert Channels
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#64748B] hover:text-[#16324F] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#64748B]">
              Configure which operational events trigger real-time alerts for Blood Bank staff. Channel availability is based on current system integration.
            </p>

            {/* Category Preferences */}
            <div className="space-y-3">
              <span className="font-black text-[#16324F] text-xs block">Operational Alert Rules</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'emergencyAlerts', label: 'Emergency Alerts', icon: Flame, color: 'text-rose-600' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', icon: AlertTriangle, color: 'text-amber-600' },
                  { key: 'expiryAlerts', label: 'Expiry Alerts', icon: Clock, color: 'text-amber-600' },
                  { key: 'bloodRequests', label: 'New Blood Requests', icon: Package, color: 'text-[#2563EB]' },
                  { key: 'hospitalRequests', label: 'Hospital Orders', icon: Building2, color: 'text-sky-600' },
                  { key: 'donorResponses', label: 'Donor Responses', icon: Droplet, color: 'text-rose-600' },
                  { key: 'bloodTransfers', label: 'Blood Transfers', icon: Boxes, color: 'text-indigo-600' },
                  { key: 'systemNotifications', label: 'System Alerts', icon: Shield, color: 'text-slate-600' },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isChecked = notificationPreferences[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked ? 'bg-[#E8F4FF] border-[#BFDBFE]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp className={`w-4 h-4 ${item.color}`} />
                        <span className="font-bold text-[#16324F] text-xs">{item.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setNotificationPreferences({
                            ...notificationPreferences,
                            [item.key]: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded text-[#2563EB] cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Channels Overview */}
            <div className="space-y-2 pt-2 border-t border-[#DCEAF5]">
              <span className="font-black text-[#16324F] text-xs block">Supported Channels</span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800">In-App Alerts</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#22C55E] text-white text-[9px] font-black">ACTIVE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-70">
                  <span className="font-bold text-slate-600">Email Dispatch</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">SYSTEM DEFAULT</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#16324F] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast('Notification preferences saved successfully!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
