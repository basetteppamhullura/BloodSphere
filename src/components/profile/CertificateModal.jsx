import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Download, X, ShieldCheck, Heart } from 'lucide-react';

export default function CertificateModal() {
  const { activeCertificateModal, setActiveCertificateModal, currentUser } = useApp();
  const certRef = useRef(null);

  if (!activeCertificateModal) return null;

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Official Voluntary Blood Donor Certificate</h3>
          </div>

          <button
            onClick={() => setActiveCertificateModal(null)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Canvas View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          
          <div
            ref={certRef}
            className="w-full max-w-xl p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-500/40 shadow-2xl relative text-center space-y-4"
          >
            {/* Watermark / Seal */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
              <span className="font-black text-xl text-slate-100 tracking-wide uppercase">
                Blood Donor Network
              </span>
            </div>

            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
              CERTIFICATE OF APPRECIATION
            </span>

            <p className="text-xs text-slate-300 italic">This certificate is proudly awarded to</p>

            <h2 className="text-2xl font-extrabold text-white tracking-tight border-b-2 border-amber-500/30 pb-2 inline-block px-6">
              {currentUser?.name || "Dr. Ananya Sharma"}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              for their selfless contribution as a voluntary blood donor (<span className="text-red-400 font-bold">{currentUser?.bloodGroup || "O-"}</span>) on{" "}
              <span className="font-semibold text-slate-100">{activeCertificateModal.date}</span> at{" "}
              <span className="font-semibold text-slate-100">{activeCertificateModal.location}</span>.
              Your donation saved valuable lives!
            </p>

            {/* Verification Stamp & Details */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-6 text-xs text-slate-400">
              <div className="text-left">
                <span className="block text-[10px] text-slate-500">Certificate Hash</span>
                <span className="font-mono text-slate-300 text-[11px]">KA-BDN-2026-990812</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" /> Digitally Verified
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button
            onClick={() => setActiveCertificateModal(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download / Print PDF
          </button>
        </div>

      </div>
    </div>
  );
}
