import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ArrowRight, ShieldAlert, CheckCircle2, MapPin, Clock } from 'lucide-react';

export const BloodBridgePage: React.FC = () => {
  const { interCityTransfers, showToast } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Blood Bridge — Inter-City Supply Chain</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated logistics routing suggesting surplus-to-shortage blood transfers between regional hospitals
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
          LOGISTICS OPTIMIZER v3
        </span>
      </div>

      {/* Transfer Recommendation Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
          Active Supply Routing Recommendations
        </h3>

        <div className="space-y-4">
          {interCityTransfers.map((item) => (
            <div key={item.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              
              {/* Route Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-slate-800 text-white font-extrabold text-sm border border-slate-700">
                    {item.fromCity}
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div className="px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold text-sm border border-indigo-800">
                    {item.toCity}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-red-400 text-sm">{item.units} Units ({item.bloodGroup})</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> ~{item.estimatedTimeMins} mins transport
                  </span>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Surplus Dispatch Facility</span>
                  <span className="font-bold text-slate-200">{item.fromHospital}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Critical Deficit Destination</span>
                  <span className="font-bold text-slate-200">{item.toHospital}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">Context: {item.urgencyReason}</span>
                
                <button
                  onClick={() => showToast(`Initiated Inter-City Cold Chain Transport for ${item.units} units of ${item.bloodGroup}!`)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" /> Authorize Cold-Chain Transit
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
