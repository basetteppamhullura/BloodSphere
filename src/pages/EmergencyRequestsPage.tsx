import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import {
  AlertTriangle,
  PlusCircle,
  MapPin,
  Check,
  X,
  Building2
} from 'lucide-react';

export const EmergencyRequestsPage: React.FC = () => {
  const {
    requests,
    donors,
    donorRespondToRequest,
    setActiveEmergencyPostModal,
    setActiveChatModal
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
    if (r.status === 'CANCELLED') return false;

    if (filterTab === 'MATCHING_FOR_ME') {
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white shadow-md shadow-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            <h2 className="text-xl font-black">Emergency Blood Request Board</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/30">
              REAL-TIME MATCHING ACTIVE
            </span>
          </div>
          <p className="text-xs text-red-100 mt-1">
            Real-time emergency blood requests matched to your blood group ({loggedInDonor.bloodGroup}) and availability.
          </p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-red-600 font-extrabold text-xs shadow-md transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Post Emergency Need
        </button>
      </div>

      {/* Donor Eligibility & Availability Warning Banner */}
      {(!eligibility.isEligible || loggedInDonor.availabilityStatus !== 'AVAILABLE') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
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
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'bg-white text-slate-700 border border-sky-100 hover:bg-sky-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-sky-100 text-center text-slate-500">
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
                className={`p-5 rounded-3xl bg-white border-2 transition-all space-y-4 shadow-sm ${
                  req.urgency === 'CRITICAL' ? 'border-red-200 shadow-red-500/5' : 'border-sky-100'
                }`}
              >
                {/* CARD HEADER */}
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
                      <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{req.patientName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-red-500" /> {req.hospitalName}, {req.city}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    isSecured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {isSecured ? 'Blood Secured' : req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-sky-50/50 p-3 rounded-2xl border border-sky-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Units Required</span>
                    <strong className="text-slate-900 font-bold">{req.unitsNeeded} Units ({req.bloodComponent || 'PRBC'})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Required Within</span>
                    <strong className="text-amber-600 font-bold">{req.requiredTime || 'Within 2 Hours'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Confirmed Responses</span>
                    <strong className="text-emerald-600 font-bold">{req.confirmedUnits || 0} / {req.unitsNeeded} Units</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Medical Reason</span>
                    <span className="text-slate-700 font-sans line-clamp-1">{req.reason}</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-1">
                  {myResponse ? (
                    <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-bold">
                        {myResponse.status === 'ACCEPTED' ? '✅ You accepted this emergency request' : 'ℹ️ You declined this request'}
                      </span>
                      <button
                        onClick={() => setActiveChatModal({ request: req, donor: loggedInDonor })}
                        className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[11px]"
                      >
                        Privacy Chat
                      </button>
                    </div>
                  ) : isSecured ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                      🔒 Required blood quantity has been secured for this patient.
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
  );
};
