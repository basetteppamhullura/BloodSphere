import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 px-4 lg:px-8 mt-12 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-extrabold text-slate-100 text-base">BloodSphere Healthcare</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Real-Time Blood Donor Network connecting donors, recipients, hospitals, and blood banks across India.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> 24/7 Verified Emergency Grid
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2">
            <li><button onClick={() => navigateTo('landing')} className="hover:text-white">Home Landing</button></li>
            <li><button onClick={() => navigateTo('dashboard')} className="hover:text-white">Dashboard</button></li>
            <li><button onClick={() => navigateTo('emergency-requests')} className="hover:text-white">Emergency Requests</button></li>
            <li><button onClick={() => navigateTo('donor-search')} className="hover:text-white">Search Donors</button></li>
            <li><button onClick={() => navigateTo('blood-banks')} className="hover:text-white">Blood Banks & Inventory</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3">Donor Resources</h4>
          <ul className="space-y-2">
            <li><button onClick={() => navigateTo('rare-registry')} className="hover:text-white">Rare Blood Registry</button></li>
            <li><button onClick={() => navigateTo('group-circles')} className="hover:text-white">Family & Group Circles</button></li>
            <li><button onClick={() => navigateTo('blood-bridge')} className="hover:text-white">Inter-City Blood Bridge</button></li>
            <li><button onClick={() => navigateTo('camps')} className="hover:text-white">Donation Camps</button></li>
            <li><button onClick={() => navigateTo('leaderboard')} className="hover:text-white">Leaderboard & Badges</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3">24/7 Helpline</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <PhoneCall className="w-4 h-4 text-red-500" />
              <span>1800-BLOOD-HELP (+91 800 256 6343)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>emergency@bloodsphere.org</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-2">
              Hubballi • Dharwad • Bengaluru • Belagavi • Karnataka Network
            </p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
        <div>© 2026 BloodSphere Healthcare. All Rights Reserved.</div>
        <div className="flex gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-300 cursor-pointer">Medical Disclaimer</span>
        </div>
      </div>
    </footer>
  );
};
