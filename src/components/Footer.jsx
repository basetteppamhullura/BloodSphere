import React from 'react';
import { Heart, Phone, Globe, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 pt-12 pb-8 px-4 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-bold text-slate-100 text-base">Blood Donor Network</span>
          </div>
          <p className="leading-relaxed">
            Real-time emergency blood donation platform powered by AI donor matching, demand forecasting, and gamified community engagement.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" /> HIPAA & NBTC Compliance Compliant
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Emergency Helplines</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> National Helpline: <strong className="text-white">104 / 1910</strong>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> Karnataka Blood Transfusion Council: <strong className="text-white">+91 80 2286 1234</strong>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> Hubballi Emergency Helpline: <strong className="text-white">+91 836 2378000</strong>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Multi-Language Support</h4>
          <p className="leading-relaxed mb-3">Available across English, ಕನ್ನಡ (Kannada), and हिंदी (Hindi) for reach across Karnataka & India.</p>
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Region: Karnataka, India</span>
          </div>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">AI Platform Microservice</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400" /> Smart Donor Matching Engine</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400" /> 30-Day Demand Forecasting</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400" /> NLP Emergency Request Generator</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
        <div>© 2026 Blood Donor Network. Built for Saving Lives in Real-Time.</div>
        <div>Made with ❤️ for Healthcare & Lifesavers</div>
      </div>
    </footer>
  );
}
