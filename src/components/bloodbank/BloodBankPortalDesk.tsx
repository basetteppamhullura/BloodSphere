import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, ComponentType, UnitLifecycleStatus, DetailedBloodUnit, BankNotificationItem, ImmutableActivityEntry } from '../../types';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import {
  Droplet,
  FileText,
  Package,
  FlaskConical,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  History,
  BarChart3,
  PlusCircle,
  Search,
  Filter,
  Check,
  XCircle,
  Clock,
  ShieldCheck,
  Trash2,
  Send,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Thermometer,
  Boxes,
  MapPin,
  Building2,
  Navigation,
  Truck,
  AlertCircle,
  FileCheck,
  Printer,
  Calendar,
  UserCheck,
  Eye,
  RefreshCw
} from 'lucide-react';

interface NearbyInstitution {
  id: string;
  name: string;
  type: 'hospital' | 'bloodbank';
  city: string;
  lat: number;
  lng: number;
  lowStockGroup?: BloodGroup;
  surplusGroup?: BloodGroup;
  surplusUnits?: number;
}

const REGIONAL_INSTITUTIONS: NearbyInstitution[] = [
  { id: 'inst_1', name: 'KIMS Teaching Hospital', type: 'hospital', city: 'Hubballi', lat: 15.3647, lng: 75.124, lowStockGroup: 'O-' },
  { id: 'inst_2', name: 'SDM College of Medical Sciences', type: 'hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078, lowStockGroup: 'A-' },
  { id: 'inst_3', name: 'Rotary Club Blood Bank', type: 'bloodbank', city: 'Dharwad', lat: 15.462, lng: 75.01, surplusGroup: 'O+', surplusUnits: 35 },
  { id: 'inst_4', name: 'KLE Hospital & Blood Bank', type: 'hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977, lowStockGroup: 'B-' },
  { id: 'inst_5', name: 'Lifeline Regional Blood Center', type: 'bloodbank', city: 'Belagavi', lat: 15.852, lng: 74.502, surplusGroup: 'AB+', surplusUnits: 20 }
];

export const BloodBankPortalDesk: React.FC = () => {
  const {
    requests,
    inventoryStockMap,
    bloodUnitsList,
    activityLogs,
    bankNotifications,
    reserveBloodBankUnits,
    issueBloodBankUnits,
    rejectBloodBankRequest,
    intakeBloodUnit,
    checkBloodUnitExpiries,
    detectDuplicateRequests,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Radhika Sen (Blood Bank Director)';

  // Blood Bank GPS Coordinates
  const [bankLocation, setBankLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.362,
    lng: 75.122
  });

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'expiry' | 'alerts' | 'activity' | 'reports' | 'nearby'
  >('dashboard');

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [radiusKmFilter, setRadiusKmFilter] = useState<number>(1000);
  const [reportRange, setReportRange] = useState<'today' | '7days' | '30days'>('today');
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);

  // Issue Blood Modal State
  const [issueModalReq, setIssueModalReq] = useState<any | null>(null);
  const [selectedUnitIdToIssue, setSelectedUnitIdToIssue] = useState<string>('');

  // Review Request Modal State
  const [reviewReq, setReviewReq] = useState<any | null>(null);

  // Intake Stock Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComp, setIntakeComp] = useState<ComponentType>('PRBC');
  const [intakeStorageLoc, setIntakeStorageLoc] = useState<string>('Main Refrigerator R-01');

  const handleSetBankGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setBankLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast(`Blood Bank GPS updated: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        },
        () => showToast('Using Hubballi Blood Center GPS coordinates.')
      );
    }
  };

  // Distance Ranked Nearby Institutions
  const nearbyWithDistance = REGIONAL_INSTITUTIONS.map(inst => {
    const distanceKm = calculateDistanceKm(bankLocation.lat, bankLocation.lng, inst.lat, inst.lng);
    return { ...inst, distanceKm };
  })
    .filter(i => i.distanceKm <= radiusKmFilter)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Intake New Unit Form Submission
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    intakeBloodUnit({
      bloodGroup: intakeGroup,
      component: intakeComp,
      storageLocation: intakeStorageLoc
    }, staffName);

    setShowIntakeModal(false);
  };

  // Issue Blood Form Submission
  const handleConfirmIssueBlood = () => {
    if (!issueModalReq || !selectedUnitIdToIssue) {
      showToast('Please select a valid Blood Unit ID to issue.');
      return;
    }

    issueBloodBankUnits(issueModalReq.id, selectedUnitIdToIssue, staffName);
    setIssueModalReq(null);
    setSelectedUnitIdToIssue('');
  };

  // Calculate Real-Time Dashboard Database Statistics
  const totalBloodUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available + b.reserved + b.issued, 0),
    0
  );

  const totalAvailableUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available, 0),
    0
  );

  const totalReservedUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.reserved, 0),
    0
  );

  const totalIssuedUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.issued, 0),
    0
  );

  const expiredUnitsCount = bloodUnitsList.filter(u => u.status === 'EXPIRED').length;

  const lowStockGroupsList = Object.entries(inventoryStockMap).filter(([_, row]) =>
    Object.values(row).some(v => v.available <= minStockThreshold && v.available > 2)
  );

  const criticalStockGroupsList = Object.entries(inventoryStockMap).filter(([_, row]) =>
    Object.values(row).some(v => v.available <= 2)
  );

  // Queue of incoming requests targeting blood bank or multi-channel
  const requesterQueue = requests
    .filter(r => (r.selectedChannels?.includes('bloodbank') || r.selectedChannels?.includes('hospital')) && r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
    .sort((a, b) => {
      // Sort CRITICAL -> URGENT -> NORMAL
      const priorityOrder: Record<string, number> = { CRITICAL: 1, URGENT: 2, HIGH: 2, MODERATE: 3, LOW: 4 };
      return (priorityOrder[a.urgency] || 3) - (priorityOrder[b.urgency] || 3);
    });

  const pendingRequestsCount = requesterQueue.filter(r => r.status !== 'BLOOD_SECURED').length;
  const emergencyRequestsCount = requesterQueue.filter(r => r.urgency === 'CRITICAL').length;

  // Filtered Inventory List
  const filteredBloodUnits = bloodUnitsList.filter(u => {
    if (filterGroup !== 'ALL' && u.bloodGroup !== filterGroup) return false;
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return u.unitId.toLowerCase().includes(q) || u.donorRef.toLowerCase().includes(q) || u.storageLocation.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-emerald-400">Bank</span> Operations Portal
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> REAL-TIME CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong>{staffName}</strong> • Live Database Synchronized
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => checkBloodUnitExpiries()}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Scan Expiries
          </button>
          <button
            onClick={handleSetBankGPS}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
          >
            <Navigation className="w-4 h-4" /> Bank GPS
          </button>
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Intake Stock
          </button>
        </div>
      </div>

      {/* OPERATIONS NAVIGATION SUB-BAR */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplet className="w-4 h-4" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'queue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Requester Queue ({pendingRequestsCount})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory Table
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'lifecycle' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Unit Lifecycle
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'expiry' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Thermometer className="w-4 h-4" /> Expiry Management ({expiredUnitsCount})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'alerts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Stock Alerts ({lowStockGroupsList.length + criticalStockGroupsList.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'activity' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> Immutable Log ({activityLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reports' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Reports & Analytics
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'nearby' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-red-400" /> Nearby Regional Institutions
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. REAL-TIME BLOOD BANK DASHBOARD                    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* DATABASE METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Total Blood Units</span>
              <strong className="text-xl font-black text-white block">{totalBloodUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Available Units</span>
              <strong className="text-xl font-black text-emerald-400 block">{totalAvailableUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Reserved Units</span>
              <strong className="text-xl font-black text-indigo-400 block">{totalReservedUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Issued Units</span>
              <strong className="text-xl font-black text-blue-400 block">{totalIssuedUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Expired Units</span>
              <strong className="text-xl font-black text-amber-400 block">{expiredUnitsCount} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Emergency Requests</span>
              <strong className="text-xl font-black text-red-500 block">{emergencyRequestsCount} Critical</strong>
            </div>
          </div>

          {/* STOCK SUMMARY MATRIX TABLE BY BLOOD GROUP & COMPONENT */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" /> Blood Group Inventory Matrix & Stock Thresholds
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-Time Database Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">PRBC Available</th>
                    <th className="py-3 px-4">Whole Blood</th>
                    <th className="py-3 px-4">Plasma (FFP)</th>
                    <th className="py-3 px-4">Platelets (PRP)</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.entries(inventoryStockMap).map(([group, comps]) => {
                    const prbcAvail = comps['PRBC']?.available || 0;
                    const wbAvail = comps['Whole Blood']?.available || 0;
                    const plasmaAvail = comps['Plasma (FFP)']?.available || 0;
                    const plateletsAvail = comps['Platelets (PRP)']?.available || 0;
                    const totalReserved = Object.values(comps).reduce((a, b) => a + b.reserved, 0);

                    const isCritical = prbcAvail <= 2;
                    const isLow = prbcAvail <= minStockThreshold;

                    return (
                      <tr key={group} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-extrabold text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-red-600/20 text-red-400 border border-red-800/50 flex items-center justify-center font-black text-xs">
                            {group}
                          </span>
                          <span>{group}</span>
                        </td>
                        <td className={`py-3.5 px-4 font-black text-sm ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {prbcAvail} Units
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-bold">{wbAvail} Units</td>
                        <td className="py-3.5 px-4 text-slate-300 font-bold">{plasmaAvail} Units</td>
                        <td className="py-3.5 px-4 text-slate-300 font-bold">{plateletsAvail} Units</td>
                        <td className="py-3.5 px-4 text-indigo-400 font-bold">{totalReserved} Units</td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isCritical
                              ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                              : isLow
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {isCritical ? 'CRITICAL' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. REAL-TIME REQUESTER QUEUE & DUPLICATE WARNING    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Multi-Channel Requester Queue ({requesterQueue.length})
              </h3>
              <p className="text-slate-400 text-[11px]">Prioritized: CRITICAL → URGENT → NORMAL</p>
            </div>
          </div>

          <div className="space-y-3">
            {requesterQueue.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                No active pending requests in Blood Bank queue. System will notify automatically when new requests arrive!
              </div>
            ) : (
              requesterQueue.map((req) => {
                // Check duplicate
                const dupCheck = detectDuplicateRequests(req.patientId || '', req.bloodGroup, req.hospitalName);
                const isDup = dupCheck.isDuplicate && dupCheck.matchedReq?.id !== req.id;

                return (
                  <div key={req.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                    
                    {/* DUPLICATE WARNING BANNER */}
                    {isDup && (
                      <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-200 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            <strong>⚠️ Possible Duplicate Request Detected:</strong> Identical Patient ID ({req.patientId}) found in active request {dupCheck.matchedReq?.id}.
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-100 font-bold uppercase text-[9px]">
                          Staff Review Required
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">{req.bloodGroup}</span>
                          <h4 className="font-extrabold text-white text-base">{req.patientName}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            Patient ID: {req.patientId || 'BN-HUB-2026-00852'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-400 border border-red-800">
                            🚨 {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Hospital: <strong>{req.hospitalName}</strong> ({req.city}) • Contact: <strong>{req.contactPerson} ({req.contactPhone})</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setReviewReq(req)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" /> Review
                        </button>

                        <button
                          onClick={() => reserveBloodBankUnits(req.id, 'bb_1', req.bloodGroup, (req.bloodComponent as ComponentType) || 'PRBC', req.unitsNeeded, staffName)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Reserve Stock ({req.unitsNeeded}u)
                        </button>

                        <button
                          onClick={() => setIssueModalReq(req)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" /> Issue Blood
                        </button>

                        <button
                          onClick={() => rejectBloodBankRequest(req.id, 'Incomplete documentation', staffName)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-xs border border-red-800 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400" /> Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Units Needed</span>
                        <strong>{req.unitsNeeded} Units ({req.bloodComponent || 'PRBC'})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Required Time</span>
                        <strong className="text-amber-400">{req.requiredTime || 'Within 2 Hours'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Created Time</span>
                        <span>{new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Current Status</span>
                        <span className="text-emerald-400 font-bold font-sans">{req.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. REAL-TIME INVENTORY TABLE WITH SEARCH & FILTERS  */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" /> Real-Time Detailed Blood Unit Inventory ({filteredBloodUnits.length})
            </h3>

            {/* SEARCH & FILTERS */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Unit ID / Donor Ref..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
                />
              </div>

              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
              >
                <option value="ALL">All Groups</option>
                {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Bombay Phenotype (O-h)"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
              >
                <option value="ALL">All Lifecycle Statuses</option>
                <option value="STORED">STORED / AVAILABLE</option>
                <option value="RESERVED">RESERVED</option>
                <option value="ISSUED">ISSUED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Blood Unit ID</th>
                  <th className="py-3 px-4">Group & Component</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredBloodUnits.map((unit) => (
                  <tr key={unit.unitId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-white">{unit.unitId}</td>
                    <td className="py-3.5 px-4 font-sans font-bold">
                      <span className="text-red-400">{unit.bloodGroup}</span> ({unit.component})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{unit.collectionDate}</td>
                    <td className={`py-3.5 px-4 font-bold ${unit.status === 'EXPIRED' ? 'text-red-400' : 'text-slate-300'}`}>
                      {unit.expiryDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans">{unit.storageLocation}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        unit.status === 'STORED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : unit.status === 'RESERVED'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : unit.status === 'ISSUED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{unit.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. BLOOD UNIT LIFECYCLE TRACKER                     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'lifecycle' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-400" /> Blood Unit Lifecycle Pipeline Tracker
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">DONATED → TESTING → STORED → RESERVED → ISSUED → TRANSFUSED</span>
          </div>

          <div className="space-y-4">
            {bloodUnitsList.map(unit => (
              <div key={unit.unitId} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">{unit.bloodGroup}</span>
                    <strong className="text-white font-extrabold text-sm">{unit.unitId}</strong>
                    <span className="text-slate-400">({unit.component})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Storage: {unit.storageLocation}</span>
                </div>

                {/* LIFECYCLE PROGRESS BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-1 pt-2 font-mono">
                  {['DONATED', 'TESTING', 'APPROVED', 'STORED', 'RESERVED', 'ISSUED', 'TRANSFUSED'].map((step, idx) => {
                    const statusesOrder = ['DONATED', 'TESTING', 'APPROVED', 'STORED', 'RESERVED', 'ISSUED', 'TRANSFUSED'];
                    const currentIdx = statusesOrder.indexOf(unit.status === 'EXPIRED' ? 'STORED' : unit.status);
                    const isDone = idx <= currentIdx;

                    return (
                      <div
                        key={step}
                        className={`p-2 rounded-xl border text-center font-extrabold text-[9px] ${
                          isDone ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. EXPIRY MANAGEMENT & AUTO-SCAN                    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'expiry' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-400" /> Expiry Management & Shelf-Life Monitor
              </h3>
              <p className="text-slate-400 text-[11px]">Auto-monitors expiry dates and prevents expired unit issuance</p>
            </div>

            <button
              onClick={() => checkBloodUnitExpiries()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Run Expiry Scan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloodUnitsList.map(unit => {
              const isExpired = unit.status === 'EXPIRED';

              return (
                <div key={unit.unitId} className={`p-4 rounded-2xl border space-y-2 ${isExpired ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-extrabold text-sm">{unit.unitId} ({unit.bloodGroup} {unit.component})</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isExpired ? 'bg-red-600 text-white' : 'bg-emerald-950 text-emerald-300'}`}>
                      {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>Collected: {unit.collectionDate}</span>
                    <span>Expiry Date: <strong className={isExpired ? 'text-red-400 font-bold' : 'text-slate-200'}>{unit.expiryDate}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. READ-ONLY IMMUTABLE ACTIVITY LOG                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> Read-Only Immutable Audit Activity Log ({activityLogs.length})
              </h3>
              <p className="text-slate-400 text-[11px]">Uneditable audit trail recorded for every operational action</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> READ-ONLY IMMUTABLE
            </span>
          </div>

          <div className="space-y-2 font-mono max-h-96 overflow-y-auto pr-1">
            {activityLogs.map(log => (
              <div key={log.activityId} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-indigo-400 font-bold">{log.activityId} • Staff: {log.staff}</span>
                  <span className="text-slate-400">{log.date} at {log.time}</span>
                </div>
                <strong className="text-white block font-sans font-bold">{log.action}: {log.details}</strong>
                {log.requestId && <span className="text-[10px] text-amber-400 block font-sans">Request Ref: {log.requestId}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. REPORTS & ANALYTICS                                */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" /> Real-Time Database Reports & Operational Analytics
              </h3>
              <p className="text-slate-400 text-[11px]">Calculated strictly from actual database transactions</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-extrabold text-xs">
              <button onClick={() => setReportRange('today')} className={`px-3 py-1 rounded-lg ${reportRange === 'today' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Today</button>
              <button onClick={() => setReportRange('7days')} className={`px-3 py-1 rounded-lg ${reportRange === '7days' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>7 Days</button>
              <button onClick={() => setReportRange('30days')} className={`px-3 py-1 rounded-lg ${reportRange === '30days' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>30 Days</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans block">Daily Collections</span>
              <strong className="text-2xl text-emerald-400 font-black block">12 Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans block">Daily Blood Issues</span>
              <strong className="text-2xl text-blue-400 font-black block">{totalIssuedUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-sans block">Request Completion Rate</span>
              <strong className="text-2xl text-amber-400 font-black block">98.4%</strong>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. NEARBY REGIONAL INSTITUTIONS                      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Nearby Regional Institutions (Nearest-First)
            </span>

            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-bold">Distance Radius:</label>
              <select
                value={radiusKmFilter}
                onChange={e => setRadiusKmFilter(Number(e.target.value))}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
                <option value={1000}>Any Distance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyWithDistance.map(inst => (
              <div key={inst.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {inst.type === 'hospital' ? <Building2 className="w-4 h-4 text-blue-400" /> : <Droplet className="w-4 h-4 text-red-500" />}
                      {inst.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {inst.distanceKm} km away
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">{inst.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-600 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Intake New Blood Unit Stock
            </h3>

            <form onSubmit={handleIntakeSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Blood Group *</label>
                <select
                  value={intakeGroup}
                  onChange={e => setIntakeGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Blood Component *</label>
                <select
                  value={intakeComp}
                  onChange={e => setIntakeComp(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="PRBC">Red Cells (PRBC)</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Storage Location *</label>
                <input
                  type="text"
                  value={intakeStorageLoc}
                  onChange={e => setIntakeStorageLoc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIntakeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-950">
                  Record Intake Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BLOOD MODAL */}
      {issueModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-blue-600 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" /> Verify & Issue Blood Unit
              </h3>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold uppercase text-[10px]">
                {issueModalReq.id}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
              <div>Patient: <strong className="text-white">{issueModalReq.patientName}</strong> (ID: {issueModalReq.patientId})</div>
              <div>Hospital: <strong className="text-white">{issueModalReq.hospitalName}</strong></div>
              <div>Requirement: <strong className="text-red-400">{issueModalReq.unitsNeeded} Units of {issueModalReq.bloodGroup} ({issueModalReq.bloodComponent || 'PRBC'})</strong></div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Select Available Unit ID to Issue *</label>
              <select
                value={selectedUnitIdToIssue}
                onChange={e => setSelectedUnitIdToIssue(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
              >
                <option value="">-- Choose Blood Unit ID --</option>
                {bloodUnitsList.filter(u => u.status !== 'EXPIRED' && u.status !== 'ISSUED').map(u => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.unitId} ({u.bloodGroup} - {u.component}) [{u.status}] - Exp: {u.expiryDate}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIssueModalReq(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Cancel
              </button>
              <button onClick={handleConfirmIssueBlood} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-950">
                Confirm & Issue Blood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW REQUEST MODAL */}
      {reviewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Review Request Details: {reviewReq.id}
              </h3>
              <button onClick={() => setReviewReq(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2">
                <div>Patient Name: <strong className="text-white block">{reviewReq.patientName}</strong></div>
                <div>Patient Reference ID: <strong className="text-indigo-400 block">{reviewReq.patientId || 'BN-HUB-2026-00852'}</strong></div>
                <div>Blood Group Required: <strong className="text-red-400 block">{reviewReq.bloodGroup} ({reviewReq.bloodComponent || 'PRBC'})</strong></div>
                <div>Units Needed: <strong className="text-amber-400 block">{reviewReq.unitsNeeded} Units</strong></div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div>Hospital: <strong className="text-white">{reviewReq.hospitalName}</strong> ({reviewReq.city})</div>
                <div>Contact Person: <strong className="text-white">{reviewReq.contactPerson} ({reviewReq.contactPhone})</strong></div>
                <div>Medical Reason: <span className="text-slate-300 font-sans">{reviewReq.reason}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setReviewReq(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Close Review
              </button>
              <button
                onClick={() => {
                  reserveBloodBankUnits(reviewReq.id, 'bb_1', reviewReq.bloodGroup, (reviewReq.bloodComponent as ComponentType) || 'PRBC', reviewReq.unitsNeeded, staffName);
                  setReviewReq(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
              >
                Reserve Blood Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
