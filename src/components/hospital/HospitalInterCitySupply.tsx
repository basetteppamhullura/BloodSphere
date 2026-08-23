import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import { Truck, Building2, MapPin, ArrowRight, CheckCircle2, Clock, PlusCircle, Navigation, Filter } from 'lucide-react';

interface NetworkHospitalStock {
  id: string;
  hospitalName: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  stockMap: Record<BloodGroup, number>;
}

const NETWORK_HOSPITALS: NetworkHospitalStock[] = [
  {
    id: 'hosp_sdm',
    hospitalName: 'SDM College of Medical Sciences',
    city: 'Dharwad',
    lat: 15.4589,
    lng: 75.0078,
    phone: '+91 836 2477777',
    stockMap: { 'A+': 14, 'A-': 4, 'B+': 18, 'B-': 6, 'AB+': 8, 'AB-': 2, 'O+': 25, 'O-': 6, 'Bombay Phenotype (O-h)': 1 }
  },
  {
    id: 'hosp_kle',
    hospitalName: 'KLE Prabhakar Kore Hospital',
    city: 'Belagavi',
    lat: 15.8497,
    lng: 74.4977,
    phone: '+91 831 2473777',
    stockMap: { 'A+': 20, 'A-': 6, 'B+': 24, 'B-': 8, 'AB+': 12, 'AB-': 4, 'O+': 35, 'O-': 10, 'Bombay Phenotype (O-h)': 2 }
  },
  {
    id: 'hosp_manipal',
    hospitalName: 'Manipal Hospital',
    city: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    phone: '+91 80 25024444',
    stockMap: { 'A+': 40, 'A-': 12, 'B+': 50, 'B-': 15, 'AB+': 20, 'AB-': 8, 'O+': 60, 'O-': 18, 'Bombay Phenotype (O-h)': 3 }
  }
];

export const HospitalInterCitySupply: React.FC = () => {
  const { interCityTransfers, createInterCityTransfer, updateInterCityTransferStatus, showToast } = useApp();

  const [hospitalLocation, setHospitalLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.124
  });

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [radiusFilter, setRadiusFilter] = useState<number>(1000);

  const [requestModalHosp, setRequestModalHosp] = useState<NetworkHospitalStock | null>(null);
  const [requestUnits, setRequestUnits] = useState<number>(2);

  const handleSetCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setHospitalLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast(`Hospital GPS location updated: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        },
        () => showToast('Using Hubballi regional center coordinates.')
      );
    }
  };

  const handleConfirmTransferRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalHosp) return;

    createInterCityTransfer({
      sourceHospital: requestModalHosp.hospitalName,
      sourceCity: requestModalHosp.city,
      targetHospital: 'KIMS Teaching Hospital (Hubballi)',
      bloodGroup: selectedGroup,
      component: 'Whole Blood',
      units: requestUnits,
      courierEtaMins: 30
    });

    setRequestModalHosp(null);
    showToast(`Created inter-city transfer request for ${requestUnits} units of ${selectedGroup}!`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inter-City Regional Blood Supply Network</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
              REAL-TIME COURIER DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Inter-hospital stock transfer dispatch and cold-chain logistic monitoring</p>
        </div>

        <button
          onClick={handleSetCurrentGPS}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-700 font-extrabold border border-sky-200 shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Navigation className="w-4 h-4 text-sky-600" /> Calibrate Hospital GPS
        </button>
      </div>

      {/* 2. ACTIVE TRANSFERS SECTION (VERTICAL STACK) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" /> Active Inter-City Stock Transfers ({interCityTransfers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live status tracking: Pending → Approved → In Transit → Received</p>
          </div>
        </div>

        <div className="space-y-3">
          {interCityTransfers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-bold">No active inter-city transfer requests.</div>
          ) : (
            interCityTransfers.map(trf => (
              <div key={trf.id} className="p-4 rounded-2xl border border-sky-100 bg-slate-50/50 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                      {trf.bloodGroup}
                    </span>
                    <strong className="text-slate-900 font-sans">{trf.units} Units ({trf.component})</strong>
                    <span className="text-[10px] text-slate-400">ID: {trf.id}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-sans ${
                    trf.status === 'In Transit'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      : trf.status === 'Delivered' || trf.status === 'Received'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}>
                    🚚 {trf.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-slate-600">
                  <div>Source: <strong>{trf.sourceHospital} ({trf.sourceCity})</strong> → Target: <strong>{trf.targetHospital}</strong></div>
                  <div>ETA: <strong className="text-sky-700">{trf.courierEtaMins} Mins</strong></div>
                </div>

                {trf.status !== 'Delivered' && trf.status !== 'Received' && (
                  <div className="pt-1 flex items-center justify-end gap-2 font-sans">
                    {trf.status === 'Pending' && (
                      <button
                        onClick={() => updateInterCityTransferStatus(trf.id, 'In Transit')}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-[10px]"
                      >
                        Dispatch Courier (In Transit)
                      </button>
                    )}
                    {trf.status === 'In Transit' && (
                      <button
                        onClick={() => updateInterCityTransferStatus(trf.id, 'Delivered')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-[10px]"
                      >
                        Confirm Delivery (Received)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. REGIONAL NETWORK HOSPITALS DIRECTORY (VERTICAL STACK) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" /> Regional Partner Hospitals & Stock Availability
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Request stock transfers from connected medical centers across Karnataka.</p>
          </div>

          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value as BloodGroup)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
          >
            <option value="O-">O- (Universal)</option>
            <option value="O+">O+</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NETWORK_HOSPITALS.map(hosp => {
            const avail = hosp.stockMap[selectedGroup] || 0;
            const distKm = calculateDistanceKm(hospitalLocation.lat, hospitalLocation.lng, hosp.lat, hosp.lng);

            return (
              <div key={hosp.id} className="p-5 rounded-3xl border border-sky-100 bg-slate-50/50 space-y-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{hosp.hospitalName}</h4>
                  <span className="text-[11px] text-slate-500 block">📍 {hosp.city} • {distKm.toFixed(1)} km away</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-sky-100 text-xs flex items-center justify-between font-mono">
                  <span className="text-slate-600 font-sans">Stock for {selectedGroup}:</span>
                  <strong className="text-sm text-emerald-700">{avail} Units</strong>
                </div>

                <button
                  onClick={() => setRequestModalHosp(hosp)}
                  className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20"
                >
                  Request Stock Transfer
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* TRANSFER REQUEST MODAL */}
      {requestModalHosp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Request Inter-City Transfer • {requestModalHosp.hospitalName}</h4>
              <button onClick={() => setRequestModalHosp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleConfirmTransferRequest} className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Blood Group</label>
                <input type="text" value={selectedGroup} readOnly className="w-full p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold font-mono" />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Units Needed *</label>
                <input
                  type="number"
                  min={1}
                  max={requestModalHosp.stockMap[selectedGroup] || 5}
                  value={requestUnits}
                  onChange={e => setRequestUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setRequestModalHosp(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-extrabold">
                  Confirm Dispatch Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
