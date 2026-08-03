import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Phone, Clock, ShieldCheck, Plus, Minus } from 'lucide-react';

export const BloodBanksPage: React.FC = () => {
  const { bloodBanks, updateInventoryStock } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Blood Bank Inventory Directory</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">Live stock levels, 7-day unit expiry warnings, and direct contact details</p>
      </div>

      {/* Hospital Blood Banks List */}
      <div className="space-y-6">
        {bloodBanks.map((bank) => (
          <div key={bank.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            
            {/* Facility Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">{bank.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Licensed Facility
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {bank.address} ({bank.distanceKm} km away)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${bank.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Facility
                </a>
              </div>
            </div>

            {/* Inventory Gauges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {bank.inventory.map((item) => (
                <div
                  key={item.group}
                  className={`p-3 rounded-2xl border text-center space-y-1 ${
                    item.status === 'CRITICAL'
                      ? 'bg-red-950/40 border-red-800'
                      : item.status === 'Low'
                      ? 'bg-amber-950/30 border-amber-800'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <span className="font-extrabold text-base text-white block">{item.group}</span>
                  <span className="text-xl font-black text-slate-100">{item.units}</span>
                  <span className="text-[10px] text-slate-400 block">{item.status}</span>

                  <div className="flex items-center justify-center gap-1 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => updateInventoryStock(bank.id, item.group, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateInventoryStock(bank.id, item.group, 1)}
                      className="p-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
