import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Download, X, Building2, Users, Heart, ShieldCheck } from 'lucide-react';

export const CorporateImpactModal: React.FC = () => {
  const { activeCorporateImpactModal, setActiveCorporateImpactModal } = useApp();

  if (!activeCorporateImpactModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm text-white">CSR & Campus Impact Report</h3>
          </div>
          <button onClick={() => setActiveCorporateImpactModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 bg-slate-950 flex-1 text-xs">
          
          <div className="p-6 rounded-2xl border-2 border-blue-500/40 bg-slate-900 space-y-4 text-center">
            <Award className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-xl font-extrabold text-white">Infosys Hubballi CSR Blood Drive Report</h2>
            <p className="text-slate-300">August 2026 Drive Impact Summary</p>

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="font-black text-lg text-emerald-400 block">184</span>
                <span className="text-[10px] text-slate-400">Donors Registered</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="font-black text-lg text-red-400 block">184 Units</span>
                <span className="text-[10px] text-slate-400">Blood Collected</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="font-black text-lg text-amber-400 block">552</span>
                <span className="text-[10px] text-slate-400">Lives Saved</span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Verified B2B Impact Certification
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2">
          <button onClick={() => window.print()} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download Official CSR Report
          </button>
        </div>

      </div>
    </div>
  );
};
