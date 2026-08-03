import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, Minus, AlertTriangle, Clock, RefreshCw, ShieldAlert } from 'lucide-react';

export default function BloodBankInventory() {
  const { inventory, updateInventoryStock, currentUser } = useApp();

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/50 shadow-md">
            <Building2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Blood Bank Inventory Dashboard</h3>
            <p className="text-xs text-slate-400">Real-time stock monitoring & 7-day expiry tracking for {currentUser?.name || "KIMS Blood Center"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            License: KA-BB-2024-8891
          </span>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {inventory.map((item) => {
          const isCritical = item.status === 'CRITICAL';
          const isLow = item.status === 'Low';

          return (
            <div
              key={item.group}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-red-950/40 border-red-800/80 shadow-lg shadow-red-950/30'
                  : isLow
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-2xl text-slate-100">{item.group}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isCritical
                    ? 'bg-red-600 text-white animate-pulse'
                    : isLow
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-black text-slate-100">{item.units}</span>
                <span className="text-xs text-slate-400 font-medium">Units</span>
              </div>

              {/* Expiry Note */}
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{item.expiring7Days} units expiring in &lt;7 days</span>
              </div>

              {/* Stock Edit Controls (Hospital View) */}
              <div className="flex items-center justify-between gap-1 pt-3 mt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-medium">Stock Adjust:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateInventoryStock(item.group, -1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Decrease 1 unit"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => updateInventoryStock(item.group, 1)}
                    className="p-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                    title="Add 1 unit"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
