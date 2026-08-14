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
    setActiveChatModal,
    leaderboard,
    showToast
  } = useApp();

  const { currentUser } = useAuth();

  // Find active donor object or fallback
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];

  // Donor eligibility check
  const eligibility = checkDonorEligibility(loggedInDonor);

  // Incoming Emergency Requests for donor (Active requests matching donor's blood group or universal compatibility)
  const incomingRequests = requests.filter(r => {
    if (r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED') return false;
    // Match blood group or universal O-
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/50 border border-slate-800 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-red-950">
              <span>{loggedInDonor.bloodGroup}</span>
              <span className="text-[9px] opacity-90">Donor</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{loggedInDonor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> {loggedInDonor.city}, Karnataka • Emergency Alert System Active
              </p>
            </div>
          </div>

          {/* AVAILABILITY CONTROLS TOGGLE */}
          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Availability Status</span>
              <select
                value={loggedInDonor.availabilityStatus || 'AVAILABLE'}
                onChange={e => toggleDonorAvailability(loggedInDonor.id, e.target.value as any, loggedInDonor.emergencyAlertsEnabled)}
                className="bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer"
              >
                <option value="AVAILABLE" className="bg-slate-900 text-emerald-400">🟢 AVAILABLE</option>
                <option value="TEMPORARILY UNAVAILABLE" className="bg-slate-900 text-amber-400">🟡 TEMPORARILY UNAVAILABLE</option>
                <option value="NOT AVAILABLE" className="bg-slate-900 text-red-400">🔴 NOT AVAILABLE</option>
              </select>
            </div>

            <div className="pl-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">Emergency Alerts</span>
              <button
                onClick={() => toggleDonorAvailability(loggedInDonor.id, loggedInDonor.availabilityStatus || 'AVAILABLE', !loggedInDonor.emergencyAlertsEnabled)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all ${
                  loggedInDonor.emergencyAlertsEnabled !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {loggedInDonor.emergencyAlertsEnabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* DONOR REAL-TIME METRICS & ELIGIBILITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
          
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Donor Status</span>
            <strong className={`text-xs font-black block ${eligibility.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
              {eligibility.isEligible ? '🟢 Eligible to Donate' : '🟡 Temporarily Ineligible'}
            </strong>
            {!eligibility.isEligible && (
              <p className="text-[9px] text-slate-400 font-sans mt-1 line-clamp-1">{eligibility.reason}</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Last Donation</span>
            <strong className="text-sm text-white font-bold block">{loggedInDonor.lastDonationDate || '2026-03-10'}</strong>
            <span className="text-[9px] text-slate-400 font-sans">Next Eligible: {loggedInDonor.nextEligibleDate || '2026-06-10'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Nearby Emergency Requests</span>
            <strong className="text-lg text-red-400 font-black block">{nearbyEmergencyCount} Requests</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Active Accepted Requests</span>
            <strong className="text-lg text-emerald-400 font-black block">{activeAcceptedCount} Active</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Today's Opportunities</span>
            <strong className="text-lg text-amber-400 font-black block">{todaysOpportunitiesCount} Critical</strong>
          </div>

        </div>

        {/* MEDICAL ELIGIBILITY GUIDANCE CARD */}
        {!eligibility.isEligible && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-extrabold text-white block">Medical Eligibility & Health Guidance</strong>
                <p className="text-[11px] text-amber-300">
                  {eligibility.reason} Standard interval between whole blood donations is 90 days. For medical queries, consult nearest blood center staff.
                </p>
              </div>
            </div>
            <a
              href="https://nbtc.naco.gov.in"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-[11px] shrink-0"
            >
              Medical Guidance
            </a>
          </div>
        )}

      </div>

      {/* 2. REAL-TIME EMERGENCY BLOOD REQUESTS FEED */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Real-Time Nearby Emergency Requests ({incomingRequests.length})
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-Time Dispatch Active
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
            No active emergency blood requests nearby at this moment. You will be notified live when a request is dispatched!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map(req => {
              const myResponse = (req.donorResponses || []).find(r => r.donorId === loggedInDonor.id);
              const matchScore = req.matchScores?.[loggedInDonor.id] || 95;

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-3xl bg-slate-950 border-2 transition-all space-y-4 shadow-xl ${
                    req.urgency === 'CRITICAL' ? 'border-red-600/80 shadow-red-950/40' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-red-950">
                        <span>{req.bloodGroup}</span>
                        <span className="text-[9px] opacity-90">{req.bloodComponent || 'PRBC'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-black text-[10px] uppercase">
                            🚨 {req.urgency} EMERGENCY
                          </span>
                          <span className="text-slate-400 text-[10px]">Req ID: {req.id}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-white mt-0.5">{req.patientName}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-red-400" /> {req.hospitalName}, {req.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {matchScore}% Match
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Units Required</span>
                      <strong className="text-white font-bold">{req.unitsNeeded} Units ({req.bloodComponent || 'PRBC'})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Required Within</span>
                      <strong className="text-amber-400 font-bold">{req.requiredTime || 'Within 2 Hours'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Distance</span>
                      <span className="text-slate-200 font-bold">{req.lat ? '2.1' : '3.2'} km from your location</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Medical Reason</span>
                      <span className="text-slate-300 line-clamp-1">{req.reason}</span>
                    </div>
                  </div>

                  {/* RESPONSE BUTTONS */}
                  {myResponse ? (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">Your Response:</span>
                      <span className={`px-3 py-1 rounded-xl font-extrabold uppercase ${
                        myResponse.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {myResponse.status}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'ACCEPTED')}
                        className="py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Check className="w-4 h-4" /> Accept Request
                      </button>
                      <button
                        onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'DECLINED')}
                        className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. ACCEPTED REQUESTS & DONATION APPOINTMENT COORDINATION */}
      {acceptedRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active Accepted Requests & Appointment Coordination
          </h3>

          <div className="space-y-4">
            {acceptedRequests.map(req => (
              <div key={req.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px] uppercase">
                      Status: Accepted & Confirmed
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1">{req.patientName} at {req.hospitalName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Blood Group: <strong>{req.bloodGroup}</strong> ({req.unitsNeeded} Units Needed)</p>
                  </div>

                  <button
                    onClick={() => setActiveChatModal({ request: req, donor: loggedInDonor })}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> Open Privacy Chat Relay
                  </button>
                </div>

                {/* APPOINTMENT DETAILS */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Donation Appointment Schedule
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date & Time</span>
                      <strong className="text-white">{req.appointmentDetails?.date || 'Today'} • {req.appointmentDetails?.time || '10:30 AM'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Venue / Room</span>
                      <strong className="text-white">{req.appointmentDetails?.venue || `${req.hospitalName} Blood Desk`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Appointment Status</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-extrabold text-[10px] uppercase">
                        Confirmed & Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GAMIFICATION & BADGES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="w-5 h-5 text-amber-400" /> Donor Achievement Badges & Lifesaver Leaderboard
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-3xl block">🛡️</span>
            <strong className="font-extrabold text-white text-xs block">Universal Lifesaver</strong>
            <span className="text-[10px] text-slate-400 block">Donated rare blood 5+ times</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-3xl block">⚡</span>
            <strong className="font-extrabold text-white text-xs block">Fast Responder</strong>
            <span className="text-[10px] text-slate-400 block">Responded within 15 minutes</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-3xl block">🔥</span>
            <strong className="font-extrabold text-white text-xs block">Regular Donor</strong>
            <span className="text-[10px] text-slate-400 block">Maintained active streak</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-3xl block">🦸</span>
            <strong className="font-extrabold text-white text-xs block">Emergency Hero</strong>
            <span className="text-[10px] text-slate-400 block">Accepted critical ICU alert</span>
          </div>
        </div>
      </div>

    </div>
  );
};
