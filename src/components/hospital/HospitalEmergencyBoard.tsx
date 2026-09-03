import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, Clock, Check, Phone, Building2, XCircle, ArrowRightLeft, X } from 'lucide-react';
import { EmergencyRequest } from '../../types';

const REGIONAL_TARGETS = [
  { name: 'KIMS Teaching Hospital', city: 'Hubballi', region: 'Hubballi-Dharwad' },
  { name: 'SDM College of Medical Sciences', city: 'Dharwad', region: 'Hubballi-Dharwad' },
  { name: 'Rotary Regional Blood Center', city: 'Dharwad', region: 'Hubballi-Dharwad' },
  { name: 'KLE Hospital & Blood Bank', city: 'Belagavi', region: 'Belagavi Division' },
  { name: 'Lifeline Regional Center', city: 'Belagavi', region: 'Belagavi Division' },
  { name: 'Tatwadarsha Hospital', city: 'Hubballi', region: 'Hubballi-Dharwad' },
  { name: 'Manipal Hospital', city: 'Bengaluru', region: 'Bengaluru Division' }
];

export const HospitalEmergencyBoard: React.FC = () => {
  const { requests, acceptBloodRequest, rejectBloodRequest, redirectBloodRequest, showToast } = useApp();

  // Rejection Modal State
  const [rejectingReq, setRejectingReq] = useState<EmergencyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Redirection Modal State
  const [redirectingReq, setRedirectingReq] = useState<EmergencyRequest | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('Hubballi-Dharwad');
  const [selectedTargetCenter, setSelectedTargetCenter] = useState<string>('Rotary Regional Blood Center');
  const [redirectReason, setRedirectReason] = useState<string>('No compatible blood stock available at current center');

  // Filter only active pending requests live
  const emergencyRequests = requests
    .filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED')
    .sort((a, b) => {
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
      return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
    });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    if (!rejectReason.trim()) {
      showToast('Please specify a rejection reason.');
      return;
    }
    rejectBloodRequest(rejectingReq.id, 'KIMS Hospital Trauma Desk', rejectReason.trim());
    setRejectingReq(null);
    setRejectReason('');
  };

  const handleConfirmRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectingReq) return;
    const targetObj = REGIONAL_TARGETS.find(t => t.name === selectedTargetCenter);
    redirectBloodRequest(
      redirectingReq.id,
      'KIMS Hospital',
      selectedTargetCenter,
      targetObj?.city || redirectingReq.city,
      redirectReason.trim()
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Incoming Patient Blood Requests Queue</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
              LIVE TRAUMA QUEUE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Process emergency requests with Accept, Reject (reason required), or Inter-Region Redirect.</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-right font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Queue Cases</span>
          <span className="text-2xl font-black text-red-600">{emergencyRequests.length} Cases</span>
        </div>
      </div>

      {/* 2. EMERGENCY CARDS LIST */}
      <div className="space-y-4">
        {emergencyRequests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-sky-100 shadow-sm text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900">No Pending Emergency Trauma Cases</h3>
            <p className="text-xs text-slate-500">All critical trauma blood requests have been processed.</p>
          </div>
        ) : (
          emergencyRequests.map(req => {
            const isCritical = req.urgency === 'CRITICAL' || req.urgency === 'HIGH';
            return (
              <div
                key={req.id}
                className={`p-6 rounded-3xl bg-white border space-y-4 shadow-sm transition-all ${
                  isCritical
                    ? 'border-2 border-red-300 ring-1 ring-red-400/20'
                    : 'border-sky-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">
                        🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900">{req.patientName || 'Emergency Patient'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isCritical ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        Urgency: {req.urgency}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {req.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Hospital: <strong>{req.hospitalName}</strong> • Units Needed: <strong>{req.unitsNeeded} units</strong> • City: {req.city}
                    </p>
                    {req.reason && (
                      <p className="text-[11px] text-slate-500 italic">
                        Reason: "{req.reason}"
                      </p>
                    )}
                  </div>

                  {/* 3 CORE ACTIONS: ACCEPT, REJECT, REDIRECT */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => acceptBloodRequest(req.id, req.hospitalName || 'KIMS Hospital')}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" /> Accept Request
                    </button>

                    <button
                      onClick={() => {
                        setRejectingReq(req);
                        setRejectReason('');
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs border border-red-200 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4 text-red-600" /> Reject Request
                    </button>

                    <button
                      onClick={() => {
                        setRedirectingReq(req);
                        setSelectedTargetCenter('Rotary Regional Blood Center');
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-xs border border-sky-200 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-sky-600" /> Redirect Request
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-mono">
                  <div>Requester: <strong>{req.contactPerson} ({req.contactPhone})</strong></div>
                  <a href={`tel:${req.contactPhone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Call Requester ({req.contactPhone})
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 3. REJECTION REASON MODAL */}
        {rejectingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
              <button
                onClick={() => setRejectingReq(null)}
                className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" /> Confirm Request Rejection
              </h3>

              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
                <span className="font-black text-slate-900 block text-sm">
                  Request {rejectingReq.id} • {rejectingReq.patientName}
                </span>
                <span className="text-red-700 font-bold block">
                  🩸 {rejectingReq.bloodGroup} ({rejectingReq.unitsNeeded} Units Needed)
                </span>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">Reason for Rejection * (Required)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Blood stock unavailable at center, incompatible component..."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-500 h-24"
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

        {/* 4. REDIRECTION REGION/CENTER MODAL */}
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
                  Request {redirectingReq.id} (Keeping same Request ID)
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
                  <label className="text-slate-800 font-bold block mb-1">Message / Redirect Notes</label>
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
