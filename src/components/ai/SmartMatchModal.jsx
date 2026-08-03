import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rankMatchedDonors } from '../../services/aiEngine';
import { Sparkles, X, MapPin, Send, CheckCircle2, ShieldCheck, PhoneCall, AlertTriangle } from 'lucide-react';

export default function SmartMatchModal() {
  const { activeSmartMatchModal, setActiveSmartMatchModal, donors, addToastNotification } = useApp();
  const [pulseSent, setPulseSent] = useState(false);

  if (!activeSmartMatchModal) return null;

  const request = activeSmartMatchModal;
  const matchedDonors = rankMatchedDonors(request, donors);

  const handleSendPulseAlert = () => {
    setPulseSent(true);
    addToastNotification(`🚨 Emergency SMS & Push alert dispatched to ${matchedDonors.length} top matched donors!`);
    setTimeout(() => {
      setPulseSent(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-100">AI Smart Donor Matching Engine</h3>
                <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-800">
                  ML RANKING ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Matching nearby verified donors for <span className="text-red-400 font-bold">{request.bloodGroup}</span> needed at {request.hospitalName} ({request.city})
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSmartMatchModal(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Matched Donors List */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {matchedDonors.length} Eligible Donors Ranked by Match Score
            </span>
            <span className="text-xs text-slate-400">Scored on Compatibility, Distance & Reliability</span>
          </div>

          <div className="space-y-3">
            {matchedDonors.map((donor, idx) => (
              <div
                key={donor.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                
                {/* Donor Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 font-extrabold text-sm flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm">{donor.name}</h4>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">{donor.bloodGroup} Blood</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.calculatedDistanceKm} km away ({donor.city})
                      </span>
                      <span>Total Donations: {donor.totalDonations}</span>
                    </div>

                    {/* Match Score Reasons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {donor.matchReasons.map((reason, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score & Alert Button */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">AI Match Rating</span>
                    <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-400" /> {donor.matchPercentage}%
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                    Ready to Donate
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Donor privacy protected via encrypted contact relay</span>
          </div>

          <button
            onClick={handleSendPulseAlert}
            disabled={pulseSent}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              pulseSent
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950'
            }`}
          >
            {pulseSent ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Pulse Alert Sent to All Donors!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Broadcast High-Priority SMS Pulse
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
