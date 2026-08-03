import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Download, X, Heart, ShieldCheck } from 'lucide-react';

export const CertificateModal: React.FC = () => {
  const { activeCertificateModal, setActiveCertificateModal } = useApp();

  if (!activeCertificateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Voluntary Donor Certificate</h3>
          </div>
          <button onClick={() => setActiveCertificateModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center space-y-4 bg-slate-950">
          <div className="w-full p-6 rounded-2xl border-4 border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 space-y-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 mx-auto animate-pulse" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Official Certificate</span>
            <h2 className="text-xl font-extrabold text-white">Dr. Ananya Sharma</h2>
            <p className="text-xs text-slate-300">
              For voluntary blood donation at <strong className="text-white">{activeCertificateModal.location}</strong> on <strong className="text-white">{activeCertificateModal.date}</strong>.
            </p>
            <div className="pt-2 text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Digitally Verified Hash KA-BDN-2026-9908
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2">
          <button onClick={() => window.print()} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download / Print PDF
          </button>
        </div>

      </div>
    </div>
  );
};
