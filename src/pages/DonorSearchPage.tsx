import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { Donor, BloodGroup } from '../types';
import { Search, Filter, MapPin, Phone, ShieldCheck, Heart, UserCheck, Sliders, Lock, CheckCircle2 } from 'lucide-react';

export const DonorSearchPage: React.FC = () => {
  const { donors, setActiveChatModal, requests } = useApp();
  const { currentRole } = useAuth();

  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('ALL');
  const [rareOnly, setRareOnly] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState<number>(50);

  const filteredDonors = donors.filter(d => {
    if (selectedGroup !== 'ALL' && d.bloodGroup !== selectedGroup) return false;
    if (selectedCity !== 'ALL' && d.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    
    if (availabilityFilter === 'AVAILABLE' && d.availabilityStatus === 'NOT AVAILABLE') return false;
    
    const eligibility = checkDonorEligibility(d);
    if (eligibilityFilter === 'ELIGIBLE' && !eligibility.isEligible) return false;

    if (rareOnly && !['O-', 'AB-', 'A-', 'B-', 'Bombay Phenotype (O-h)'].includes(d.bloodGroup)) return false;

    if ((d.distanceKm || 0) > maxDistance) return false;

    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-black text-white">Searchable Donor Directory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Privacy Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Find voluntary blood donors by blood group, city, availability, and eligibility while preserving personal privacy.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Blood Group Filter */}
        <div>
          <label className="text-slate-400 font-bold block mb-1">Blood Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Blood Groups</option>
            {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Bombay Phenotype (O-h)"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="text-slate-400 font-bold block mb-1">City / Region</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Cities (Karnataka)</option>
            <option value="Hubballi">Hubballi</option>
            <option value="Dharwad">Dharwad</option>
            <option value="Belagavi">Belagavi</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="text-slate-400 font-bold block mb-1">Availability</label>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">🟢 Available Only</option>
          </select>
        </div>

        {/* Eligibility Filter */}
        <div>
          <label className="text-slate-400 font-bold block mb-1">Eligibility</label>
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Donors</option>
            <option value="ELIGIBLE">🟢 Medically Eligible Only</option>
          </select>
        </div>

        {/* Rare Only Toggle */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer font-bold text-slate-200">
            <input
              type="checkbox"
              checked={rareOnly}
              onChange={e => setRareOnly(e.target.checked)}
              className="accent-red-600 cursor-pointer w-4 h-4"
            />
            <span>🛡️ Rare Phenotypes Only</span>
          </label>
        </div>

      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.map((donor) => {
          const eligibility = checkDonorEligibility(donor);
          const isAvail = donor.availabilityStatus !== 'NOT AVAILABLE';

          return (
            <div
              key={donor.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-950">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-slate-100">{donor.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Donor" />
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400" /> Area: {donor.city} ({donor.distanceKm || 3.2} km)
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    isAvail ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isAvail ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </div>

                {/* ATTRIBUTES & PRIVACY MASKING */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Eligibility</span>
                    <span className={`font-bold ${eligibility.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {eligibility.isEligible ? 'Eligible' : 'Deferred'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Total Verified</span>
                    <span className="font-bold text-slate-200">{donor.totalDonations} Donations</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Reliability Score</span>
                    <span className="font-bold text-amber-400">{donor.reliabilityScore || donor.responseLikelihoodScore || 95}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Phone Number</span>
                    <span className="text-slate-400">{donor.maskedPhone || '+91 98*** **310'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveChatModal({ request: requests[0], donor })}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Connect via Privacy Relay
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
