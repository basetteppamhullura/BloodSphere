import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  PhoneCall,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export default function EmergencyRequestCard({ request }) {
  const { setActiveSmartMatchModal, respondToRequest, currentUser, addToastNotification } = useApp();

  const isCritical = request.urgency === 'CRITICAL';
  const isHigh = request.urgency === 'HIGH';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `URGENT BLOOD NEED: ${request.bloodGroup} in ${request.city}`,
        text: `Urgent! ${request.unitsNeeded} units of ${request.bloodGroup} blood needed at ${request.hospitalName}, ${request.city}.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      addToastNotification(`Emergency Request link copied to clipboard! Share on WhatsApp.`);
    }
  };

  return (
    <div className={`glass-card p-5 transition-all duration-300 hover:border-slate-600 relative overflow-hidden ${
      isCritical ? 'border-red-900/60 shadow-lg shadow-red-950/40' : ''
    }`}>
      
      {/* Top Banner & Urgency Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        
        {/* Blood Group Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-xl shadow-inner ${
            isCritical
              ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-950 border border-red-400/30 animate-pulse-glow'
              : isHigh
              ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white'
              : 'bg-slate-800 text-slate-200 border border-slate-700'
          }`}>
            <span>{request.bloodGroup}</span>
            <span className="text-[10px] font-semibold opacity-90">{request.unitsNeeded} {request.unitsNeeded > 1 ? 'Units' : 'Unit'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-100">{request.patientName}</h3>
              {request.status === 'FULFILLED' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> FULFILLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-medium text-slate-300">{request.hospitalName}</span>, {request.city}
            </p>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
            isCritical
              ? 'bg-red-950 text-red-400 border border-red-800'
              : isHigh
              ? 'bg-amber-950 text-amber-400 border border-amber-800'
              : 'bg-blue-950 text-blue-400 border border-blue-800'
          }`}>
            {isCritical && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
            {request.urgency}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Requested today
          </span>
        </div>

      </div>

      {/* Reason / Clinical Details */}
      <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-4 leading-relaxed">
        <span className="text-slate-400 font-medium">Medical Context:</span> {request.reason}
      </p>

      {/* Stats Bar (AI Score, Matched Donors, Shares) */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs mb-4">
        <div>
          <span className="text-[10px] text-slate-400 block">AI Urgency Score</span>
          <span className="font-bold text-red-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> {request.aiUrgencyScore}/100
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Matched Donors</span>
          <span className="font-bold text-slate-200">{request.matchedDonorsCount} Nearby</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Units Status</span>
          <span className="font-bold text-emerald-400">{request.unitsFulfilled}/{request.unitsNeeded} Received</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        
        {/* AI Smart Match Modal Trigger */}
        <button
          onClick={() => setActiveSmartMatchModal(request)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all hover:border-indigo-500/50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Smart Match Donors</span>
        </button>

        {/* Respond / Connect Button */}
        <button
          onClick={() => respondToRequest(request, currentUser)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all active:scale-95"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>I Can Donate</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
          title="Share request"
        >
          <Share2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
