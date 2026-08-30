import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, ComponentType } from '../../types';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import {
  Truck,
  Building2,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlusCircle,
  Navigation,
  Search,
  Filter,
  ShieldCheck,
  Package,
  Layers,
  Send
} from 'lucide-react';

export const HospitalInterCitySupply: React.FC = () => {
  const {
    bloodBanks,
    interCityTransfers,
    createInterCityTransfer,
    updateInterCityTransferStatus,
    showToast
  } = useApp();

  const [hospitalLocation, setHospitalLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.124
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE'>('ALL');

  // Request & Transfer Modals State
  const [requestModalBank, setRequestModalBank] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'request' | 'transfer'>('request');
  const [requestGroup, setRequestGroup] = useState<BloodGroup>('O+');
  const [requestComponent, setRequestComponent] = useState<ComponentType>('PRBC');
  const [requestUnits, setRequestUnits] = useState<number>(2);
  const [requestUrgency, setRequestUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [patientId, setPatientId] = useState<string>(`PAT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [requiredDate, setRequiredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hospitalName] = useState<string>('KIMS Teaching Hospital & Trauma Center');
  const [notes, setNotes] = useState<string>('Emergency trauma unit stock replenishment request');

  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);

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

  const handleOpenModal = (bank: any, mode: 'request' | 'transfer') => {
    setRequestModalBank(bank);
    setModalMode(mode);
    setRequestGroup(selectedGroup !== 'ALL' ? (selectedGroup as BloodGroup) : 'O+');
  };

  const handleConfirmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalBank) return;

    createInterCityTransfer({
      sourceHospital: requestModalBank.name,
      sourceCity: requestModalBank.city,
      targetHospital: hospitalName,
      bloodGroup: requestGroup,
      component: requestComponent,
      units: requestUnits,
      courierEtaMins: 30
    });

    const actionText = modalMode === 'transfer' ? 'Inter-City Transfer Request' : 'Blood Supply Request';
    showToast(`Submitted ${actionText} to ${requestModalBank.name} for ${requestUnits} unit(s) of ${requestGroup} ${requestComponent}!`);
    setRequestModalBank(null);
  };

  // Process & Filter Blood Banks from real database
  const activeConnectedBanks = (bloodBanks || []).filter(b => b.verified !== false);

  const filteredBanks = activeConnectedBanks.filter(bank => {
    const matchesSearch =
      !searchQuery ||
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      selectedGroup === 'ALL' ||
      bank.inventory.some(inv => inv.group === selectedGroup && inv.units > 0);

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto pb-12">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#087443]" />
            <h2 className="text-2xl font-black text-[#18352A] tracking-tight">Connected Regional Blood Banks</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#E8F6EF] text-[#087443] border border-[#DDE8E2] flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#16A86B] animate-ping" />
              <span>REAL-TIME SYNC ACTIVE</span>
            </span>
          </div>
          <p className="text-xs text-[#587067] mt-1">
            Real-time blood availability, direct blood orders, and inter-city cold chain transfer dispatch.
          </p>
        </div>

        <button
          onClick={handleSetCurrentGPS}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#E8F6EF] text-[#087443] font-extrabold border border-[#DDE8E2] shadow-xs flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Navigation className="w-4 h-4 text-[#087443]" /> Calibrate Hospital GPS
        </button>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <h3 className="font-black text-sm text-[#18352A] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#087443]" /> Filter Connected Regional Blood Banks
          </h3>
          <span className="text-[11px] text-[#587067] font-mono">
            Showing {filteredBanks.length} of {activeConnectedBanks.length} Connected Bank(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#587067] uppercase block mb-1">Search Blood Bank / City</label>
            <input
              type="text"
              placeholder="e.g. Rotary, KIMS, Hubballi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#587067] uppercase block mb-1">Blood Type</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443] cursor-pointer"
            >
              <option value="ALL">All Blood Types</option>
              <option value="O+">O+</option>
              <option value="O-">O- (Universal)</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#587067] uppercase block mb-1">Component</label>
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443] cursor-pointer"
            >
              <option value="ALL">All Components</option>
              <option value="PRBC">PRBC (Packed Red Blood Cells)</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Plasma">Plasma (FFP)</option>
              <option value="Platelets">Platelets (PRP)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#587067] uppercase block mb-1">Connection Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#087443] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="LIVE">🟢 Live Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE INTER-CITY TRANSFERS LIST */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#18352A] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#087443]" /> Active Inter-City Stock Transfers & Orders ({interCityTransfers.length})
            </h3>
            <p className="text-xs text-[#587067] mt-0.5">Live transfer status: Pending → Accepted → Dispatched → Received</p>
          </div>
        </div>

        <div className="space-y-3">
          {interCityTransfers.length === 0 ? (
            <div className="p-6 text-center text-[#587067] font-bold bg-[#F7FAF8] rounded-2xl border border-[#DDE8E2]">
              No active inter-city transfer or supply requests.
            </div>
          ) : (
            interCityTransfers.map(trf => (
              <div key={trf.id} className="p-4 rounded-2xl border border-[#DDE8E2] bg-[#F7FAF8] space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE8E2] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                      🩸 {trf.bloodGroup}
                    </span>
                    <strong className="text-slate-900 font-sans">{trf.units} Units ({trf.component || 'PRBC'})</strong>
                    <span className="text-[10px] text-slate-400">ID: {trf.id}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-sans flex items-center gap-1 ${
                    trf.status === 'In Transit' || trf.status === 'Dispatched'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : trf.status === 'Delivered' || trf.status === 'Received' || trf.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-sky-100 text-sky-900 border border-sky-300'
                  }`}>
                    <span>🚚</span> <span>{trf.status}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-slate-700">
                  <div>Source: <strong>{trf.sourceHospital} ({trf.sourceCity})</strong> → Target: <strong>{trf.targetHospital}</strong></div>
                  <div>ETA: <strong className="text-[#087443]">{trf.courierEtaMins} Mins</strong></div>
                </div>

                {trf.status !== 'Delivered' && trf.status !== 'Received' && trf.status !== 'Completed' && (
                  <div className="pt-1 flex items-center justify-end gap-2 font-sans">
                    {trf.status === 'Pending' && (
                      <button
                        onClick={() => updateInterCityTransferStatus(trf.id, 'In Transit')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow-xs"
                      >
                        Dispatch Courier (In Transit)
                      </button>
                    )}
                    {(trf.status === 'In Transit' || trf.status === 'Dispatched') && (
                      <button
                        onClick={() => updateInterCityTransferStatus(trf.id, 'Delivered')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#087443] hover:bg-[#065b34] text-white font-extrabold text-[11px] shadow-xs"
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

      {/* 4. CONNECTED BLOOD BANKS DIRECTORY */}
      <div className="p-6 rounded-3xl bg-white border border-[#DDE8E2] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#18352A] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#087443]" /> Connected Regional Blood Bank Directory
            </h3>
            <p className="text-xs text-[#587067] mt-0.5">
              Verified BloodNet partner banks connected with live inventory synchronization.
            </p>
          </div>
        </div>

        {filteredBanks.length === 0 ? (
          <div className="p-12 text-center text-[#587067] font-bold bg-[#F7FAF8] rounded-2xl border border-[#DDE8E2]">
            No connected regional blood banks match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBanks.map(bank => {
              const isExpanded = expandedBankId === bank.id;
              const dist = bank.distanceKm || calculateDistanceKm(hospitalLocation.lat, hospitalLocation.lng, bank.lat, bank.lng);

              return (
                <div key={bank.id} className="p-6 rounded-3xl border border-[#DDE8E2] bg-white space-y-4 shadow-xs hover:shadow-md transition-all">
                  
                  {/* BANK TOP HEADER */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#DDE8E2] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-black text-sm text-[#18352A] block">{bank.name}</strong>
                        {bank.verified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-[#087443]" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#587067] block mt-0.5">
                        📍 {bank.address}, {bank.city} • <strong className="font-mono text-slate-700">{dist.toFixed(1)} km away</strong>
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#E8F6EF] text-[#087443] text-[10px] font-black border border-[#DDE8E2] flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#16A86B] animate-ping" />
                      <span>🟢 Live</span>
                    </span>
                  </div>

                  {/* INVENTORY PREVIEW MATRIX */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Real-Time Inventory Overview:</span>
                      <span className="text-slate-400 font-mono text-[10px]">Synced 10 seconds ago</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                      {bank.inventory.slice(0, 4).map((inv, iIdx) => (
                        <div key={iIdx} className="p-2 rounded-xl bg-[#F7FAF8] border border-[#DDE8E2] space-y-0.5">
                          <span className="text-[10px] font-black text-red-600 block">{inv.group}</span>
                          <strong className="text-xs text-[#087443] font-black block">{inv.units}u</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EXPANDED FULL STOCK VIEW */}
                  {isExpanded && (
                    <div className="p-3 rounded-2xl bg-[#E8F6EF]/60 border border-[#DDE8E2] space-y-2 animate-in fade-in">
                      <span className="font-extrabold text-xs text-[#18352A] block">Full Available Inventory:</span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                        {bank.inventory.map((inv, iIdx) => (
                          <div key={iIdx} className="p-2 rounded-xl bg-white border border-[#DDE8E2] flex items-center justify-between">
                            <span className="font-extrabold text-red-700">{inv.group}</span>
                            <span className="font-black text-[#087443]">{inv.units} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BANK FOOTER & ACTIONS */}
                  <div className="pt-2 border-t border-[#DDE8E2] flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#F7FAF8] hover:bg-[#E8F6EF] text-[#18352A] font-extrabold text-xs border border-[#DDE8E2] transition-colors"
                    >
                      {isExpanded ? 'Hide Stock' : 'View Stock'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(bank, 'request')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#087443] hover:bg-[#065b34] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Request Blood
                      </button>
                      <button
                        onClick={() => handleOpenModal(bank, 'transfer')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Request Transfer
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOOD REQUEST & TRANSFER MODAL (REQUIREMENT 6 & 7) */}
      {requestModalBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#DDE8E2] rounded-3xl p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-[#DDE8E2] pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {modalMode === 'transfer' ? '🚚 Request Inter-City Transfer' : '🩸 Request Blood Supply'}
                </h4>
                <span className="text-xs text-[#087443] font-bold">Target Bank: {requestModalBank.name}</span>
              </div>
              <button onClick={() => setRequestModalBank(null)} className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Blood Type *</label>
                  <select
                    value={requestGroup}
                    onChange={e => setRequestGroup(e.target.value as BloodGroup)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Component *</label>
                  <select
                    value={requestComponent}
                    onChange={e => setRequestComponent(e.target.value as ComponentType)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  >
                    <option value="PRBC">PRBC (Packed Red Blood Cells)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Plasma">Plasma (FFP)</option>
                    <option value="Platelets">Platelets (PRP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Required Units *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={requestUnits}
                    onChange={e => setRequestUnits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Urgency Level *</label>
                  <select
                    value={requestUrgency}
                    onChange={e => setRequestUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL (ICU Trauma)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Patient / Request ID</label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Required Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={e => setRequiredDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Requesting Hospital</label>
                <input
                  type="text"
                  value={hospitalName}
                  readOnly
                  className="w-full p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalBank(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#087443] hover:bg-[#065b34] text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
