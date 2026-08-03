import React from 'react';
import { useApp } from '../../context/AppContext';
import EligibilityPredictor from '../ai/EligibilityPredictor';
import { Heart, Flame, Trophy, Award, ShieldCheck, Share2, FileText, CheckCircle2 } from 'lucide-react';

export default function DonorProfile() {
  const { currentUser, setActiveCertificateModal, addToastNotification } = useApp();

  const handleCopyReferral = () => {
    addToastNotification("Referral link copied! Earn 100 bonus points when friends register.");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Profile Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-red-950 border-2 border-red-400/40 shrink-0">
              {currentUser?.bloodGroup || "O-"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{currentUser?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.address}</p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <Flame className="w-4 h-4 text-amber-400" /> {currentUser?.streak || 4}x Donation Streak
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Trophy className="w-4 h-4" /> {currentUser?.points || 1250} Recognition Pts
                </span>
              </div>
            </div>
          </div>

          {/* Quick Share Referral */}
          <button
            onClick={handleCopyReferral}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            <Share2 className="w-4 h-4 text-amber-400" /> Invite Friends & Earn Points
          </button>

        </div>

      </div>

      {/* AI Eligibility Predictor Component */}
      <EligibilityPredictor />

      {/* Badges Grid */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Unlocked Lifesaver Badges
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentUser?.badges?.map((badge) => (
            <div
              key={badge.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center space-y-1 hover:border-amber-500/40 transition-all"
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="font-bold text-xs text-slate-200">{badge.title}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History & Certificates */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" /> Verified Donation History
        </h3>

        <div className="space-y-3">
          {currentUser?.donationHistory?.map((don) => (
            <div
              key={don.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <span className="font-bold text-slate-200 block text-sm">{don.location}</span>
                <span className="text-slate-400">Donated 1 Unit ({don.bloodGroup}) on {don.date}</span>
              </div>

              <button
                onClick={() => setActiveCertificateModal(don)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> View Certificate
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
