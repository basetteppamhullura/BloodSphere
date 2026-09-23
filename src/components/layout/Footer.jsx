import React from 'react';
import { Link } from 'react-router-dom';
import { BloodNetLogo } from '../common/BloodNetLogo';
import { PhoneCall, ShieldCheck, ExternalLink, MapPin } from 'lucide-react';
export const Footer = () => {
    return (<footer className="bg-[#F0F8FF] border-t border-[#DCEAF5] text-[#16324F] text-xs mt-12 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* TOP ROW: BRAND & EMERGENCY HELPLINE */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#DCEAF5] pb-8">
          <div>
            <BloodNetLogo size="lg" showTagline={true}/>
            <p className="text-[#64748B] text-xs mt-3 max-w-md leading-relaxed">
              BloodNet connects voluntary donors, patient requesters, hospital trauma centers, and regional blood banks in real time to save lives during critical medical emergencies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EF4444] text-white border border-[#FECDD3] shadow-md flex items-center gap-4 text-xs">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner border border-white/30 shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse text-white"/>
            </div>
            <div>
              <span className="text-[10px] font-black text-red-100 uppercase tracking-wider block">
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
            <h4 className="font-extrabold text-[#16324F] uppercase tracking-wider text-[11px]">Portals & Login Routes</h4>
            <ul className="space-y-1.5 font-medium text-[#64748B]">
              <li><Link to="/login" className="hover:text-[#2563EB] hover:translate-x-0.5 transition-all inline-block">Donor & Requester Portal</Link></li>
              <li><Link to="/login/hospital" className="hover:text-[#2563EB] hover:translate-x-0.5 transition-all inline-block">Hospital Trauma Center</Link></li>
              <li><Link to="/login/bloodbank" className="hover:text-[#22C55E] hover:translate-x-0.5 transition-all inline-block">Blood Bank Operations</Link></li>
              <li><Link to="/login/admin" className="hover:text-[#F59E0B] hover:translate-x-0.5 transition-all inline-block">Super Admin Control</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#16324F] uppercase tracking-wider text-[11px]">Emergency Network</h4>
            <ul className="space-y-1.5 font-medium text-[#64748B]">
              <li><Link to="/donor/emergency" className="hover:text-[#EF4444] hover:translate-x-0.5 transition-all inline-block">🚨 Emergency Request Board</Link></li>
              <li><Link to="/donor/rare-blood" className="hover:text-[#2563EB] hover:translate-x-0.5 transition-all inline-block">🛡️ Rare Blood Registry</Link></li>
              <li><Link to="/donor/family" className="hover:text-[#2563EB] hover:translate-x-0.5 transition-all inline-block">Family & Circles</Link></li>
              <li><Link to="/donor/directory" className="hover:text-[#2563EB] hover:translate-x-0.5 transition-all inline-block">Donor Directory Search</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#16324F] uppercase tracking-wider text-[11px]">Regional Centers</h4>
            <ul className="space-y-1.5 font-medium text-[#64748B]">
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0"/> Hubballi KIMS Blood Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0"/> Dharwad SDM Medical Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0"/> Belagavi KLE Hospital Center</li>
              <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0"/> Bengaluru Regional Hub</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#16324F] uppercase tracking-wider text-[11px]">Medical Compliance</h4>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              BloodNet operates under National Blood Transfusion Council (NBTC) guidelines. Patient privacy protected.
            </p>
            <a href="https://nbtc.naco.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline text-[11px] mt-1">
              NBTC Guidelines <ExternalLink className="w-3 h-3"/>
            </a>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT */}
        <div className="pt-6 border-t border-[#DCEAF5] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#94A3B8] font-mono">
          <span>© 2026 BloodNet. Connecting Lives Through Blood. All Rights Reserved.</span>
          <span className="flex items-center gap-1 text-[#64748B] font-sans font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]"/> Real-Time Database Protected
          </span>
        </div>

      </div>
    </footer>);
};
