import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { checkDonorEligibility } from '../../utils/matchingEngine';
import {
  ShieldAlert,
  Heart,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
  Calendar,
  AlertCircle,
  Sliders,
  Check,
  X,
  Droplet,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export const RealtimeDonorPortal: React.FC = () => {
  const {
    requests,
    donors,
    donorRespondToRequest,
    toggleDonorAvailability,
    openEmergencyChat,
    leaderboard,
    showToast
  } = useApp();

  const { currentUser } = useAuth();

  // Find active donor object or fallback
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];

  // Donor eligibility check
  const eligibility = checkDonorEligibility(loggedInDonor);

  // Incoming Emergency Requests for donor
  const incomingRequests = requests.filter(r => {
    if (r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED') return false;
    return r.bloodGroup === loggedInDonor.bloodGroup || loggedInDonor.bloodGroup === 'O-';
  });

  // Accepted Requests by donor
  const acceptedRequests = requests.filter(r => {
    return (r.donorResponses || []).some(resp => resp.donorId === loggedInDonor.id && resp.status === 'ACCEPTED');
  });

  // Dashboard counter metrics
  const nearbyEmergencyCount = incomingRequests.length;
  const activeAcceptedCount = acceptedRequests.length;
  const todaysOpportunitiesCount = incomingRequests.filter(r => r.urgency === 'CRITICAL').length;

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* 1. DONOR REAL-TIME DASHBOARD HEADER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
              <span>{loggedInDonor.bloodGroup}</span>
              <span className="text-[9px] opacity-90">Donor</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{loggedInDonor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {loggedInDonor.city}, Karnataka • Real-Time Alert System Active
              </p>
            </div>
          </div>

          {/* AVAILABILITY CONTROLS TOGGLE */}
          <div className="p-2 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">Availability Status</span>
              <select
                value={loggedInDonor.availabilityStatus || 'AVAILABLE'}
                onChange={e => toggleDonorAvailability(loggedInDonor.id, e.target.value as any, loggedInDonor.emergencyAlertsEnabled)}
                className="bg-transparent text-slate-900 font-black text-xs focus:outline-none cursor-pointer"
              >
                <option value="AVAILABLE" className="bg-white text-emerald-600 font-bold">🟢 AVAILABLE</option>
                <option value="TEMPORARILY UNAVAILABLE" className="bg-white text-amber-600 font-bold">🟡 TEMPORARILY UNAVAILABLE</option>
                <option value="NOT AVAILABLE" className="bg-white text-red-600 font-bold">🔴 NOT AVAILABLE</option>
              </select>
            </div>
          </div>
        </div>

        {/* 10-METRICS REAL-TIME COUNTER CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Total Verified Donations</span>
            <strong className="text-lg text-slate-900 font-black block">{loggedInDonor.totalDonations} Completed</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Last Verified Donation</span>
            <strong className="text-xs text-slate-700 font-bold block mt-1">{loggedInDonor.lastDonationDate || '2026-03-10'}</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Next Eligible Date</span>
            <strong className="text-xs text-emerald-600 font-bold block mt-1">{loggedInDonor.nextEligibleDate || '2026-06-10'}</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Emergency Alerts</span>
            <strong className="text-lg text-red-600 font-black block">{nearbyEmergencyCount} Requests</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Accepted Requests</span>
            <strong className="text-lg text-indigo-600 font-black block">{activeAcceptedCount} Active</strong>
          </div>
        </div>

      </div>

      {/* 2. REAL-TIME EMERGENCY BLOOD ALERTS FEED */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" /> Live Emergency Requests Feed ({incomingRequests.length})
            </h3>
            <p className="text-slate-500 text-[11px]">Real-time push alerts matched to your blood group ({loggedInDonor.bloodGroup})</p>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-sky-50/40 border border-sky-100 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <strong className="block text-slate-900 font-bold">You're all clear for now!</strong>
            <p className="text-xs">No active emergency blood requests match your current location. We will notify you instantly when a need arises.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map(req => {
              const myResp = (req.donorResponses || []).find(r => r.donorId === loggedInDonor.id);
              const isAccepted = myResp?.status === 'ACCEPTED';
              const isDeclined = myResp?.status === 'DECLINED';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-3xl border-2 transition-all space-y-4 shadow-sm ${
                    req.urgency === 'CRITICAL' ? 'border-red-200 bg-red-50/20' : 'border-sky-100 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-sky-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
                        <span>{req.bloodGroup}</span>
                        <span className="text-[9px] opacity-90">{req.bloodComponent || 'PRBC'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[10px] uppercase border border-red-200">
                            🚨 {req.urgency}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">ID: {req.id}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 mt-0.5">{req.patientName}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-red-500" /> {req.hospitalName}, {req.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {req.unitsNeeded} Units
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-sky-50/50 p-3 rounded-2xl border border-sky-100 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Required Within</span>
                      <strong className="text-amber-600 font-bold">{req.requiredTime || 'Within 2 Hours'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Confirmed Donors</span>
                      <strong className="text-emerald-600 font-bold">{req.confirmedUnits || 0} / {req.unitsNeeded} Units</strong>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="pt-1">
                    {isAccepted ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                        <span>✅ You accepted this emergency request</span>
                        <button
                          onClick={() => openEmergencyChat(req.id, loggedInDonor.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all hover:scale-105"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Private Chat
                        </button>
                      </div>
                    ) : isDeclined ? (
                      <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-bold text-center">
                        ℹ️ You declined this request.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'ACCEPTED')}
                          className="py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                        >
                          <Check className="w-4 h-4" /> ACCEPT
                        </button>

                        <button
                          onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'DECLINED')}
                          className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <X className="w-4 h-4" /> DECLINE
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
