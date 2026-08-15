import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import {
  Heart,
  Flame,
  Trophy,
  Award,
  ShieldCheck,
  Share2,
  FileText,
  Scale,
  Calendar,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Sliders,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { donors, toggleDonorAvailability, setActiveCertificateModal, showToast } = useApp();

  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];

  const [weight, setWeight] = useState<number>(currentUser?.medicalFlags?.weight || 64);
  const [hbLevel, setHbLevel] = useState<number>(currentUser?.medicalFlags?.hbLevel || 14.2);

  const eligibility = checkDonorEligibility(loggedInDonor);

  const handleAvailabilityChange = (newStatus: 'AVAILABLE' | 'NOT AVAILABLE' | 'TEMPORARILY UNAVAILABLE') => {
    toggleDonorAvailability(loggedInDonor.id, newStatus, loggedInDonor.emergencyAlertsEnabled);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* 1. DONOR PROFILE HEADER CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/60 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-red-950 border-2 border-red-400/30 shrink-0">
              {loggedInDonor.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{loggedInDonor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Donor
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> {loggedInDonor.city}, Karnataka • Gender: Female / Male
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold">
                <span className="text-red-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> {currentUser?.streak || 4}x Donation Streak
                </span>
                <span className="text-amber-400 flex items-center gap-1 font-mono">
                  <Trophy className="w-4 h-4" /> {loggedInDonor.points || 1250} Recognition Points
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => showToast("Referral code copied! Share with friends to earn 100 points.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-slate-200 border border-slate-700 shadow-md"
          >
            <Share2 className="w-4 h-4 text-amber-400" /> Invite Friends & Earn Points
          </button>
        </div>

        {/* 2. REAL-TIME AVAILABILITY & ELIGIBILITY CONTROL PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Availability Control */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block text-[11px]">Donor Emergency Availability</span>
            <select
              value={loggedInDonor.availabilityStatus || 'AVAILABLE'}
              onChange={e => handleAvailabilityChange(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-extrabold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="AVAILABLE" className="bg-slate-900 text-emerald-400 font-bold">🟢 Available for Emergency Requests</option>
              <option value="TEMPORARILY UNAVAILABLE" className="bg-slate-900 text-amber-400 font-bold">🟡 Temporarily Unavailable</option>
              <option value="NOT AVAILABLE" className="bg-slate-900 text-red-400 font-bold">🔴 Not Available</option>
            </select>
            <p className="text-[10px] text-slate-400">
              When 🟢 AVAILABLE, you automatically receive live matching emergency request notifications.
            </p>
          </div>

          {/* Calculated Eligibility Status */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block text-[11px]">Calculated Medical Eligibility</span>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-extrabold ${
              eligibility.isEligible ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}>
              <span className="flex items-center gap-1.5">
                {eligibility.isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                {eligibility.isEligible ? 'Eligible for Donation' : 'Temporarily Deferred'}
              </span>
              <span className="text-[10px] font-mono">Next Eligible: {loggedInDonor.nextEligibleDate || '2026-06-10'}</span>
            </div>
            {!eligibility.isEligible && (
              <p className="text-[10px] text-amber-300 font-sans">{eligibility.reason}</p>
            )}
          </div>

        </div>
      </div>

      {/* 3. SECURE MEDICAL DIAGNOSTIC & ELIGIBILITY RULES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Backend Medical Safety Diagnostics
          </h3>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-emerald-400" /> Protected Record
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-slate-400 font-bold block mb-1">Donor Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-900 p-2.5 rounded-xl text-white font-bold border border-slate-700"
            />
            <span className="text-[10px] text-slate-500 block">Min weight requirement: 45 kg</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-slate-400 font-bold block mb-1">Hemoglobin Level (g/dL)</label>
            <input
              type="number"
              step="0.1"
              value={hbLevel}
              onChange={(e) => setHbLevel(parseFloat(e.target.value))}
              className="w-full bg-slate-900 p-2.5 rounded-xl text-white font-bold border border-slate-700"
            />
            <span className="text-[10px] text-slate-500 block">Min Hb requirement: 12.5 g/dL</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <span>Medical eligibility is calculated using national blood bank safety guidelines.</span>
          <a
            href="https://nbtc.naco.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            Blood Bank Medical Guidelines <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4. DONATION HISTORY & DIGITAL CERTIFICATES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-indigo-400" /> Verified Donation History ({loggedInDonor.totalDonations} Completed)
        </h3>

        <div className="space-y-3">
          {(currentUser?.donationHistory || [
            { id: "dh_1", date: "2026-03-10", location: "KIMS Teaching Hospital Hubballi", units: 1, bloodGroup: loggedInDonor.bloodGroup, certificateUrl: "#" },
            { id: "dh_2", date: "2025-11-15", location: "Rotary Regional Blood Center", units: 1, bloodGroup: loggedInDonor.bloodGroup, certificateUrl: "#" }
          ]).map((don) => (
            <div key={don.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-white block">{don.location}</span>
                <span className="text-slate-400 text-[11px]">1 Unit ({don.bloodGroup}) on {don.date} • Verified Transfusion</span>
              </div>

              <button
                onClick={() => setActiveCertificateModal(don)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30 flex items-center gap-1.5 shrink-0"
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
