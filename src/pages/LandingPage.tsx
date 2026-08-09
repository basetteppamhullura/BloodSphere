import React from 'react';
import { useApp } from '../context/AppContext';
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
  UserCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, setActiveEmergencyPostModal } = useApp();

  return (
    <div className="space-y-16 py-4 animate-in fade-in">
      
      {/* Hero Section */}
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
              onClick={() => navigateTo('login-donor-requester')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-800 flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-red-500" /> Join as Voluntary Donor
            </button>
          </div>

        </div>
      </section>

      {/* 4 Separate Portal Route Choice Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Access BloodNet via Dedicated Portal Routes</h2>
          <p className="text-xs text-slate-400">Choose your system portal to navigate directly to its route</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* 1. Donor & Requester */}
          <div
            onClick={() => navigateTo('login-donor-requester')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-red-600/80 cursor-pointer space-y-3 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono text-red-400 block">/login/donor-requester</span>
            <h3 className="font-extrabold text-base text-white">Donor & Requester Login</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Public portal for voluntary donors and patient requesters with OTP verification.
            </p>
            <div className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Portal Route →
            </div>
          </div>

          {/* 2. Hospital Portal */}
          <div
            onClick={() => navigateTo('login-hospital')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-600/80 cursor-pointer space-y-3 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            </div>
            <span className="text-[10px] font-mono text-blue-400 block">/login/hospital</span>
            <h3 className="font-extrabold text-base text-white">Hospital Desk Login</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Restricted medical portal requiring Hospital License ID (`LIC-HUB-4482`) and 2FA OTP.
            </p>
            <div className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Hospital Route →
            </div>
          </div>

          {/* 3. Blood Bank Portal */}
          <div
            onClick={() => navigateTo('login-bloodbank')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-600/80 cursor-pointer space-y-3 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block">/login/bloodbank</span>
            <h3 className="font-extrabold text-base text-white">Blood Bank Portal</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Restricted inventory portal for real-time stock reservation and stock management.
            </p>
            <div className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Blood Bank Route →
            </div>
          </div>

          {/* 4. Super Admin Portal */}
          <div
            onClick={() => navigateTo('login-admin')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-600/80 cursor-pointer space-y-3 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 block">/login/admin</span>
            <h3 className="font-extrabold text-base text-white">Super Admin Control</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Private administration system for facility license approvals and account security.
            </p>
            <div className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Admin Route →
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
