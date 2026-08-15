import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { EmergencyRequest } from '../types';
import {
  AlertTriangle,
  PlusCircle,
  Sparkles,
  MapPin,
  Clock,
  Share2,
  UserCheck,
  Check,
  X,
  ShieldCheck,
  Building2,
  Send,
  Users,
  CheckCircle2,
  Ban
} from 'lucide-react';

export const EmergencyRequestsPage: React.FC = () => {
  const {
    requests,
    donors,
    donorRespondToRequest,
    setActiveSmartMatchModal,
    setActiveChatModal,
    setActiveEmergencyPostModal,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const [filterTab, setFilterTab] = useState<string>('MATCHING_FOR_ME');

  // Find active donor profile
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];
  const eligibility = checkDonorEligibility(loggedInDonor);

  // Compatible groups map
  const compatibleMap: Record<string, string[]> = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'Bombay Phenotype (O-h)': ['Bombay Phenotype (O-h)']
  };

  const myCompatibleGroups = compatibleMap[loggedInDonor.bloodGroup] || [loggedInDonor.bloodGroup];

  const filteredRequests = requests.filter(r => {
    // If request cancelled, hide from active emergency board
    if (r.status === 'CANCELLED') return false;

    if (filterTab === 'MATCHING_FOR_ME') {
      // Must match donor compatibility
      const isGroupCompatible = myCompatibleGroups.includes(r.bloodGroup) || loggedInDonor.bloodGroup === 'O-';
      return isGroupCompatible && r.status !== 'COMPLETED';
    }

    if (filterTab === 'CRITICAL') return r.urgency === 'CRITICAL' && r.status !== 'COMPLETED';
    if (filterTab === 'RARE') return ['O-', 'AB-', 'A-', 'Bombay Phenotype (O-h)'].includes(r.bloodGroup) && r.status !== 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <h2 className="text-xl font-black text-white">Emergency Blood Request Board</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950 text-red-300 border border-red-800">
              REAL-TIME MATCHING ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time emergency blood requests matched to your blood group ({loggedInDonor.bloodGroup}) and availability.
          </p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Post Emergency Need
        </button>
      </div>

      {/* Donor Eligibility & Availability Warning Banner */}
      {(!eligibility.isEligible || loggedInDonor.availabilityStatus !== 'AVAILABLE') && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Availability Warning:</strong> You are currently marked as <strong>{loggedInDonor.availabilityStatus || 'Unavailable'}</strong>. Change status to 🟢 AVAILABLE in My Health Profile to receive instant emergency alerts.
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-extrabold">
        {[
          { id: 'MATCHING_FOR_ME', label: `🎯 Matched for Me (${loggedInDonor.bloodGroup})` },
          { id: 'CRITICAL', label: '🚨 Critical Urgency' },
          { id: 'RARE', label: '🛡️ Rare Blood Groups' },
          { id: 'ALL', label: 'All Requests' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
              filterTab === t.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          No active emergency blood requests match your current filters. System is continuously monitoring for new requests!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(req => {
            const myResponse = (req.donorResponses || []).find(r => r.donorId === loggedInDonor.id);
            const isSecured = (req.confirmedUnits || 0) >= req.unitsNeeded || req.status === 'BLOOD_SECURED' || req.status === 'COMPLETED';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-3xl bg-slate-950 border-2 transition-all space-y-4 shadow-xl ${
                  req.urgency === 'CRITICAL' ? 'border-red-800/80 shadow-red-950/40' : 'border-slate-800'
                }`}
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-red-950">
                      <span>{req.bloodGroup}</span>
                      <span className="text-[9px] opacity-90">{req.bloodComponent || 'PRBC'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-black text-[10px] uppercase">
                          🚨 {req.urgency}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {req.id}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-white mt-0.5">{req.patientName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-red-400" /> {req.hospitalName}, {req.city}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    isSecured
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {isSecured ? 'Blood Secured' : req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* DETAILS GRID */}
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
                    <span className="text-[10px] text-slate-400 block">Confirmed Responses</span>
                    <strong className="text-emerald-400 font-bold">{req.confirmedUnits || 0} / {req.unitsNeeded} Units</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Medical Reason</span>
                    <span className="text-slate-300 line-clamp-1">{req.reason}</span>
                  </div>
                </div>

                {/* REAL-TIME DONOR ACTION / STATUS */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  {myResponse ? (
                    <div className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">
                        {myResponse.status === 'ACCEPTED' ? '✅ You accepted this emergency request' : 'ℹ️ You declined this request'}
                      </span>
                      <button
                        onClick={() => setActiveChatModal({ request: req, donor: loggedInDonor })}
                        className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        Privacy Chat
                      </button>
                    </div>
                  ) : isSecured ? (
                    <div className="w-full p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-bold text-center">
                      🔒 Required blood quantity has been secured for this patient.
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <button
                        onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'ACCEPTED')}
                        className="py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Check className="w-4 h-4" /> ACCEPT
                      </button>
                      <button
                        onClick={() => donorRespondToRequest(req.id, loggedInDonor.id, 'DECLINED')}
                        className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
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
  );
};
