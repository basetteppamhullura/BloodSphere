import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Droplet, Boxes, Package, LogOut, ArrowRight, ShieldCheck, CheckCircle2, Clock, Send, FlaskConical, Activity } from 'lucide-react';
export const BloodBankHomePage = () => {
    const { currentUser, logout } = useAuth();
    const { requests, bloodUnitsList, inventoryStockMap, activityLogs } = useApp();
    const navigate = useNavigate();
    const todayStr = new Date().toISOString().split('T')[0];
    // 1. Total Blood Units (Sum of all units in DB)
    const totalUnits = bloodUnitsList.length;
    // 2. Available Units (Units ready for immediate issue)
    const availableCount = bloodUnitsList.filter(u => u.status === 'APPROVED' || u.status === 'STORED' || u.status === 'COLLECTED').length;
    // 3. Reserved Units
    const reservedCount = bloodUnitsList.filter(u => u.status === 'RESERVED').length;
    // 4. Issued Units
    const issuedCount = bloodUnitsList.filter(u => u.status === 'ISSUED' || u.status === 'TRANSFUSED').length;
    // 5. Expiring Soon (Within 5 days)
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expiringSoonCount = bloodUnitsList.filter(u => u.status !== 'EXPIRED' && u.status !== 'ISSUED' && u.expiryDate >= todayStr && u.expiryDate <= fiveDaysFromNow).length;
    // 6. Expired Units
    const expiredCount = bloodUnitsList.filter(u => u.status === 'EXPIRED' || u.expiryDate < todayStr).length;
    // 7. Low Stock Groups (Groups with total available units < 5)
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const lowStockGroupsList = allGroups.filter(bg => {
        const groupStock = inventoryStockMap[bg] || {};
        const totalAvail = Number(Object.values(groupStock).reduce((acc, comp) => acc + Number(comp?.available || 0), 0));
        return totalAvail < 5;
    });
    // 8. New Requests (Created today)
    const newRequestsCount = requests.filter(r => r.requestedAt && r.requestedAt.includes('Today') || (r.requestedAt && r.requestedAt.includes(todayStr))).length;
    // 9. Pending Requests (Active in queue)
    const inactiveStatuses = ['FULFILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
    const pendingRequestsList = requests.filter(r => !inactiveStatuses.includes(r.status));
    const pendingRequestsCount = pendingRequestsList.length;
    // 10. Critical Requests (Urgency CRITICAL or HIGH)
    const criticalRequestsCount = pendingRequestsList.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length;
    // 11. Today's Issued Units (Activity logs for blood issued today)
    const todayIssuedCount = activityLogs.filter(l => l.action.toLowerCase().includes('issued') && (l.date === todayStr || l.date.includes('2026'))).length;
    const handleLogout = () => {
        logout();
        navigate('/login/bloodbank', { replace: true });
    };
    return (<div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2563EB] via-emerald-600 to-[#0284C7] text-white shadow-md relative overflow-hidden border border-emerald-400/30">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Droplet className="w-96 h-96 fill-white"/>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300"/>
              <span>Verified Regional Blood Center & Supply Vault</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Rotary Blood Center'} 🩸
            </h1>
            <p className="text-sm text-emerald-100 font-medium leading-relaxed">
              Real-time operational overview: processing direct requester queues, hospital emergency orders, inventory component management, and cold chain preservation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navigate('/bloodbank/requests')} className="px-5 py-3 rounded-2xl bg-white text-[#2563EB] hover:bg-emerald-50 font-black text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
              <Package className="w-4 h-4 text-emerald-600"/>
              <span>Process Request Queue</span>
              <ArrowRight className="w-3.5 h-3.5"/>
            </button>

            <button onClick={() => navigate('/bloodbank/inventory')} className="px-4 py-3 rounded-2xl bg-emerald-600/60 hover:bg-emerald-600 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer">
              <Boxes className="w-4 h-4"/>
              <span>Live Inventory Matrix</span>
            </button>

            <button onClick={handleLogout} className="px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Operational Cards (11 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600"/> Operational Metrics & Live Status
          </h2>
          <span className="text-[11px] font-mono text-slate-600">Sync: Real-time DB Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Blood Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Total Blood Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-slate-900 block">{totalUnits}</strong>
            <span className="text-[11px] text-slate-600 font-medium">All components in database</span>
          </div>

          {/* Card 2: Available Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Available Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-emerald-600 block">{availableCount}</strong>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5"/> Ready for immediate issue
            </span>
          </div>

          {/* Card 3: Reserved Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Reserved Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-amber-600 block">{reservedCount}</strong>
            <span className="text-[11px] text-amber-700 font-medium">Locked for pending orders</span>
          </div>

          {/* Card 4: Issued Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Total Issued Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-sky-600 block">{issuedCount}</strong>
            <span className="text-[11px] text-sky-700 font-medium">Dispatched to hospitals</span>
          </div>

          {/* Card 5: Expiring Soon */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Expiring Soon (≤ 5d)</span>
            <strong className="text-2xl sm:text-3xl font-black text-amber-500 block">{expiringSoonCount}</strong>
            <span className="text-[11px] text-amber-700 font-medium">Prioritize FEFO issue</span>
          </div>

          {/* Card 6: Expired Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Expired Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-red-600 block">{expiredCount}</strong>
            <span className="text-[11px] text-red-600 font-bold">Excluded from availability</span>
          </div>

          {/* Card 7: Low Stock Groups */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Low Stock Groups</span>
            <strong className={`text-2xl sm:text-3xl font-black block ${lowStockGroupsList.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {lowStockGroupsList.length > 0 ? lowStockGroupsList.join(', ') : 'None'}
            </strong>
            <span className={`text-[11px] font-bold ${lowStockGroupsList.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {lowStockGroupsList.length > 0 ? 'Threshold < 5 units' : 'All groups adequate'}
            </span>
          </div>

          {/* Card 8: New Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">New Requests</span>
            <strong className="text-2xl sm:text-3xl font-black text-indigo-600 block">{newRequestsCount}</strong>
            <span className="text-[11px] text-slate-600 font-medium">Created recently</span>
          </div>

          {/* Card 9: Pending Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Pending Requests</span>
            <strong className="text-2xl sm:text-3xl font-black text-amber-600 block">{pendingRequestsCount}</strong>
            <span className="text-[11px] text-slate-600 font-medium">In requester & hospital queue</span>
          </div>

          {/* Card 10: Critical Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Critical Requests</span>
            <strong className="text-2xl sm:text-3xl font-black text-red-600 block">{criticalRequestsCount}</strong>
            <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5"/> High priority triage
            </span>
          </div>

          {/* Card 11: Today's Issued Units */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-bold block">Today's Issued Units</span>
            <strong className="text-2xl sm:text-3xl font-black text-emerald-600 block">{todayIssuedCount}</strong>
            <span className="text-[11px] text-emerald-700 font-medium">Completed today</span>
          </div>

          {/* Card 12: Action Card */}
          <div onClick={() => navigate('/bloodbank/issue')} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xs space-y-1 cursor-pointer hover:opacity-95 transition-all">
            <span className="text-xs text-emerald-100 font-bold block">Quick Transfusion</span>
            <strong className="text-lg font-black block flex items-center gap-1.5">
              <Send className="w-5 h-5"/> Issue Blood
            </strong>
            <span className="text-[11px] text-emerald-100 font-medium">Match barcode units & dispatch</span>
          </div>

        </div>
      </div>

      {/* 3. Quick Section Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Box 1: Requester & Hospital Queues */}
        <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Package className="w-4 h-4"/>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Request Queues</h3>
                <span className="text-[10px] text-slate-600 font-medium">3 separated channels</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
              {pendingRequestsCount} Active
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Process Direct Requesters, verified Hospital emergency orders, and Inter-Blood-Bank transfer replenishment requests.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button onClick={() => navigate('/bloodbank/requests')} className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-colors">
              Open Requester Queue →
            </button>
            <button onClick={() => navigate('/bloodbank/hospital-requests')} className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
              Hospitals
            </button>
          </div>
        </div>

        {/* Box 2: Inventory & Cold Vaults */}
        <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Boxes className="w-4 h-4"/>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Inventory Matrix</h3>
                <span className="text-[10px] text-slate-600 font-medium">PRBC, Whole Blood, Platelets, Plasma</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {availableCount} Available
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Real-time stock aggregated by Blood Group $\times$ Component. Telemetry for cold chain vault temperatures.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button onClick={() => navigate('/bloodbank/inventory')} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors">
              View Inventory Matrix →
            </button>
            <button onClick={() => navigate('/bloodbank/preservation')} className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
              Vaults
            </button>
          </div>
        </div>

        {/* Box 3: Blood Unit Lifecycle & Tracking */}
        <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4"/>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Unit Lifecycle</h3>
                <span className="text-[10px] text-slate-600 font-medium">Individual barcode tracking</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
              {totalUnits} Units
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Track units through testing, storage, reservation, issue, and transfusion. Automated expiry alerts.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button onClick={() => navigate('/bloodbank/units')} className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition-colors">
              Track Barcode Units →
            </button>
            <button onClick={() => navigate('/bloodbank/activity')} className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
              Audit Log
            </button>
          </div>
        </div>

      </div>

      {/* 4. Live Portal Overview Banner */}
      <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4 text-emerald-950">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600"/> Multi-Portal Real-Time Interconnection Active
          </h3>
          <p className="text-xs text-emerald-800 font-medium">
            Your blood bank is synchronously connected with Requester Portal, Hospital Network, Voluntary Donors, and Super Admin Live Monitoring.
          </p>
        </div>

        <button onClick={() => navigate('/bloodbank/requests')} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer">
          Open Operations Desk
        </button>
      </div>

    </div>);
};
