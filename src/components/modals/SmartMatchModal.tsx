import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Send, ShieldCheck, MapPin } from 'lucide-react';

export const SmartMatchModal: React.FC = () => {
  const { activeSmartMatchModal, setActiveSmartMatchModal, donors, showToast } = useApp();
  const [pulseSent, setPulseSent] = useState(false);

  if (!activeSmartMatchModal) return null;

  const req = activeSmartMatchModal;

  const handleSendPulse = () => {
    setPulseSent(true);
    showToast(`🚨 High-priority SMS pulse alert sent to ${donors.length} matched donors!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">AI Smart Donor Matching</h3>
          </div>

          <button onClick={() => setActiveSmartMatchModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200">
            Matching donors for <strong className="text-white">{req.bloodGroup}</strong> blood needed at <strong className="text-white">{req.hospitalName}</strong>
          </div>

          <div className="space-y-3">
            {donors.map((donor, idx) => (
              <div key={donor.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{donor.name} ({donor.bloodGroup})</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.distanceKm} km away ({donor.city})
                    </p>
                  </div>
                </div>

                <div className="text-right font-black text-amber-400 text-sm">
                  {98 - idx * 4}% Match
                </div>
              </div>
            ))}
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
            <Send className="w-4 h-4" /> {pulseSent ? 'SMS Pulse Sent!' : 'Broadcast Emergency SMS Pulse'}
          </button>
        </div>

      </div>
    </div>
  );
};
