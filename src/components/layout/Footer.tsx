import React from 'react';
import { useApp } from '../../context/AppContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import { Heart, PhoneCall, ShieldCheck, ExternalLink, MapPin, Mail, Droplet } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-white border-t border-sky-100 text-slate-600 text-xs mt-12 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* TOP ROW: BRAND & EMERGENCY HELPLINE */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sky-100 pb-8">
          <div>
            <BloodNetLogo size="lg" showTagline={true} />
            <p className="text-slate-500 text-xs mt-3 max-w-md leading-relaxed">
              Blood Net connects voluntary donors, patient requesters, hospital trauma centers, and regional blood banks in real time to save lives during critical medical emergencies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 flex items-center gap-4 text-xs">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">
                NATIONAL BLOOD EMERGENCY HELPLINE
              </span>
              <strong className="text-xl font-black text-slate-900 block mt-0.5">108 / 104</strong>
              <span className="text-[10px] text-slate-500 font-mono">24x7 Real-Time Emergency Response</span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: QUICK LINKS & PORTALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Portals & Login Routes</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li><button onClick={() => navigateTo('login-donor-requester')} className="hover:text-red-600 transition-colors">Donor & Requester Portal</button></li>
              <li><button onClick={() => navigateTo('login-hospital')} className="hover:text-sky-600 transition-colors">Hospital Trauma Center</button></li>
              <li><button onClick={() => navigateTo('login-bloodbank')} className="hover:text-emerald-600 transition-colors">Blood Bank Operations</button></li>
              <li><button onClick={() => navigateTo('login-admin')} className="hover:text-amber-600 transition-colors">Super Admin Control</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Emergency Network</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li><button onClick={() => navigateTo('emergency-requests')} className="hover:text-red-600 transition-colors">🚨 Emergency Request Board</button></li>
              <li><button onClick={() => navigateTo('rare-registry')} className="hover:text-sky-600 transition-colors">🛡️ Rare Blood Registry</button></li>
              <li><button onClick={() => navigateTo('group-circles')} className="hover:text-sky-600 transition-colors">Family & Circles</button></li>
              <li><button onClick={() => navigateTo('donor-search')} className="hover:text-sky-600 transition-colors">Donor Directory Search</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Regional Centers</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Hubballi KIMS Blood Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Dharwad SDM Medical Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Belagavi KLE Hospital Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Bengaluru Regional Hub</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Medical Compliance</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Blood Net operates under National Blood Transfusion Council (NBTC) guidelines. Patient privacy protected.
            </p>
            <a
              href="https://nbtc.naco.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 font-bold hover:underline text-[11px] mt-1"
            >
              NBTC Guidelines <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT */}
        <div className="pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <span>© 2026 Blood Net. Connecting Lives Through Blood. All Rights Reserved.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Real-Time Database Protected
          </span>
        </div>

      </div>
    </footer>
  );
};
