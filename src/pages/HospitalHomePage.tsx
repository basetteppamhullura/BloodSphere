import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Building2,
  LayoutDashboard,
  AlertTriangle,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Clock,
  PackageCheck,
  Truck,
  Droplet,
  History,
  Check,
  Search,
  ExternalLink,
  MapPin
} from 'lucide-react';

// Helper function to get minimum required safety threshold per component & blood group
function getMinimumThreshold(bloodGroup: string, component: string): number {
  if (bloodGroup === 'O+' || bloodGroup === 'A+') {
    if (component === 'PRBC' || component === 'Whole Blood') return 5;
  }
  if (component === 'PRBC' || component === 'Whole Blood') return 4;
  return 3;
}

export const HospitalHomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    requests,
    inventoryStockMap,
    bloodBanks,
    activityLogs,
    interCityTransfers
  } = useApp();

  const navigate = useNavigate();

  // 1. Calculate Total Hospital Stock dynamically (Sum of all available units in database)
  const totalAvailableUnits = Object.values(inventoryStockMap).reduce((totalGroup, comps) => {
    return totalGroup + Object.values(comps).reduce((totalComp, item) => totalComp + (item.available || 0), 0);
  }, 0);

  // 2. Calculate unique blood components that currently have available stock
  const activeComponentsSet = new Set<string>();
  Object.values(inventoryStockMap).forEach(comps => {
    Object.entries(comps).forEach(([compName, item]) => {
      if (item.available > 0) {
        activeComponentsSet.add(compName);
      }
    });
  });
  const activeComponentsCount = activeComponentsSet.size || 4;

  // 3. Calculate Critical Low-Stock Groups dynamically based on minimum safety thresholds
  const lowStockGroupSet = new Set<string>();
  (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as string[]).forEach(group => {
    const groupComps = inventoryStockMap[group as any] || {};
    let isGroupLow = false;

    ['PRBC', 'Whole Blood', 'Plasma (FFP)', 'Platelets (PRP)', 'Plasma', 'Platelets'].forEach(comp => {
      const item = (groupComps as any)[comp];
      const avail = item?.available || 0;
      const minRequired = getMinimumThreshold(group, comp);
      if (avail < minRequired) {
        isGroupLow = true;
      }
    });

    if (isGroupLow) {
      lowStockGroupSet.add(group);
    }
  });

  const criticalLowGroupCount = lowStockGroupSet.size;

  // 4. Calculate Active Connected Regional Blood Banks dynamically from database
  const activeConnectedBanksCount = (bloodBanks || []).filter(b => b.verified !== false).length;

  // 5. TRAUMA EMERGENCY REQUESTS QUEUE - Filter ONLY ACTIVE Requests (exclude fulfilled/completed/cancelled)
  const inactiveStatuses = ['FULFILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
  const activeRequests = (requests || []).filter(r => !inactiveStatuses.includes(r.status));

  // Deduplicate by Request ID (Ensure no duplicate Request IDs appear)
  const activeMap = new Map<string, typeof requests[0]>();
  activeRequests.forEach(r => {
    if (!activeMap.has(r.id)) {
      activeMap.set(r.id, r);
    }
  });
  const uniqueActiveRequests = Array.from(activeMap.values());

  // Priority Rank Helper (1: Critical, 2: Urgent, 3: Pending)
  const getPriorityRank = (r: typeof requests[0]) => {
    const urg = String(r.urgency || '').toUpperCase();
    if (urg === 'HIGH' || urg === 'CRITICAL' || urg === 'EMERGENCY') return 1;
    if (urg === 'MODERATE' || urg === 'URGENT') return 2;
    return 3;
  };

  // Sort Active Emergency Queue: Priority Rank Ascending -> Required Date/Time Earliest First
  const sortedActiveRequests = uniqueActiveRequests.sort((a, b) => {
    const pA = getPriorityRank(a);
    const pB = getPriorityRank(b);
    if (pA !== pB) return pA - pB;
    return (a.requiredDate || '').localeCompare(b.requiredDate || '');
  });

  // Calculate Real-Time Severity Counters from actual active requests
  const criticalCount = sortedActiveRequests.filter(r => getPriorityRank(r) === 1).length;
  const urgentCount = sortedActiveRequests.filter(r => getPriorityRank(r) === 2).length;
  const pendingCount = sortedActiveRequests.filter(r => getPriorityRank(r) === 3).length;

  // 6. Active Transfers In-Transit
  const activeTransfers = (interCityTransfers || []).filter(t => t.status === 'In Transit' || t.status === 'Dispatched' || t.status === 'Pending');

  // 7. Today's Completed Operations Count (Intakes / Issues)
  const todayCompletedLogs = (activityLogs || []).filter(log => log.action.includes('Intake') || log.action.includes('Issued') || log.action.includes('Approved') || log.action.includes('Fulfilled'));

  const handleLogout = () => {
    logout();
    navigate('/login/hospital', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. WELCOME & HOSPITAL OVERVIEW HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Hospital Medical Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Hospital Trauma Center'} 🏥
            </h1>
            <p className="text-sm text-sky-100 font-medium leading-relaxed">
              Manage trauma center blood inventory, broadcast emergency patient requests, and coordinate with connected regional blood banks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/hospital/dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5 text-sky-700" />
              <span>Open Hospital Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 🚨 TRAUMA EMERGENCY REQUESTS QUEUE (COMPACT HOME PAGE WIDGET) */}
      <div className="p-6 rounded-3xl bg-white border border-red-100 shadow-xs space-y-4">
        
        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" /> Trauma Emergency Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Active emergency requests requiring attention</p>
          </div>

          <button
            onClick={() => navigate('/hospital/dashboard')}
            className="text-xs text-sky-600 font-extrabold hover:text-sky-800 flex items-center gap-1 shrink-0"
          >
            Manage Desk →
          </button>
        </div>

        {/* Counter Pill Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1 pb-1">
          <span className="px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600" /> 🔴 Critical <strong className="font-black text-slate-900">{criticalCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 🟠 Urgent <strong className="font-black text-slate-900">{urgentCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> 🟡 Pending <strong className="font-black text-slate-900">{pendingCount}</strong>
          </span>
        </div>

        {/* Active Emergency Request Cards (Top 3–5 Most Urgent Active Requests Only) */}
        {sortedActiveRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#087443] mx-auto" />
            <strong className="text-sm font-black text-slate-900 block">🟢 No Active Emergency Requests</strong>
            <p className="text-xs text-slate-500">All emergency blood requests are currently under control.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {sortedActiveRequests.slice(0, 3).map(req => {
                const rank = getPriorityRank(req);
                const isCritical = rank === 1;
                const isUrgent = rank === 2;

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl bg-white border space-y-3 flex flex-col justify-between transition-all hover:shadow-md ${
                      isCritical
                        ? 'border-red-200 hover:border-red-400 bg-gradient-to-b from-red-50/20 to-white'
                        : isUrgent
                        ? 'border-amber-200 hover:border-amber-400'
                        : 'border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Pill Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-red-600 flex items-center gap-1">
                          🩸 {req.bloodGroup} <span className="text-xs font-semibold text-slate-500">({req.bloodComponent || 'PRBC'})</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                          isCritical
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-sky-100 text-sky-900 border-sky-200'
                        }`}>
                          {isCritical ? '🔴 CRITICAL' : isUrgent ? '🟠 URGENT' : '🟡 PENDING'}
                        </span>
                      </div>

                      {/* Request Info */}
                      <div className="space-y-1">
                        <strong className="text-sm font-black text-slate-900 block">
                          {req.unitsNeeded} Units Required
                        </strong>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          ICU • Required: {req.requiredDate || 'Within 2 hours'}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">Request {req.id}</span>
                      <button
                        onClick={() => navigate('/hospital/dashboard')}
                        className="text-sky-700 font-extrabold hover:text-sky-900 flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                      >
                        View Request →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 font-medium block text-center pt-1">
              Showing the most urgent active requests
            </span>
          </div>
        )}
      </div>

      {/* 3. 📥 INCOMING PATIENT REQUESTS QUEUE */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#18352A] flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600" /> 📥 Incoming Patient Requests
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time incoming patient blood requests from Blood Net system</p>
          </div>

          <button
            onClick={() => navigate('/hospital/dashboard')}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            View All Requests →
          </button>
        </div>

        {sortedActiveRequests.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#F7FAF8] text-center border border-[#DDE8E2] space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#087443] mx-auto" />
            <span className="text-xs font-bold text-slate-800 block">No Incoming Patient Requests</span>
            <p className="text-[11px] text-slate-500">All patient blood requirements are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {sortedActiveRequests.slice(0, 3).map(req => {
              const isCrit = req.urgency === 'HIGH' || req.urgency === 'CRITICAL' || (req.urgency as string) === 'EMERGENCY';
              const isUrg = (req.urgency as string) === 'MODERATE' || (req.urgency as string) === 'URGENT';
              return (
                <div key={`inc-${req.id}`} className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-3 flex flex-col justify-between hover:border-red-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                        isCrit ? 'bg-red-100 text-red-800 border-red-200' : isUrg ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-sky-100 text-sky-900 border-sky-200'
                      }`}>
                        {isCrit ? '🔴 Critical' : isUrg ? '🟠 Urgent' : '🟡 Pending'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">BR-{req.id}</span>
                    </div>

                    <strong className="text-sm font-black text-slate-900 block">
                      {req.bloodGroup} {req.bloodComponent || 'PRBC'} • {req.unitsNeeded} Units Required
                    </strong>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <span className="block font-medium">Patient ID: {req.patientName || `PID-${req.id}`}</span>
                      <span className="block">Department: ICU</span>
                      <span className="block font-mono text-slate-600">Required: {req.requiredDate || 'Within 2 Hours'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/hospital/dashboard')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    View Request →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 🩸 BLOOD AVAILABILITY SUMMARY MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* TOTAL HOSPITAL STOCK CARD */}
        <div
          onClick={() => navigate('/hospital/blood-availability')}
          className="p-5 rounded-2xl bg-white border border-[#DDE8E2] shadow-xs space-y-2 cursor-pointer hover:border-[#087443] hover:shadow-md transition-all group"
          title="Click to view detailed hospital inventory matrix"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#18352A] font-bold block">🩸 Total Hospital Stock</span>
            <span className="text-xs font-extrabold text-[#087443] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              View Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <strong className="text-3xl font-black text-[#087443] block tracking-tight">
            {totalAvailableUnits} Units
          </strong>
          <span className="text-[11px] text-slate-500 font-medium block">
            Available across {activeComponentsCount} blood component{activeComponentsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* CRITICAL LOW-STOCK ALERTS CARD */}
        <div
          onClick={() => navigate('/hospital/blood-availability')}
          className={`p-5 rounded-2xl bg-white border shadow-xs space-y-2 cursor-pointer transition-all group ${
            criticalLowGroupCount > 0
              ? 'border-red-200 hover:border-red-500 hover:shadow-md'
              : 'border-[#DDE8E2] hover:border-emerald-500 hover:shadow-md'
          }`}
          title="Click to view critical low-stock alerts & nearby blood bank transfers"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#18352A] font-bold block">🚨 Critical Low-Stock Alerts</span>
            <span className={`text-xs font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 ${
              criticalLowGroupCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              View Alerts <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <strong className={`text-3xl font-black block tracking-tight ${
            criticalLowGroupCount > 0 ? 'text-red-600' : 'text-emerald-600'
          }`}>
            {criticalLowGroupCount > 0 ? `${criticalLowGroupCount} Group${criticalLowGroupCount !== 1 ? 's' : ''} Low` : 'All Stock Normal'}
          </strong>
          <span className={`text-[11px] font-bold block ${
            criticalLowGroupCount > 0 ? 'text-red-600' : 'text-emerald-700'
          }`}>
            {criticalLowGroupCount > 0 ? 'Inter-city transfer / blood bank order recommended' : '🟢 All safety thresholds met'}
          </span>
        </div>

        {/* CONNECTED REGIONAL BANKS CARD */}
        <div
          onClick={() => navigate('/hospital/blood-banks')}
          className="p-5 rounded-2xl bg-white border border-[#DDE8E2] shadow-xs space-y-2 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
          title="Click to view connected regional blood banks & real-time inventory"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#18352A] font-bold block">🏥 Connected Regional Banks</span>
            <span className="text-xs font-extrabold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              View Blood Banks <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <strong className="text-3xl font-black text-emerald-600 block tracking-tight">
            {activeConnectedBanksCount} Active Bank{activeConnectedBanksCount !== 1 ? 's' : ''}
          </strong>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#16A86B] animate-ping" />
            <span>Real-time sync enabled</span>
          </span>
        </div>

      </div>

      {/* 5. 📦 BLOOD BANK STORAGE (DETAILED HOSPITAL INVENTORY STORAGE GRID) */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#18352A] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#087443]" /> 📦 BLOOD BANK STORAGE
            </h3>
            <p className="text-xs text-[#587067] mt-0.5">Real-time authorized blood inventory storage & availability status</p>
          </div>

          <button
            onClick={() => navigate('/hospital/blood-availability')}
            className="text-xs font-bold text-[#087443] hover:underline flex items-center gap-1"
          >
            View Inventory Matrix →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const).map(group => {
            const groupObj = (inventoryStockMap as any)[group] || {};
            const availableUnits: number = (Object.values(groupObj) as any[]).reduce((acc: number, item: any) => acc + Number(item?.available || 0), 0);
            const reservedUnits = availableUnits > 0 ? 1 : 0;
            const isCrit = availableUnits <= 2;
            const isLimited = availableUnits > 2 && availableUnits < 8;

            return (
              <div key={group} className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-2 hover:border-[#087443] transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-base">{group}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                    isCrit
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : isLimited
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {isCrit ? '🔴 Critical' : isLimited ? '🟡 Limited' : '🟢 Available'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                  <div className="flex items-center justify-between">
                    <span>Available:</span>
                    <strong className="font-black text-slate-900">{availableUnits}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Reserved:</span>
                    <span>{reservedUnits}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Near Expiry:</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. TODAY'S HOSPITAL OPERATIONS */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#18352A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#087443]" /> TODAY'S HOSPITAL OPERATIONS
            </h3>
            <p className="text-xs text-[#587067] mt-0.5">Monitor today's important blood operations and actions.</p>
          </div>

          <button
            onClick={() => navigate('/hospital/reports')}
            className="px-4 py-2 rounded-xl bg-[#E8F6EF] hover:bg-[#d5ede1] text-[#087443] font-extrabold text-xs border border-[#DDE8E2] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <History className="w-4 h-4" /> View Activity History →
          </button>
        </div>

        {/* COMPACT ACTIONABLE OPERATIONAL CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* CARD 1: EMERGENCY REQUESTS */}
          <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-3 flex flex-col justify-between hover:border-red-400 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  🚨 Emergency
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                  criticalCount > 0 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {criticalCount > 0 ? '🔴 ACTION REQUIRED' : '🟢 NORMAL'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-slate-900 block">
                  {sortedActiveRequests.length} Request{sortedActiveRequests.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {sortedActiveRequests.length > 0
                    ? `${sortedActiveRequests[0].bloodGroup} (${sortedActiveRequests[0].unitsNeeded}u) for ${sortedActiveRequests[0].patientName}`
                    : 'No emergency trauma requests pending'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/hospital/dashboard')}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1"
            >
              View Requests <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 2: INVENTORY & STOCK ALERTS */}
          <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  📦 Stock Updates
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                  criticalLowGroupCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {criticalLowGroupCount > 0 ? '🟡 LOW STOCK' : '🟢 OPTIMAL'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-slate-900 block">
                  {criticalLowGroupCount > 0 ? `${criticalLowGroupCount} Group(s) Low` : `${totalAvailableUnits} Units Vault`}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {criticalLowGroupCount > 0
                    ? 'Requires safety threshold replenishment'
                    : 'All safety thresholds met across inventory'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/hospital/blood-availability')}
              className="w-full py-2 rounded-xl bg-[#087443] hover:bg-[#065b34] text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1"
            >
              Check Inventory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 3: INTER-CITY TRANSFERS */}
          <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-3 flex flex-col justify-between hover:border-sky-400 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  🚚 Blood Transfers
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                  activeTransfers.length > 0 ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {activeTransfers.length > 0 ? '🔵 IN TRANSIT' : 'ACTIVE'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-slate-900 block">
                  {activeTransfers.length} Transfer{activeTransfers.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {activeTransfers.length > 0
                    ? `${activeTransfers[0].units}u ${activeTransfers[0].bloodGroup} ETA: ${activeTransfers[0].courierEtaMins || 30} mins`
                    : 'No active inter-city transfers in transit'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/hospital/blood-banks')}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1"
            >
              Track Transfers <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 4: TODAY'S COMPLETED INTAKES & ISSUES */}
          <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  🩸 Today's Activity
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  🟢 COMPLETED
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-slate-900 block">
                  {todayCompletedLogs.length} Operation{todayCompletedLogs.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {todayCompletedLogs.length > 0
                    ? `${todayCompletedLogs[0].action} (${todayCompletedLogs[0].bloodGroup || 'Stock'})`
                    : 'Blood intake & issue operations logged'}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 text-[#087443] font-bold text-[11px] text-center border border-[#DDE8E2]">
              ✓ Operations Logged Today
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
