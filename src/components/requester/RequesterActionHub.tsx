import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { EmergencyQuickModal } from '../modals/EmergencyQuickModal';
import {
  Zap,
  Building2,
  Droplet,
  MapPin,
  Crosshair,
  Phone,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  X
} from 'lucide-react';

// Haversine Distance Formula (straight-line GPS distance in km)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const RequesterActionHub: React.FC = () => {
  const { bloodBanks, setActiveEmergencyPostModal, createEmergencyRequest, approveBloodBankReservation, showToast } = useApp();

  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<'hospital' | 'bloodbank' | null>(null);

  // Distance & Location State
  const [searchRadius, setSearchRadius] = useState<number>(25); // km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 15.3647, lng: 75.1240 }); // Hubballi default
  const [isLocating, setIsLocating] = useState(false);
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState<BloodGroup>('O-');

  // Favorites Saved State (localStorage)
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bloodsphere_favorite_facilities');
    return saved ? JSON.parse(saved) : { b1: true };
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('bloodsphere_favorite_facilities', JSON.stringify(next));
      showToast(next[id] ? 'Facility saved to Favorites!' : 'Removed from Favorites.');
      return next;
    });
  };

  const handleUseLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
          showToast('GPS Location fetched! Sorting nearest facilities...');
        },
        () => {
          setIsLocating(false);
          showToast('GPS unavailable. Showing Hubballi regional facilities.');
        }
      );
    }
  };

  // Facility Lists with Calculated Distances
  const facilitiesList = bloodBanks.map(b => {
    const dist = calculateHaversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    const stockItem = b.inventory.find(i => i.group === selectedBloodGroupFilter);
    const units = stockItem ? stockItem.units : 0;
    
    let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'Out of Stock';
    if (units >= 5) stockStatus = 'In Stock';
    else if (units > 0) stockStatus = 'Low Stock';

    return {
      ...b,
      calculatedDist: dist,
      units,
      stockStatus,
      estimatedResponseMins: Math.round(10 + dist * 2)
    };
  }).filter(f => f.calculatedDist <= searchRadius)
    .sort((a, b) => a.calculatedDist - b.calculatedDist);

  return (
    <div className="space-y-6">
      
      {/* 3 Guided Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 1-Minute Emergency Blood Need */}
        <div
          onClick={() => setIsQuickModalOpen(true)}
          className="p-6 rounded-3xl bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 border-2 border-red-600/80 hover:border-red-500 cursor-pointer shadow-xl shadow-red-950/40 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-red-950">
              <Zap className="w-7 h-7 fill-white group-hover:animate-bounce" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
              1-Min Urgent
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-white mt-4 tracking-tight">Emergency Blood Need</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Shortened essential form for critical trauma cases. Dispatches Hospital + Donors + Blood Banks all at once.
          </p>

          <div className="mt-4 text-xs font-black text-red-400 flex items-center gap-1">
            Launch Emergency Form →
          </div>
        </div>

        {/* Card 2: Find Hospital & Request Blood */}
        <div
          onClick={() => setActiveModalType('hospital')}
          className="p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer shadow-xl transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-blue-950">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800">
              GPS Radius Search
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-white mt-4 tracking-tight">Find Hospital & Request</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Discover nearest hospitals sorted by Haversine GPS distance (5km - 50km). Pre-fills hospital request wizard.
          </p>

          <div className="mt-4 text-xs font-black text-blue-400 flex items-center gap-1">
            Search Nearby Hospitals →
          </div>
        </div>

        {/* Card 3: Find Blood Bank & Reserve Stock */}
        <div
          onClick={() => setActiveModalType('bloodbank')}
          className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer shadow-xl transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-emerald-950">
              <Droplet className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Direct Stock Reserve
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-white mt-4 tracking-tight">Find Blood Bank</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Check live inventory stock badges, operating hours, and 1-click reserve units directly from blood banks.
          </p>

          <div className="mt-4 text-xs font-black text-emerald-400 flex items-center gap-1">
            Check Live Inventory →
          </div>
        </div>

      </div>

      {/* 1-Minute Emergency Modal */}
      <EmergencyQuickModal isOpen={isQuickModalOpen} onClose={() => setIsQuickModalOpen(false)} />

      {/* Distance Setup & Discovery Modal */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Title Bar */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                {activeModalType === 'hospital' ? (
                  <Building2 className="w-5 h-5 text-blue-400" />
                ) : (
                  <Droplet className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="font-extrabold text-base text-white">
                  {activeModalType === 'hospital' ? 'Find Hospital & Request Blood' : 'Find Blood Bank & Reserve Stock'}
                </h3>
              </div>

              <button onClick={() => setActiveModalType(null)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Distance Controls Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-bold">Search Radius:</span>
                  {[5, 10, 25, 50, 100].map(r => (
                    <button
                      key={r}
                      onClick={() => setSearchRadius(r)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        searchRadius === r
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 border border-slate-700 shrink-0"
                >
                  <Crosshair className="w-4 h-4 text-red-400" />
                  {isLocating ? 'Locating...' : 'Use My GPS Location'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-bold">Target Blood Group:</span>
                <select
                  value={selectedBloodGroupFilter}
                  onChange={e => setSelectedBloodGroupFilter(e.target.value as BloodGroup)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Distance-Sorted Facilities List */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {facilitiesList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold">No facilities found within {searchRadius} km radius.</p>
                  <button onClick={() => setSearchRadius(100)} className="text-red-400 font-bold underline">
                    Expand Search Radius to 100 km
                  </button>
                </div>
              ) : (
                facilitiesList.map(facility => {
                  const isFav = favorites[facility.id] ?? false;

                  return (
                    <div key={facility.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-white">{facility.name}</h4>
                            <button onClick={() => toggleFavorite(facility.id)} className="text-amber-400">
                              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>

                          <p className="text-slate-400 mt-0.5">
                            📍 <strong>{facility.calculatedDist} km away</strong> ({facility.city}) • Est. Response Time: <strong>{facility.estimatedResponseMins} mins</strong>
                          </p>
                        </div>

                        {/* Live Stock Badge */}
                        <span className={`px-3 py-1 rounded-full font-extrabold border text-center shrink-0 ${
                          facility.stockStatus === 'In Stock'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : facility.stockStatus === 'Low Stock'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}>
                          {selectedBloodGroupFilter}: {facility.units} Units ({facility.stockStatus})
                        </span>
                      </div>

                      {/* Facility Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                        <a
                          href={`tel:${facility.phone}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1.5 border border-slate-800"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Now ({facility.phone})
                        </a>

                        {activeModalType === 'hospital' ? (
                          <button
                            onClick={() => {
                              setActiveModalType(null);
                              setActiveEmergencyPostModal(true);
                            }}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                          >
                            Select & Request Blood
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              createEmergencyRequest({
                                hospitalName: facility.name,
                                bloodGroup: selectedBloodGroupFilter,
                                city: facility.city,
                                selectedChannels: ['bloodbank']
                              });
                              approveBloodBankReservation(`req_${Date.now()}`, facility.id);
                              setActiveModalType(null);
                            }}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                          >
                            Reserve Stock ({selectedBloodGroupFilter})
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
