import React from 'react';
import { useApp } from '../../context/AppContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import { Award, X, Download, ShieldCheck } from 'lucide-react';

export const CertificateModal: React.FC = () => {
  const { activeCertificateModal, setActiveCertificateModal, showToast } = useApp();

  if (!activeCertificateModal) return null;

  const handleDownloadPDF = () => {
    showToast(`Downloading Official Blood Net Lifesaver Certificate (PDF)...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 space-y-6 text-xs shadow-2xl relative">
        
        <button
          onClick={() => setActiveCertificateModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CERTIFICATE DESIGN FRAME */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white via-sky-50/50 to-red-50/20 border-4 border-amber-200 shadow-inner space-y-6 text-center">
          
          <div className="flex justify-center">
            <BloodNetLogo size="md" showTagline={true} />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest">
              OFFICIAL CERTIFICATE OF APPRECIATION
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">VOLUNTARY LIFESAVER AWARD</h2>
            <p className="text-xs text-slate-500 font-medium">Presented for voluntary blood donation in service to humanity</p>
          </div>

          <div className="py-4 border-y border-amber-200 space-y-2">
            <span className="text-slate-500 text-xs font-serif italic block">This certificate is proudly awarded to</span>
            <strong className="text-2xl font-black text-slate-900 tracking-tight block">
              {activeCertificateModal.donorName || 'Ananya Sharma'}
            </strong>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              For donating 1 unit of <strong>{activeCertificateModal.bloodGroup}</strong> blood on <strong>{activeCertificateModal.date}</strong> at <strong>{activeCertificateModal.location}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> NBTC Verified Certificate
            </div>
            <div>Certificate ID: <strong>CERT-2026-88910</strong></div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setActiveCertificateModal(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
          >
            Close
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Official PDF Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
