import React from 'react';
import { useApp } from '../../context/AppContext';
import { Tent, Calendar, MapPin, Users, CheckCircle2, Clock, PlusCircle } from 'lucide-react';

export default function CampsManager() {
  const { camps, toggleCampRSVP, addToastNotification } = useApp();

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md">
            <Tent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Blood Donation Camps & Community Drives</h3>
            <p className="text-xs text-slate-400">RSVP for upcoming blood donation drives or host your own organization camp</p>
          </div>
        </div>

        <button
          onClick={() => addToastNotification("Camp host form submitted! Admin review pending.")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" /> Host a Donation Drive
        </button>
      </div>

      {/* Camps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camps.map((camp) => (
          <div
            key={camp.id}
            className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all"
          >
            {/* Banner Image */}
            <div className="h-44 relative bg-slate-800 overflow-hidden">
              <img
                src={camp.bannerUrl}
                alt={camp.title}
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-xs font-bold text-slate-100 backdrop-blur-md border border-slate-700">
                📍 {camp.city}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-base">{camp.title}</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Organized by {camp.organizer}</p>

                <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{camp.date} ({camp.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{camp.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{camp.rsvpsCount} Donors RSVP'd (Target: {camp.expectedDonors})</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {camp.amenities.map((a, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* RSVP Button */}
              <button
                onClick={() => toggleCampRSVP(camp.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  camp.isJoined
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950'
                }`}
              >
                {camp.isJoined ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> You've RSVP'd for this Drive
                  </>
                ) : (
                  'Confirm RSVP Slot'
                )}
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
