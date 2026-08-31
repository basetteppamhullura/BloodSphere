import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import { Heart, PhoneCall, ShieldCheck, ExternalLink, MapPin, Mail, Droplet } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-white border-t border-sky-200/90 text-[#0D2B45] text-xs mt-12 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* TOP ROW: BRAND & EMERGENCY HELPLINE */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sky-200/70 pb-8">
          <div>
            <BloodNetLogo size="lg" showTagline={true} />
            <p className="text-slate-600 text-xs mt-3 max-w-md leading-relaxed">
              Blood Net connects voluntary donors, patient requesters, hospital trauma centers, and regional blood banks in real time to save lives during critical medical emergencies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white border border-red-500/30 shadow-md shadow-red-600/20 flex items-center gap-4 text-xs">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner border border-white/30 shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-red-200 uppercase tracking-wider block">
                NATIONAL BLOOD EMERGENCY HELPLINE
              </span>
              <strong className="text-xl font-black text-white block mt-0.5 tracking-tight">108 / 104</strong>
              <span className="text-[10px] text-red-100 font-mono">24x7 Real-Time Emergency Response</span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: QUICK LINKS & PORTALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-extrabold text-[#0D2B45] uppercase tracking-wider text-[11px]">Portals & Login Routes</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li><Link to="/login" className="hover:text-red-600 hover:translate-x-0.5 transition-all inline-block">Donor & Requester Portal</Link></li>
              <li><Link to="/login/hospital" className="hover:text-[#0EA5E9] hover:translate-x-0.5 transition-all inline-block">Hospital Trauma Center</Link></li>
              <li><Link to="/login/bloodbank" className="hover:text-emerald-600 hover:translate-x-0.5 transition-all inline-block">Blood Bank Operations</Link></li>
              <li><Link to="/login/admin" className="hover:text-amber-600 hover:translate-x-0.5 transition-all inline-block">Super Admin Control</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#0D2B45] uppercase tracking-wider text-[11px]">Emergency Network</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li><Link to="/donor/emergency" className="hover:text-red-600 hover:translate-x-0.5 transition-all inline-block">🚨 Emergency Request Board</Link></li>
              <li><Link to="/donor/rare-blood" className="hover:text-[#0EA5E9] hover:translate-x-0.5 transition-all inline-block">🛡️ Rare Blood Registry</Link></li>
              <li><Link to="/donor/family" className="hover:text-[#0EA5E9] hover:translate-x-0.5 transition-all inline-block">Family & Circles</Link></li>
              <li><Link to="/donor/directory" className="hover:text-[#0EA5E9] hover:translate-x-0.5 transition-all inline-block">Donor Directory Search</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#0D2B45] uppercase tracking-wider text-[11px]">Regional Centers</h4>
            <ul className="space-y-1.5 font-medium text-slate-600">
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Hubballi KIMS Blood Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Dharwad SDM Medical Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Belagavi KLE Hospital Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Bengaluru Regional Hub</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#0D2B45] uppercase tracking-wider text-[11px]">Medical Compliance</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Blood Net operates under National Blood Transfusion Council (NBTC) guidelines. Patient privacy protected.
            </p>
            <a
              href="https://nbtc.naco.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#0EA5E9] font-bold hover:underline text-[11px] mt-1"
            >
              NBTC Guidelines <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT */}
        <div className="pt-6 border-t border-sky-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <span>© 2026 Blood Net. Connecting Lives Through Blood. All Rights Reserved.</span>
          <span className="flex items-center gap-1 text-slate-500 font-sans font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Real-Time Database Protected
          </span>
        </div>

      </div>
    </footer>
  );
};
