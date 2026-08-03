import React from 'react';
import { useApp } from '../../context/AppContext';
import { Map, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

export default function ShortageHeatmap() {
  const { cityShortages } = useApp();

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-950 border border-red-800/40">
            <Map className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">City Shortage & Demand Heatmap</h3>
            <p className="text-xs text-slate-400">Live regional tracking of critical blood deficits across Karnataka</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
          <ShieldAlert className="w-4 h-4" /> Regional Emergency Network Active
        </span>
      </div>

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityShortages.map((cityData) => {
          const isSevere = cityData.shortageLevel === 'Severe';
          const isHigh = cityData.shortageLevel === 'High';

          return (
            <div
              key={cityData.city}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                isSevere
                  ? 'bg-gradient-to-br from-red-950/70 to-slate-900 border-red-800/80 shadow-lg shadow-red-950/30'
                  : isHigh
                  ? 'bg-gradient-to-br from-amber-950/50 to-slate-900 border-amber-800/60'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <span>{cityData.city}</span>
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isSevere
                    ? 'bg-red-600 text-white animate-pulse'
                    : isHigh
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {cityData.shortageLevel} Shortage
                </span>
              </div>

              {/* Critical Groups List */}
              <div className="mb-3">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Critical Deficit Groups:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cityData.criticalGroups.map(grp => (
                    <span
                      key={grp}
                      className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-xs font-bold border border-red-800/60 flex items-center gap-1"
                    >
                      <AlertOctagon className="w-3 h-3 text-red-400" /> {grp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Request Count Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Requests:</span>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> {cityData.activeRequests} pending
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
