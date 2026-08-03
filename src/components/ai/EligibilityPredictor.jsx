import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { predictEligibility } from '../../services/aiEngine';
import { ShieldCheck, AlertCircle, Calendar, Heart, Scale, Syringe } from 'lucide-react';

export default function EligibilityPredictor() {
  const { currentUser } = useApp();

  const [weight, setWeight] = useState(currentUser?.medicalFlags?.weight || 64);
  const [hbLevel, setHbLevel] = useState(currentUser?.medicalFlags?.hbLevel || 14.2);
  const [lastDonationDate, setLastDonationDate] = useState(currentUser?.lastDonationDate || "2026-03-10");
  const [recentTattoo, setRecentTattoo] = useState(false);
  const [chronicIllness, setChronicIllness] = useState(false);

  const evaluation = predictEligibility({
    weight: parseFloat(weight),
    hbLevel: parseFloat(hbLevel),
    lastDonationDate,
    recentTattoo,
    chronicIllness
  });

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">AI Medical Eligibility Predictor</h3>
            <p className="text-xs text-slate-400">Evaluated against National Blood Transfusion Council (NBTC) safety norms</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Rule Engine v2.4
        </span>
      </div>

      {/* Evaluation Result Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
        evaluation.isEligible
          ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
          : 'bg-amber-950/50 border-amber-800/80 text-amber-200'
      }`}>
        {evaluation.isEligible ? (
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        )}

        <div>
          <div className="font-bold text-sm">
            {evaluation.isEligible ? '✅ SAFE & ELIGIBLE TO DONATE TODAY' : '⚠️ CURRENTLY DEFERRED FROM DONATION'}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{evaluation.summary}</p>

          {!evaluation.isEligible && (
            <div className="mt-2 text-xs font-semibold text-amber-300">
              Next Eligible Date: {evaluation.nextEligibleDate} ({evaluation.daysRemainingToEligible} days remaining)
            </div>
          )}
        </div>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        
        {/* Weight Input */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-300" /> Donor Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Minimum safe weight: 45 kg</span>
        </div>

        {/* Hemoglobin Level */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" /> Hemoglobin Level (g/dL)
          </label>
          <input
            type="number"
            step="0.1"
            value={hbLevel}
            onChange={(e) => setHbLevel(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Minimum required: 12.5 g/dL</span>
        </div>

        {/* Last Donation Date */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Last Donation Date
          </label>
          <input
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Requires 90-day recovery gap</span>
        </div>

      </div>

      {/* Checkbox Toggles */}
      <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={recentTattoo}
            onChange={(e) => setRecentTattoo(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0"
          />
          <span>Tattoo or Piercing in last 6 months?</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={chronicIllness}
            onChange={(e) => setChronicIllness(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0"
          />
          <span>Active fever or antibiotics?</span>
        </label>
      </div>

    </div>
  );
}
