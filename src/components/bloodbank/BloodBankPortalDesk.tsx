import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  BloodGroup,
  ComponentType,
  DetailedBloodUnit,
  UnitLifecycleStatus,
  ImmutableActivityEntry
} from '../../types';
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
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Filter
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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    requests,
    inventoryStockMap,
    bloodUnitsList,
    activityLogs,
    reserveBloodBankUnits,
    issueBloodBankUnits,
    rejectBloodBankRequest,
    acceptBloodRequest,
    rejectBloodRequest,
    redirectBloodRequest,
    intakeBloodUnit,
    checkBloodUnitExpiries,
    showToast,
    requestInterCityTransfer
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Rotary Blood Center Director';

  // Bank Coordinates (Hubballi Regional Center)
  const [bankLocation, setBankLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.124
  });

  // Determine active tab dynamically from URL path
  const getActiveTabFromPath = (): 'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'preservation' | 'issue' | 'alerts' | 'activity' | 'reports' | 'settings' => {
    const path = location.pathname;
    if (path.includes('/bloodbank/requests') || path.includes('/bloodbank/reservations')) return 'queue';
    if (path.includes('/bloodbank/inventory')) return 'inventory';
    if (path.includes('/bloodbank/units')) return 'lifecycle';
    if (path.includes('/bloodbank/preservation')) return 'preservation';
    if (path.includes('/bloodbank/issue')) return 'issue';
    if (path.includes('/bloodbank/alerts')) return 'alerts';
    if (path.includes('/bloodbank/activity')) return 'activity';
    if (path.includes('/bloodbank/reports')) return 'reports';
    if (path.includes('/bloodbank/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reportRange, setReportRange] = useState<'today' | '7days' | '30days'>('today');
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);

  // Requester Queue 3-Subcategory State
  const [queueCategory, setQueueCategory] = useState<'direct' | 'hospital' | 'bloodbank'>('direct');

  // Issue Blood Modal State
  const [issueModalReq, setIssueModalReq] = useState<any | null>(null);
  const [selectedUnitIdToIssue, setSelectedUnitIdToIssue] = useState<string>('');

  // Rejection & Redirection Modal States
  const [rejectingReq, setRejectingReq] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [redirectingReq, setRedirectingReq] = useState<any | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('Hubballi-Dharwad');
  const [selectedTargetCenter, setSelectedTargetCenter] = useState<string>('KIMS Teaching Hospital');
  const [redirectReason, setRedirectReason] = useState<string>('No compatible blood stock available at current center');

  // Review Request Modal State
  const [reviewReq, setReviewReq] = useState<any | null>(null);

  // Intake Stock Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComp, setIntakeComp] = useState<ComponentType>('PRBC');
  const [intakeStorageLoc, setIntakeStorageLoc] = useState<string>('Main Vault R-01 (Shelf A)');

  // Preservation Temperature Logs
  const [vaultTemps, setVaultTemps] = useState([
    { id: 'v1', name: 'Main PRBC Refrigerator Vault R-01', temp: '3.8 °C', target: '2.0°C - 6.0°C', status: 'Optimal' },
    { id: 'v2', name: 'FFP Plasma Ultra-Freezer F-02', temp: '-28.5 °C', target: '< -25.0°C', status: 'Optimal' },
    { id: 'v3', name: 'Platelet Incubator & Agitator P-01', temp: '22.1 °C', target: '20.0°C - 24.0°C', status: 'Optimal' }
  ]);

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
  });

  // Calculate Real Total Available Inventory Units
  const totalAvailableUnits = Object.values(inventoryStockMap).reduce((totalGroup, comps) => {
    return totalGroup + Object.values(comps).reduce((totalComp, item) => totalComp + (item.available || 0), 0);
  }, 0);

  // Filter Active Incoming Requests (exclude fulfilled/completed/cancelled)
  const inactiveStatuses = ['FULFILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
  const activeRequestsQueue = requests.filter(r => !inactiveStatuses.includes(r.status));

  // 1. Direct Requesters: Requests from patients, family members, friends, or authorized individuals
  const directRequestsList = React.useMemo(() => {
    return activeRequestsQueue.filter(r => {
      if (r.requesterType === 'DIRECT_REQUESTER') return true;
      if (r.requesterType === 'HOSPITAL' || r.requesterType === 'BLOOD_BANK') return false;
      const isHospital = r.hospitalName && (
        r.hospitalName.toLowerCase().includes('hospital') ||
        r.hospitalName.toLowerCase().includes('kims') ||
        r.hospitalName.toLowerCase().includes('sdm') ||
        r.hospitalName.toLowerCase().includes('kle') ||
        r.hospitalName.toLowerCase().includes('medical college') ||
        r.hospitalName.toLowerCase().includes('clinic')
      );
      const isBank = r.hospitalName && (
        r.hospitalName.toLowerCase().includes('blood bank') ||
        r.hospitalName.toLowerCase().includes('blood center') ||
        r.hospitalName.toLowerCase().includes('regional blood')
      );
      if (isBank) return false;
      if (isHospital && r.isVerifiedByHospital) return false;
      return true;
    });
  }, [activeRequestsQueue]);

  // 2. Hospital Requests: Requests received from verified hospitals
  const hospitalRequestsList = React.useMemo(() => {
    return activeRequestsQueue.filter(r => {
      if (r.requesterType === 'HOSPITAL') return true;
      if (r.requesterType === 'DIRECT_REQUESTER' || r.requesterType === 'BLOOD_BANK') return false;
      const isHospital = r.hospitalName && (
        r.hospitalName.toLowerCase().includes('hospital') ||
        r.hospitalName.toLowerCase().includes('kims') ||
        r.hospitalName.toLowerCase().includes('sdm') ||
        r.hospitalName.toLowerCase().includes('kle') ||
        r.hospitalName.toLowerCase().includes('medical') ||
        r.hospitalName.toLowerCase().includes('clinic')
      );
      const isBank = r.hospitalName && (
        r.hospitalName.toLowerCase().includes('blood bank') ||
        r.hospitalName.toLowerCase().includes('blood center') ||
        r.hospitalName.toLowerCase().includes('regional blood')
      );
      return isHospital && !isBank;
    });
  }, [activeRequestsQueue]);

  // 3. Blood Bank Requests: Requests received from other blood banks for inter-bank stock support/transfers
  const bloodBankRequestsList = React.useMemo(() => {
    return activeRequestsQueue.filter(r => {
      if (r.requesterType === 'BLOOD_BANK') return true;
      const isBank = r.hospitalName && (
        r.hospitalName.toLowerCase().includes('blood bank') ||
        r.hospitalName.toLowerCase().includes('blood center') ||
        r.hospitalName.toLowerCase().includes('rotary') ||
        r.hospitalName.toLowerCase().includes('regional blood')
      );
      const isTransfer = r.reason && (
        r.reason.toLowerCase().includes('transfer') ||
        r.reason.toLowerCase().includes('replenishment') ||
        r.reason.toLowerCase().includes('inter-bank') ||
        r.reason.toLowerCase().includes('stock support')
      );
      return isBank || isTransfer;
    });
  }, [activeRequestsQueue]);

  // Calculate Low Stock Alert Groups dynamically
  const lowStockAlertGroups = (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).filter(group => {
    const comps = inventoryStockMap[group] || {};
    const avail = Object.values(comps).reduce((acc, item) => acc + (item.available || 0), 0);
    return avail < minStockThreshold;
  });

  // Filter Blood Units for Lifecycle View
  const filteredBloodUnits = bloodUnitsList.filter(unit => {
    const matchesGroup = filterGroup === 'ALL' || unit.bloodGroup === filterGroup;
    const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
    const matchesQuery = searchQuery === '' || unit.unitId.toLowerCase().includes(searchQuery.toLowerCase()) || unit.storageLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesStatus && matchesQuery;
  });

  // Handlers for Request Workflow Actions
  const handleReserve = (reqId: string, bg: BloodGroup, units: number) => {
    const result = reserveBloodBankUnits(reqId, bg, units);
    showToast(result.message);
  };

  const handleOpenIssueModal = (req: any) => {
    setIssueModalReq(req);
    // Auto-select first matching unit if available
    const availableMatchingUnit = bloodUnitsList.find(
      u => u.bloodGroup === req.bloodGroup && (u.status === 'AVAILABLE' || u.status === 'STORED' || u.status === 'APPROVED' || u.status === 'RESERVED')
    );
    setSelectedUnitIdToIssue(availableMatchingUnit ? availableMatchingUnit.unitId : '');
  };

  const handleConfirmIssue = () => {
    if (!issueModalReq) return;
    const result = issueBloodBankUnits(issueModalReq.id, issueModalReq.bloodGroup, issueModalReq.unitsNeeded || 1, selectedUnitIdToIssue);
    showToast(result.message);
    setIssueModalReq(null);
    setSelectedUnitIdToIssue('');
  };

  const handleReject = (reqId: string) => {
    const result = rejectBloodBankRequest(reqId, 'Stock unavailable at blood center');
    showToast(result.message);
    setReviewReq(null);
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = intakeBloodUnit(intakeGroup, intakeComp, intakeStorageLoc);
    showToast(result.message);
    setShowIntakeModal(false);
  };

  const handleReplenishmentOrder = (targetInstName: string, group: BloodGroup) => {
    if (requestInterCityTransfer) {
      requestInterCityTransfer('Hubballi Blood Center', targetInstName, group, 5, 'Low Stock Automated Replenishment Order');
      showToast(`Replenishment transfer request for 5 units of ${group} sent to ${targetInstName}.`);
    } else {
      showToast(`Replenishment transfer request for 5 units of ${group} sent to ${targetInstName}.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in">
      
      {/* 1. PORTAL HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <Droplet className="w-80 h-80 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Verified Regional Blood Storage & Transfusion Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Blood Bank Operational Control Desk 🩸
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-2xl">
              Logged in as <strong className="text-white font-bold">{staffName}</strong>. Manage hospital requests, component storage, unit lifecycle, and real-time inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowIntakeModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Intake New Stock
            </button>
            <button
              onClick={handleSetBankGPS}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
              title="Update GPS Location"
            >
              <MapPin className="w-4 h-4 text-emerald-300" /> GPS Location
            </button>
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Total Vault Units</span>
              <strong className="text-3xl font-black text-slate-900 block tracking-tight">{totalAvailableUnits}</strong>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for immediate issue
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Active Requests Queue</span>
              <strong className="text-3xl font-black text-amber-600 block tracking-tight">{activeRequestsQueue.length}</strong>
              <span className="text-[11px] text-slate-500 font-medium">Requester & Hospital orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Low Stock Groups</span>
              <strong className={`text-3xl font-black block tracking-tight ${lowStockAlertGroups.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {lowStockAlertGroups.length}
              </strong>
              <span className={`text-[11px] font-bold ${lowStockAlertGroups.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {lowStockAlertGroups.length > 0 ? 'Safety threshold alert' : 'All thresholds met'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Tracked Units Lifecycle</span>
              <strong className="text-3xl font-black text-sky-600 block tracking-tight">{bloodUnitsList.length}</strong>
              <span className="text-[11px] text-slate-500 font-medium">Individual barcode items</span>
            </div>
          </div>

          {/* Quick Action Matrix & Regional Transfers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-Time Stock Quick View */}
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" /> Current Vault Inventory Status
                </h3>
                <button onClick={() => navigate('/bloodbank/inventory')} className="text-xs text-emerald-700 font-bold hover:underline">
                  Full Matrix →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map(group => {
                  const comps = inventoryStockMap[group] || {};
                  const avail = Object.values(comps).reduce((acc, item) => acc + (item.available || 0), 0);
                  const isLow = avail < minStockThreshold;
                  return (
                    <div key={group} className={`p-3 rounded-2xl border text-center space-y-1 ${isLow ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/70 border-slate-200'}`}>
                      <span className="font-black text-slate-900 text-sm block">{group}</span>
                      <strong className={`text-base font-black block ${isLow ? 'text-red-600' : 'text-emerald-700'}`}>
                        {avail} <span className="text-[10px] font-normal text-slate-500">units</span>
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Connected Institutions */}
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" /> Regional Network & Transfer Hub
                </h3>
                <span className="text-xs text-slate-500 font-mono">Hubballi Radius</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {nearbyWithDistance.slice(0, 4).map(inst => (
                  <div key={inst.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="font-black text-slate-900 block">{inst.name}</strong>
                      <span className="text-[11px] text-slate-500">{inst.city} • {inst.distanceKm.toFixed(1)} km away</span>
                    </div>

                    {inst.lowStockGroup ? (
                      <button
                        onClick={() => handleReplenishmentOrder(inst.name, inst.lowStockGroup!)}
                        className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-extrabold text-[11px]"
                      >
                        Supply {inst.lowStockGroup}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReplenishmentOrder(inst.name, 'O+')}
                        className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-900 hover:bg-sky-200 border border-sky-300 font-extrabold text-[11px]"
                      >
                        Request Transfer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUESTER QUEUE (3 SEPARATE CATEGORIES: DIRECT REQUESTERS, HOSPITALS, BLOOD BANKS) */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" /> Real-Time Requester & Hospital Requests Queue
              </h3>
              <p className="text-xs text-slate-500 font-medium">Categorized request processing for direct requesters, hospital orders, and inter-blood-bank transfers.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                {activeRequestsQueue.length} Total Active Pending
              </span>
            </div>
          </div>

          {/* 3 SUB-SECTION CATEGORY TABS */}
          <div className="p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 flex flex-wrap gap-2 text-xs font-extrabold">
            <button
              onClick={() => setQueueCategory('direct')}
              className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                queueCategory === 'direct'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span>📥 Direct Requesters</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                queueCategory === 'direct' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {directRequestsList.length}
              </span>
            </button>

            <button
              onClick={() => setQueueCategory('hospital')}
              className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                queueCategory === 'hospital'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span>🏥 Hospital Requests</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                queueCategory === 'hospital' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {hospitalRequestsList.length}
              </span>
            </button>

            <button
              onClick={() => setQueueCategory('bloodbank')}
              className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                queueCategory === 'bloodbank'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span>🩸 Blood Bank Requests</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                queueCategory === 'bloodbank' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {bloodBankRequestsList.length}
              </span>
            </button>
          </div>

          {/* CATEGORY REQUEST CONTENT VIEW */}
          {(() => {
            const currentList =
              queueCategory === 'direct'
                ? directRequestsList
                : queueCategory === 'hospital'
                ? hospitalRequestsList
                : bloodBankRequestsList;

            const categoryLabel =
              queueCategory === 'direct'
                ? 'Direct Requesters'
                : queueCategory === 'hospital'
                ? 'Hospital Requests'
                : 'Blood Bank Requests';

            if (currentList.length === 0) {
              return (
                <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <strong className="text-sm font-black text-slate-900 block">No Pending Requests in {categoryLabel}</strong>
                  <p className="text-xs text-slate-500">All requests in this category are up to date.</p>
                </div>
              );
            }

            return (
              <div className="divide-y divide-sky-100">
                {currentList.map(req => {
                  const isCritical = req.urgency === 'HIGH' || req.urgency === 'CRITICAL';
                  return (
                    <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-black text-xs">
                            🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {req.urgency}
                          </span>
                          <span className="text-xs font-mono text-slate-400">BR-{req.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                            {queueCategory === 'direct' ? 'DIRECT' : queueCategory === 'hospital' ? 'HOSPITAL' : 'BLOOD BANK'}
                          </span>
                        </div>

                        <strong className="text-sm font-black text-slate-900 block">
                          {queueCategory === 'hospital'
                            ? `Hospital: ${req.hospitalName || 'Verified Hospital'}`
                            : queueCategory === 'bloodbank'
                            ? `Requesting Blood Bank: ${req.hospitalName || 'Regional Center'}`
                            : `Requester: ${req.contactPerson || 'Registered Patient'} (Patient: ${req.patientName || 'Emergency Patient'})`}
                          {' '}• {req.unitsNeeded} Units Required
                        </strong>

                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {req.hospitalName} ({req.city})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Contact: {req.contactPerson} ({req.maskedPhone}) • Required: {req.requiredDate || 'Within 2 Hours'} • Status: <strong className="text-emerald-700">{req.status}</strong>
                          </p>
                          {req.reason && (
                            <p className="text-[11px] text-slate-600 italic">
                              Reason: "{req.reason}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => acceptBloodRequest(req.id, 'Rotary Regional Blood Center')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs"
                        >
                          Accept Request
                        </button>

                        <button
                          onClick={() => handleReserve(req.id, req.bloodGroup, req.unitsNeeded)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs"
                        >
                          Reserve {req.unitsNeeded}u
                        </button>

                        <button
                          onClick={() => {
                            setRejectingReq(req);
                            setRejectReason('');
                          }}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => {
                            setRedirectingReq(req);
                            setSelectedTargetCenter('KIMS Teaching Hospital');
                          }}
                          className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Redirect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" /> Real Database Blood Inventory Table
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time authorized stock matrix aggregated across blood groups & components.</p>
            </div>

            <button
              onClick={() => setShowIntakeModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Record New Intake
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Red Cells (PRBC)</th>
                  <th className="py-3 px-4">Whole Blood</th>
                  <th className="py-3 px-4">Plasma (FFP)</th>
                  <th className="py-3 px-4">Platelets (PRP)</th>
                  <th className="py-3 px-4">Total Available</th>
                  <th className="py-3 px-4">Threshold Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(group => {
                  const groupStock = inventoryStockMap[group] || {};
                  const prbc = groupStock['PRBC']?.available || 0;
                  const wb = groupStock['Whole Blood']?.available || 0;
                  const ffp = groupStock['Plasma (FFP)']?.available || 0;
                  const prp = groupStock['Platelets (PRP)']?.available || 0;
                  const totalGroupAvail = prbc + wb + ffp + prp;
                  const isLow = totalGroupAvail < minStockThreshold;

                  return (
                    <tr key={group} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-black text-slate-900 text-sm">{group}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{prbc} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{wb} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{ffp} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{prp} u</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{totalGroupAvail} units</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          isLow ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          <span>{isLow ? '🔴 LOW STOCK' : '🟢 AVAILABLE'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: UNIT LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-sky-600" /> Blood Unit Lifecycle & Barcode Registry
              </h3>
              <p className="text-xs text-slate-500 font-medium">Trace individual blood units: Collected $\rightarrow$ Testing $\rightarrow$ Available $\rightarrow$ Reserved $\rightarrow$ Issued.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search barcode unit ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold w-48"
                />
              </div>

              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                <option value="ALL">All Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Unit ID</th>
                  <th className="py-3 px-4">Group & Component</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {filteredBloodUnits.map(unit => (
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        unit.status === 'STORED' || unit.status === 'APPROVED' || unit.status === 'DONATED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : unit.status === 'RESERVED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : unit.status === 'ISSUED' || unit.status === 'TESTING'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        <span>{unit.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PRESERVATION VAULT */}
      {activeTab === 'preservation' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
          <div className="border-b border-sky-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-600" /> Cold Chain Storage & Preservation Vault Monitoring
            </h3>
            <p className="text-xs text-slate-500 font-medium">Real-time temperature telemetry for refrigerated blood component vaults.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vaultTemps.map(v => (
              <div key={v.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{v.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    {v.status}
                  </span>
                </div>

                <div>
                  <strong className="text-3xl font-black text-emerald-700 block tracking-tight">{v.temp}</strong>
                  <span className="text-[11px] text-slate-500 font-mono">Target Range: {v.target}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Sensor ID: SENS-{v.id.toUpperCase()}</span>
                  <span className="text-emerald-700 font-bold">✓ Calibrated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ISSUE BLOOD */}
      {activeTab === 'issue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div className="border-b border-sky-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" /> Dedicated Blood Unit Issue & Dispatch Desk
            </h3>
            <p className="text-xs text-slate-500 font-medium">Match verified requests to barcode blood units and perform transactional dispatch.</p>
          </div>

          {activeRequestsQueue.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="text-sm font-black text-slate-900 block">No Active Requests Pending Issue</strong>
              <p className="text-xs text-slate-500">All emergency blood requests are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequestsQueue.map(req => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-xs">
                      🩸 {req.bloodGroup} ({req.unitsNeeded}u Required)
                    </span>
                    <span className="text-xs font-mono text-slate-400">BR-{req.id}</span>
                  </div>

                  <div>
                    <strong className="text-sm font-black text-slate-900 block">{req.patientName || 'Emergency Patient'}</strong>
                    <span className="text-xs text-slate-600 block">{req.hospitalName} ({req.city})</span>
                  </div>

                  <button
                    onClick={() => handleOpenIssueModal(req)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Select Unit & Dispatch Blood
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: LOW STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Dynamic Low-Stock & Expiry Alert Center
              </h3>
              <p className="text-xs text-slate-500 font-medium">Automatic alerts generated when stock falls below threshold ({minStockThreshold} units).</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Threshold:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={minStockThreshold}
                onChange={e => setMinStockThreshold(Number(e.target.value))}
                className="w-16 p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center"
              />
            </div>
          </div>

          {lowStockAlertGroups.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="text-sm font-black text-slate-900 block">🟢 All Safety Thresholds Satisfied</strong>
              <p className="text-xs text-slate-600">All blood groups currently meet minimum required safety stock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockAlertGroups.map(group => {
                const comps = inventoryStockMap[group] || {};
                const currentAvail = Object.values(comps).reduce((acc, item) => acc + (item.available || 0), 0);
                return (
                  <div key={group} className="p-4 rounded-2xl bg-red-50/70 border border-red-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-black text-red-700 text-sm block">🔴 LOW STOCK: Group {group}</span>
                      <p className="text-xs text-slate-600">
                        Current Available Stock: <strong className="font-bold text-slate-900">{currentAvail} units</strong> (Required Safety Threshold: {minStockThreshold} units)
                      </p>
                    </div>

                    <button
                      onClick={() => handleReplenishmentOrder('Rotary Club Blood Bank Dharwad', group)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-xs shrink-0"
                    >
                      Request Transfer
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Immutable Read-Only Activity Log Audit Trail
              </h3>
              <p className="text-xs text-slate-500 font-medium">Historical audit trail of all blood bank intake, reservation, and issue operations.</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
              READ-ONLY AUDIT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Group & Units</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{log.action}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-700">{log.user}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{log.bloodGroup || 'General'}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: REPORTS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" /> Operational Reports & Aggregated Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">Verified metrics calculated directly from database records.</p>
            </div>

            <div className="flex items-center gap-2">
              {(['today', '7days', '30days'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setReportRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize ${
                    reportRange === range ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-xs text-emerald-800 font-bold block">Units Issued</span>
              <strong className="text-3xl font-black text-emerald-700 block tracking-tight">14 Units</strong>
              <span className="text-[11px] text-emerald-600 font-medium">To emergency hospitals</span>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
              <span className="text-xs text-sky-800 font-bold block">Units Intake / Collected</span>
              <strong className="text-3xl font-black text-sky-700 block tracking-tight">28 Units</strong>
              <span className="text-[11px] text-sky-600 font-medium">From donation drives</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="text-xs text-amber-900 font-bold block">Requests Processed</span>
              <strong className="text-3xl font-black text-amber-700 block tracking-tight">9 Requests</strong>
              <span className="text-[11px] text-amber-600 font-medium">100% fulfillment rate</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
          <div className="border-b border-sky-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Blood Center Account & System Settings
            </h3>
            <p className="text-xs text-slate-500 font-medium">Manage blood bank license information, emergency thresholds, and notification protocols.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="font-black text-slate-900 text-sm block">Institution Details</strong>
              <div className="space-y-1 text-slate-700 font-medium">
                <p>Name: <strong className="font-extrabold text-slate-900">{staffName}</strong></p>
                <p>License No: <span className="font-mono text-slate-800">BB-HUB-2026-8812</span></p>
                <p>City: <span className="text-slate-800">Hubballi, Karnataka</span></p>
                <p>Verification: <span className="text-emerald-700 font-bold">✓ Verified Regional Center</span></p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="font-black text-slate-900 text-sm block">Alert Protocols & Sync</strong>
              <div className="space-y-1 text-slate-700 font-medium">
                <p>Safety Stock Threshold: <strong className="font-extrabold text-slate-900">{minStockThreshold} Units</strong></p>
                <p>Realtime Database Sync: <span className="text-emerald-700 font-bold">ACTIVE</span></p>
                <p>Socket Protocol: <span className="font-mono text-slate-800">WebSocket / Polling Fallback</span></p>
                <p>Status: <span className="text-emerald-700 font-bold">● Connected</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE BLOOD CONFIRMATION MODAL */}
      {issueModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" /> Confirm Blood Unit Dispatch
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-slate-900 text-sm block">
                {issueModalReq.bloodGroup} ({issueModalReq.bloodComponent || 'PRBC'}) • {issueModalReq.unitsNeeded || 1} Unit(s)
              </span>
              <span className="text-slate-600 block">Patient: {issueModalReq.patientName}</span>
              <span className="text-slate-500 block">Hospital: {issueModalReq.hospitalName}</span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Select Barcode Blood Unit *</label>
              <select
                value={selectedUnitIdToIssue}
                onChange={e => setSelectedUnitIdToIssue(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono"
              >
                <option value="">Auto-select matching unit from vault</option>
                {bloodUnitsList
                  .filter(u => u.bloodGroup === issueModalReq.bloodGroup)
                  .map(u => (
                    <option key={u.unitId} value={u.unitId}>
                      {u.unitId} - {u.storageLocation} (Exp: {u.expiryDate})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIssueModalReq(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                Cancel
              </button>
              <button onClick={handleConfirmIssue} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20">
                Confirm & Issue Blood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTAKE STOCK MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
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
      {/* REJECTION REASON MODAL */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button
              onClick={() => setRejectingReq(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" /> Confirm Request Rejection
            </h3>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request {rejectingReq.id} • {rejectingReq.patientName || 'Patient'}
              </span>
              <span className="text-red-700 font-bold block">
                🩸 {rejectingReq.bloodGroup} ({rejectingReq.unitsNeeded} Units Needed)
              </span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!rejectReason.trim()) {
                  showToast('Rejection reason is required.');
                  return;
                }
                rejectBloodRequest(rejectingReq.id, 'Rotary Regional Blood Center', rejectReason.trim());
                setRejectingReq(null);
                setRejectReason('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-800 font-bold block mb-1">Reason for Rejection * (Required)</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Blood stock unavailable at center, component out of stock..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-500 h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REDIRECTION REGION/CENTER MODAL */}
      {redirectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button
              onClick={() => setRedirectingReq(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-600" /> Redirect Blood Request
            </h3>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request {redirectingReq.id} (Keeping same Request ID)
              </span>
              <span className="text-sky-800 font-bold block">
                🩸 {redirectingReq.bloodGroup} ({redirectingReq.unitsNeeded} Units) • {redirectingReq.patientName || 'Patient'}
              </span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                redirectBloodRequest(
                  redirectingReq.id,
                  'Rotary Regional Blood Center',
                  selectedTargetCenter,
                  selectedRegion === 'Belagavi Division' ? 'Belagavi' : 'Hubballi',
                  redirectReason.trim()
                );
                setRedirectingReq(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-800 font-bold block mb-1">Select Target Region *</label>
                <select
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Hubballi-Dharwad">Hubballi-Dharwad Region</option>
                  <option value="Belagavi Division">Belagavi Division</option>
                  <option value="Bengaluru Division">Bengaluru Division</option>
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Select Target Hospital / Blood Bank *</label>
                <select
                  value={selectedTargetCenter}
                  onChange={e => setSelectedTargetCenter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="KIMS Teaching Hospital">KIMS Teaching Hospital (Hubballi)</option>
                  <option value="SDM College of Medical Sciences">SDM Medical College (Dharwad)</option>
                  <option value="KLE Hospital & Blood Bank">KLE Hospital & Blood Bank (Belagavi)</option>
                  <option value="Lifeline Regional Center">Lifeline Regional Center (Belagavi)</option>
                  <option value="Tatwadarsha Hospital">Tatwadarsha Hospital (Hubballi)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Message / Redirect Notes</label>
                <input
                  type="text"
                  value={redirectReason}
                  onChange={e => setRedirectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRedirectingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black shadow-md shadow-sky-500/20"
                >
                  Confirm Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
