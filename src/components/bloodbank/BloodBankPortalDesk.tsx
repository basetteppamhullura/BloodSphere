import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, ComponentType, DetailedBloodUnit, BankNotificationItem, ImmutableActivityEntry } from '../../types';
import { socketManager } from '../../utils/socketManager';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import {
  Droplet,
  FileText,
  Package,
  FlaskConical,
  Lock,
  AlertTriangle,
  History,
  BarChart3,
  PlusCircle,
  Search,
  Check,
  XCircle,
  Send,
  Thermometer,
  Boxes,
  MapPin,
  Building2,
  Navigation,
  RefreshCw,
  Eye
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

export interface BloodBankPortalDeskProps {
  initialTab?: 'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'expiry' | 'alerts' | 'activity' | 'reports' | 'nearby';
}

export const BloodBankPortalDesk: React.FC<BloodBankPortalDeskProps> = () => {
  const location = useLocation();
  const params = useParams();

  const {
    requests,
    inventoryStockMap,
    bloodUnitsList,
    activityLogs,
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

  // Determine active tab dynamically from URL path
  const getActiveTabFromPath = (): 'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'expiry' | 'alerts' | 'activity' | 'reports' | 'nearby' => {
    const path = location.pathname;
    if (path.includes('/bloodbank/requests')) return 'queue';
    if (path.includes('/bloodbank/inventory')) return 'inventory';
    if (path.includes('/bloodbank/units')) return 'lifecycle';
    if (path.includes('/bloodbank/reservations')) return 'lifecycle';
    if (path.includes('/bloodbank/issue')) return 'lifecycle';
    if (path.includes('/bloodbank/alerts')) return 'alerts';
    if (path.includes('/bloodbank/activity')) return 'activity';
    if (path.includes('/bloodbank/reports')) return 'reports';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

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
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Blood<span className="text-emerald-600">Net</span> Operations Portal
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> REAL-TIME CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as: <strong>{staffName}</strong> • Live Database Synchronized
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => checkBloodUnitExpiries()}
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-amber-700 font-bold hover:bg-sky-100 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Scan Expiries
          </button>
          <button
            onClick={handleSetBankGPS}
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-bold hover:bg-sky-100 flex items-center gap-1.5 shrink-0"
          >
            <Navigation className="w-4 h-4" /> Bank GPS
          </button>
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Intake Stock
          </button>
        </div>
      </div>

      {/* OPERATIONS NAVIGATION SUB-BAR */}
      <div className="p-1.5 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplet className="w-4 h-4" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'queue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Requester Queue ({pendingRequestsCount})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory Table
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'lifecycle' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Unit Lifecycle
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'expiry' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Thermometer className="w-4 h-4" /> Expiry Management ({expiredUnitsCount})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'alerts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Stock Alerts ({lowStockGroupsList.length + criticalStockGroupsList.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'activity' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Immutable Log ({activityLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reports' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Reports & Analytics
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'nearby' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-red-500" /> Nearby Regional Institutions
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. REAL-TIME BLOOD BANK DASHBOARD                    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* DATABASE METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Total Blood Stock</span>
              <strong className="text-xl font-black text-slate-900 block">{totalBloodUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Available Units</span>
              <strong className="text-xl font-black text-emerald-600 block">{totalAvailableUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Reserved Units</span>
              <strong className="text-xl font-black text-indigo-600 block">{totalReservedUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Issued Units</span>
              <strong className="text-xl font-black text-sky-600 block">{totalIssuedUnits} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Expired Units</span>
              <strong className="text-xl font-black text-amber-600 block">{expiredUnitsCount} Units</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Emergency Requests</span>
              <strong className="text-xl font-black text-red-600 block">{emergencyRequestsCount} Critical</strong>
            </div>
          </div>

          {/* STOCK SUMMARY MATRIX TABLE BY BLOOD GROUP & COMPONENT */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" /> Blood Group Inventory Matrix & Stock Thresholds
              </h3>
              <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real-Time Database Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
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
                <tbody className="divide-y divide-sky-100 font-mono">
                  {Object.entries(inventoryStockMap).map(([group, comps]) => {
                    const prbcAvail = comps['PRBC']?.available || 0;
                    const wbAvail = comps['Whole Blood']?.available || 0;
                    const plasmaAvail = comps['Plasma (FFP)']?.available || 0;
                    const plateletsAvail = comps['Platelets (PRP)']?.available || 0;
                    const totalReserved = Object.values(comps).reduce((a, b) => a + b.reserved, 0);

                    const isCritical = prbcAvail <= 2;
                    const isLow = prbcAvail <= minStockThreshold;

                    return (
                      <tr key={group} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-black text-xs">
                            {group}
                          </span>
                          <span>{group}</span>
                        </td>
                        <td className={`py-3.5 px-4 font-black text-sm ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {prbcAvail} Units
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{wbAvail} Units</td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{plasmaAvail} Units</td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{plateletsAvail} Units</td>
                        <td className="py-3.5 px-4 text-indigo-700 font-bold">{totalReserved} Units</td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isCritical
                              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
      {/* 2. REAL-TIME REQUESTER QUEUE                         */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" /> Multi-Channel Requester Queue ({requesterQueue.length})
              </h3>
              <p className="text-slate-500 text-[11px]">Prioritized: CRITICAL → URGENT → NORMAL</p>
            </div>
          </div>

          <div className="space-y-3">
            {requesterQueue.length === 0 ? (
              <div className="p-8 rounded-2xl bg-sky-50/40 border border-sky-100 text-center text-slate-500">
                No active pending requests in Blood Bank queue. System will notify automatically when new requests arrive!
              </div>
            ) : (
              requesterQueue.map((req) => {
                const dupCheck = detectDuplicateRequests(req.patientId || '', req.bloodGroup, req.hospitalName);
                const isDup = dupCheck.isDuplicate && dupCheck.matchedReq?.id !== req.id;

                return (
                  <div key={req.id} className="p-5 rounded-3xl bg-white border border-sky-100 space-y-3 shadow-xs">
                    
                    {/* DUPLICATE WARNING BANNER */}
                    {isDup && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>⚠️ Possible Duplicate Request Detected:</strong> Identical Patient ID ({req.patientId}) found in active request {dupCheck.matchedReq?.id}.
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase text-[9px]">
                          Staff Review Required
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">{req.bloodGroup}</span>
                          <h4 className="font-extrabold text-slate-900 text-base">{req.patientName}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-50 text-sky-800 border border-sky-200">
                            Patient ID: {req.patientId || 'BN-HUB-2026-00852'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                            🚨 {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Hospital: <strong>{req.hospitalName}</strong> ({req.city}) • Contact: <strong>{req.contactPerson} ({req.contactPhone})</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setReviewReq(req)}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-600" /> Review
                        </button>

                        <button
                          onClick={() => reserveBloodBankUnits(req.id, 'bb_1', req.bloodGroup, (req.bloodComponent as ComponentType) || 'PRBC', req.unitsNeeded, staffName)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Reserve Stock ({req.unitsNeeded}u)
                        </button>

                        <button
                          onClick={() => setIssueModalReq(req)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" /> Issue Blood
                        </button>

                        <button
                          onClick={() => rejectBloodBankRequest(req.id, 'Incomplete documentation', staffName)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" /> Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Units Needed</span>
                        <strong>{req.unitsNeeded} Units ({req.bloodComponent || 'PRBC'})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Required Time</span>
                        <strong className="text-amber-600">{req.requiredTime || 'Within 2 Hours'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Created Time</span>
                        <span>{new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Current Status</span>
                        <span className="text-emerald-600 font-bold font-sans">{req.status.replace(/_/g, ' ')}</span>
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
      {/* 3. REAL-TIME INVENTORY TABLE                          */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Real-Time Detailed Blood Unit Inventory ({filteredBloodUnits.length})
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Unit ID / Donor Ref..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
                />
              </div>

              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                <option value="ALL">All Groups</option>
                {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Bombay Phenotype (O-h)"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
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
              <tbody className="divide-y divide-sky-100 font-mono">
                {filteredBloodUnits.map((unit) => (
                  <tr key={unit.unitId} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{unit.unitId}</td>
                    <td className="py-3.5 px-4 font-sans font-bold">
                      <span className="text-red-600">{unit.bloodGroup}</span> ({unit.component})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{unit.collectionDate}</td>
                    <td className={`py-3.5 px-4 font-bold ${unit.status === 'EXPIRED' ? 'text-red-600' : 'text-slate-700'}`}>
                      {unit.expiryDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-sans">{unit.storageLocation}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        unit.status === 'STORED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : unit.status === 'RESERVED'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : unit.status === 'ISSUED'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{unit.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" /> Intake New Blood Unit Stock
            </h3>

            <form onSubmit={handleIntakeSubmit} className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Blood Group *</label>
                <select
                  value={intakeGroup}
                  onChange={e => setIntakeGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Blood Component *</label>
                <select
                  value={intakeComp}
                  onChange={e => setIntakeComp(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="PRBC">Red Cells (PRBC)</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Storage Location *</label>
                <input
                  type="text"
                  value={intakeStorageLoc}
                  onChange={e => setIntakeStorageLoc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIntakeModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20">
                  Record Intake Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
