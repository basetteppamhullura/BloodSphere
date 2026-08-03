import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Heart, Flame, Trophy, Award, ShieldCheck, Share2, FileText, Scale, Calendar, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { setActiveCertificateModal, showToast } = useApp();

  const [weight, setWeight] = useState(currentUser?.medicalFlags?.weight || 64);
  const [hbLevel, setHbLevel] = useState(currentUser?.medicalFlags?.hbLevel || 14.2);

  const isEligible = weight >= 45 && hbLevel >= 12.5;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-red-950 border-2 border-red-400/30 shrink-0">
              {currentUser?.bloodGroup || "O-"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{currentUser?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.address}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold">
                <span className="text-red-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> {currentUser?.streak || 4}x Donation Streak
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> {currentUser?.points || 1250} Recognition Points
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => showToast("Referral code copied! Share with friends to earn 100 points.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            <Share2 className="w-4 h-4 text-amber-400" /> Invite Friends & Earn Points
          </button>
        </div>
      </div>

      {/* AI Health Eligibility Predictor */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> AI Medical Eligibility Diagnostic
        </h3>

        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          isEligible ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-amber-950/40 border-amber-800 text-amber-200'
        }`}>
          {isEligible ? <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          <div>
            <div className="font-bold">{isEligible ? '✅ Safe & Fully Eligible to Donate Today' : '⚠️ Temporarily Deferred'}</div>
            <p className="mt-0.5 text-slate-300">Your health stats match national blood bank safety guidelines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <label className="text-slate-400 font-semibold block mb-1">Donor Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-800 p-2 rounded-lg text-white font-bold border border-slate-700"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <label className="text-slate-400 font-semibold block mb-1">Hemoglobin Level (g/dL)</label>
            <input
              type="number"
              step="0.1"
              value={hbLevel}
              onChange={(e) => setHbLevel(parseFloat(e.target.value))}
              className="w-full bg-slate-800 p-2 rounded-lg text-white font-bold border border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Donation History & Download Certificate */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" /> Donation History & Digital Certificates
        </h3>

        <div className="space-y-3">
          {currentUser?.donationHistory?.map((don) => (
            <div key={don.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-white block">{don.location}</span>
                <span className="text-slate-400">1 Unit ({don.bloodGroup}) on {don.date}</span>
              </div>

              <button
                onClick={() => setActiveCertificateModal(don)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> Download Certificate
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
