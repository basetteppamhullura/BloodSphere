import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, Clock, Check, Phone, Building2 } from 'lucide-react';

export const HospitalEmergencyBoard: React.FC = () => {
  const { requests, approveRequestByHospital, showToast } = useApp();

  // Filter only Critical & Urgent requests, sorted by urgency and oldest requestedAt
  const emergencyRequests = requests
    .filter(r => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'COMPLETED')
    .sort((a, b) => {
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
      return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
    });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-2 border-red-600 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            <h2 className="text-xl font-black text-white tracking-tight">Hospital Emergency & ICU Board</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase">
              Live Trauma Desk
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">High-priority queue displaying Critical (Within 2 Hours) & Urgent cases</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Critical Cases</span>
          <span className="text-2xl font-black text-red-500">{emergencyRequests.filter(r => r.urgency === 'CRITICAL').length}</span>
        </div>
      </div>

      {/* Emergency Cards List */}
      <div className="space-y-4">
        {emergencyRequests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-extrabold text-base text-white">No Pending Emergency Cases</h3>
            <p className="text-xs text-slate-400">All critical trauma blood requests have been fulfilled or cleared.</p>
          </div>
        ) : (
          emergencyRequests.map(req => (
            <div
              key={req.id}
              className={`p-6 rounded-3xl bg-slate-900 border space-y-4 shadow-xl transition-all ${
                req.urgency === 'CRITICAL'
                  ? 'border-2 border-red-600 ring-1 ring-red-500/80 animate-pulse'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                      {req.bloodGroup}
                    </span>
                    <h3 className="font-extrabold text-base text-white">{req.patientName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                      Urgency: {req.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hospital: <strong>{req.hospitalName}</strong> • Units Required: <strong>{req.unitsNeeded} units</strong>
                  </p>
                </div>

                <button
                  onClick={() => {
                    approveRequestByHospital(req.id);
                    showToast(`Approved Emergency Request for ${req.patientName}!`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-lg shadow-red-950 flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" /> Immediate Priority Approval
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div>Requester: <strong>{req.contactPerson} ({req.contactPhone})</strong></div>
                <a href={`tel:${req.contactPhone}`} className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
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
