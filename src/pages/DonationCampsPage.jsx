import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tent, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { CampRegistrationModal } from '../components/modals/CampRegistrationModal';

export const DonationCampsPage = () => {
    const { camps } = useApp();
    const [selectedCamp, setSelectedCamp] = useState(null);

    return (<div className="space-y-6 text-xs animate-in fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Tent className="w-6 h-6 text-red-600"/>
            <h2 className="text-xl font-black text-slate-900">Voluntary Blood Donation Drives & Camps</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Join upcoming voluntary blood donation camps in your city</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {camps.map((camp) => (<div key={camp.id} className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                  Organized by {camp.organizer || 'Blood Bank'}
                </span>
                <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-600"/> {camp.rsvpsCount || camp.registeredDonorsCount || 0} Registered
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{camp.title || camp.name}</h3>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-sky-50/50 p-3 rounded-2xl border border-sky-100 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-red-500"/>
                  <span className="text-slate-900 font-bold">{camp.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500"/>
                  <span className="text-slate-900 font-bold">{camp.city}</span>
                </div>
              </div>

              <p className="text-slate-600 text-xs">{camp.venue || camp.location}</p>
            </div>

            <button 
              onClick={() => setSelectedCamp(camp)} 
              className="w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md cursor-pointer"
            >
              Participate & Register →
            </button>
          </div>))}
      </div>

      {selectedCamp && (
        <CampRegistrationModal
          camp={selectedCamp}
          onClose={() => setSelectedCamp(null)}
        />
      )}

    </div>);
};

