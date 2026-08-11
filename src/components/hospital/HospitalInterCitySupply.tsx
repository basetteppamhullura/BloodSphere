import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { Truck, Building2, MapPin, ArrowRight, CheckCircle2, Clock, PlusCircle } from 'lucide-react';

interface NetworkHospitalStock {
  id: string;
  hospitalName: string;
  city: string;
  distanceKm: number;
  phone: string;
  stockMap: Record<BloodGroup, number>;
}

interface TransferRequest {
  id: string;
  sourceHospital: string;
  sourceCity: string;
  targetHospital: string;
  bloodGroup: BloodGroup;
  component: string;
  units: number;
  status: 'Pending' | 'Approved' | 'In Transit' | 'Received';
  courierEtaMins: number;
  timestamp: string;
}

const NETWORK_HOSPITALS: NetworkHospitalStock[] = [
  {
    id: 'hosp_sdm',
    hospitalName: 'SDM College of Medical Sciences',
    city: 'Dharwad',
    distanceKm: 18.5,
    phone: '+91 836 2477777',
    stockMap: { 'A+': 14, 'A-': 4, 'B+': 18, 'B-': 6, 'AB+': 8, 'AB-': 2, 'O+': 25, 'O-': 6, 'Bombay Phenotype (O-h)': 1 }
  },
  {
    id: 'hosp_kle',
    hospitalName: 'KLE Prabhakar Kore Hospital',
    city: 'Belagavi',
    distanceKm: 92.0,
    phone: '+91 831 2473777',
    stockMap: { 'A+': 20, 'A-': 6, 'B+': 24, 'B-': 8, 'AB+': 12, 'AB-': 4, 'O+': 35, 'O-': 10, 'Bombay Phenotype (O-h)': 2 }
  },
  {
    id: 'hosp_manipal',
    hospitalName: 'Manipal Hospital',
    city: 'Bengaluru',
    distanceKm: 410.0,
    phone: '+91 80 25024444',
    stockMap: { 'A+': 40, 'A-': 12, 'B+': 50, 'B-': 15, 'AB+': 20, 'AB-': 8, 'O+': 60, 'O-': 18, 'Bombay Phenotype (O-h)': 3 }
  }
];

export const HospitalInterCitySupply: React.FC = () => {
  const { showToast } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [transferList, setTransferList] = useState<TransferRequest[]>([
    {
      id: 'TRF_001',
      sourceHospital: 'SDM Medical Center',
      sourceCity: 'Dharwad',
      targetHospital: 'KIMS Teaching Hospital (Hubballi)',
      bloodGroup: 'O-',
      component: 'Whole Blood',
      units: 3,
      status: 'In Transit',
      courierEtaMins: 25,
      timestamp: 'Today, 10:30 AM'
    }
  ]);

  const [requestModalHosp, setRequestModalHosp] = useState<NetworkHospitalStock | null>(null);
  const [requestUnits, setRequestUnits] = useState<number>(2);

  const handleCreateTransfer = () => {
    if (!requestModalHosp) return;

    const newTransfer: TransferRequest = {
      id: `TRF_${Date.now().toString().slice(-4)}`,
      sourceHospital: requestModalHosp.hospitalName,
      sourceCity: requestModalHosp.city,
      targetHospital: 'KIMS Teaching Hospital (Hubballi)',
      bloodGroup: selectedGroup,
      component: 'Whole Blood',
      units: requestUnits,
      status: 'In Transit',
      courierEtaMins: Math.round(requestModalHosp.distanceKm * 1.5),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTransferList(prev => [newTransfer, ...prev]);
    setRequestModalHosp(null);
    showToast(`Transfer request sent to ${requestModalHosp.hospitalName}! Logistics courier dispatched.`);
  };

  const handleMarkReceived = (transferId: string) => {
    setTransferList(prev =>
      prev.map(t => (t.id === transferId ? { ...t, status: 'Received' } : t))
    );
    showToast(`Transfer ${transferId} received & added to hospital inventory!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" /> Inter-Hospital & Inter-City Supply Transfer Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Locate regional hospital surpluses and request trackable cold-chain stock transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-bold">Select Group:</label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value as BloodGroup)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-xs"
          >
            {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Network Hospitals Stock Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" /> Regional Network Hospital Inventories ({selectedGroup})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NETWORK_HOSPITALS.map(hosp => {
            const unitsAvail = hosp.stockMap[selectedGroup] || 0;

            return (
              <div key={hosp.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white">{hosp.hospitalName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      📍 {hosp.distanceKm} km ({hosp.city})
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-slate-400 font-sans font-bold">{selectedGroup} Availability:</span>
                    <strong className="text-lg text-emerald-400">{unitsAvail} Units</strong>
                  </div>
                </div>

                <button
                  onClick={() => { setRequestModalHosp(hosp); setRequestUnits(2); }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4" /> Request Stock Transfer
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trackable Transfer Pipeline */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" /> Active Inter-City Stock Transfer Requests ({transferList.length})
        </h3>

        <div className="space-y-3">
          {transferList.map(trf => (
            <div key={trf.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400 font-extrabold text-xs">{trf.id}</span>
                  <span className="px-2 py-0.5 rounded-xl bg-red-600 text-white font-black text-[11px]">{trf.bloodGroup}</span>
                  <span className="font-extrabold text-white text-xs">{trf.units} Units</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    trf.status === 'Received'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse'
                  }`}>
                    {trf.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  From: <strong>{trf.sourceHospital} ({trf.sourceCity})</strong> • ETA: <strong>~{trf.courierEtaMins} mins</strong>
                </p>
              </div>

              {trf.status === 'In Transit' && (
                <button
                  onClick={() => handleMarkReceived(trf.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Received & Add to Stock
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Request Modal */}
      {requestModalHosp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-blue-600 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Request Stock Transfer</h3>
            
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div>Source Hospital: <strong className="text-white">{requestModalHosp.hospitalName}</strong></div>
              <div>Location: <strong className="text-slate-300">{requestModalHosp.city} ({requestModalHosp.distanceKm} km away)</strong></div>
              <div>Selected Blood Group: <strong className="text-red-400">{selectedGroup}</strong></div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Enter Units Required *</label>
              <input
                type="number"
                min={1}
                max={requestModalHosp.stockMap[selectedGroup] || 10}
                value={requestUnits}
                onChange={e => setRequestUnits(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRequestModalHosp(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Cancel
              </button>
              <button onClick={handleCreateTransfer} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold">
                Dispatch Courier Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
