import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import {
  Heart,
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  PhoneCall,
  Droplet,
  Lock,
  UserCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Bell,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    navigateTo,
    setActiveEmergencyPostModal,
    requests,
    donors,
    camps,
    bloodBanks,
    notifications
  } = useApp();

  const { currentUser, currentRole } = useAuth();

  // Find active donor profile
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];
  const eligibility = checkDonorEligibility(loggedInDonor);

  // Compute live real-time metrics
  const activeNearbyRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const nearbyCampsCount = camps.length;

  // Compute live blood shortage alerts from blood banks inventory
  const shortageAlerts: { bankName: string; group: string; units: number }[] = [];
  bloodBanks.forEach(bank => {
    bank.inventory.forEach(item => {
      if (item.units <= (item.minThreshold || 5)) {
        shortageAlerts.push({
          bankName: bank.name,
          group: item.group,
          units: item.units
        });
      }
    });
  });

  return (
    <div className="space-y-10 py-4 animate-in fade-in text-xs">
      
      {/* 1. REAL-TIME DONOR STATUS SUMMARY CARD (WHEN LOGGED IN) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/70 border-2 border-red-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-red-950">
              <span>{loggedInDonor.bloodGroup}</span>
              <span className="text-[9px] opacity-90">Blood</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase tracking-wider">
                  REAL-TIME DONOR STATUS
                </span>
                <span className="text-slate-400 font-mono">ID: {loggedInDonor.id}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">{loggedInDonor.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Location: {loggedInDonor.city}, Karnataka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('emergency-requests')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-950 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> View Emergency Board
            </button>
          </div>
        </div>

        {/* REAL-TIME METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Donor Availability</span>
            <strong className="text-sm font-black text-emerald-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              {loggedInDonor.availabilityStatus || '🟢 Available'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Eligibility Status</span>
            <strong className={`text-sm font-black ${eligibility.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
              {eligibility.isEligible ? '🟢 Eligible' : '🟡 Temporarily Deferred'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Nearby Emergency Requests</span>
            <strong className="text-lg text-red-400 font-black">{activeNearbyRequests.length} Requests</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Nearby Blood Camps</span>
            <strong className="text-lg text-amber-400 font-black">{nearbyCampsCount} Camps</strong>
          </div>
        </div>
      </div>

      {/* 2. SHORTAGE ALERTS & REAL-TIME NOTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shortage Alerts Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" /> Live Regional Blood Shortage Alerts
            </h3>
            <span className="text-[10px] text-amber-400 font-mono font-bold">{shortageAlerts.length} Critical Stocks</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {shortageAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-amber-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-950 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-800">
                    {alert.group}
                  </span>
                  <div>
                    <strong className="text-white font-bold block">{alert.bankName}</strong>
                    <span className="text-[10px] text-slate-400">Inventory threshold alert</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800">
                  {alert.units} Units Left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Important Notifications Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Recent Activity & Real-Time Alerts
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Push System</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notifications.slice(0, 4).map(notif => (
              <div key={notif.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-xs">{notif.title}</strong>
                  <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. HERO & DEDICATED PORTAL ROUTES */}
      <section className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/80 border border-slate-800 shadow-2xl">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Next-Gen Emergency Blood Network
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Connecting Lifesavers, <span className="text-red-500">Saving Lives</span> Instantly.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            BloodNet is a multi-role blood donation platform with 1-minute emergency requests, Haversine GPS hospital distance discovery, live inventory stock tracking, and instant donor alerts.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveEmergencyPostModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-white" /> Create Emergency Blood Request
            </button>

            <button
              onClick={() => navigateTo('donor-search')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-800 flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4 text-red-500" /> Search Donor Directory
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
