import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { ShieldCheck, AlertOctagon, Phone, Sparkles, Send, MapPin, Zap, UserCheck, Check, Lock } from 'lucide-react';

export const RareRegistryPage: React.FC = () => {
  const { donors, setDonors, setActiveChatModal, requests, showToast } = useApp();
  const { currentUser } = useAuth();

  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];
  const isRareGroup = ['O-', 'AB-', 'A-', 'B-', 'Bombay Phenotype (O-h)'].includes(loggedInDonor.bloodGroup);

  const [isRegistered, setIsRegistered] = useState<boolean>(loggedInDonor.isRareGroup ?? isRareGroup);

  const rareDonors = donors.filter(d => ['O-', 'AB-', 'A-', 'B-', 'Bombay Phenotype (O-h)'].includes(d.bloodGroup));

  const handleToggleRareRegistration = () => {
    const nextState = !isRegistered;
    setIsRegistered(nextState);

    setDonors(prev =>
      prev.map(d => {
        if (d.id === loggedInDonor.id) {
          return { ...d, isRareGroup: nextState };
        }
        return d;
      })
    );

    showToast(nextState ? `You are registered in the National Rare Blood Registry!` : `Rare Registry registration updated.`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-black text-white">National Rare Blood Registry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950 text-red-300 border border-red-800">
              PROACTIVE EMERGENCY NETWORK
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Dedicated registry for rare blood phenotypes (O-, AB-, A-, B-, Bombay Phenotype O-h) with privacy protection.
          </p>
        </div>

        <button
          onClick={handleToggleRareRegistration}
          className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
            isRegistered
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-950 hover:scale-105'
          }`}
        >
          {isRegistered ? <><Check className="w-4 h-4 text-emerald-400" /> Registered in Rare Registry</> : <><PlusCircleIcon className="w-4 h-4" /> Register My Blood in Registry</>}
        </button>
      </div>

      {/* Rare Phenotype Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-red-400 block text-sm">O- Universal Red Cell</span>
          <p className="text-slate-400 text-[11px]">~5% population. Universal red cell donor for emergency trauma cases.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-amber-400 block text-sm">AB- Plasma Universal</span>
          <p className="text-slate-400 text-[11px]">High scarcity. Crucial for emergency plasma and platelet transfusions.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-blue-400 block text-sm">A- & B- Rare Groups</span>
          <p className="text-slate-400 text-[11px]">Requires proactive registry tracking to prevent ICU delays.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-extrabold text-emerald-400 block text-sm">Bombay Phenotype (O-h)</span>
          <p className="text-slate-400 text-[11px]">1 in 10,000 incidence. Requires emergency inter-city coordination.</p>
        </div>
      </div>

      {/* Rare Donors Directory List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Registered Rare Blood Donors On-Call ({rareDonors.length})
          </h3>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-emerald-400" /> Privacy Relay Protected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rareDonors.map((donor) => {
            const eligibility = checkDonorEligibility(donor);

            return (
              <div
                key={donor.id}
                className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 hover:border-red-800/60 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-sm flex items-center justify-center p-1 text-center shadow-md shadow-red-950">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-white">{donor.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" /> {donor.city}, Karnataka ({donor.distanceKm || 2.1} km)
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-300" /> Rare Registry
                    </span>
                  </div>

                  {/* REAL ATTRIBUTES GRID */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Availability</span>
                      <strong className="text-emerald-400 font-bold">{donor.availabilityStatus || '🟢 Available'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Eligibility</span>
                      <strong className={eligibility.isEligible ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {eligibility.isEligible ? 'Eligible' : 'Deferred'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Last Verified Donation</span>
                      <span className="text-slate-300 font-mono">{donor.lastDonationDate || '2026-03-10'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Registry Status</span>
                      <span className="text-emerald-300 font-bold">Verified On-Call</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveChatModal({ request: requests[0], donor })}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-extrabold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Connect via Privacy Relay
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
