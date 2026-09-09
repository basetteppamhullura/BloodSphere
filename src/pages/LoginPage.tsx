import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { User, Building2, Droplet, ShieldCheck, ArrowRight, PlusCircle, Heart } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col justify-center items-center overflow-hidden">
      
      {/* FLOATING SUBTLE BACKGROUND ELEMENTS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-10 relative z-10 animate-in fade-in duration-300">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Choose Your Portal
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto">
            Select your dedicated portal below to proceed to isolated authentication
          </p>
        </div>

        {/* 5 PORTAL CHOICE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* DONOR PORTAL CARD */}
          <button
            type="button"
            onClick={() => navigate('/login/donor')}
            className="p-5 rounded-3xl border border-slate-200 bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10 hover:scale-[1.03] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-black shadow-xs">
                ❤️
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <strong className="font-extrabold text-slate-900 text-base block group-hover:text-red-600 transition-colors">
                Donor
              </strong>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Donate blood & respond to emergency requests
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-red-600 flex items-center gap-1">
              <span>Donor Access</span> &rarr;
            </div>
          </button>

          {/* REQUESTER PORTAL CARD */}
          <button
            type="button"
            onClick={() => navigate('/login/requester')}
            className="p-5 rounded-3xl border border-slate-200 bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/10 hover:scale-[1.03] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-black shadow-xs">
                🆘
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <strong className="font-extrabold text-slate-900 text-base block group-hover:text-rose-600 transition-colors">
                Requester
              </strong>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Create & track patient emergency blood requests
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
              <span>Requester Access</span> &rarr;
            </div>
          </button>

          {/* HOSPITAL PORTAL CARD */}
          <button
            type="button"
            onClick={() => navigate('/login/hospital')}
            className="p-5 rounded-3xl border border-slate-200 bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10 hover:scale-[1.03] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl font-black shadow-xs">
                🏥
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <strong className="font-extrabold text-slate-900 text-base block group-hover:text-sky-600 transition-colors">
                Hospital
              </strong>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage patient requests & hospital blood stock
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-sky-600 flex items-center gap-1">
              <span>Hospital Access</span> &rarr;
            </div>
          </button>

          {/* BLOOD BANK PORTAL CARD */}
          <button
            type="button"
            onClick={() => navigate('/login/bloodbank')}
            className="p-5 rounded-3xl border border-slate-200 bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.03] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-xs">
                🩸
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <strong className="font-extrabold text-slate-900 text-base block group-hover:text-emerald-600 transition-colors">
                Blood Bank
              </strong>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage inventory, requests & blood units
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
              <span>Blood Bank OTP Access</span> &rarr;
            </div>
          </button>

          {/* SUPER ADMIN CARD */}
          <button
            type="button"
            onClick={() => navigate('/login/admin')}
            className="p-5 rounded-3xl border border-slate-200 bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-slate-800 hover:shadow-xl hover:shadow-slate-900/10 hover:scale-[1.03] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-xl font-black shadow-xs">
                🛡️
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <strong className="font-extrabold text-slate-900 text-base block group-hover:text-slate-800 transition-colors">
                Super Admin
              </strong>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                System-wide management & monitoring
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
              <span>Admin Access</span> &rarr;
            </div>
          </button>

        </div>

      </div>

    </div>
  );
};
