import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSmartDonorMatches, MatchedDonorResult } from '../../utils/matchingEngine';
import { EmergencyRequest, BloodGroup } from '../../types';
import {
  ShieldAlert,
  Search,
  Building2,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Droplet,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Phone,
  PlusCircle,
  Radio,
  Sliders,
  Check,
  XCircle,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Ban,
  Users
} from 'lucide-react';

export const RealtimeRequesterPortal: React.FC = () => {
  const {
    requests,
    donors,
    bloodBanks,
    sendDirectRequestToDonor,
    approveBloodBankReservation,
    cancelEmergencyRequest,
    setActiveEmergencyPostModal,
    setActiveChatModal,
    showToast
  } = useApp();

  // Selected Active Request ID (Defaults to first non-completed request or first request)
  const activeRequestsList = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const selectedReqId = activeRequestsList.length > 0 ? activeRequestsList[0].id : requests[0]?.id || '';
  const [activeReqId, setActiveReqId] = useState<string>(selectedReqId);

  // Active view sub-tab
  const [activeSearchTab, setActiveSearchTab] = useState<'donors' | 'hospitals' | 'bloodbanks'>('donors');

  // Search radius expansion state
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const activeReq = requests.find(r => r.id === activeReqId) || requests[0];

  if (!activeReq) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Active Blood Requests</h3>
        <p className="text-xs text-slate-400">Launch a new emergency blood request to activate real-time matching.</p>
        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg"
        >
          Create Blood Request
        </button>
      </div>
    );
  }

  // Calculate smart donor matches for active request
  const matchedDonors: MatchedDonorResult[] = calculateSmartDonorMatches(
    donors,
    activeReq.bloodGroup,
    activeReq.lat || 15.3647,
    activeReq.lng || 75.124,
    radiusKm,
    activeReq.urgency
  );

  // Nearby Hospitals & Blood Banks Stock Filter
  const targetGroup = activeReq.bloodGroup;
  const targetComponent = activeReq.bloodComponent || 'PRBC';

  const hospitalFacilities = bloodBanks
    .map(bank => {
      const stockItem = bank.inventory.find(i => i.group === targetGroup);
      const avail = stockItem ? stockItem.units : 0;
      return {
        ...bank,
        availableUnits: avail,
        lastUpdated: stockItem ? stockItem.lastUpdated : 'Just now'
      };
    })
    .sort((a, b) => (b.distanceKm || 0) - (a.distanceKm || 0));

  const totalMatchingStock = hospitalFacilities.reduce((sum, f) => sum + f.availableUnits, 0);

  // Auto radius expansion helper if no match
  const handleExpandRadius = () => {
    const nextRadius = radiusKm < 10 ? 25 : radiusKm < 25 ? 50 : 100;
    setRadiusKm(nextRadius);
    showToast(`Search radius expanded to ${nextRadius} km! Scanning additional regional facilities.`);
  };

  const isNoBloodAvailable = matchedDonors.length === 0 && totalMatchingStock === 0;

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* SELECT ACTIVE REQUEST DROPDOWN / BANNER */}
      {requests.length > 1 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-slate-300 font-bold">Select Active Request:</span>
          </div>
          <select
            value={activeReqId}
            onChange={e => setActiveReqId(e.target.value)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-extrabold text-xs focus:outline-none focus:border-red-500"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                {r.id} • {r.patientName} ({r.bloodGroup} {r.unitsNeeded} Units) - Status: {r.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. ACTIVE BLOOD REQUEST DASHBOARD CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/60 border-2 border-red-800/80 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-red-950">
              <span>{activeReq.bloodGroup}</span>
              <span className="text-[9px] opacity-90">{targetComponent}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase tracking-wider">
                  Request ID: {activeReq.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  Patient ID: {activeReq.patientId || 'BN-HUB-2026-00852'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{activeReq.patientName}</h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-red-400" /> {activeReq.hospitalName}, {activeReq.city}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                activeReq.urgency === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {activeReq.urgency} Urgency
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                activeReq.status === 'BLOOD_SECURED' || activeReq.status === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-800'
              }`}>
                {activeReq.status.replace(/_/g, ' ')}
              </span>
            </div>

            {activeReq.status !== 'COMPLETED' && activeReq.status !== 'CANCELLED' && (
              <button
                onClick={() => cancelEmergencyRequest(activeReq.id, 'Cancelled by requester')}
                className="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 mt-1"
              >
                <Ban className="w-3 h-3" /> Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* METRICS GRID SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Units Required</span>
            <strong className="text-lg text-white font-black">{activeReq.unitsNeeded} Units</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Confirmed Secured</span>
            <strong className="text-lg text-emerald-400 font-black">{activeReq.confirmedUnits || 0} / {activeReq.unitsNeeded} Units</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Required Time</span>
            <strong className="text-sm text-amber-400 font-bold block">{activeReq.requiredTime || 'Within 2 Hours'}</strong>
            <span className="text-[9px] text-slate-400">{activeReq.requiredDate || 'Today'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Matching Donors Found</span>
            <strong className="text-lg text-indigo-400 font-black">{matchedDonors.length} Donors</strong>
          </div>
        </div>

        {/* 2. REAL-TIME REQUEST STATUS TIMELINE */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="font-extrabold text-xs text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Clock className="w-4 h-4 text-red-500" /> Real-Time Request Lifecycle Timeline
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Sync Active
            </span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
            {(activeReq.requestTimeline || []).map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : isCurrent
                      ? 'bg-red-950/60 border-red-600 text-white animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>Step {idx + 1}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    ) : null}
                  </div>
                  <strong className="text-[11px] font-extrabold mt-1 block leading-tight">{step.label}</strong>
                  {step.timestamp && <span className="text-[9px] text-slate-400 mt-1 block font-mono">{step.timestamp}</span>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. MULTIPLE DONOR RESPONSES REAL-TIME BOARD */}
      {activeReq.donorResponses && activeReq.donorResponses.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Real-Time Donor Responses ({activeReq.donorResponses.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Secured: <strong>{activeReq.confirmedUnits || 0} / {activeReq.unitsNeeded} Units</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeReq.donorResponses.map((resp, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border space-y-2 ${
                  resp.status === 'ACCEPTED'
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{resp.donorName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      resp.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {resp.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                  <span>Distance: {resp.distanceKm} km</span>
                  <span className="font-mono">{resp.respondedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AUTO "NO BLOOD AVAILABLE NEARBY" WARNING & AUTO RADIUS EXPANSION */}
      {isNoBloodAvailable && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-600 text-amber-200 space-y-3 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-base font-extrabold text-white">No Matching Blood Currently Available Nearby ({radiusKm} km)</h3>
          <p className="text-xs text-amber-300 max-w-lg mx-auto">
            Blood Net is automatically monitoring regional blood banks, hospitals, and voluntary donors for new availability.
          </p>
          <button
            onClick={handleExpandRadius}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md"
          >
            Auto-Expand Search Radius ({radiusKm} km → {radiusKm * 2} km)
          </button>
        </div>
      )}

      {/* 5. REAL-TIME BLOOD SEARCH GRID (DONORS / HOSPITALS / BLOOD BANKS) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-red-500" /> Real-Time Blood Search & Source Finder
            </h3>
            <p className="text-slate-400 text-[11px]">Matching Blood Group {targetGroup} ({targetComponent}) within {radiusKm} km</p>
          </div>

          {/* TAB BUTTONS */}
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1 font-extrabold text-xs">
            <button
              onClick={() => setActiveSearchTab('donors')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'donors' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Eligible Donors ({matchedDonors.length})
            </button>
            <button
              onClick={() => setActiveSearchTab('hospitals')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'hospitals' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Nearby Hospitals ({hospitalFacilities.length})
            </button>
            <button
              onClick={() => setActiveSearchTab('bloodbanks')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'bloodbanks' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplet className="w-4 h-4" /> Blood Banks ({hospitalFacilities.length})
            </button>
          </div>
        </div>

        {/* TAB 1: ELIGIBLE NEARBY DONORS */}
        {activeSearchTab === 'donors' && (
          <div className="space-y-4">
            {matchedDonors.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                No eligible donors found within {radiusKm} km. Try expanding the search radius.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedDonors.map(({ donor, matchScore, distanceKm, isExactGroupMatch, compatibilityReason }) => {
                  const hasRequested = (activeReq.requestedDonorsList || []).includes(donor.id);
                  const hasResponded = (activeReq.donorResponses || []).find(r => r.donorId === donor.id);

                  return (
                    <div
                      key={donor.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                    >
                      <div>
                        {/* CARD HEADER */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-950">
                              {donor.bloodGroup}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-sm text-white">{donor.name}</h4>
                                <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Donor" />
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-red-400" /> {distanceKm} km away ({donor.city})
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {matchScore}% Match
                          </span>
                        </div>

                        {/* STATUS DETAILS */}
                        <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Availability</span>
                            <span className="font-bold text-emerald-400">Available</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Eligibility</span>
                            <span className="font-bold text-emerald-400">Eligible</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Response Status</span>
                            <span className="font-bold text-amber-400">
                              {hasResponded ? hasResponded.status : 'Not Yet Responded'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Privacy Phone</span>
                            <span className="font-mono text-slate-300">{donor.maskedPhone || '+91 98*** **310'}</span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => sendDirectRequestToDonor(activeReq.id, donor.id)}
                          disabled={hasRequested}
                          className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                            hasRequested
                              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-md shadow-red-950 hover:scale-105'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" /> {hasRequested ? 'Emergency Notification Sent' : 'Send Blood Request'}
                        </button>

                        <button
                          onClick={() => setActiveChatModal({ request: activeReq, donor })}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Privacy Chat Relay
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2 & TAB 3: HOSPITALS AND BLOOD BANKS */}
        {(activeSearchTab === 'hospitals' || activeSearchTab === 'bloodbanks') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalFacilities.map(fac => {
              const hasStock = fac.availableUnits > 0;

              return (
                <div
                  key={fac.id}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-400" /> {fac.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> {fac.distanceKm || 2.4} km away
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">{fac.address}, {fac.city} • Verified Facility</p>

                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-xs font-bold block">{targetGroup} {targetComponent}:</span>
                        <span className="text-[10px] text-slate-500">Updated: {fac.lastUpdated}</span>
                      </div>
                      <div className="text-right font-mono">
                        <strong className={`text-lg block font-black ${hasStock ? 'text-emerald-400' : 'text-red-400'}`}>
                          {hasStock ? `${fac.availableUnits} Units Available` : 'OUT OF STOCK'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => approveBloodBankReservation(activeReq.id, fac.id)}
                    disabled={!hasStock}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 ${
                      hasStock
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Droplet className="w-4 h-4" /> {hasStock ? `Reserve ${targetGroup} Blood from Facility` : 'Out of Stock'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
