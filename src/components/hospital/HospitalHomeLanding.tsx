import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Clock,
  ArrowRight,
  Droplet,
  FileText,
  UserPlus
} from 'lucide-react';

interface HospitalHomeLandingProps {
  onNavigateToTab: (tab: 'overview' | 'emergency_board' | 'inter_city' | 'blood_banks' | 'drives') => void;
}

export const HospitalHomeLanding: React.FC<HospitalHomeLandingProps> = ({ onNavigateToTab }) => {
  const { requests, setActiveEmergencyPostModal } = useApp();
  const { currentUser } = useAuth();

  const hospitalName = currentUser?.name || 'KIMS Teaching Hospital';

  // Live Activity Snapshot Counts
  const pendingCount = requests.filter(r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS').length;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;
  const approvedTodayCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'DONOR_CONFIRMED' || r.status === 'COMPLETED').length;
  const rejectedTodayCount = requests.filter(r => r.status === 'REJECTED').length;

  const overdueCriticalReq = requests.find(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED');

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto">
      
      {/* Hospital Welcome Header */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome, <span className="text-sky-600">{hospitalName}</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
              HOSPITAL MODE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hospital Operations Control Center • Real-Time Medical Inventory & Request Queue
          </p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Create Walk-In Patient Request
        </button>
      </div>

      {/* Overdue Critical Request Alert Banner */}
      {overdueCriticalReq && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-red-700">⚠️ OVERDUE CRITICAL REQUEST ALERT</h4>
              <p className="text-xs text-slate-600">
                Patient <strong>{overdueCriticalReq.patientName}</strong> ({overdueCriticalReq.bloodGroup}) requires <strong>{overdueCriticalReq.unitsNeeded} units</strong> immediately!
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('overview')}
            className="px-4 py-2 rounded-full bg-red-600 text-white font-black text-xs uppercase shadow-md hover:bg-red-500 flex items-center gap-1"
          >
            ACTION REQUIRED NOW <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-Time Live Activity Snapshot */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" /> Today's Real-Time Hospital Activity Snapshot
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Synced Live with Operations Desk</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-slate-500 font-bold block">Pending Requests</span>
            <span className="text-2xl font-black text-amber-600 block">{pendingCount}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-slate-500 font-bold block">Critical ICU Cases</span>
            <span className="text-2xl font-black text-red-600 block">{criticalCount}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-slate-500 font-bold block">Approved Today</span>
            <span className="text-2xl font-black text-emerald-600 block">{approvedTodayCount}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-1">
            <span className="text-slate-500 font-bold block">Rejected Today</span>
            <span className="text-2xl font-black text-slate-500 block">{rejectedTodayCount}</span>
          </div>
        </div>
      </div>

      {/* Hospital Quick Action Shortcuts (Vertical Stack of Card Groups) */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" /> Hospital Operational Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div
            onClick={() => onNavigateToTab('overview')}
            className="p-5 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 cursor-pointer space-y-3 shadow-xs transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Go to Live Desk Monitor & Queue
            </h4>
            <p className="text-slate-500 text-[11px]">Review and approve incoming patient requests in real time.</p>
            <div className="text-sky-600 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Live Desk →
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('overview')}
            className="p-5 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 cursor-pointer space-y-3 shadow-xs transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Droplet className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              View Blood Stock Monitor
            </h4>
            <p className="text-slate-500 text-[11px]">8 Groups × 4 Components inline editable stock grid.</p>
            <div className="text-sky-600 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Stock Grid →
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('overview')}
            className="p-5 rounded-3xl bg-white border border-sky-100 hover:border-emerald-300 cursor-pointer space-y-3 shadow-xs transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
              Record Donation Intake
            </h4>
            <p className="text-slate-500 text-[11px]">Add units directly to stock and log immutable audit entries.</p>
            <div className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Intake Form →
            </div>
          </div>

          <div
            onClick={() => setActiveEmergencyPostModal(true)}
            className="p-5 rounded-3xl bg-white border border-sky-100 hover:border-amber-300 cursor-pointer space-y-3 shadow-xs transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
              Create Walk-In Request
            </h4>
            <p className="text-slate-500 text-[11px]">Create requests on behalf of hospital walk-in patients.</p>
            <div className="text-amber-600 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Create Walk-In Request →
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
