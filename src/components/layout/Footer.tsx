import React from 'react';
import { Heart, Phone, Globe, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 pt-10 pb-20 lg:pb-10 px-4 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-extrabold text-slate-100 text-base">BloodNet Healthcare</span>
          </div>
          <p className="leading-relaxed">
            Real-time emergency blood donation network connecting donors, requesters, hospitals, and blood banks.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4" /> HIPAA & NBTC Safety Guidelines Verified
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase text-[11px]">Emergency Helplines</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> National Toll-Free: <strong className="text-white">104 / 1910</strong>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> Karnataka Blood Council: <strong className="text-white">+91 80 2286 1234</strong>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase text-[11px]">Multi-Language Support</h4>
          <p className="leading-relaxed mb-2">Available across English, ಕನ್ನಡ (Kannada), and हिंदी (Hindi).</p>
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-4 h-4 text-blue-400" /> Region: Karnataka, India
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase text-[11px]">Quick Links</h4>
          <div className="flex flex-wrap gap-2 text-slate-300">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Donor Eligibility</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Blood Group Matrix</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Camp Host Guide</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
        <div>© 2026 BloodNet Healthcare. All Rights Reserved.</div>
        <div>Built for Lifesavers & Healthcare Access</div>
      </div>
    </footer>
  );
};
