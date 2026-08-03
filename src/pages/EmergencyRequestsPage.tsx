import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyRequest } from '../types';
import { AlertTriangle, PlusCircle, Sparkles, MapPin, Clock, Share2, UserCheck } from 'lucide-react';

export const EmergencyRequestsPage: React.FC = () => {
  const { requests, setActiveSmartMatchModal, setActiveChatModal, donors, setActiveEmergencyPostModal, showToast } = useApp();
  const [filterTab, setFilterTab] = useState<string>('ALL');

  const filteredRequests = requests.filter(r => {
    if (filterTab === 'CRITICAL') return r.urgency === 'CRITICAL';
    if (filterTab === 'RARE') return ['O-', 'AB-', 'A-'].includes(r.bloodGroup);
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Emergency Request Board</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live urgent blood needs posted by patients and hospital ICUs</p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Post Emergency Need
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Emergency Requests' },
          { id: 'CRITICAL', label: '🚨 Critical Urgency' },
          { id: 'RARE', label: '🛡️ Rare Blood Groups (O-, AB-)' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-4 ${
              req.urgency === 'CRITICAL' ? 'border-red-800/80 shadow-lg shadow-red-950/30' : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center">
                  <span>{req.bloodGroup}</span>
                  <span className="text-[9px] opacity-80">{req.unitsNeeded} Units</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{req.patientName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> {req.hospitalName}, {req.city}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                req.urgency === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400'
              }`}>
                {req.urgency}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
              Medical Reason: {req.reason}
            </p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveSmartMatchModal(req)}
                className="flex items-center gap-1 text-amber-400 font-bold hover:underline"
              >
                <Sparkles className="w-4 h-4" /> AI Smart Match ({req.matchedDonorsCount} Donors)
              </button>

              <button
                onClick={() => setActiveChatModal({ request: req, donor: donors[0] })}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                I Can Donate
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
