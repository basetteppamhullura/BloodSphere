import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Droplet, Search } from 'lucide-react';

export const BloodBanksPage: React.FC = () => {
  const { bloodBanks } = useApp();
  const [searchCity, setSearchCity] = useState('ALL');

  const filteredBanks = bloodBanks.filter(b => {
    if (searchCity !== 'ALL' && b.city.toLowerCase() !== searchCity.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-black text-slate-900">Regional Blood Banks Directory & Stock</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Live inventory level monitor across regional certified blood centers</p>
        </div>

        <select
          value={searchCity}
          onChange={e => setSearchCity(e.target.value)}
          className="p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 font-bold text-xs shadow-xs"
        >
          <option value="ALL">All Regional Centers</option>
          <option value="Hubballi">Hubballi</option>
          <option value="Dharwad">Dharwad</option>
          <option value="Belagavi">Belagavi</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBanks.map((bank) => (
          <div key={bank.id} className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-sky-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600" /> {bank.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {bank.address}, {bank.city}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Center
              </span>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-center">
              {bank.inventory.map(item => (
                <div key={item.group} className="p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <span className="text-[10px] text-slate-500 font-sans block">{item.group}</span>
                  <strong className={`text-xs block font-bold ${item.units > 5 ? 'text-emerald-600' : item.units > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {item.units}u
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
