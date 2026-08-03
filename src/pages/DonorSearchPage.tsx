import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Donor, BloodGroup } from '../types';
import { Search, Filter, MapPin, Phone, ShieldCheck, Heart, UserCheck, Sliders } from 'lucide-react';

export const DonorSearchPage: React.FC = () => {
  const { donors, setActiveChatModal, requests } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [maxDistance, setMaxDistance] = useState<number>(25);

  const filteredDonors = donors.filter(d => {
    if (selectedGroup !== 'ALL' && d.bloodGroup !== selectedGroup) return false;
    if (selectedCity !== 'ALL' && d.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (d.distanceKm > maxDistance) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-white">Find Verified Donors</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">Search nearby voluntary blood donors by blood group, city, and radius distance</p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        
        {/* Blood Group Selector */}
        <div>
          <label className="text-slate-400 font-bold block mb-1.5">Blood Group Filter</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-bold text-slate-100 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Blood Groups</option>
            {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="text-slate-400 font-bold block mb-1.5">City / Region</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-semibold text-slate-100 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Cities (Karnataka)</option>
            <option value="Hubballi">Hubballi</option>
            <option value="Dharwad">Dharwad</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        {/* Max Radius Distance Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-bold">
            <span className="text-slate-400">Max Radius</span>
            <span className="text-red-400">{maxDistance} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
            className="w-full accent-red-600 cursor-pointer mt-2"
          />
        </div>

      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.map((donor) => (
          <div
            key={donor.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-950">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{donor.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.distanceKm} km ({donor.city})
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Donations</span>
                  <span className="font-bold text-slate-200">{donor.totalDonations} Times</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Reliability Score</span>
                  <span className="font-bold text-amber-400">{donor.reliabilityScore}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveChatModal({ request: requests[0], donor })}
              className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> Connect via Privacy Relay
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
