import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, Activity, X, Calendar, ShieldCheck, CheckCircle2, Droplet } from 'lucide-react';

export const HealthPassportModal: React.FC = () => {
  const { activeHealthPassportModal, setActiveHealthPassportModal, showToast } = useApp();
  const { currentUser } = useAuth();

  if (!activeHealthPassportModal) return null;

  const isFemale = currentUser?.gender === 'female';
  const donationIntervalDays = isFemale ? 84 : 56;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Donor Health Passport & Recovery Care</h3>
          </div>

          <button onClick={() => setActiveHealthPassportModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Policy Banner */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Policy Rule ({currentUser?.gender || 'Female'})</span>
              <span className="text-[11px] text-slate-400">Mandatory Recovery Gap: <strong>{donationIntervalDays} Days</strong></span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
              Optimal Health Score: 98%
            </span>
          </div>

          {/* Hb Trend Tracker Over Time */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
              Hemoglobin (Hb) Signal History (g/dL)
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {currentUser?.hbTrendHistory?.map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{item.date}</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{item.hb} g/dL</span>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Donation Care Checklist */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <Droplet className="w-4 h-4" /> Post-Donation Recovery Protocol
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Hydrate: Drink 500ml extra fluids today</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rest: Avoid heavy lifting for 24 hours</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Iron: Take prescribed iron supplements</li>
            </ul>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => { showToast("Health Passport updated!"); setActiveHealthPassportModal(false); }}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Save Health Log
          </button>
        </div>

      </div>
    </div>
  );
};
