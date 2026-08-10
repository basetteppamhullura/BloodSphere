import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import {
  Building2,
  MapPin,
  Phone,
  Search,
  Navigation,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  PlusCircle,
  Sparkles,
  Droplet,
  Filter
} from 'lucide-react';

interface HospitalEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  stock: Record<BloodGroup, { whole: number; plasma: number; platelets: number; rbc: number }>;
}

// Seed Hospital Data with GPS Coordinates
const SEED_HOSPITALS: HospitalEntry[] = [
  {
    id: 'hosp_001',
    name: 'KIMS Teaching Hospital',
    address: 'PB Road, Vidyanagar',
    city: 'Hubballi',
    phone: '+91 836 2378000',
    lat: 15.3647,
    lng: 75.1240,
    stock: {
      'A+': { whole: 12, plasma: 8, platelets: 6, rbc: 10 },
      'A-': { whole: 3, plasma: 2, platelets: 1, rbc: 4 },
      'B+': { whole: 16, plasma: 10, platelets: 8, rbc: 14 },
      'B-': { whole: 4, plasma: 3, platelets: 2, rbc: 5 },
      'AB+': { whole: 8, plasma: 6, platelets: 4, rbc: 6 },
      'AB-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'O+': { whole: 22, plasma: 14, platelets: 12, rbc: 18 },
      'O-': { whole: 2, plasma: 2, platelets: 1, rbc: 3 },
      'Bombay Phenotype (O-h)': { whole: 1, plasma: 0, platelets: 0, rbc: 1 }
    }
  },
  {
    id: 'hosp_002',
    name: 'SDM College of Medical Sciences',
    address: 'Sattur',
    city: 'Dharwad',
    phone: '+91 836 2477777',
    lat: 15.4211,
    lng: 75.0084,
    stock: {
      'A+': { whole: 8, plasma: 5, platelets: 4, rbc: 6 },
      'A-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'B+': { whole: 10, plasma: 6, platelets: 4, rbc: 8 },
      'B-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'AB+': { whole: 5, plasma: 3, platelets: 2, rbc: 4 },
      'AB-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'O+': { whole: 15, plasma: 9, platelets: 8, rbc: 12 },
      'O-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  },
  {
    id: 'hosp_003',
    name: 'Tatwadarsha Hospital',
    address: 'Vidyanagar',
    city: 'Hubballi',
    phone: '+91 836 2212345',
    lat: 15.3700,
    lng: 75.1280,
    stock: {
      'A+': { whole: 6, plasma: 4, platelets: 2, rbc: 5 },
      'A-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'B+': { whole: 8, plasma: 4, platelets: 3, rbc: 6 },
      'B-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'AB+': { whole: 4, plasma: 2, platelets: 1, rbc: 3 },
      'AB-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'O+': { whole: 12, plasma: 7, platelets: 6, rbc: 10 },
      'O-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  }
];

// Haversine Distance Formula (km)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const HospitalBloodStockFinder: React.FC = () => {
  const { setActiveEmergencyPostModal, showToast } = useApp();

  // Search & Filters State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O-');
  const [maxDistanceRadius, setMaxDistanceRadius] = useState<number>(50); // km
  const [citySearchQuery, setCitySearchQuery] = useState<string>('Hubballi');
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(false);

  // User Geolocation State (Hubballi default)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.1240
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Default: Hubballi City Center');

  // Trigger GPS Geolocation
  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation API not supported by browser. Using Hubballi Center.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus(`GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
        showToast('GPS Location acquired!');
      },
      err => {
        setLocationStatus('GPS Access Denied. Using City Search fallback.');
        setIsLocating(false);
        showToast('GPS access denied. City search active.');
      }
    );
  };

  // 1-Click Request Pre-Fill Action
  const handleRequestFromHospital = (hosp: HospitalEntry) => {
    setActiveEmergencyPostModal(true);
    showToast(`Pre-filling Blood Request for ${hosp.name}!`);
  };

  // Process Hospitals with Distances & Filtering
  const processedHospitals = SEED_HOSPITALS.map(hosp => {
    const distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, hosp.lat, hosp.lng);
    const grpStock = hosp.stock[selectedBloodGroup] || { whole: 0, plasma: 0, platelets: 0, rbc: 0 };
    const totalUnits = grpStock.whole + grpStock.plasma + grpStock.platelets + grpStock.rbc;

    let statusText: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (totalUnits === 0) statusText = 'Out of Stock';
    else if (totalUnits <= 3) statusText = 'Low Stock';

    return {
      ...hosp,
      distanceKm,
      grpStock,
      totalUnits,
      statusText
    };
  });

  // Filter & Sort Nearest-First
  const filteredHospitals = processedHospitals
    .filter(h => {
      const matchesDistance = maxDistanceRadius >= 50 || h.distanceKm <= maxDistanceRadius;
      const matchesCity = !citySearchQuery || h.city.toLowerCase().includes(citySearchQuery.toLowerCase());
      const matchesStock = showOutOfStock || h.totalUnits > 0;
      return matchesDistance && matchesCity && matchesStock;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl text-xs animate-in fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Read-Only Live Hospital Stock Portal
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" /> Find Blood in Nearby Hospitals
          </h2>
          <p className="text-xs text-slate-400">Search hospitals by blood group, component stock, and distance radius</p>
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Location Status Notice */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span>Location Mode: <strong>{locationStatus}</strong></span>
        <span>Lat/Lng: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}</span>
      </div>

      {/* Search & Radius Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Blood Group *</label>
          <select
            value={selectedBloodGroup}
            onChange={e => setSelectedBloodGroup(e.target.value as BloodGroup)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-xs"
          >
            {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Distance Radius Radius</label>
          <select
            value={maxDistanceRadius}
            onChange={e => setMaxDistanceRadius(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
            <option value={50}>Any distance (All)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter City / Area</label>
          <input
            type="text"
            placeholder="Hubballi, Dharwad..."
            value={citySearchQuery}
            onChange={e => setCitySearchQuery(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            id="chkOutOfStock"
            checked={showOutOfStock}
            onChange={e => setShowOutOfStock(e.target.checked)}
            className="w-4 h-4 accent-red-600 rounded"
          />
          <label htmlFor="chkOutOfStock" className="text-slate-300 font-bold text-[11px] cursor-pointer">
            Include Out of Stock
          </label>
        </div>

      </div>

      {/* Hospital Stock Results List */}
      <div className="space-y-4">
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2 bg-slate-950 rounded-2xl border border-slate-800">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold">No hospitals found with {selectedBloodGroup} in stock within selected radius.</p>
            <button
              onClick={() => { setShowOutOfStock(true); setMaxDistanceRadius(50); }}
              className="text-blue-400 font-bold underline"
            >
              Show all hospitals including Out of Stock
            </button>
          </div>
        ) : (
          filteredHospitals.map(hosp => (
            <div key={hosp.id} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              
              {/* Card Header: Hospital Info & Distance Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-white">{hosp.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800">
                      📍 {hosp.distanceKm} km away
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {hosp.address}, <strong>{hosp.city}</strong>
                  </p>
                </div>

                {/* Stock Status Badge */}
                <div className="shrink-0">
                  {hosp.statusText === 'In Stock' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ✅ In Stock ({hosp.totalUnits} units)
                    </span>
                  )}
                  {hosp.statusText === 'Low Stock' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> ⚠️ Low Stock ({hosp.totalUnits} units)
                    </span>
                  )}
                  {hosp.statusText === 'Out of Stock' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-400" /> ❌ Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Component Availability Breakdown Matrix */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedBloodGroup} Component Breakdown:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Whole Blood:</span>
                    <strong className="text-white">{hosp.grpStock.whole} u</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Plasma (FFP):</span>
                    <strong className="text-white">{hosp.grpStock.plasma} u</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Platelets (PRP):</span>
                    <strong className="text-white">{hosp.grpStock.platelets} u</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Red Cells (PRBC):</span>
                    <strong className="text-white">{hosp.grpStock.rbc} u</strong>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <a
                  href={`tel:${hosp.phone}`}
                  className="text-emerald-400 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" /> Call Desk ({hosp.phone})
                </a>

                <button
                  onClick={() => handleRequestFromHospital(hosp)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Request from this Hospital
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
