import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
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
  CheckCircle2,
  Radio,
  RadioTower,
  Hospital
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

  const { currentUser } = useAuth();

  // Find active donor profile
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];
  const eligibility = checkDonorEligibility(loggedInDonor);

  // Compute live metrics
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
    <div className="space-y-10 py-2 animate-in fade-in text-xs">
      
      {/* 1. HERO SECTION WITH WATER BUBBLES & NETWORK GRAPHIC */}
      <section className="relative overflow-hidden p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-white via-sky-50/60 to-red-50/30 border border-sky-100 shadow-sm space-y-8">
        
        {/* Floating Water Bubble Background Orbs */}
        <div className="absolute top-6 right-10 w-28 h-28 rounded-full bg-sky-200/40 blur-2xl animate-bubble-float pointer-events-none" />
        <div className="absolute bottom-6 left-12 w-36 h-36 rounded-full bg-red-200/30 blur-2xl animate-bubble-slow pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-blue-100/50 blur-xl animate-bubble-float pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 text-sky-700 border border-sky-200 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Real-Time Healthcare Blood Network</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Find. Donate. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-rose-700">Save Lives.</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium pt-2 max-w-xl">
                <strong>Blood Net</strong> connects voluntary donors, patient requesters, hospitals, and blood banks in real time to help blood reach the people who need it most.
              </p>
            </div>

            {/* HERO BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigateTo('donor-search')}
                className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Search className="w-4 h-4" /> Find Blood Now
              </button>

              <button
                onClick={() => navigateTo('camps')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Heart className="w-4 h-4 fill-white" /> Donate Blood
              </button>

              <button
                onClick={() => setActiveEmergencyPostModal(true)}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-red-50 text-red-600 font-extrabold text-xs border border-red-200 shadow-xs flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-red-600" /> Emergency Request
              </button>
            </div>

            {/* LIVE TRUST INDICATORS */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-sky-100/80 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>100% Real-Time Backend Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Verified Hospital Transfusion Network</span>
              </div>
            </div>
          </div>

          {/* HERO RIGHT: CENTRAL BLOOD DROP + CONNECTED NETWORK GRAPHIC */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              
              {/* Concentric Water Wave Rings */}
              <div className="absolute inset-0 rounded-full bg-sky-100/50 border border-sky-200/60 animate-ping opacity-20" />
              <div className="absolute inset-4 rounded-full bg-white/80 border-2 border-sky-200 shadow-xl" />

              {/* Network Node Lines */}
              <svg className="absolute inset-0 w-full h-full text-sky-400" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-50" />
                {/* Node 1: Donor */}
                <line x1="100" y1="25" x2="100" y2="65" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
                {/* Node 2: Hospital */}
                <line x1="175" y1="100" x2="135" y2="100" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
                {/* Node 3: Requester */}
                <line x1="100" y1="175" x2="100" y2="135" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
                {/* Node 4: Blood Bank */}
                <line x1="25" y1="100" x2="65" y2="100" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
              </svg>

              {/* Node Badges Around Drop */}
              <div className="absolute top-2 px-3 py-1 rounded-full bg-white border border-sky-200 shadow-sm text-[10px] font-extrabold text-sky-700 flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-600" /> Donor
              </div>
              <div className="absolute right-0 px-3 py-1 rounded-full bg-white border border-sky-200 shadow-sm text-[10px] font-extrabold text-sky-700 flex items-center gap-1">
                <Hospital className="w-3 h-3 text-sky-600" /> Hospital
              </div>
              <div className="absolute bottom-2 px-3 py-1 rounded-full bg-white border border-sky-200 shadow-sm text-[10px] font-extrabold text-sky-700 flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-600" /> Requester
              </div>
              <div className="absolute left-0 px-3 py-1 rounded-full bg-white border border-sky-200 shadow-sm text-[10px] font-extrabold text-sky-700 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-emerald-600" /> Blood Bank
              </div>

              {/* Central Glowing Blood Drop */}
              <div className="relative z-10 w-24 h-24 rounded-t-full rounded-br-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 shadow-xl shadow-red-500/30 transform -rotate-45 flex items-center justify-center border-4 border-white">
                <div className="transform rotate-45 flex flex-col items-center justify-center text-white text-center">
                  <Heart className="w-7 h-7 fill-white animate-heartbeat" />
                  <span className="text-[9px] font-black tracking-widest uppercase mt-0.5">BloodNet</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. REAL-TIME DONOR STATUS SUMMARY CARD */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
              <span>{loggedInDonor.bloodGroup}</span>
              <span className="text-[9px] opacity-90">Blood</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wider">
                  REAL-TIME DONOR STATUS
                </span>
                <span className="text-slate-400 font-mono">ID: {loggedInDonor.id}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{loggedInDonor.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Location: {loggedInDonor.city}, Karnataka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('emergency-requests')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> View Emergency Board
            </button>
          </div>
        </div>

        {/* REAL-TIME METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Donor Availability</span>
            <strong className="text-sm font-black text-emerald-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              {loggedInDonor.availabilityStatus || '🟢 Available'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Eligibility Status</span>
            <strong className={`text-sm font-black ${eligibility.isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
              {eligibility.isEligible ? '🟢 Eligible' : '🟡 Temporarily Deferred'}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Emergency Requests</span>
            <strong className="text-lg text-red-600 font-black">{activeNearbyRequests.length} Requests</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Blood Camps</span>
            <strong className="text-lg text-amber-600 font-black">{nearbyCampsCount} Camps</strong>
          </div>
        </div>
      </div>

      {/* 3. SHORTAGE ALERTS & REAL-TIME NOTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shortage Alerts Card */}
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Live Regional Blood Shortage Alerts
            </h3>
            <span className="text-[10px] text-amber-700 font-mono font-bold">{shortageAlerts.length} Critical Stocks</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {shortageAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-300">
                    {alert.group}
                  </span>
                  <div>
                    <strong className="text-slate-900 font-bold block">{alert.bankName}</strong>
                    <span className="text-[10px] text-slate-500">Inventory threshold alert</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                  {alert.units} Units Left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Important Notifications Card */}
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" /> Recent Activity & Real-Time Alerts
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Push System</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notifications.slice(0, 4).map(notif => (
              <div key={notif.id} className="p-3 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-bold text-xs">{notif.title}</strong>
                  <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
