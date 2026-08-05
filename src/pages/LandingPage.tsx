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
  Phone
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, setActiveEmergencyPostModal, requests } = useApp();

  return (
    <div className="space-y-16 animate-in fade-in">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 border border-slate-800 p-8 lg:p-14 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Real-Time Blood Donor Network • Hubballi-Dharwad Grid
        </div>

        <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Every Drop Counts. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Connect Donors with Patients in Real Time.
          </span>
        </h1>

        <p className="text-sm lg:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Blood Net connects voluntary blood donors with hospitals, blood banks, and emergency trauma patients using AI matching, backup escalation queues, and verified hospital co-signs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" /> Post Emergency Need
          </button>

          <button
            onClick={() => navigateTo('donor-search')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-5 h-5 text-red-400" /> Find Donors Nearby
          </button>
        </div>

        {/* Live Emergency Marquee */}
        <div className="pt-6 border-t border-slate-800/80 max-w-3xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-red-400">
            <Activity className="w-4 h-4 animate-pulse" /> Live Emergency Ticker:
          </span>
          <span className="truncate">O- needed at KIMS Hubballi (Bed 14) • AB- needed at SDM Dharwad</span>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
          <span className="text-3xl font-black text-white">14,890+</span>
          <span className="text-xs text-slate-400 block">Lives Saved in 2026</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
          <span className="text-3xl font-black text-red-500">4,820</span>
          <span className="text-xs text-slate-400 block">Active Verified Donors</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
          <span className="text-3xl font-black text-amber-400">12 Mins</span>
          <span className="text-xs text-slate-400 block">Avg Response Time</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
          <span className="text-3xl font-black text-emerald-400">42</span>
          <span className="text-xs text-slate-400 block">Partner Hospitals</span>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-6 text-center">
        <h2 className="text-2xl font-bold text-white">How Blood Net Saves Lives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 font-extrabold flex items-center justify-center">1</div>
            <h3 className="font-bold text-base text-white">Post Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create an emergency blood request with hospital verification and patient blood group requirements.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 font-extrabold flex items-center justify-center">2</div>
            <h3 className="font-bold text-base text-white">AI Donor Match</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our algorithm ranks donors by compatibility, distance, availability, and response likelihood score.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-extrabold flex items-center justify-center">3</div>
            <h3 className="font-bold text-base text-white">Donate & Save Life</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Donor confirms, appointment is scheduled at the hospital, certificate generated, and reward points awarded.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
