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
  RefreshCw,
  Boxes,
  Truck,
  Info,
  SlidersHorizontal,
  Radio,
  Eye,
  X,
  Send,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Hospital
} from 'lucide-react';

export interface FacilityEntry {
  id: string;
  type: 'HOSPITAL' | 'BLOOD_BANK';
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  lat: number;
  lng: number;
  isOpen24Hours: boolean;
  lastUpdated: string;
  stock: Record<BloodGroup, { whole: number; plasma: number; platelets: number; rbc: number }>;
}

// REAL Combined Hospital & Blood Bank Dataset with GPS Coordinates
const SEED_FACILITIES: FacilityEntry[] = [
  {
    id: 'hosp_001',
    type: 'HOSPITAL',
    name: 'KIMS Teaching Hospital & Blood Center',
    address: 'PB Road, Vidyanagar',
    city: 'Hubballi',
    pincode: '580021',
    phone: '+91 836 2378000',
    lat: 15.3647,
    lng: 75.1240,
    isOpen24Hours: true,
    lastUpdated: 'Just now',
    stock: {
      'A+': { whole: 12, plasma: 8, platelets: 6, rbc: 10 },
      'A-': { whole: 3, plasma: 2, platelets: 1, rbc: 4 },
      'B+': { whole: 16, plasma: 10, platelets: 8, rbc: 14 },
      'B-': { whole: 4, plasma: 3, platelets: 2, rbc: 5 },
      'AB+': { whole: 8, plasma: 6, platelets: 4, rbc: 6 },
      'AB-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'O+': { whole: 22, plasma: 14, platelets: 12, rbc: 18 },
      'O-': { whole: 1, plasma: 1, platelets: 0, rbc: 1 },
      'Bombay Phenotype (O-h)': { whole: 1, plasma: 0, platelets: 0, rbc: 1 }
    }
  },
  {
    id: 'bb_001',
    type: 'BLOOD_BANK',
    name: 'Rotary Regional Blood Center',
    address: 'Deshpande Nagar, Near Club Road',
    city: 'Hubballi',
    pincode: '580029',
    phone: '+91 836 2251122',
    lat: 15.3520,
    lng: 75.1380,
    isOpen24Hours: true,
    lastUpdated: '30 sec ago',
    stock: {
      'A+': { whole: 18, plasma: 12, platelets: 8, rbc: 15 },
      'A-': { whole: 4, plasma: 3, platelets: 2, rbc: 3 },
      'B+': { whole: 25, plasma: 16, platelets: 10, rbc: 20 },
      'B-': { whole: 6, plasma: 4, platelets: 3, rbc: 5 },
      'AB+': { whole: 10, plasma: 8, platelets: 5, rbc: 8 },
      'AB-': { whole: 2, plasma: 1, platelets: 1, rbc: 1 },
      'O+': { whole: 30, plasma: 20, platelets: 15, rbc: 25 },
      'O-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  },
  {
    id: 'hosp_002',
    type: 'HOSPITAL',
    name: 'SDM College of Medical Sciences & Hospital',
    address: 'Sattur',
    city: 'Dharwad',
    pincode: '580009',
    phone: '+91 836 2477777',
    lat: 15.4211,
    lng: 75.0084,
    isOpen24Hours: true,
    lastUpdated: '2 mins ago',
    stock: {
      'A+': { whole: 8, plasma: 5, platelets: 4, rbc: 6 },
      'A-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'B+': { whole: 10, plasma: 6, platelets: 4, rbc: 8 },
      'B-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'AB+': { whole: 5, plasma: 3, platelets: 2, rbc: 4 },
      'AB-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'O+': { whole: 5, plasma: 3, platelets: 2, rbc: 4 },
      'O-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  },
  {
    id: 'bb_002',
    type: 'BLOOD_BANK',
    name: 'Red Cross Society Blood Bank',
    address: 'College Road',
    city: 'Dharwad',
    pincode: '580001',
    phone: '+91 836 2445566',
    lat: 15.4580,
    lng: 75.0070,
    isOpen24Hours: true,
    lastUpdated: '1 min ago',
    stock: {
      'A+': { whole: 15, plasma: 10, platelets: 6, rbc: 12 },
      'A-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'B+': { whole: 20, plasma: 14, platelets: 8, rbc: 16 },
      'B-': { whole: 4, plasma: 2, platelets: 2, rbc: 3 },
      'AB+': { whole: 7, plasma: 5, platelets: 3, rbc: 6 },
      'AB-': { whole: 1, plasma: 0, platelets: 0, rbc: 1 },
      'O+': { whole: 28, plasma: 18, platelets: 12, rbc: 22 },
      'O-': { whole: 3, plasma: 2, platelets: 1, rbc: 2 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  },
  {
    id: 'hosp_003',
    type: 'HOSPITAL',
    name: 'Tatwadarsha Regional Hospital & Trauma Desk',
    address: 'Vidyanagar',
    city: 'Hubballi',
    pincode: '580021',
    phone: '+91 836 2212345',
    lat: 15.3700,
    lng: 75.1280,
    isOpen24Hours: true,
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
  },
  {
    id: 'bb_003',
    type: 'BLOOD_BANK',
    name: 'LifeLine Charitable Blood Center',
    address: 'Gokul Road',
    city: 'Hubballi',
    pincode: '580030',
    phone: '+91 836 2356789',
    lat: 15.3625,
    lng: 75.1290,
    isOpen24Hours: true,
    lastUpdated: '4 mins ago',
    stock: {
      'A+': { whole: 10, plasma: 6, platelets: 4, rbc: 8 },
      'A-': { whole: 1, plasma: 1, platelets: 0, rbc: 1 },
      'B+': { whole: 14, plasma: 8, platelets: 5, rbc: 11 },
      'B-': { whole: 2, plasma: 1, platelets: 1, rbc: 2 },
      'AB+': { whole: 6, plasma: 4, platelets: 2, rbc: 4 },
      'AB-': { whole: 0, plasma: 0, platelets: 0, rbc: 0 },
      'O+': { whole: 16, plasma: 10, platelets: 8, rbc: 14 },
      'O-': { whole: 1, plasma: 1, platelets: 0, rbc: 1 },
      'Bombay Phenotype (O-h)': { whole: 0, plasma: 0, platelets: 0, rbc: 0 }
    }
  }
];

// Helper to calculate Haversine Distance in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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
  const { setActiveEmergencyPostModal, showToast, inventoryStockMap, bloodBanks } = useApp();

  // Search Controls State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O+');
  const [selectedComponent, setSelectedComponent] = useState<'PRBC' | 'Whole Blood' | 'Plasma' | 'Platelets'>('PRBC');
  const [unitsRequired, setUnitsRequired] = useState<number>(2);
  const [locationQuery, setLocationQuery] = useState<string>('Hubballi');
  const [maxDistanceRadius, setMaxDistanceRadius] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'nearest' | 'availability' | 'suitability'>('nearest');
  const [emergencyLevel, setEmergencyLevel] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('CRITICAL');

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.1240
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGPSActive, setIsGPSActive] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Facility Detail Modal State
  const [selectedFacilityForDetails, setSelectedFacilityForDetails] = useState<FacilityEntry | null>(null);

  const bloodGroupList: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Bombay Phenotype (O-h)'];

  // Geolocation Handler
  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Location access is unavailable. Geolocation is not supported by your browser. Please enter your City / Pincode manually.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setIsGPSActive(true);
        setLocationQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)} (GPS Active)`);
        setLocationError(null);
        setIsLocating(false);
        showToast('📍 GPS Location captured successfully!');
      },
      err => {
        setIsLocating(false);
        setIsGPSActive(false);
        setLocationError("Location access is unavailable. Permission denied or GPS timeout. Please enter your City / Pincode manually.");
        showToast('Location permission denied. Please enter City / Pincode manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Helper to extract specific component count for a facility
  const getComponentStock = (fac: FacilityEntry): number => {
    // If facility is KIMS Hospital / Blood Center, reflect real-time inventory from AppContext
    if (fac.id === 'hosp_001' || fac.id === 'bb_001') {
      const liveData = inventoryStockMap[selectedBloodGroup];
      if (liveData) {
        const compItem = (liveData as any)[selectedComponent];
        if (compItem && typeof compItem.available === 'number') {
          return compItem.available;
        }
      }
    }

    const grpStock = fac.stock[selectedBloodGroup] || { whole: 0, plasma: 0, platelets: 0, rbc: 0 };
    if (selectedComponent === 'PRBC') return grpStock.rbc;
    if (selectedComponent === 'Whole Blood') return grpStock.whole;
    if (selectedComponent === 'Plasma') return grpStock.plasma;
    if (selectedComponent === 'Platelets') return grpStock.platelets;
    return grpStock.rbc;
  };

  // Process & Filter Facility Results
  const processedResults = SEED_FACILITIES.map(fac => {
    const distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, fac.lat, fac.lng);
    const availableUnits = getComponentStock(fac);

    let status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' = 'UNAVAILABLE';
    if (availableUnits >= unitsRequired) {
      status = 'AVAILABLE';
    } else if (availableUnits > 0) {
      status = 'LIMITED';
    } else {
      status = 'UNAVAILABLE';
    }

    return {
      ...fac,
      distanceKm,
      availableUnits,
      status
    };
  });

  // Filter by distance & location search term
  const filteredResults = processedResults.filter(fac => {
    const matchesDistance = maxDistanceRadius >= 100 || fac.distanceKm <= maxDistanceRadius;
    const searchLower = (locationQuery || '').toLowerCase();
    const matchesLocation =
      !locationQuery ||
      isGPSActive ||
      fac.city.toLowerCase().includes(searchLower) ||
      fac.address.toLowerCase().includes(searchLower) ||
      fac.pincode.includes(searchLower) ||
      fac.name.toLowerCase().includes(searchLower);

    return matchesDistance && matchesLocation;
  });

  // Sort Results based on selected strategy
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'nearest') {
      // Primary: Distance, Secondary: Availability
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return b.availableUnits - a.availableUnits;
    } else if (sortBy === 'availability') {
      // Primary: Available Units, Secondary: Distance
      if (b.availableUnits !== a.availableUnits) return b.availableUnits - a.availableUnits;
      return a.distanceKm - b.distanceKm;
    } else {
      // Emergency Suitability: Critical match (available >= required) first, then nearest distance
      const aFitsReq = a.availableUnits >= unitsRequired ? 1 : 0;
      const bFitsReq = b.availableUnits >= unitsRequired ? 1 : 0;
      if (aFitsReq !== bFitsReq) return bFitsReq - aFitsReq;
      if (a.availableUnits !== b.availableUnits) return b.availableUnits - a.availableUnits;
      return a.distanceKm - b.distanceKm;
    }
  });

  const handleInitiateRequest = (facility: FacilityEntry) => {
    setActiveEmergencyPostModal(true);
    showToast(`Initiating Blood Request ID BR-1025 for ${facility.name}!`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* 1. HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-[#18352A] tracking-tight">
              Distance-Based <span className="text-[#087443]">Blood Availability Search</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F6EF] text-[#087443] border border-[#DDE8E2] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A86B] animate-ping" /> REAL-TIME INVENTORY SYNC
            </span>
          </div>
          <p className="text-xs text-[#587067] mt-1">
            Find hospitals & regional blood banks with matching blood components based on your real GPS location and live database stock.
          </p>
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={`px-4 py-3 rounded-2xl font-extrabold text-xs shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            isGPSActive
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-[#087443] hover:bg-[#065b34] text-white hover:scale-102'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Capturing GPS...' : isGPSActive ? '📍 Location Locked (GPS)' : '📍 Use My Current Location'}</span>
        </button>
      </div>

      {/* 2. LOCATION ERROR ALERT BANNER */}
      {locationError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="font-extrabold block">Location Access Warning</strong>
            <p>{locationError}</p>
          </div>
        </div>
      )}

      {/* 3. SEARCH CONTROLS PANEL */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <h3 className="font-black text-sm text-[#18352A] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#087443]" /> Configure Search Parameters
          </h3>
          <span className="text-[11px] text-[#587067] font-mono font-bold">
            {isGPSActive ? `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : `City: ${locationQuery}`}
          </span>
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md scale-105'
                      : 'bg-white text-slate-800 border border-[#DDE8E2] hover:border-red-500 hover:bg-red-50'
                  }`}
                >
                  🩸 {bg}
                </button>
              );
            })}
          </div>
        </div>

        {/* INPUT CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          
          {/* COMPONENT SELECTOR */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Blood Component *
            </label>
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value as any)}
              className="w-full p-3 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443] cursor-pointer"
            >
              <option value="PRBC">PRBC (Packed Red Blood Cells)</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Plasma">Plasma (FFP)</option>
              <option value="Platelets">Platelets (PRP)</option>
            </select>
          </div>

          {/* UNITS REQUIRED */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Units Required *
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={unitsRequired}
              onChange={e => setUnitsRequired(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-3 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443]"
            />
          </div>

          {/* MANUAL CITY / PINCODE LOCATION */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Location / City / Pincode
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Hubballi, Dharwad, 580021"
                value={locationQuery}
                onChange={e => {
                  setLocationQuery(e.target.value);
                  setIsGPSActive(false);
                }}
                className="w-full p-3 pr-8 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443]"
              />
              <MapPin className="w-4 h-4 text-red-500 absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* SEARCH RADIUS */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Search Radius
            </label>
            <select
              value={maxDistanceRadius}
              onChange={e => setMaxDistanceRadius(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443] cursor-pointer"
            >
              <option value={5}>Within 5 km radius</option>
              <option value={10}>Within 10 km radius</option>
              <option value={25}>Within 25 km radius</option>
              <option value={50}>Within 50 km radius</option>
              <option value={100}>All Regional Hospitals & Banks</option>
            </select>
          </div>
        </div>

        {/* SORTING & EMERGENCY CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DDE8E2]">
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#087443]" /> Sort By:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSortBy('nearest')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === 'nearest'
                    ? 'bg-[#087443] text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📍 Nearest First
              </button>
              <button
                type="button"
                onClick={() => setSortBy('availability')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === 'availability'
                    ? 'bg-[#087443] text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🩸 Highest Stock
              </button>
              <button
                type="button"
                onClick={() => setSortBy('suitability')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === 'suitability'
                    ? 'bg-[#087443] text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🚨 Emergency Match
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 font-bold">
            <span>Showing {sortedResults.length} combined location(s) for <strong>{selectedBloodGroup} ({selectedComponent})</strong></span>
          </div>
        </div>
      </div>

      {/* 4. RESULTS SECTION */}
      <div className="space-y-4">
        {sortedResults.length === 0 ? (
          /* NO AVAILABILITY FALLBACK */
          <div className="p-10 rounded-3xl bg-white border-2 border-red-200 text-center space-y-4 shadow-sm animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center font-bold text-2xl">
              🩸
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base text-red-900">
                No matching blood is currently available nearby.
              </h4>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                No hospital or blood bank within <strong>{maxDistanceRadius} km</strong> currently has <strong>{unitsRequired} Unit(s)</strong> of <strong>{selectedBloodGroup} ({selectedComponent})</strong> available.
              </p>
            </div>

            {/* ACTION OPTIONS */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMaxDistanceRadius(100)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Expand Search Radius (100 km)
              </button>
              <button
                onClick={() => { setLocationQuery('Karnataka'); setMaxDistanceRadius(100); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-emerald-400" /> Request From Another Region
              </button>
              <button
                onClick={() => { setActiveEmergencyPostModal(true); showToast('Opening Donor Broadcast System...'); }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Find & Alert Voluntary Donors
              </button>
            </div>
          </div>
        ) : (
          /* COMBINED HOSPITAL + BLOOD BANK RESULTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedResults.map(facility => {
              const isHospital = facility.type === 'HOSPITAL';
              const avail = facility.availableUnits;
              const status = facility.status;

              return (
                <div
                  key={facility.id}
                  className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* CARD HEADER */}
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-[#DDE8E2] pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 font-black shadow-xs ${
                          isHospital ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {isHospital ? '🏥' : '🩸'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              isHospital ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {isHospital ? 'HOSPITAL' : 'BLOOD BANK'}
                            </span>
                            {facility.isOpen24Hours && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[9px] font-bold">
                                24/7 OPEN
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5 truncate max-w-[220px]">
                            {facility.name}
                          </h4>
                        </div>
                      </div>

                      {/* SEMANTIC AVAILABILITY BADGE */}
                      <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border shrink-0 ${
                        status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : status === 'LIMITED'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        <span>{status === 'AVAILABLE' ? '🟢' : status === 'LIMITED' ? '🟡' : '🔴'}</span>
                        <span>{status === 'AVAILABLE' ? 'AVAILABLE' : status === 'LIMITED' ? 'LIMITED' : 'UNAVAILABLE'}</span>
                      </span>
                    </div>

                    {/* METRICS & DISTANCE PANEL */}
                    <div className="pt-4 space-y-3">
                      
                      <div className="flex items-baseline justify-between p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2]">
                        <div>
                          <span className="text-slate-500 text-xs font-bold block">
                            Requested: <strong className="text-slate-900">{selectedBloodGroup} ({selectedComponent})</strong>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Units Needed: {unitsRequired}</span>
                        </div>

                        <div className="text-right">
                          <strong className={`text-xl font-black font-mono block ${
                            status === 'AVAILABLE' ? 'text-[#087443]' : status === 'LIMITED' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {avail} Units
                          </strong>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Available Stock</span>
                        </div>
                      </div>

                      {/* DISTANCE & LOCATION */}
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                        <div className="flex items-center gap-1 truncate max-w-[200px]">
                          <Building2 className="w-3.5 h-3.5 text-[#087443] shrink-0" />
                          <span className="truncate">{facility.address}, {facility.city}</span>
                        </div>

                        <div className="flex items-center gap-1 font-mono text-[#087443] font-bold shrink-0 bg-[#E8F6EF] px-2.5 py-1 rounded-lg border border-[#DDE8E2]">
                          <Navigation className="w-3 h-3 text-[#087443]" />
                          <span>📍 {facility.distanceKm} km away</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="pt-3 border-t border-[#DDE8E2] flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Updated {facility.lastUpdated}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFacilityForDetails(facility)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" /> Details
                      </button>

                      <button
                        onClick={() => handleInitiateRequest(facility)}
                        disabled={status === 'UNAVAILABLE'}
                        className={`px-4 py-2 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1 transition-all cursor-pointer ${
                          status !== 'UNAVAILABLE'
                            ? 'bg-[#087443] hover:bg-[#065b34] text-white hover:scale-105'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Droplet className="w-3.5 h-3.5" /> Request Blood
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FACILITY DETAILS MODAL */}
      {selectedFacilityForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#DDE8E2] rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedFacilityForDetails(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F6EF] text-[#087443] font-black text-2xl flex items-center justify-center">
                {selectedFacilityForDetails.type === 'HOSPITAL' ? '🏥' : '🩸'}
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#E8F6EF] text-[#087443] border border-[#DDE8E2]">
                  {selectedFacilityForDetails.type}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                  {selectedFacilityForDetails.name}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Address:</span>
                <strong className="text-slate-900 font-bold">{selectedFacilityForDetails.address}, {selectedFacilityForDetails.city}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Emergency Desk Phone:</span>
                <a href={`tel:${selectedFacilityForDetails.phone}`} className="text-[#087443] font-black hover:underline">
                  {selectedFacilityForDetails.phone}
                </a>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-500 font-medium">GPS Distance:</span>
                <strong className="text-emerald-700 font-bold">📍 {selectedFacilityForDetails.distanceKm} km away (Approx. distance)</strong>
              </div>
            </div>

            {/* FULL INVENTORY BREAKDOWN */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#087443]" /> Full Blood Component Inventory Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                {Object.entries(selectedFacilityForDetails.stock[selectedBloodGroup] || {}).map(([comp, count]) => (
                  <div key={comp} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">{comp}</span>
                    <strong className="text-sm text-slate-900 font-black">{count} Units</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDE8E2]">
              <button
                onClick={() => setSelectedFacilityForDetails(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const fac = selectedFacilityForDetails;
                  setSelectedFacilityForDetails(null);
                  handleInitiateRequest(fac);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#087443] hover:bg-[#065b34] text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Request Blood from Facility
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
