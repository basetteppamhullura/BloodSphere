import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import {
  Flame,
  Trophy,
  Award,
  ShieldCheck,
  Share2,
  FileText,
  AlertCircle,
  MapPin,
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
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sky-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              {loggedInDonor.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{loggedInDonor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Donor
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {loggedInDonor.city}, Karnataka
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold">
                <span className="text-red-600 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500" /> {currentUser?.streak || 4}x Donation Streak
                </span>
                <span className="text-amber-600 flex items-center gap-1 font-mono">
                  <Trophy className="w-4 h-4" /> {loggedInDonor.points || 1250} Recognition Points
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => showToast("Referral code copied! Share with friends to earn 100 points.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-xs font-extrabold text-sky-900 border border-sky-200 shadow-xs"
          >
            <Share2 className="w-4 h-4 text-sky-600" /> Invite Friends & Earn Points
          </button>
        </div>

        {/* 2. REAL-TIME AVAILABILITY & ELIGIBILITY CONTROL PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Availability Control */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
            <span className="text-slate-600 font-bold block text-[11px]">Donor Emergency Availability</span>
            <select
              value={loggedInDonor.availabilityStatus || 'AVAILABLE'}
              onChange={e => handleAvailabilityChange(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="AVAILABLE" className="bg-white text-emerald-600 font-bold">🟢 Available for Emergency Requests</option>
              <option value="TEMPORARILY UNAVAILABLE" className="bg-white text-amber-600 font-bold">🟡 Temporarily Unavailable</option>
              <option value="NOT AVAILABLE" className="bg-white text-red-600 font-bold">🔴 Not Available</option>
            </select>
            <p className="text-[10px] text-slate-500">
              When 🟢 AVAILABLE, you automatically receive live matching emergency request notifications.
            </p>
          </div>

          {/* Calculated Eligibility Status */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
            <span className="text-slate-600 font-bold block text-[11px]">Calculated Medical Eligibility</span>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-extrabold ${
              eligibility.isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span className="flex items-center gap-1.5">
                {eligibility.isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                {eligibility.isEligible ? 'Eligible for Donation' : 'Temporarily Deferred'}
              </span>
              <span className="text-[10px] font-mono">Next Eligible: {loggedInDonor.nextEligibleDate || '2026-06-10'}</span>
            </div>
            {!eligibility.isEligible && (
              <p className="text-[10px] text-amber-700 font-sans">{eligibility.reason}</p>
            )}
          </div>

        </div>
      </div>

      {/* 3. SECURE MEDICAL DIAGNOSTIC & ELIGIBILITY RULES */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Backend Medical Safety Diagnostics
          </h3>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-emerald-600" /> Protected Record
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
            <label className="text-slate-600 font-bold block mb-1">Donor Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full bg-white p-2.5 rounded-xl text-slate-900 font-bold border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block">Min weight requirement: 45 kg</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
            <label className="text-slate-600 font-bold block mb-1">Hemoglobin Level (g/dL)</label>
            <input
              type="number"
              step="0.1"
              value={hbLevel}
              onChange={(e) => setHbLevel(parseFloat(e.target.value))}
              className="w-full bg-white p-2.5 rounded-xl text-slate-900 font-bold border border-slate-200"
            />
            <span className="text-[10px] text-slate-400 block">Min Hb requirement: 12.5 g/dL</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Medical eligibility is calculated using national blood bank safety guidelines.</span>
          <a
            href="https://nbtc.naco.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 font-bold hover:underline flex items-center gap-1"
          >
            Blood Bank Medical Guidelines <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4. DONATION HISTORY & DIGITAL CERTIFICATES */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-3">
          <FileText className="w-5 h-5 text-indigo-600" /> Verified Donation History ({loggedInDonor.totalDonations} Completed)
        </h3>

        <div className="space-y-3">
          {(currentUser?.donationHistory || [
            { id: "dh_1", date: "2026-03-10", location: "KIMS Teaching Hospital Hubballi", units: 1, bloodGroup: loggedInDonor.bloodGroup, certificateUrl: "#" },
            { id: "dh_2", date: "2025-11-15", location: "Rotary Regional Blood Center", units: 1, bloodGroup: loggedInDonor.bloodGroup, certificateUrl: "#" }
          ]).map((don) => (
            <div key={don.id} className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{don.location}</span>
                <span className="text-slate-500 text-[11px]">1 Unit ({don.bloodGroup}) on {don.date} • Verified Transfusion</span>
              </div>

              <button
                onClick={() => setActiveCertificateModal(don)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold border border-amber-200 flex items-center gap-1.5 shrink-0"
              >
                <Award className="w-4 h-4 text-amber-600" /> Download Certificate
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
