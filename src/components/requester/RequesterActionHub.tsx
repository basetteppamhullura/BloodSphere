import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import {
  ShieldAlert,
  Search,
  Building2,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Droplet,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Phone,
  PlusCircle,
  Radio,
  Sliders
} from 'lucide-react';

interface HospitalStockFacility {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  type: 'Hospital' | 'BloodBank';
  stock: Record<BloodGroup, { available: number; reserved: number }>;
}

const REGIONAL_FACILITIES: HospitalStockFacility[] = [
  {
    id: 'fac_kims',
    name: 'KIMS Teaching Hospital',
    city: 'Hubballi',
    lat: 15.3647,
    lng: 75.124,
    phone: '+91 836 2378888',
    type: 'Hospital',
    stock: {
      'A+': { available: 16, reserved: 2 },
      'A-': { available: 3, reserved: 1 },
      'B+': { available: 20, reserved: 4 },
      'B-': { available: 4, reserved: 1 },
      'AB+': { available: 10, reserved: 2 },
      'AB-': { available: 2, reserved: 0 },
      'O+': { available: 28, reserved: 5 },
      'O-': { available: 3, reserved: 2 },
      'Bombay Phenotype (O-h)': { available: 1, reserved: 0 }
    }
  },
  {
    id: 'fac_sdm',
    name: 'SDM College of Medical Sciences',
    city: 'Dharwad',
    lat: 15.4589,
    lng: 75.0078,
    phone: '+91 836 2477777',
    type: 'Hospital',
    stock: {
      'A+': { available: 14, reserved: 2 },
      'A-': { available: 4, reserved: 0 },
      'B+': { available: 18, reserved: 3 },
      'B-': { available: 6, reserved: 1 },
      'AB+': { available: 8, reserved: 1 },
      'AB-': { available: 2, reserved: 0 },
      'O+': { available: 25, reserved: 4 },
      'O-': { available: 6, reserved: 1 },
      'Bombay Phenotype (O-h)': { available: 1, reserved: 0 }
    }
  },
  {
    id: 'fac_rotary',
    name: 'Rotary Club Blood Bank',
    city: 'Hubballi',
    lat: 15.362,
    lng: 75.122,
    phone: '+91 836 2255444',
    type: 'BloodBank',
    stock: {
      'A+': { available: 22, reserved: 4 },
      'A-': { available: 5, reserved: 1 },
      'B+': { available: 30, reserved: 6 },
      'B-': { available: 8, reserved: 2 },
      'AB+': { available: 12, reserved: 2 },
      'AB-': { available: 3, reserved: 1 },
      'O+': { available: 40, reserved: 8 },
      'O-': { available: 8, reserved: 2 },
      'Bombay Phenotype (O-h)': { available: 2, reserved: 0 }
    }
  },
  {
    id: 'fac_kle',
    name: 'KLE Prabhakar Kore Hospital',
    city: 'Belagavi',
    lat: 15.8497,
    lng: 74.4977,
    phone: '+91 831 2473777',
    type: 'Hospital',
    stock: {
      'A+': { available: 20, reserved: 4 },
      'A-': { available: 6, reserved: 1 },
      'B+': { available: 24, reserved: 5 },
      'B-': { available: 8, reserved: 2 },
      'AB+': { available: 12, reserved: 2 },
      'AB-': { available: 4, reserved: 1 },
      'O+': { available: 35, reserved: 6 },
      'O-': { available: 10, reserved: 2 },
      'Bombay Phenotype (O-h)': { available: 2, reserved: 0 }
    }
  }
];

