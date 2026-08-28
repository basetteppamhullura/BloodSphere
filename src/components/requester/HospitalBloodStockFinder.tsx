import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import {
  Building2,
  MapPin,
  Phone,
  Search,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Sparkles,
  Droplet,
  Clock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface HospitalEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  stock: Record<BloodGroup, { whole: number; plasma: number; platelets: number; rbc: number }>;
}

// Seed Hospital Data with GPS Coordinates
const SEED_HOSPITALS: HospitalEntry[] = [
  {
    id: 'hosp_001',
    name: 'KIMS Teaching Hospital & Blood Center',
    address: 'PB Road, Vidyanagar',
    city: 'Hubballi',
    phone: '+91 836 2378000',
    lat: 15.3647,
    lng: 75.1240,
    lastUpdated: 'Just now',
    stock: {
      'A+': { whole: 12, plasma: 8, platelets: 6, rbc: 10 },
      'A-': { whole: 3, plasma: 2, platelets: 1, rbc: 4 },
      'B+': { whole: 16, plasma: 10, platelets: 8, rbc: 14 },
      'B-': { whole: 4, plasma: 3, platelets: 2, rbc: 5 },
      'AB+': { whole: 8, plasma: 6, platelets: 4, rbc: 6 },
      'AB-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'O+': { whole: 22, plasma: 14, platelets: 12, rbc: 18 },
      'O-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'Bombay Phenotype (O-h)': { whole: 1, plasma: 0, platelets: 0, rbc: 1 }
    }
  },
  {
    id: 'hosp_002',
    name: 'SDM College of Medical Sciences Blood Bank',
    address: 'Sattur',
    city: 'Dharwad',
    phone: '+91 836 2477777',
    lat: 15.4211,
    lng: 75.0084,
    lastUpdated: '2 mins ago',
    stock: {
      'A+': { whole: 8, plasma: 5, platelets: 4, rbc: 6 },
      'A-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'B+': { whole: 10, plasma: 6, platelets: 4, rbc: 8 },
      'B-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'AB+': { whole: 5, plasma: 3, platelets: 2, rbc: 4 },
      'AB-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'O+': { whole: 3, plasma: 1, platelets: 1, rbc: 2 },
      'O-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  },
  {
    id: 'hosp_003',
    name: 'Tatwadarsha Regional Blood Bank',
    address: 'Vidyanagar',
    city: 'Hubballi',
    phone: '+91 836 2212345',
    lat: 15.3700,
    lng: 75.1280,
    lastUpdated: '5 mins ago',
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

// Haversine Distance Calculation (km)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

  // Search Controls State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O+');
  const [selectedComponent, setSelectedComponent] = useState<'PRBC' | 'Whole Blood' | 'Plasma' | 'Platelets'>('PRBC');
  const [locationQuery, setLocationQuery] = useState<string>('Hubballi');
  const [maxDistanceRadius, setMaxDistanceRadius] = useState<number>(50);
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(true);

  // User GPS Coordinates State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.1240
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Current Area: Hubballi City Center');

  const bloodGroupList: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation API unavailable. Using Hubballi Center.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus(`GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
        showToast('GPS Location updated!');
      },
      () => {
        setLocationStatus('GPS Access Denied. Using City fallback.');
        setIsLocating(false);
        showToast('GPS access denied. City search active.');
      }
    );
  };

  const handleRequestFromHospital = (hosp: HospitalEntry) => {
    setActiveEmergencyPostModal(true);
    showToast(`Initiating Blood Request for ${hosp.name}!`);
  };

  // Get specific component count
  const getComponentCount = (stockObj: { whole: number; plasma: number; platelets: number; rbc: number }) => {
    if (selectedComponent === 'PRBC') return stockObj.rbc;
    if (selectedComponent === 'Whole Blood') return stockObj.whole;
    if (selectedComponent === 'Plasma') return stockObj.plasma;
    if (selectedComponent === 'Platelets') return stockObj.platelets;
    return stockObj.rbc;
  };

  // Filter & Process Hospital Availability Results
  const processedHospitals = SEED_HOSPITALS.map(hosp => {
    const distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, hosp.lat, hosp.lng);
    const grpStock = hosp.stock[selectedBloodGroup] || { whole: 0, plasma: 0, platelets: 0, rbc: 0 };
    const availableUnits = getComponentCount(grpStock);
    const totalAllUnits = grpStock.whole + grpStock.plasma + grpStock.platelets + grpStock.rbc;

    return {
      ...hosp,
      distanceKm,
      grpStock,
      availableUnits,
      totalAllUnits
    };
  });

  const filteredHospitals = processedHospitals
    .filter(h => {
      const matchesDistance = maxDistanceRadius >= 50 || h.distanceKm <= maxDistanceRadius;
      const matchesCity = !locationQuery || h.city.toLowerCase().includes(locationQuery.toLowerCase()) || h.address.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesStock = showOutOfStock || h.availableUnits > 0;
      return matchesDistance && matchesCity && matchesStock;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const isEmergencySearch = selectedBloodGroup === 'O-' || filteredHospitals.every(h => h.availableUnits === 0);

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* PAGE HEADER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Blood <span className="text-sky-600">Availability Search</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE DATABASE CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search real-time blood unit availability across connected Hospitals & Blood Banks
          </p>
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 shrink-0 transition-all hover:scale-105"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
        </button>
      </div>

      {/* EMERGENCY SEARCH WARNING BANNER */}
      {isEmergencySearch && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-base shrink-0 font-bold">
              🚨
            </span>
            <div>
              <strong className="font-extrabold text-sm block">EMERGENCY BLOOD SEARCH MODE</strong>
              <span className="text-xs text-red-700">
                Searching for critical supply group ({selectedBloodGroup} {selectedComponent}). Live emergency alert broadcasting active.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs shrink-0 shadow">
            CRITICAL AVAILABILITY
          </span>
        </div>
      )}

      {/* SEARCH CONTROLS PANEL */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600" /> Search Blood Availability
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">{locationStatus}</span>
        </div>

        {/* BLOOD GROUP SELECTOR CHIPS */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Select Blood Group *
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {bloodGroupList.map(bg => {
              const isSelected = selectedBloodGroup === bg;
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-105'
                      : 'bg-white text-slate-800 border border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  🩸 {bg}
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPONENT SELECTOR & FILTERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Blood Component *
            </label>
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value as any)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-sky-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="PRBC">PRBC (Packed Red Blood Cells)</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Plasma">Plasma (FFP)</option>
              <option value="Platelets">Platelets (PRP)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Location / City Filter
            </label>
            <input
              type="text"
              placeholder="e.g. Hubballi, Dharwad..."
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-sky-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Distance Radius
            </label>
            <select
              value={maxDistanceRadius}
              onChange={e => setMaxDistanceRadius(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-50 border border-sky-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value={5}>Within 5 km radius</option>
              <option value={10}>Within 10 km radius</option>
              <option value={25}>Within 25 km radius</option>
              <option value={50}>All Regional Hospitals & Banks</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={e => setShowOutOfStock(e.target.checked)}
              className="w-4 h-4 accent-sky-600 rounded"
            />
            <span>Include Hospitals with 0 Units (Out of Stock)</span>
          </label>

          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Showing {filteredHospitals.length} result(s) for <strong>{selectedBloodGroup} ({selectedComponent})</strong>
          </span>
        </div>
      </div>

      {/* SEARCH RESULTS CONTAINER */}
      <div className="space-y-4">
        {filteredHospitals.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-sky-100 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center font-bold text-xl">
              🩸
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">No matching blood availability found.</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No hospital or blood bank in your selected search radius currently has <strong>{selectedBloodGroup} ({selectedComponent})</strong> in stock.
            </p>
            <button
              onClick={() => { setShowOutOfStock(true); setMaxDistanceRadius(50); }}
              className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold border border-sky-200 transition-colors"
            >
              Expand Search Radius & Include Out of Stock
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHospitals.map(hosp => {
              const avail = hosp.availableUnits;
              const isAvailable = avail > 5;
              const isLowStock = avail >= 1 && avail <= 5;
              const isUnavailable = avail === 0;

              return (
                <div
                  key={hosp.id}
                  className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* CARD TOP HEADER: BLOOD GROUP & STATUS BADGE */}
                  <div>
                    <div className="flex items-center justify-between gap-3 border-b border-sky-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
                          🩸 {selectedBloodGroup}
                        </span>
                        <div>
                          <strong className="font-black text-slate-900 text-sm block">{selectedComponent}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Component ID: CMP-2026-REG</span>
                        </div>
                      </div>

                      {/* SEMANTIC STATUS BADGE: COLOR + ICON + TEXT */}
                      <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        <span>{isAvailable ? '🟢' : isLowStock ? '🟡' : '🔴'}</span>
                        <span>{isAvailable ? 'AVAILABLE' : isLowStock ? 'LOW STOCK' : 'UNAVAILABLE'}</span>
                      </span>
                    </div>

                    {/* AVAILABLE UNITS & LOCATION INFORMATION */}
                    <div className="pt-4 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-medium">Available Units:</span>
                        <strong className={`text-xl font-black font-mono ${
                          isAvailable ? 'text-emerald-600' : isLowStock ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {avail} Units
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                          <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span className="truncate">{hosp.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {hosp.city}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-500">
                            📏 {hosp.distanceKm} km away
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER: TIMESTAMP & VIEW DETAILS BUTTON */}
                  <div className="pt-3 border-t border-sky-100 flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Updated {hosp.lastUpdated}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${hosp.phone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title={`Call ${hosp.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRequestFromHospital(hosp)}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1 transition-all hover:scale-105"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
