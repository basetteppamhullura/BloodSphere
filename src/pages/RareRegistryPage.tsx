import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertOctagon, Phone, Sparkles, Send, MapPin, Zap } from 'lucide-react';

export const RareRegistryPage: React.FC = () => {
  const { donors, setActiveChatModal, requests, showToast } = useApp();

  const rareDonors = donors.filter(d => ['O-', 'AB-', 'A-', 'Bombay Phenotype (O-h)'].includes(d.bloodGroup));

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-extrabold text-white">Rare Blood Phenotype Registry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
              NATIONAL EMERGENCY OUTREACH
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Dedicated opt-in registry for ultra-rare blood groups (O- negative, AB-, Bombay Phenotype O-h)
          </p>
        </div>

        <button
          onClick={() => showToast("🚨 Emergency Rare Group Outreach Pulse broadcasted to 28 registered rare donors!")}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Send className="w-4 h-4" /> Broadcast Proactive Rare Pulse
        </button>
      </div>

      {/* Rare Groups Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-red-400 block text-sm">O- Universal Red Cell</span>
          <p className="text-slate-400 leading-relaxed">Only ~5% of population. Compatible with all emergency trauma patients.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-amber-400 block text-sm">AB- Plasma Universal</span>
          <p className="text-slate-400 leading-relaxed">Extremely low stock in blood banks. Critical for emergency plasma transfusions.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-emerald-400 block text-sm">Bombay Phenotype (O-h)</span>
          <p className="text-slate-400 leading-relaxed">Ultra-rare (1 in 10,000 in India). Requires proactive regional tracking.</p>
        </div>
      </div>

      {/* Rare Donors Directory List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
          Registered Rare Donors On-Call ({rareDonors.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rareDonors.map((donor) => (
            <div key={donor.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-red-800/60 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-sm flex items-center justify-center p-1 text-center shadow-md">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{donor.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.city}, Karnataka ({donor.distanceKm} km)
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> Proactive On-Call
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold">Reliability: <strong className="text-amber-400">{donor.reliabilityScore}%</strong></span>
                
                <button
                  onClick={() => setActiveChatModal({ request: requests[0], donor })}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold border border-slate-700 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Contact via Relay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
