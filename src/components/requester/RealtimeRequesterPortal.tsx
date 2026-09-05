import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSmartDonorMatches } from '../../utils/matchingEngine';
import {
  Heart,
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  Building2,
  Clock,
  Droplet,
  AlertTriangle,
  MapPin,
  Calendar,
  Bell,
  CheckCircle2,
  RadioTower,
  MessageSquare,
  Send,
  ShieldAlert,
  FileText,
  Download,
  ArrowRightLeft
} from 'lucide-react';

export const RealtimeRequesterPortal: React.FC = () => {
  const {
    requests,
    donors,
    bloodBanks,
    notifications,
    sendDirectRequestToDonor,
    cancelEmergencyRequest,
    approveBloodBankReservation,
    setActiveEmergencyPostModal,
    openEmergencyChat,
    showToast
  } = useApp();

  const { currentUser } = useAuth();

  const [activeReqId, setActiveReqId] = useState<string>(requests[0]?.id || 'BR-1025');
  const [portalTab, setPortalTab] = useState<'tracking' | 'availability' | 'notifications' | 'history'>('tracking');
  const [activeSearchTab, setActiveSearchTab] = useState<'donors' | 'bloodbanks'>('donors');
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const activeReq = requests.find(r => r.id === activeReqId) || requests[0];
  const activeRequestsList = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const historyRequestsList = requests.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');

  if (!activeReq) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-sky-100 shadow-sm text-center space-y-4 max-w-xl mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto animate-bounce" />
        <h2 className="text-xl font-black text-slate-900">No Active Blood Request Found</h2>
        <p className="text-xs text-slate-500">You currently have no active emergency blood requests. Create a new request to start tracking nearby donors and blood bank stocks.</p>
        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-red-500/20"
        >
          <PlusCircle className="w-4 h-4 inline mr-1.5" /> Create Emergency Blood Request
        </button>
      </div>
    );
  }

  const targetGroup = activeReq.bloodGroup;
  const targetComponent = activeReq.bloodComponent || 'PRBC';

  // Smart Matching Donors
  const matchedDonors = calculateSmartDonorMatches(donors, activeReq, radiusKm);

  // Hospital Facilities & Blood Banks Stock
  const hospitalFacilities = bloodBanks.map(bank => {
    const matchedItem = bank.inventory.find(i => i.bloodGroup === targetGroup);
    const availableUnits = matchedItem ? (matchedItem.availableUnits || matchedItem.units) : 0;
    return {
      ...bank,
      availableUnits,
      lastUpdated: matchedItem ? matchedItem.lastUpdated : 'Just now'
    };
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in max-w-6xl mx-auto pb-16">
      
      {/* 1. REQUESTER HEADER & ACTIVE REQUEST SELECTOR (Feature 1) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase">
                Patient & Caregiver Command Center
              </span>
              <span className="text-xs text-slate-400 font-mono">User: {currentUser?.name || 'Requester'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Live Blood Request & Tracking Portal 🆘
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor real-time status updates, stock reservations, donor acceptances, and regional facility redirections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveEmergencyPostModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Create Emergency Request
            </button>
          </div>
        </div>

        {/* ACTIVE REQUEST SELECTOR PILLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase shrink-0">Select Active Request ID:</span>
            {activeRequestsList.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveReqId(r.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                  r.id === activeReq.id
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r.id} ({r.bloodGroup})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[10px] text-slate-500 font-sans block">Patient Name:</span>
            <strong className="text-slate-900 font-bold">{activeReq.patientName}</strong>
          </div>
        </div>
      </div>

      {/* 2. 4 PRIMARY REQUESTER FEATURE TABS */}
      <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap gap-2 text-xs font-extrabold">
        <button
          onClick={() => setPortalTab('tracking')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'tracking'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Activity className="w-4 h-4" /> <span>Live Tracking & Timeline</span>
        </button>

        <button
          onClick={() => setPortalTab('availability')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'availability'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Search className="w-4 h-4" /> <span>Nearby Blood Stock ({hospitalFacilities.filter(f => f.availableUnits > 0).length})</span>
        </button>

        <button
          onClick={() => setPortalTab('notifications')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'notifications'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Bell className="w-4 h-4" /> <span>Live Notifications ({notifications.filter(n => !n.read).length})</span>
        </button>

        <button
          onClick={() => setPortalTab('history')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            portalTab === 'history'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <FileText className="w-4 h-4" /> <span>Request History ({historyRequestsList.length})</span>
        </button>
      </div>

      {/* TAB 1: LIVE REQUEST TRACKING & TIMELINE (Features 1, 3, 4, & 7) */}
      {portalTab === 'tracking' && (
        <div className="space-y-6">
          
          {/* ACTIVE REQUEST DETAILS CARD */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
                  {activeReq.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                      Request ID: {activeReq.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase border border-red-200">
                      Component: {targetComponent}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase border border-indigo-200">
                      {activeReq.unitsNeeded} Units Required
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
                    activeReq.status === 'APPROVED' || activeReq.status === 'BLOOD_SECURED' || activeReq.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activeReq.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  }`}>
                    {activeReq.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {activeReq.status !== 'COMPLETED' && activeReq.status !== 'CANCELLED' && (
                  <button
                    onClick={() => cancelEmergencyRequest(activeReq.id, 'Cancelled by requester')}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>

            {/* REJECTION REASON BANNER (Feature 4) */}
            {activeReq.status === 'REJECTED' && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-1 animate-in fade-in">
                <strong className="text-sm font-black flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Request Rejected by Center
                </strong>
                <p className="text-xs font-bold">
                  Reason: "{activeReq.additionalNotes || 'Stock unavailable at target hospital/center'}"
                </p>
                <p className="text-[11px] text-red-700">
                  You can redirect this request to another nearby center or broadcast urgent alerts to voluntary donors below.
                </p>
              </div>
            )}

            {/* REDIRECTION NOTIFICATION BANNER (Feature 4) */}
            {activeReq.trendingReason?.includes('Redirected') && (
              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-sky-900 space-y-1 animate-in fade-in">
                <strong className="text-sm font-black flex items-center gap-1.5 text-sky-800">
                  <RadioTower className="w-4 h-4 text-sky-600" /> Request Redirected to {activeReq.hospitalName}
                </strong>
                <p className="text-xs font-bold">
                  {activeReq.trendingReason}
                </p>
                <p className="text-[11px] text-sky-700">
                  Request ID remains <strong>{activeReq.id}</strong>. Current processing facility: {activeReq.hospitalName} ({activeReq.city}).
                </p>
              </div>
            )}

            {/* RESERVED / APPROVED PICKUP PASS (Feature 4) */}
            {(activeReq.status === 'APPROVED' || activeReq.status === 'BLOOD_SECURED' || activeReq.status === 'COMPLETED') && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <strong className="text-sm font-black flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Stock Reserved & Pickup Pass Code Generated
                  </strong>
                  <p className="text-xs font-bold text-emerald-900">
                    Blood units reserved at <strong>{activeReq.hospitalName} ({activeReq.city})</strong>. Present fulfillment code at counter.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-300 text-center font-mono shrink-0 shadow-sm">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Fulfillment Pickup Code</span>
                  <span className="text-lg font-black text-emerald-700 tracking-wider">PK-{activeReq.id.slice(-5).toUpperCase()}</span>
                </div>
              </div>
            )}

            {/* 8-STEP LIFECYCLE TIMELINE (Feature 3) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                <span>Synchronized Request Lifecycle Timeline</span>
                <span className="text-emerald-600 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Sync
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

          {/* CONFIRMED DONORS BOARD */}
          {activeReq.donorResponses && activeReq.donorResponses.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Donors Who Responded "I Can Donate" ({activeReq.donorResponses.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Units Secured: <strong>{activeReq.confirmedUnits || 0} / {activeReq.unitsNeeded} Units</strong>
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                        RESP: ACCEPTED
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Distance: {resp.distanceKm} km</span>
                      <span className="font-mono">{resp.respondedAt}</span>
                    </div>

                    <button
                      onClick={() => openEmergencyChat(activeReq.id, resp.donorId)}
                      className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-102 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Open Private Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REAL-TIME MATCHED DONORS SEARCH GRID */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" /> Match & Broadcast to Eligible Voluntary Donors
                </h3>
                <p className="text-slate-500 text-[11px]">Direct alert broadcast to registered {targetGroup} donors within {radiusKm} km</p>
              </div>
            </div>

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
                        className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          hasRequested
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-md shadow-red-500/20 hover:scale-105'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" /> {hasRequested ? 'Emergency Alert Sent' : 'Send Blood Alert'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: NEARBY BLOOD AVAILABILITY SEARCH (Feature 2) */}
      {portalTab === 'availability' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" /> Real Database Regional Blood Bank Inventory Matrix
              </h3>
              <p className="text-slate-500 text-[11px]">Real-time verified stock check for Blood Group <strong>{targetGroup}</strong> ({targetComponent})</p>
            </div>
          </div>

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
                        <MapPin className="w-3 h-3 text-red-500" /> {fac.city}
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
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      hasStock
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Droplet className="w-4 h-4" /> {hasStock ? `Reserve ${targetGroup} Blood from ${fac.name}` : 'Out of Stock'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME NOTIFICATIONS FEED (Feature 5) */}
      {portalTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Live Real-Time Notifications Stream
              </h3>
              <p className="text-slate-500 text-[11px]">Instant alerts for hospital approvals, stock reservations, donor acceptances, and redirections</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
              {notifications.filter(n => !n.read).length} Unread Alerts
            </span>
          </div>

          <div className="divide-y divide-sky-100">
            {notifications.map(n => (
              <div key={n.id} className="py-3.5 flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  n.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-extrabold text-slate-900">{n.title}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REQUEST HISTORY (Feature 6) */}
      {portalTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> Request History & Fulfilled Orders
              </h3>
              <p className="text-slate-500 text-[11px]">Complete historical record of completed blood requests and pickup certificates</p>
            </div>
          </div>

          {historyRequestsList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <strong className="block text-slate-900 font-bold">No Past Completed Orders Yet</strong>
              <p className="text-xs">When an emergency blood request is completed or fulfilled, it will be logged here with its full audit trail.</p>
            </div>
          ) : (
            <div className="divide-y divide-sky-100">
              {historyRequestsList.map(req => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">
                        {req.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">ID: {req.id}</span>
                      <span className="text-slate-400 text-xs">• Patient: {req.patientName}</span>
                    </div>
                    <strong className="text-sm font-black text-slate-900 block">{req.hospitalName} ({req.city})</strong>
                    <p className="text-xs text-slate-500">
                      Blood Group: <strong>{req.bloodGroup}</strong> ({req.unitsNeeded} Units) • Requested: {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => showToast(`Downloaded Fulfillment Pass & Receipt for Request ${req.id}`)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" /> Download Pass
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
