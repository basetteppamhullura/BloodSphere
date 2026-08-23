import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, Clock, Check, Phone, Building2 } from 'lucide-react';

export const HospitalEmergencyBoard: React.FC = () => {
  const { requests, approveRequestByHospital, showToast } = useApp();

  // Filter only Critical & Urgent requests live, sorted by urgency and oldest requestedAt
  const emergencyRequests = requests
    .filter(r => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
    .sort((a, b) => {
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
      return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
    });

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto">
      
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
          emergencyRequests.map(req => (
            <div
              key={req.id}
              className={`p-6 rounded-3xl bg-white border space-y-4 shadow-sm transition-all ${
                req.urgency === 'CRITICAL'
                  ? 'border-2 border-red-300 ring-1 ring-red-400/30'
                  : 'border-sky-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                      {req.bloodGroup}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{req.patientName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase">
                      Urgency: {req.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hospital: <strong>{req.hospitalName}</strong> • Units Required: <strong>{req.unitsNeeded} units</strong> • City: {req.city}
                  </p>
                </div>

                <button
                  onClick={() => {
                    approveRequestByHospital(req.id);
                    showToast(`Approved Emergency Request for ${req.patientName}!`);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" /> Immediate Priority Approval
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-mono">
                <div>Requester: <strong>{req.contactPerson} ({req.contactPhone})</strong></div>
                <a href={`tel:${req.contactPhone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Call ICU Desk ({req.contactPhone})
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
