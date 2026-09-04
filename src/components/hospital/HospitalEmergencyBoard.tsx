import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyRequest } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Check,
  Phone,
  Building2,
  X,
  ArrowRightLeft,
  CheckCircle2,
  RadioTower
} from 'lucide-react';

const REGIONAL_TARGETS = [
  { name: 'KIMS Teaching Hospital', city: 'Hubballi', region: 'Hubballi-Dharwad' },
  { name: 'SDM Medical Center', city: 'Dharwad', region: 'Hubballi-Dharwad' },
  { name: 'Hubballi Regional Blood Bank', city: 'Hubballi', region: 'Hubballi-Dharwad' },
  { name: 'Belagavi District Civil Hospital', city: 'Belagavi', region: 'Belagavi Division' },
  { name: 'City Central Blood Transfusion Bank', city: 'Bengaluru', region: 'Bengaluru Division' }
];

export const HospitalEmergencyBoard: React.FC = () => {
  const {
    requests,
    approveRequestByHospital,
    acceptBloodRequest,
    rejectBloodRequest,
    redirectBloodRequest,
    showToast
  } = useApp();

  // Modal States
  const [rejectingReq, setRejectingReq] = useState<EmergencyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Stock temporarily depleted at ICU blood counter');

  const [redirectingReq, setRedirectingReq] = useState<EmergencyRequest | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('Hubballi-Dharwad');
  const [selectedTargetCenter, setSelectedTargetCenter] = useState<string>('SDM Medical Center');
  const [redirectReason, setRedirectReason] = useState<string>('Stock unavailable at current hospital desk - Redirecting to partner facility');

  // Filter active requests sorted by urgency and date
  const emergencyRequests = requests
    .filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
    .sort((a, b) => {
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
      return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
    });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    rejectBloodRequest(rejectingReq.id, rejectingReq.hospitalName || 'KIMS Teaching Hospital', rejectionReason);
    setRejectingReq(null);
  };

  const handleConfirmRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectingReq) return;
    const targetObj = REGIONAL_TARGETS.find(t => t.name === selectedTargetCenter);
    const targetCity = targetObj ? targetObj.city : 'Hubballi';
    redirectBloodRequest(
      redirectingReq.id,
      redirectingReq.hospitalName || 'KIMS Teaching Hospital',
      selectedTargetCenter,
      targetCity,
      redirectReason
    );
    setRedirectingReq(null);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto pb-12">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Emergency & ICU Trauma Board</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
              LIVE TRAUMA QUEUE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">High-priority queue displaying Critical (Within 2 Hours) & Urgent cases in real time</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-right font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Critical Cases</span>
          <span className="text-2xl font-black text-red-600">{emergencyRequests.filter(r => r.urgency === 'CRITICAL').length} Cases</span>
        </div>
      </div>

      {/* 2. EMERGENCY CARDS LIST (VERTICAL STACK) */}
      <div className="space-y-4">
        {emergencyRequests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-sky-100 shadow-sm text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900">No Pending Emergency Trauma Cases</h3>
            <p className="text-xs text-slate-500">All critical trauma blood requests have been fulfilled or cleared.</p>
          </div>
        ) : (
          emergencyRequests.map(req => {
            const isApproved = req.status === 'APPROVED' || req.status === 'BLOOD_SECURED';
            const isRejected = req.status === 'REJECTED';
            const isRedirected = req.trendingReason?.includes('Redirected');

            return (
              <div
                key={req.id}
                className={`p-6 rounded-3xl bg-white border space-y-4 shadow-sm transition-all ${
                  req.urgency === 'CRITICAL'
                    ? 'border-2 border-red-300 ring-1 ring-red-400/30'
                    : 'border-sky-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                        🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900">{req.patientName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase">
                        Urgency: {req.urgency}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {req.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isRejected
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}>
                        Status: {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Target Hospital: <strong>{req.hospitalName}</strong> • Units Required: <strong>{req.unitsNeeded} units</strong> • Location: {req.city}
                    </p>
                    {isRedirected && (
                      <p className="text-xs text-sky-700 font-bold mt-1 flex items-center gap-1">
                        <RadioTower className="w-3.5 h-3.5" /> {req.trendingReason}
                      </p>
                    )}
                    {isRejected && (
                      <p className="text-xs text-red-700 font-bold mt-1">
                        ❌ Rejection Reason: "{req.additionalNotes || 'Stock unavailable'}"
                      </p>
                    )}
                  </div>

                  {/* 3 WORKFLOW ACTIONS FOR HOSPITAL: ACCEPT, REJECT, REDIRECT */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!isApproved && !isRejected && (
                      <>
                        <button
                          onClick={() => acceptBloodRequest(req.id, req.hospitalName || 'KIMS Teaching Hospital')}
                          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Check className="w-4 h-4" /> ACCEPT & RESERVE
                        </button>

                        <button
                          onClick={() => setRedirectingReq(req)}
                          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <ArrowRightLeft className="w-4 h-4" /> REDIRECT
                        </button>

                        <button
                          onClick={() => setRejectingReq(req)}
                          className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-extrabold text-xs border border-slate-200 transition-all"
                        >
                          <X className="w-4 h-4 inline" /> REJECT
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stock Reserved & Approved
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-mono">
                  <div>Requester Contact: <strong>{req.contactPerson} ({req.maskedPhone || req.contactPhone})</strong></div>
                  <a href={`tel:${req.contactPhone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Call ICU Desk ({req.contactPhone})
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REJECTION MODAL */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button
              onClick={() => setRejectingReq(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Reject Blood Request
            </h3>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request {rejectingReq.id} • {rejectingReq.patientName}
              </span>
              <span className="text-red-800 font-bold block">
                🩸 {rejectingReq.bloodGroup} ({rejectingReq.unitsNeeded} Units)
              </span>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REDIRECTION MODAL */}
      {redirectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button
              onClick={() => setRedirectingReq(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-600" /> Redirect Blood Request
            </h3>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request ID: {redirectingReq.id} (Preserving ID)
              </span>
              <span className="text-sky-800 font-bold block">
                🩸 {redirectingReq.bloodGroup} ({redirectingReq.unitsNeeded} Units) • {redirectingReq.patientName}
              </span>
            </div>

            <form onSubmit={handleConfirmRedirect} className="space-y-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Select Target Region *</label>
                <select
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Hubballi-Dharwad">Hubballi-Dharwad Region</option>
                  <option value="Belagavi Division">Belagavi Division</option>
                  <option value="Bengaluru Division">Bengaluru Division</option>
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Select Target Hospital / Blood Bank *</label>
                <select
                  value={selectedTargetCenter}
                  onChange={e => setSelectedTargetCenter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  {REGIONAL_TARGETS
                    .filter(t => t.region === selectedRegion)
                    .map(t => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Message / Redirection Notes</label>
                <input
                  type="text"
                  value={redirectReason}
                  onChange={e => setRedirectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRedirectingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black shadow-md shadow-sky-500/20"
                >
                  Confirm Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
