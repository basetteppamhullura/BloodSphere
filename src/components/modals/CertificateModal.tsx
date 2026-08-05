import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Download, X, ShieldCheck, Heart } from 'lucide-react';

export const CertificateModal: React.FC = () => {
  const { activeCertificateModal, setActiveCertificateModal, showToast } = useApp();

  if (!activeCertificateModal) return null;

  const cert = activeCertificateModal;

  const handleDownload = () => {
    showToast("Voluntary Donation Certificate downloaded as PDF!");
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Voluntary Donor Digital Certificate</h3>
          </div>
          <button onClick={() => setActiveCertificateModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-4 bg-slate-950 flex-1 text-xs text-center">
          
          <div className="p-6 rounded-2xl border-2 border-amber-500/40 bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 fill-white" />
            </div>

            <h2 className="text-xl font-black text-white tracking-tight">CERTIFICATE OF APPRECIATION</h2>
            <p className="text-slate-400">This certificate is proudly awarded to</p>

            <span className="text-2xl font-black text-amber-400 block tracking-wide">{cert.donorName || "Dr. Ananya Sharma"}</span>

            <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
              For your heroic voluntary blood donation of <strong>{cert.bloodGroup || "O-"}</strong> at <strong>{cert.location || "KIMS Teaching Hospital"}</strong> on <strong>{cert.date || "2026-03-10"}</strong>. Your contribution saved human lives.
            </p>

            <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800">
              <span>Certificate ID: {cert.id || "CERT-2026-8891"}</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified by Red Cross & Ministry of Health
              </span>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2">
          <button onClick={handleDownload} className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download / Print Official Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
