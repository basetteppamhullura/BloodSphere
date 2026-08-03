import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Search,
  AlertTriangle,
  Users,
  Building2,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, requests, setActiveEmergencyPostModal } = useApp();

  return (
    <div className="space-y-16 animate-in fade-in">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/60 border border-slate-800 p-8 lg:p-14 overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-xs font-bold text-red-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>REAL-TIME BLOOD DONOR NETWORK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Connecting Lifesavers with Urgent Blood Needs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400">Seconds</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            A fast, mobile-first platform bringing together voluntary blood donors, emergency requesters, hospitals, and blood banks across Karnataka and India.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigateTo('donor-search')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-950 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4" /> Find Donors Now
            </button>

            <button
              onClick={() => setActiveEmergencyPostModal(true)}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Post Emergency Need
            </button>
          </div>

          {/* Quick Features List */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Aadhaar Verified Donors</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Masked Contact Privacy</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7 Hospital Inventory</span>
          </div>

        </div>
      </section>

      {/* Impact Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lives Saved', value: '14,890+', color: 'text-red-400', icon: Heart },
          { label: 'Verified Donors', value: '8,420+', color: 'text-blue-400', icon: Users },
          { label: 'Blood Banks', value: '142', color: 'text-emerald-400', icon: Building2 },
          { label: 'Avg Match Time', value: '4.2 Mins', color: 'text-amber-400', icon: Zap }
        ].map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-800 text-slate-200">
                <IconComp className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* How it Works Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">How BloodNet Saves Lives</h2>
          <p className="text-xs text-slate-400">Three simple steps to request blood or become a donor hero</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Post Emergency Need",
              desc: "Requesters type or paste plain language emergency details (blood group, hospital, units).",
              icon: AlertTriangle
            },
            {
              step: "02",
              title: "Smart Donor Matching",
              desc: "Our algorithm ranks nearby eligible donors by compatibility matrix and Haversine distance.",
              icon: Zap
            },
            {
              step: "03",
              title: "Privacy Relay & Donation",
              desc: "Donors respond, communicate via masked chat relay, and donate safely at the blood bank.",
              icon: ShieldCheck
            }
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-slate-800 absolute right-4 top-4">{item.step}</span>
              <item.icon className="w-8 h-8 text-red-500" />
              <h3 className="font-bold text-slate-100 text-base">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Urgent Requests Marquee Section */}
      <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-bold text-base text-slate-100">Live Critical Emergency Board</h3>
          </div>
          <button
            onClick={() => navigateTo('emergency-requests')}
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            View All ({requests.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.slice(0, 2).map((req) => (
            <div key={req.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-black text-base flex items-center justify-center">
                  {req.bloodGroup}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{req.patientName}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> {req.hospitalName}, {req.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('emergency-requests')}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Respond
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
