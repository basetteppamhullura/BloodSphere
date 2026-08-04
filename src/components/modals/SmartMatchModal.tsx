import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Send, ShieldCheck, MapPin, Clock, Zap } from 'lucide-react';

export const SmartMatchModal: React.FC = () => {
  const { activeSmartMatchModal, setActiveSmartMatchModal, donors, showToast } = useApp();
  const [pulseSent, setPulseSent] = useState(false);

  if (!activeSmartMatchModal) return null;

  const req = activeSmartMatchModal;

  const handleSendPulse = () => {
    setPulseSent(true);
    showToast(`🚨 High-priority SMS pulse sent to Tier 1 donors! Backup queue set for 5-min escalation.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">AI Smart Donor Matching & Escalation Queue</h3>
          </div>

          <button onClick={() => setActiveSmartMatchModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex justify-between items-center">
            <span>Matching for <strong className="text-white">{req.bloodGroup}</strong> at <strong className="text-white">{req.hospitalName}</strong></span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-[10px] border border-amber-800 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Backup Queue: 5m Timeout
            </span>
          </div>

          <div className="space-y-3">
            {donors.map((donor, idx) => {
              const isTier1 = idx < 2;
              return (
                <div key={donor.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{donor.name} ({donor.bloodGroup})</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isTier1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isTier1 ? 'Tier 1 Priority' : 'Tier 2 Escalation'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.distanceKm} km ({donor.city})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-amber-400 text-sm block">{98 - idx * 4}% Match</span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                      <Zap className="w-3 h-3" /> {96 - idx * 5}% Likelihood
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={handleSendPulse}
            disabled={pulseSent}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
              pulseSent ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950'
            }`}
          >
            <Send className="w-4 h-4" /> {pulseSent ? 'Pulse Dispatched!' : 'Broadcast Tier 1 SMS Pulse'}
          </button>
        </div>

      </div>
    </div>
  );
};
