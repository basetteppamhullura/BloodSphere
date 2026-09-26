import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Building2, AlertTriangle, LogOut, ArrowRight, ShieldCheck, CheckCircle2, Activity, ArrowUpRight, PackageCheck, Droplet, History, LayoutDashboard } from 'lucide-react';
import { PortalHero } from '../components/common/PortalHero';
// Helper function to get minimum required safety threshold per component & blood group
function getMinimumThreshold(bloodGroup, component) {
    if (bloodGroup === 'O+' || bloodGroup === 'A+') {
        if (component === 'PRBC' || component === 'Whole Blood')
            return 5;
    }
    if (component === 'PRBC' || component === 'Whole Blood')
        return 4;
    return 3;
}
export const HospitalHomePage = () => {
    const { currentUser, logout } = useAuth();
    const { requests, inventoryStockMap, bloodBanks, activityLogs, interCityTransfers } = useApp();
    const navigate = useNavigate();
    // 1. Calculate Total Hospital Stock dynamically (Sum of all available units in database)
    const totalAvailableUnits = Object.values(inventoryStockMap).reduce((totalGroup, comps) => {
        return totalGroup + Object.values(comps).reduce((totalComp, item) => totalComp + (item.available || 0), 0);
    }, 0);
    // 2. Calculate unique blood components that currently have available stock
    const activeComponentsSet = new Set();
    Object.values(inventoryStockMap).forEach(comps => {
        Object.entries(comps).forEach(([compName, item]) => {
            if (item.available > 0) {
                activeComponentsSet.add(compName);
            }
        });
    });
    const activeComponentsCount = activeComponentsSet.size || 4;
    // 3. Calculate Critical Low-Stock Groups dynamically based on minimum safety thresholds
    const lowStockGroupSet = new Set();
    ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'].forEach(group => {
        const groupComps = inventoryStockMap[group] || {};
        let isGroupLow = false;
        ['PRBC', 'Whole Blood', 'Plasma (FFP)', 'Platelets (PRP)', 'Plasma', 'Platelets'].forEach(comp => {
            const item = groupComps[comp];
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
    const activeMap = new Map();
    activeRequests.forEach(r => {
        if (!activeMap.has(r.id)) {
            activeMap.set(r.id, r);
        }
    });
    const uniqueActiveRequests = Array.from(activeMap.values());
    // Priority Rank Helper (1: Critical, 2: Urgent, 3: Pending)
    const getPriorityRank = (r) => {
        const urg = String(r.urgency || '').toUpperCase();
        if (urg === 'HIGH' || urg === 'CRITICAL' || urg === 'EMERGENCY')
            return 1;
        if (urg === 'MODERATE' || urg === 'URGENT')
            return 2;
        return 3;
    };
    // Sort Active Emergency Queue: Priority Rank Ascending -> Required Date/Time Earliest First
    const sortedActiveRequests = uniqueActiveRequests.sort((a, b) => {
        const pA = getPriorityRank(a);
        const pB = getPriorityRank(b);
        if (pA !== pB)
            return pA - pB;
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
    return (<div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in" style={{ backgroundColor: '#F5FAFF' }}>
      
      {/* 1. WELCOME & HOSPITAL OVERVIEW HERO BANNER */}
      <PortalHero
        portalLabel="Verified Hospital Medical Portal"
        badgeIcon={ShieldCheck}
        badgePulseColor="bg-blue-400"
        title={`Welcome, ${currentUser?.name || 'KIMS Teaching Hospital'} 🏥`}
        description="Manage patient blood requests, hospital inventory, blood transfers and emergency operations."
        bgImage="/bloodnet-hero-full.png"
        bgPosition="center right"
        gradientOverlay="linear-gradient(95deg, rgba(16, 37, 66, 0.90) 0%, rgba(37, 99, 235, 0.78) 55%, rgba(6, 182, 212, 0.55) 100%)"
        decorativeIcon={Building2}
        actions={
          <>
            <button onClick={() => navigate('/hospital/dashboard')} className="px-5 py-3 rounded-2xl bg-white text-[#2563EB] hover:bg-sky-50 font-black text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
              <LayoutDashboard className="w-4 h-4 text-[#2563EB]"/>
              <span>Manage Desk</span>
              <ArrowRight className="w-3.5 h-3.5"/>
            </button>

            <button onClick={handleLogout} className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4 text-white"/>
              <span>Logout</span>
            </button>
          </>
        }
      />

      {/* 2. 🚨 TRAUMA EMERGENCY REQUESTS QUEUE (WHITE CONTAINER WITH SUBTLE RED ACCENT) */}
      <div className="p-6 rounded-3xl bg-white border border-[#FECDD3] shadow-xs space-y-4">
        
        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-[#FECDD3]/60 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#16324F] flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] animate-pulse"/> Trauma Emergency Requests
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">Active emergency requests requiring immediate attention</p>
          </div>

          <button onClick={() => navigate('/hospital/dashboard')} className="px-3.5 py-1.5 rounded-xl bg-[#E8F4FF] hover:bg-[#DDF0FF] text-[#2563EB] border border-[#BFDBFE] font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer">
            Manage Desk →
          </button>
        </div>

        {/* Counter Pill Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1 pb-1">
          <span className="px-3 py-1 rounded-xl bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"/> 🔴 Critical <strong className="font-black text-[#16324F]">{criticalCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"/> 🟠 Urgent <strong className="font-black text-[#16324F]">{urgentCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"/> 🟡 Pending <strong className="font-black text-[#16324F]">{pendingCount}</strong>
          </span>
        </div>

        {/* Active Emergency Request Cards */}
        {sortedActiveRequests.length === 0 ? (<div className="p-8 rounded-2xl bg-white border border-[#DCEAF5] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto"/>
            <strong className="text-sm font-black text-[#16324F] block">🟢 No Active Emergency Requests</strong>
            <p className="text-xs text-[#64748B]">All emergency blood requests are currently under control.</p>
          </div>) : (<div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {sortedActiveRequests.slice(0, 3).map(req => {
                const rank = getPriorityRank(req);
                const isCritical = rank === 1;
                const isUrgent = rank === 2;
                return (<div key={req.id} className={`p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between transition-all hover:shadow-md ${isCritical
                        ? 'border-l-4 border-l-[#EF4444]'
                        : isUrgent
                            ? 'border-l-4 border-l-[#F59E0B]'
                            : 'border-l-4 border-l-[#2563EB]'}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-[#EF4444] flex items-center gap-1">
                          🩸 {req.bloodGroup} <span className="text-xs font-semibold text-[#64748B]">({req.bloodComponent || 'PRBC'})</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${isCritical
                        ? 'bg-[#FFF1F2] text-[#DC2626] border-[#FECDD3]'
                        : isUrgent
                            ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                            : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'}`}>
                          {isCritical ? '🔴 CRITICAL' : isUrgent ? '🟠 URGENT' : '🟡 PENDING'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-sm font-black text-[#16324F] block">
                          {req.unitsNeeded} Units Required
                        </strong>
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-[#94A3B8]"/>
                          ICU • Required: {req.requiredDate || 'Within 2 hours'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DCEAF5] flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[#94A3B8]">BR-{req.id}</span>
                      <button onClick={() => navigate('/hospital/dashboard')} className="px-3 py-1 rounded-lg bg-[#E8F4FF] hover:bg-[#DDF0FF] text-[#2563EB] font-extrabold text-[11px] border border-[#BFDBFE] shadow-2xs transition-all flex items-center gap-1 cursor-pointer">
                        View Request →
                      </button>
                    </div>
                  </div>);
            })}
            </div>

            <span className="text-[11px] text-[#64748B] font-medium block text-center pt-1">
              Showing top active emergency requests
            </span>
          </div>)}
      </div>

      {/* 3. 📥 INCOMING PATIENT BLOOD REQUESTS QUEUE (LIGHT MEDICAL WHITE CONTAINER) */}
      <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#16324F] flex items-center gap-2 tracking-tight">
              <Droplet className="w-5 h-5 text-[#2563EB]"/> 📥 Incoming Patient Blood Requests Queue
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">Real-time incoming active patient blood requests from BloodNet system</p>
          </div>

          <button onClick={() => navigate('/hospital/dashboard')} className="px-3.5 py-1.5 rounded-xl bg-[#E8F4FF] hover:bg-[#DDF0FF] text-[#2563EB] font-extrabold text-xs transition-all border border-[#BFDBFE] cursor-pointer">
            View All Requests →
          </button>
        </div>

        {sortedActiveRequests.length === 0 ? (<div className="p-6 rounded-2xl bg-white text-center border border-[#DCEAF5] space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#22C55E] mx-auto"/>
            <span className="text-xs font-bold text-[#16324F] block">No Incoming Patient Requests</span>
            <p className="text-[11px] text-[#64748B]">All patient blood requirements are up to date.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {sortedActiveRequests.slice(0, 3).map(req => {
                const isCrit = req.urgency === 'HIGH' || req.urgency === 'CRITICAL' || req.urgency === 'EMERGENCY';
                const isUrg = req.urgency === 'MODERATE' || req.urgency === 'URGENT';
                return (<div key={`inc-${req.id}`} className={`p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:shadow-md transition-all ${isCrit
                        ? 'border-l-4 border-l-[#EF4444]'
                        : isUrg
                            ? 'border-l-4 border-l-[#F59E0B]'
                            : 'border-l-4 border-l-[#2563EB]'}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${isCrit ? 'bg-[#FFF1F2] text-[#DC2626] border-[#FECDD3]' : isUrg ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'}`}>
                        {isCrit ? '🔴 CRITICAL' : isUrg ? '🟠 URGENT' : '🟡 PENDING'}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">BR-{req.id}</span>
                    </div>

                    <strong className="text-sm font-black text-[#16324F] block">
                      {req.bloodGroup} {req.bloodComponent || 'PRBC'} • {req.unitsNeeded} Units Required
                    </strong>

                    <div className="text-[11px] text-[#64748B] space-y-0.5">
                      <span className="block font-medium">Patient ID: {req.patientName || `PID-${req.id}`}</span>
                      <span className="block">Department: ICU</span>
                      <span className="block font-mono text-[#64748B]">Required: {req.requiredDate || 'Within 2 Hours'}</span>
                    </div>
                  </div>

                  <button onClick={() => navigate('/hospital/dashboard')} className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer">
                    View Request →
                  </button>
                </div>);
            })}
          </div>)}
      </div>

      {/* 4. 🩸 BLOOD AVAILABILITY SUMMARY MATRIX (SOFT SPECIFIED FILLS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* TOTAL HOSPITAL STOCK CARD (SOFT GREEN) */}
        <div onClick={() => navigate('/hospital/blood-availability')} className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] shadow-xs space-y-3 cursor-pointer hover:shadow-md transition-all group" title="Click to view detailed hospital inventory matrix">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-white text-[#22C55E] border border-[#BBF7D0] shrink-0 shadow-2xs">
                <Droplet className="w-5 h-5 text-[#22C55E]"/>
              </div>
              <span className="text-xs text-[#16324F] font-bold block">Total Hospital Stock</span>
            </div>
            <span className="text-xs font-extrabold text-[#15803D] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              View <ArrowUpRight className="w-3.5 h-3.5"/>
            </span>
          </div>

          <div>
            <strong className="text-3xl sm:text-4xl font-black text-[#16324F] block tracking-tight">
              {totalAvailableUnits} <span className="text-sm font-bold text-[#64748B]">Units</span>
            </strong>
            <span className="text-[11px] text-[#64748B] font-medium block mt-1">
              Available across {activeComponentsCount} blood component{activeComponentsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* CRITICAL LOW-STOCK ALERTS CARD (SOFT RED) */}
        <div onClick={() => navigate('/hospital/blood-availability')} className="p-5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] shadow-xs space-y-3 cursor-pointer hover:shadow-md transition-all group" title="Click to view critical low-stock alerts & nearby blood bank transfers">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-white text-[#EF4444] border border-[#FECDD3] shrink-0 shadow-2xs">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]"/>
              </div>
              <span className="text-xs text-[#16324F] font-bold block">Critical Stock Alerts</span>
            </div>

            <span className="text-xs font-extrabold text-[#DC2626] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Alerts <ArrowUpRight className="w-3.5 h-3.5"/>
            </span>
          </div>

          <div>
            <strong className="text-3xl sm:text-4xl font-black text-[#DC2626] block tracking-tight">
              {criticalLowGroupCount > 0 ? `${criticalLowGroupCount}` : '0'} <span className="text-sm font-bold text-[#64748B]">Groups Low</span>
            </strong>
            <span className={`text-[11px] font-bold block mt-1 ${criticalLowGroupCount > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
              {criticalLowGroupCount > 0 ? 'Replenishment recommended' : '🟢 All safety thresholds met'}
            </span>
          </div>
        </div>

        {/* CONNECTED REGIONAL BANKS CARD (SOFT BLUE) */}
        <div onClick={() => navigate('/hospital/blood-banks')} className="p-5 rounded-2xl bg-[#E8F4FF] border border-[#BFDBFE] shadow-xs space-y-3 cursor-pointer hover:shadow-md transition-all group" title="Click to view connected regional blood banks & real-time inventory">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-white text-[#2563EB] border border-[#BFDBFE] shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5 text-[#2563EB]"/>
              </div>
              <span className="text-xs text-[#16324F] font-bold block">Connected Banks</span>
            </div>
            <span className="text-xs font-extrabold text-[#2563EB] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Banks <ArrowUpRight className="w-3.5 h-3.5"/>
            </span>
          </div>

          <div>
            <strong className="text-3xl sm:text-4xl font-black text-[#16324F] block tracking-tight">
              {activeConnectedBanksCount} <span className="text-sm font-bold text-[#64748B]">Active</span>
            </strong>
            <span className="text-[11px] text-[#15803D] font-bold flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"/>
              <span>Real-time sync enabled</span>
            </span>
          </div>
        </div>

      </div>

      {/* 5. 📦 HOSPITAL BLOOD STOCK MONITOR (CLEAN WHITE CARDS WITH STATUS BADGES) */}
      <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#16324F] flex items-center gap-2 tracking-tight">
              <PackageCheck className="w-5 h-5 text-[#22C55E]"/> 🩸 Hospital Blood Stock Monitor
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">Real-time authorized blood inventory storage & availability status</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/hospital/unit-details')} className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer">
              Unit Details →
            </button>
            <button onClick={() => navigate('/hospital/blood-availability')} className="px-3.5 py-1.5 rounded-xl bg-[#E8F4FF] hover:bg-[#DDF0FF] text-[#2563EB] font-extrabold text-xs transition-all border border-[#BFDBFE] flex items-center gap-1 cursor-pointer">
              View Matrix →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => {
            const groupObj = inventoryStockMap[group] || {};
            const availableUnits = Object.values(groupObj).reduce((acc, item) => acc + Number(item?.available || 0), 0);
            const reservedUnits = availableUnits > 0 ? 1 : 0;
            const isCrit = availableUnits <= 2;
            const isLimited = availableUnits > 2 && availableUnits < 8;
            return (<div key={group} className="p-3.5 rounded-2xl bg-white border border-[#DCEAF5] space-y-2 transition-all hover:shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#16324F] text-base">{group}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${isCrit
                    ? 'bg-[#FFF1F2] text-[#DC2626] border-[#FECDD3]'
                    : isLimited
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]'}`}>
                    {isCrit ? '🔴 Critical' : isLimited ? '🟡 Limited' : '🟢 Available'}
                  </span>
                </div>

                <div className="text-[11px] text-[#64748B] space-y-0.5 font-medium">
                  <div className="flex items-center justify-between">
                    <span>Available:</span>
                    <strong className="font-black text-[#16324F]">{availableUnits} units</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Reserved:</span>
                    <span>{reservedUnits}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#94A3B8] text-[10px]">
                    <span>Near Expiry:</span>
                    <span>0</span>
                  </div>
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* 6. TODAY'S HOSPITAL OPERATIONS */}
      <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#16324F] flex items-center gap-2 tracking-tight">
              <Activity className="w-5 h-5 text-[#22C55E]"/> TODAY'S HOSPITAL OPERATIONS
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">Monitor today's important blood operations and actions.</p>
          </div>

          <button onClick={() => navigate('/hospital/reports')} className="px-4 py-2 rounded-xl bg-[#E8F4FF] hover:bg-[#DDF0FF] text-[#2563EB] font-extrabold text-xs border border-[#BFDBFE] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer">
            <History className="w-4 h-4"/> View Activity History →
          </button>
        </div>

        {/* COMPACT ACTIONABLE OPERATIONAL CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* CARD 1: EMERGENCY REQUESTS */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#FECDD3] transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#16324F] flex items-center gap-1.5">
                  🚨 Emergency
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${criticalCount > 0 ? 'bg-[#FFF1F2] text-[#DC2626] border-[#FECDD3]' : 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]'}`}>
                  {criticalCount > 0 ? '🔴 ACTION REQUIRED' : '🟢 NORMAL'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-[#16324F] block">
                  {sortedActiveRequests.length} Request{sortedActiveRequests.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  {sortedActiveRequests.length > 0
            ? `${sortedActiveRequests[0].bloodGroup} (${sortedActiveRequests[0].unitsNeeded}u) for ${sortedActiveRequests[0].patientName}`
            : 'No emergency trauma requests pending'}
                </span>
              </div>
            </div>

            <button onClick={() => navigate('/hospital/dashboard')} className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer">
              View Requests <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          {/* CARD 2: INVENTORY & STOCK ALERTS */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#FDE68A] transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#16324F] flex items-center gap-1.5">
                  📦 Stock Updates
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${criticalLowGroupCount > 0 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]'}`}>
                  {criticalLowGroupCount > 0 ? '🟡 LOW STOCK' : '🟢 OPTIMAL'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-[#16324F] block">
                  {criticalLowGroupCount > 0 ? `${criticalLowGroupCount} Group(s) Low` : `${totalAvailableUnits} Units Vault`}
                </strong>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  {criticalLowGroupCount > 0
            ? 'Requires safety threshold replenishment'
            : 'All safety thresholds met across inventory'}
                </span>
              </div>
            </div>

            <button onClick={() => navigate('/hospital/blood-availability')} className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer">
              Check Inventory <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          {/* CARD 3: INTER-CITY TRANSFERS (PRIMARY BLUE BUTTON) */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#BFDBFE] transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#16324F] flex items-center gap-1.5">
                  🚚 Blood Transfers
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase shadow-2xs ${activeTransfers.length > 0 ? 'bg-[#E8F4FF] text-[#2563EB] border-[#BFDBFE]' : 'bg-[#F5FAFF] text-[#64748B] border-[#DCEAF5]'}`}>
                  {activeTransfers.length > 0 ? '🔵 IN TRANSIT' : 'ACTIVE'}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-[#16324F] block">
                  {activeTransfers.length} Transfer{activeTransfers.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  {activeTransfers.length > 0
            ? `${activeTransfers[0].units}u ${activeTransfers[0].bloodGroup} ETA: ${activeTransfers[0].courierEtaMins || 30} mins`
            : 'No active inter-city transfers in transit'}
                </span>
              </div>
            </div>

            <button onClick={() => navigate('/hospital/blood-banks')} className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer">
              Track Transfers <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          {/* CARD 4: TODAY'S COMPLETED INTAKES & ISSUES */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCEAF5] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#16324F] flex items-center gap-1.5">
                  🩸 Today's Activity
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] uppercase shadow-2xs">
                  🟢 COMPLETED
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-[#16324F] block">
                  {todayCompletedLogs.length} Operation{todayCompletedLogs.length !== 1 ? 's' : ''}
                </strong>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  {todayCompletedLogs.length > 0
            ? `${todayCompletedLogs[0].action} (${todayCompletedLogs[0].bloodGroup || 'Stock'})`
            : 'Blood intake & issue operations logged'}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#15803D] font-bold text-[11px] text-center border border-[#BBF7D0]">
              ✓ Operations Logged Today
            </div>
          </div>

        </div>
      </div>

    </div>);
};