export const RequesterActionHub: React.FC = () => {
  const { createEmergencyRequest, setActiveEmergencyPostModal, showToast } = useApp();

  // Requester GPS Location State (Default: Hubballi)
  const [requesterLoc, setRequesterLoc] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.124
  });

  // Filter Selection State
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // Default Any distance

  // Applied Active Filter State (Updated on Search click)
  const [appliedGroup, setAppliedGroup] = useState<BloodGroup>('O-');
  const [appliedRadius, setAppliedRadius] = useState<number>(1000);

  // Emergency Express Form Modal State
  const [showExpressModal, setShowExpressModal] = useState<boolean>(false);
  const [expPatientName, setExpPatientName] = useState<string>('Ramesh Kumar');
  const [expGroup, setExpGroup] = useState<BloodGroup>('O-');
  const [expUnits, setExpUnits] = useState<number>(2);
  const [expHospital, setExpHospital] = useState<string>('KIMS Teaching Hospital');
  const [expPhone, setExpPhone] = useState<string>('+91 98450 12345');

  const handleUseCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setRequesterLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast(`Requester GPS updated: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        },
        () => showToast('Using Hubballi regional location.')
      );
    }
  };

  const handleExecuteSearch = () => {
    setAppliedGroup(selectedGroup);
    setAppliedRadius(selectedRadius);
    showToast(`Executing Search for ${selectedGroup} stock within ${selectedRadius === 1000 ? 'Any distance' : selectedRadius + ' km'}...`);
  };

  const handleEmergencyExpressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyRequest({
      patientName: expPatientName,
      patientAge: 38,
      patientGender: 'Male',
      bloodGroup: expGroup,
      unitsNeeded: expUnits,
      hospitalName: expHospital,
      city: 'Hubballi',
      contactPerson: 'Attending Relative',
      contactPhone: expPhone,
      selectedChannels: ['hospital', 'donors', 'bloodbank'],
      reason: 'URGENT TRAUMA EMERGENCY: Sub-1-Minute Express Request'
    });

    setShowExpressModal(false);
    showToast(`🚨 CRITICAL EMERGENCY REQUEST SUBMITTED FOR ${expPatientName}! Dispatched to Hospital + Donors + Blood Banks.`);
  };

  // Calculate distance, filter by applied radius, and sort nearest-first
  const facilitiesWithDistance = REGIONAL_FACILITIES.map(fac => {
    const distanceKm = calculateDistanceKm(requesterLoc.lat, requesterLoc.lng, fac.lat, fac.lng);
    return { ...fac, distanceKm };
  })
    .filter(fac => fac.distanceKm <= appliedRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="space-y-6 text-xs">
      
      {/* 2 MAIN ACTION CARDS: EMERGENCY NEED vs FIND NEARBY STOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: EMERGENCY BLOOD NEED (RED HIGHLIGHTED) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 border-2 border-red-600 shadow-2xl space-y-4 flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL EMERGENCY
              </span>
              <span className="text-[10px] font-extrabold text-red-400">Sub-1-Minute Form</span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">Emergency Blood Need</h3>
            <p className="text-xs text-slate-300">
              Skip extra steps — launch an express request with essential fields pre-set to <strong>Critical Urgency</strong>. Instantly triggers Hospital + Nearby Donors + Blood Banks simultaneously.
            </p>
          </div>

          <button
            onClick={() => setShowExpressModal(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-sm shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" /> Launch Emergency Express Request
          </button>
        </div>

        {/* CARD 2: FIND BLOOD NEAR YOU */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Distance Search Portal
              </span>
              <button
                onClick={handleUseCurrentGPS}
                className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" /> GPS Location
              </button>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">Find Blood Stock Near You</h3>
            <p className="text-xs text-slate-400">
              Search distance-ranked nearby hospitals and blood banks to view live stock availability (Available vs Reserved units) before placing a request.
            </p>
          </div>

          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Standard Multi-Channel Request Form
          </button>
        </div>

      </div>

      {/* REQUESTER-FACING NEARBY HOSPITAL & STOCK PORTAL */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Requester-Facing Hospital & Stock Portal
            </h3>
            <p className="text-slate-400 text-[11px]">Real-Time Stock Transparency • Distance Ranked</p>
          </div>

          {/* FILTER BAR WITH SEARCH BUTTON */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <label className="text-slate-400 font-bold">Group:</label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value as BloodGroup)}
                className="bg-transparent text-white font-black focus:outline-none"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                  <option key={bg} value={bg} className="bg-slate-900 text-white">{bg}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <label className="text-slate-400 font-bold">Radius:</label>
              <select
                value={selectedRadius}
                onChange={e => setSelectedRadius(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none"
              >
                <option value={5} className="bg-slate-900 text-white">Within 5 km</option>
                <option value={10} className="bg-slate-900 text-white">Within 10 km</option>
                <option value={25} className="bg-slate-900 text-white">Within 25 km</option>
                <option value={50} className="bg-slate-900 text-white">Within 50 km</option>
                <option value={1000} className="bg-slate-900 text-white">Any Distance</option>
              </select>
            </div>

            <button
              onClick={handleExecuteSearch}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Search className="w-3.5 h-3.5" /> Search Facilities
            </button>
          </div>
        </div>

        {/* Distance-Ranked Facilities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilitiesWithDistance.map(fac => {
            const stockData = fac.stock[appliedGroup] || { available: 0, reserved: 0 };
            const hasStock = stockData.available > 0;

            return (
              <div key={fac.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {fac.type === 'Hospital' ? <Building2 className="w-4 h-4 text-blue-400" /> : <Droplet className="w-4 h-4 text-red-500" />}
                      {fac.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {fac.distanceKm} km away
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">{fac.city} • Contact: {fac.phone}</p>

                  <div className="mt-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-slate-300 font-sans font-bold">{appliedGroup} Availability:</span>
                    <div className="text-right">
                      <strong className={`text-base block ${hasStock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stockData.available} Units Available
                      </strong>
                      <span className="text-[10px] text-amber-400 font-sans">({stockData.reserved} units reserved)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveEmergencyPostModal(true);
                    showToast(`Selected facility: ${fac.name}. Pre-filling request form!`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Request Blood From This {fac.type}
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* EMERGENCY EXPRESS SHORTENED FORM MODAL */}
      {showExpressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Emergency Express Request Form
              </h3>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-black text-[10px] uppercase">
                Critical Urgency
              </span>
            </div>

            <form onSubmit={handleEmergencyExpressSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={expPatientName}
                  onChange={e => setExpPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Blood Group *</label>
                  <select
                    value={expGroup}
                    onChange={e => setExpGroup(e.target.value as BloodGroup)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Units Required *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={expUnits}
                    onChange={e => setExpUnits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Hospital / Location *</label>
                <input
                  type="text"
                  value={expHospital}
                  onChange={e => setExpHospital(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={expPhone}
                  onChange={e => setExpPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="p-3 rounded-2xl bg-red-950/50 border border-red-800 text-red-200 text-[11px]">
                ⚡ Triggers all channels simultaneously: <strong>Hospital + Donors + Blood Banks</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExpressModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black shadow-lg shadow-red-950">
                  Submit Immediate Express Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
