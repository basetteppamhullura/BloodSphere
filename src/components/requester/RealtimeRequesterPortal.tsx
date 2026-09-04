import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSmartDonorMatches, MatchedDonorResult } from '../../utils/matchingEngine';
import {
  Heart,
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  PhoneCall,
  Droplet,
  Lock,
  UserCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Bell,
  CheckCircle2,
  Radio,
  RadioTower,
  MessageSquare,
  Share2,
  Check,
  X,
  Send,
  ShieldAlert
} from 'lucide-react';

export const RealtimeRequesterPortal: React.FC = () => {
  const {
    requests,
    donors,
    bloodBanks,
    sendDirectRequestToDonor,
    cancelEmergencyRequest,
    approveBloodBankReservation,
    setActiveEmergencyPostModal,
    openEmergencyChat,
    showToast
  } = useApp();

  const { currentUser } = useAuth();

  const [activeReqId, setActiveReqId] = useState<string>(requests[0]?.id || 'BR-1025');
  const [activeSearchTab, setActiveSearchTab] = useState<'donors' | 'hospitals' | 'bloodbanks'>('donors');
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const activeReq = requests.find(r => r.id === activeReqId) || requests[0];

  if (!activeReq) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">No Active Blood Requests</h3>
        <p className="text-xs text-slate-500">Launch a new emergency blood request to activate real-time matching.</p>
        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20"
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

  const targetGroup = activeReq.bloodGroup;
  const targetComponent = activeReq.bloodComponent || 'PRBC';

  // Nearby Hospitals & Blood Banks Stock Filter
  const hospitalFacilities = bloodBanks.map(bank => {
    const stockItem = bank.inventory.find(i => i.group === targetGroup);
    const avail = stockItem ? stockItem.units : 0;
    return {
      ...bank,
      availableUnits: avail,
      lastUpdated: stockItem?.lastUpdated || 'Just now'
    };
  });

  const totalMatchingStock = hospitalFacilities.reduce((sum, fac) => sum + fac.availableUnits, 0);

  const handleExpandRadius = () => {
    const nextRadius = radiusKm < 10 ? 25 : radiusKm < 25 ? 50 : 100;
    setRadiusKm(nextRadius);
    showToast(`Search radius expanded to ${nextRadius} km! Scanning additional regional facilities.`);
  };

  const isNoBloodAvailable = matchedDonors.length === 0 && totalMatchingStock === 0;

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* SELECT ACTIVE REQUEST DROPDOWN */}
      {requests.length > 1 && (
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-slate-800 font-bold">Select Active Request:</span>
          </div>
          <select
            value={activeReqId}
            onChange={e => setActiveReqId(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-sky-500"
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
      <div className="p-6 rounded-3xl bg-white border-2 border-red-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
              <span>{activeReq.bloodGroup}</span>
              <span className="text-[9px] opacity-90">{targetComponent}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                  Request ID: {activeReq.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 text-sky-800 border border-sky-200">
                  Patient ID: {activeReq.patientId || 'BN-HUB-2026-00852'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">{activeReq.patientName}</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-red-500" /> {activeReq.hospitalName}, {activeReq.city}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                activeReq.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                🚨 {activeReq.urgency} Urgency
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                activeReq.status === 'BLOOD_SECURED' || activeReq.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
              }`}>
                {activeReq.status.replace(/_/g, ' ')}
              </span>
            </div>

            {activeReq.status !== 'COMPLETED' && activeReq.status !== 'CANCELLED' && (
              <button
                onClick={() => cancelEmergencyRequest(activeReq.id, 'Cancelled by requester')}
                className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 mt-1"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* REJECTION REASON NOTIFICATION BANNER */}
        {activeReq.status === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-1 animate-in fade-in">
            <strong className="text-sm font-black flex items-center gap-1.5 text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Request Rejected by Center
            </strong>
            <p className="text-xs font-bold">
              Reason: "{activeReq.additionalNotes || 'Stock unavailable at target hospital/center'}"
            </p>
            <p className="text-[11px] text-red-700">
              You can redirect this request to another nearby center or broadcast urgent alerts to voluntary donors.
            </p>
          </div>
        )}

        {/* REDIRECTION NOTIFICATION BANNER */}
        {activeReq.trendingReason?.includes('Redirected') && (
          <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-sky-900 space-y-1 animate-in fade-in">
            <strong className="text-sm font-black flex items-center gap-1.5 text-sky-800">
              <RadioTower className="w-4 h-4 text-sky-600" /> Request Redirected to {activeReq.hospitalName}
            </strong>
            <p className="text-xs font-bold">
              {activeReq.trendingReason}
            </p>
            <p className="text-[11px] text-sky-700">
              Request ID remains <strong>{activeReq.id}</strong>. Current processing center: {activeReq.hospitalName} ({activeReq.city}).
            </p>
          </div>
        )}

        {/* RESERVED / APPROVED PICKUP PASS */}
        {(activeReq.status === 'APPROVED' || activeReq.status === 'BLOOD_SECURED' || activeReq.status === 'COMPLETED') && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="space-y-1">
              <strong className="text-sm font-black flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Stock Reserved & Pickup Code Generated
              </strong>
              <p className="text-xs font-bold text-emerald-900">
                Blood units reserved at <strong>{activeReq.hospitalName} ({activeReq.city})</strong>. Present pickup code at counter.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-300 text-center font-mono shrink-0 shadow-sm">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Fulfillment Pickup Code</span>
              <span className="text-lg font-black text-emerald-700 tracking-wider">PK-{activeReq.id.slice(-5).toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* 8-STEP LIFECYCLE TIMELINE */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
            <span>Real-Time Request Lifecycle Timeline</span>
            <span className="text-emerald-600 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Status
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 font-mono text-[10px]">
            {(activeReq.requestTimeline || []).map((step, idx) => (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  step.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                    : step.status === 'current'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-extrabold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div>
                  <span className="text-[9px] opacity-75 block font-sans">Step {idx + 1}</span>
                  <strong className="block leading-snug mt-0.5">{step.label}</strong>
                </div>
                {step.timestamp && <span className="text-[8px] opacity-75 mt-1 block">{step.timestamp}</span>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. MULTIPLE DONOR RESPONSES BOARD */}
      {activeReq.donorResponses && activeReq.donorResponses.length > 0 && (
        <div className="p-5 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Real-Time Donor Responses ({activeReq.donorResponses.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Secured: <strong>{activeReq.confirmedUnits || 0} / {activeReq.unitsNeeded} Units</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeReq.donorResponses.map((resp, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border space-y-2 ${
                  resp.status === 'ACCEPTED'
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{resp.donorName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      resp.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {resp.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Distance: {resp.distanceKm} km</span>
                  <span className="font-mono">{resp.respondedAt}</span>
                </div>

                {resp.status === 'ACCEPTED' && (
                  <button
                    onClick={() => openEmergencyChat(activeReq.id, resp.donorId)}
                    className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-102"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Open Private Chat
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REAL-TIME BLOOD SEARCH GRID (DONORS / HOSPITALS / BLOOD BANKS) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-red-600" /> Real-Time Blood Search & Source Finder
            </h3>
            <p className="text-slate-500 text-[11px]">Matching Blood Group {targetGroup} ({targetComponent}) within {radiusKm} km</p>
          </div>

          <div className="p-1 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-1 font-extrabold text-xs">
            <button
              onClick={() => setActiveSearchTab('donors')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'donors' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Voluntary Donors ({matchedDonors.length})
            </button>

            <button
              onClick={() => setActiveSearchTab('bloodbanks')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'bloodbanks' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
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
              <div className="p-6 rounded-2xl bg-sky-50/40 border border-sky-100 text-center text-slate-500">
                No eligible donors found within {radiusKm} km. Try expanding search radius.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedDonors.map(({ donor, matchScore, distanceKm }) => {
                  const hasRequested = (activeReq.requestedDonorsList || []).includes(donor.id);

                  return (
                    <div
                      key={donor.id}
                      className="p-5 rounded-3xl bg-white border border-sky-100 space-y-4 flex flex-col justify-between hover:border-sky-300 transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-500/20">
                              {donor.bloodGroup}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-sm text-slate-900">{donor.name}</h4>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Donor" />
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-red-500" /> {distanceKm} km away ({donor.city})
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {matchScore}% Match
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-sky-100">
                        <button
                          onClick={() => sendDirectRequestToDonor(activeReq.id, donor.id)}
                          disabled={hasRequested}
                          className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                            hasRequested
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-md shadow-red-500/20 hover:scale-105'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" /> {hasRequested ? 'Emergency Alert Sent' : 'Send Blood Request'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BLOOD BANKS & STOCK */}
        {activeSearchTab === 'bloodbanks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalFacilities.map(fac => {
              const hasStock = fac.availableUnits > 0;

              return (
                <div key={fac.id} className="p-5 rounded-3xl bg-white border border-sky-100 space-y-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-sky-600" /> {fac.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" /> {fac.distanceKm || 2.4} km away
                      </span>
                    </div>

                    <div className="mt-3 p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-600 text-xs font-bold block">{targetGroup} {targetComponent}:</span>
                        <span className="text-[10px] text-slate-400">Updated: {fac.lastUpdated}</span>
                      </div>
                      <div className="text-right font-mono">
                        <strong className={`text-lg block font-black ${hasStock ? 'text-emerald-600' : 'text-red-600'}`}>
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
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
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
