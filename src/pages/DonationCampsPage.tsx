import React from 'react';
import { useApp } from '../context/AppContext';
import { Tent, Calendar, MapPin, Users, CheckCircle2, PlusCircle } from 'lucide-react';

export const DonationCampsPage: React.FC = () => {
  const { camps, toggleCampRSVP, showToast } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tent className="w-6 h-6 text-rose-500" />
            <h2 className="text-xl font-bold text-white">Blood Donation Camps & Drives</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Join upcoming voluntary blood donation camps hosted by Rotary, Red Cross & Colleges</p>
        </div>

        <button
          onClick={() => showToast("Host camp request form opened! Admin review pending.")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" /> Host a Donation Camp
        </button>
      </div>

      {/* Camps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camps.map((camp) => (
          <div key={camp.id} className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between">
            
            <div className="h-44 relative bg-slate-800">
              <img src={camp.bannerUrl} alt={camp.title} className="w-full h-full object-cover opacity-80" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-xs font-bold text-white border border-slate-700">
                📍 {camp.city}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">{camp.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Organized by {camp.organizer}</p>

                <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" /> {camp.date} ({camp.time})
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> {camp.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> {camp.rsvpsCount} Donors RSVP'd (Target: {camp.expectedDonors})
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {camp.amenities.map((a, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleCampRSVP(camp.id)}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  camp.isJoined
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-lg shadow-red-950'
                }`}
              >
                {camp.isJoined ? <><CheckCircle2 className="w-4 h-4" /> You've RSVP'd for this Drive</> : 'Confirm RSVP Slot'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
