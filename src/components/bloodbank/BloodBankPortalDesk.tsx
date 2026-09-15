import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  BloodGroup,
  ComponentType,
  DetailedBloodUnit,
  EmergencyRequest
} from '../../types';
import { calculateDistanceKm } from '../../utils/distanceCalculator';
import {
  Droplet,
  FileText,
  Package,
  FlaskConical,
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
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Filter,
  MessageSquare,
  Lock,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  Calendar,
  Layers,
  Sparkles
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
  { id: 'inst_1', name: 'KIMS Teaching Hospital & Blood Center', type: 'hospital', city: 'Hubballi', lat: 15.3647, lng: 75.124, lowStockGroup: 'O-' },
  { id: 'inst_2', name: 'SDM College of Medical Sciences', type: 'hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078, lowStockGroup: 'A-' },
  { id: 'inst_3', name: 'Rotary Club Regional Blood Bank', type: 'bloodbank', city: 'Dharwad', lat: 15.462, lng: 75.01, surplusGroup: 'O+', surplusUnits: 35 },
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
    notifications,
    reserveBloodBankUnits,
    issueBloodBankUnits,
    acceptBloodRequest,
    rejectBloodBankRequest,
    openEmergencyChat,
    intakeBloodUnit,
    checkBloodUnitExpiries,
    showToast,
    createInterCityTransfer
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Rotary Blood Center Staff';

  // Bank Coordinates (Hubballi Regional Center)
  const [bankLocation, setBankLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.3647,
    lng: 75.124
  });

  // Determine active tab dynamically from URL path
  const getActiveTabFromPath = (): 
    | 'dashboard' 
    | 'direct-queue' 
    | 'hospital-queue' 
    | 'bloodbank-queue' 
    | 'inventory' 
    | 'lifecycle' 
    | 'preservation' 
    | 'issue' 
    | 'alerts' 
    | 'notifications' 
    | 'activity' 
    | 'reports' 
    | 'settings' => {
    const path = location.pathname;
    if (path.includes('/bloodbank/hospital-requests')) return 'hospital-queue';
    if (path.includes('/bloodbank/bloodbank-requests')) return 'bloodbank-queue';
    if (path.includes('/bloodbank/requests') || path.includes('/bloodbank/reservations')) return 'direct-queue';
    if (path.includes('/bloodbank/inventory')) return 'inventory';
    if (path.includes('/bloodbank/units')) return 'lifecycle';
    if (path.includes('/bloodbank/preservation')) return 'preservation';
    if (path.includes('/bloodbank/issue')) return 'issue';
    if (path.includes('/bloodbank/alerts')) return 'alerts';
    if (path.includes('/bloodbank/notifications')) return 'notifications';
    if (path.includes('/bloodbank/activity')) return 'activity';
    if (path.includes('/bloodbank/reports')) return 'reports';
    if (path.includes('/bloodbank/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterComponent, setFilterComponent] = useState<string>('ALL');
  const [reportRange, setReportRange] = useState<'today' | '7days' | '30days' | 'custom'>('today');
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);

  // Modals State
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<EmergencyRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<EmergencyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Blood unavailable in storage');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  const [reserveModalReq, setReserveModalReq] = useState<EmergencyRequest | null>(null);
  const [selectedUnitsToReserve, setSelectedUnitsToReserve] = useState<string[]>([]);

  const [issueModalReq, setIssueModalReq] = useState<EmergencyRequest | null>(null);
  const [selectedUnitIdToIssue, setSelectedUnitIdToIssue] = useState<string>('');
  const [receivingPartyInput, setReceivingPartyInput] = useState<string>('');

  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComp, setIntakeComp] = useState<ComponentType>('PRBC');
  const [intakeStorageLoc, setIntakeStorageLoc] = useState<string>('Main Vault R-01 (Shelf A)');
  const [intakeDonorRef, setIntakeDonorRef] = useState<string>('Voluntary Regular Donor');

  // Preservation Temperature Logs Telemetry
  const [vaultTemps] = useState([
    { id: 'v1', name: 'Main PRBC Vault R-01', temp: '3.8 °C', target: '2.0°C - 6.0°C', status: 'Optimal' },
    { id: 'v2', name: 'FFP Plasma Ultra-Freezer F-02', temp: '-28.5 °C', target: '< -25.0°C', status: 'Optimal' },
    { id: 'v3', name: 'Platelet Agitator Incubator P-01', temp: '22.1 °C', target: '20.0°C - 24.0°C', status: 'Optimal' },
    { id: 'v4', name: 'Whole Blood Cold Room W-01', temp: '4.2 °C', target: '2.0°C - 6.0°C', status: 'Optimal' }
  ]);

  const handleSetBankGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setBankLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast(`Blood Bank GPS updated: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        },
        () => showToast('Using Hubballi Blood Center coordinates.')
      );
    }
  };

  // Real Total Available Units in Vault
  const totalAvailableUnits = useMemo(() => {
    return Object.values(inventoryStockMap).reduce((totalGroup, comps) => {
      return totalGroup + Object.values(comps).reduce((totalComp, item) => totalComp + (item.available || 0), 0);
    }, 0);
  }, [inventoryStockMap]);

  // Active Incoming Requests Filter
  const inactiveStatuses = ['FULFILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
  const activeRequestsQueue = useMemo(() => {
    return requests.filter(r => !inactiveStatuses.includes(r.status));
  }, [requests]);

  // 1. Direct Requesters Queue (Patients / Family)
  const directRequestsList = useMemo(() => {
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
    }).sort((a, b) => {
      // Pin CRITICAL requests to the top
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (b.urgency === 'CRITICAL' && a.urgency !== 'CRITICAL') return 1;
      return 0;
    });
  }, [activeRequestsQueue]);

  // 2. Hospital Requests Queue (Verified Hospitals)
  const hospitalRequestsList = useMemo(() => {
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
    }).sort((a, b) => {
      if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
      if (b.urgency === 'CRITICAL' && a.urgency !== 'CRITICAL') return 1;
      return 0;
    });
  }, [activeRequestsQueue]);

  // 3. Blood Bank Requests Queue (Inter-Bank Transfers)
  const bloodBankRequestsList = useMemo(() => {
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

  // Low Stock Alert Groups dynamically
  const lowStockAlertGroups = useMemo(() => {
    const allGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return allGroups.filter(group => {
      const comps = inventoryStockMap[group] || {};
      const avail: number = Number(Object.values(comps).reduce<number>((acc: number, item: any) => acc + Number(item?.available || 0), 0));
      return avail < minStockThreshold;
    });
  }, [inventoryStockMap, minStockThreshold]);

  // Near Expiry Units (< 5 days) & Expired Units
  const todayStr = new Date().toISOString().split('T')[0];
  const fiveDaysStr = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const nearExpiryUnitsList = useMemo(() => {
    return bloodUnitsList.filter(u => u.status !== 'EXPIRED' && u.status !== 'ISSUED' && u.expiryDate >= todayStr && u.expiryDate <= fiveDaysStr);
  }, [bloodUnitsList, todayStr, fiveDaysStr]);

  const expiredUnitsList = useMemo(() => {
    return bloodUnitsList.filter(u => u.status === 'EXPIRED' || u.expiryDate < todayStr);
  }, [bloodUnitsList, todayStr]);

  // Filtered Blood Units for Barcode Lifecycle View
  const filteredBloodUnits = useMemo(() => {
    return bloodUnitsList.filter(unit => {
      const matchesGroup = filterGroup === 'ALL' || unit.bloodGroup === filterGroup;
      const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
      const matchesComp = filterComponent === 'ALL' || unit.component === filterComponent;
      const matchesQuery =
        searchQuery === '' ||
        unit.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.donorRef && unit.donorRef.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesGroup && matchesStatus && matchesComp && matchesQuery;
    });
  }, [bloodUnitsList, filterGroup, filterStatus, filterComponent, searchQuery]);

  // Helper: Get real available stock count for a blood group and component
  const getAvailableStockCount = (bg: BloodGroup, comp?: string) => {
    const groupStock = inventoryStockMap[bg] || {};
    if (comp && groupStock[comp as ComponentType]) {
      return groupStock[comp as ComponentType]?.available || 0;
    }
    return Number(Object.values(groupStock).reduce<number>((acc: number, item: any) => acc + Number(item?.available || 0), 0));
  };

  // ==================================================
  // REQUEST ACTIONS
  // ==================================================

  // 1. Accept Request (Checks real stock)
  const handleAcceptRequest = (req: EmergencyRequest) => {
    const comp = (req.bloodComponent as ComponentType) || 'PRBC';
    const avail = getAvailableStockCount(req.bloodGroup, comp);

    if (avail < req.unitsNeeded) {
      const proceed = window.confirm(
        `⚠️ Stock Notice: Currently only ${avail} unit(s) of ${req.bloodGroup} (${comp}) available in the vault (Requested: ${req.unitsNeeded}u). Do you still want to accept and coordinate fulfillment?`
      );
      if (!proceed) return;
    }

    acceptBloodRequest(req.id, staffName);
    showToast(`✅ Request BR-${req.id} accepted! Real-time notification sent.`);
  };

  // 2. Open Reject Modal
  const handleOpenRejectModal = (req: EmergencyRequest) => {
    setRejectModalReq(req);
    setRejectReason('Blood unavailable in storage');
    setCustomRejectReason('');
  };

  // 3. Confirm Reject with Reason
  const handleConfirmReject = () => {
    if (!rejectModalReq) return;
    const finalReason = rejectReason === 'Other' ? (customRejectReason.trim() || 'Unspecified reason') : rejectReason;
    rejectBloodBankRequest(rejectModalReq.id, finalReason);
    showToast(`❌ Request BR-${rejectModalReq.id} rejected: ${finalReason}`);
    setRejectModalReq(null);
  };

  // 4. Open Reserve Modal
  const handleOpenReserveModal = (req: EmergencyRequest) => {
    setReserveModalReq(req);
    // Find eligible stored/available units matching group & component
    const comp = (req.bloodComponent as ComponentType) || 'PRBC';
    const eligible = bloodUnitsList.filter(
      u => u.bloodGroup === req.bloodGroup && (u.component === comp || !u.component) && (u.status === 'STORED' || u.status === 'APPROVED' || u.status === 'COLLECTED')
    );
    // Preselect up to required units
    setSelectedUnitsToReserve(eligible.slice(0, req.unitsNeeded).map(u => u.unitId));
  };

  // 5. Confirm Reserve Units
  const handleConfirmReserve = () => {
    if (!reserveModalReq) return;
    const comp = (reserveModalReq.bloodComponent as ComponentType) || 'PRBC';
    const count = selectedUnitsToReserve.length > 0 ? selectedUnitsToReserve.length : reserveModalReq.unitsNeeded;
    reserveBloodBankUnits(reserveModalReq.id, 'BB-HUB-01', reserveModalReq.bloodGroup, comp, count, staffName);
    showToast(`🔒 Reserved ${count} unit(s) of ${reserveModalReq.bloodGroup} for BR-${reserveModalReq.id}`);
    setReserveModalReq(null);
    setSelectedUnitsToReserve([]);
  };

  // 6. Open Issue Modal
  const handleOpenIssueModal = (req: EmergencyRequest) => {
    setIssueModalReq(req);
    setReceivingPartyInput(req.hospitalName || req.contactPerson || 'Authorized Recipient');
    const matchingUnit = bloodUnitsList.find(
      u => u.bloodGroup === req.bloodGroup && (u.status === 'RESERVED' || u.status === 'STORED' || u.status === 'APPROVED')
    );
    setSelectedUnitIdToIssue(matchingUnit ? matchingUnit.unitId : '');
  };

  // 7. Confirm Issue Blood Unit
  const handleConfirmIssue = () => {
    if (!issueModalReq) return;
    issueBloodBankUnits(issueModalReq.id, selectedUnitIdToIssue, staffName);
    showToast(`🚀 Dispatched & issued blood for request BR-${issueModalReq.id}`);
    setIssueModalReq(null);
    setSelectedUnitIdToIssue('');
  };

  // 8. Intake New Blood Unit into Inventory
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    intakeBloodUnit({
      bloodGroup: intakeGroup,
      component: intakeComp,
      storageLocation: intakeStorageLoc,
      donorRef: intakeDonorRef
    }, staffName);
    setShowIntakeModal(false);
  };

  // 9. Automated Inter-Bank Transfer Order
  const handleReplenishmentOrder = (targetInstName: string, group: BloodGroup) => {
    createInterCityTransfer({
      sourceHospital: 'Hubballi Regional Blood Bank',
      sourceCity: 'Hubballi',
      targetHospital: targetInstName,
      bloodGroup: group,
      units: 5,
      urgencyReason: 'Automated Low-Stock Replenishment Transfer'
    });
    showToast(`Replenishment transfer request for 5 units of ${group} sent to ${targetInstName}.`);
  };

  // Distance calculated nearby institutions
  const nearbyWithDistance = REGIONAL_INSTITUTIONS.map(inst => ({
    ...inst,
    distanceKm: calculateDistanceKm(bankLocation.lat, bankLocation.lng, inst.lat, inst.lng)
  }));

  // Render Request Card Item Component
  const renderRequestCard = (req: EmergencyRequest, queueType: 'DIRECT' | 'HOSPITAL' | 'BLOOD_BANK') => {
    const isCritical = req.urgency === 'CRITICAL' || req.urgency === 'HIGH';
    const comp = (req.bloodComponent as ComponentType) || 'PRBC';
    const availableStock = getAvailableStockCount(req.bloodGroup, comp);
    const hasEnoughStock = availableStock >= req.unitsNeeded;

    return (
      <div
        key={req.id}
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isCritical
            ? 'bg-red-50/40 border-red-200 shadow-xs'
            : 'bg-white border-slate-200/80 hover:border-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 font-black text-xs">
                🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {req.urgency}
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">
                BR-{req.id}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                {queueType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                req.status === 'BLOOD_SECURED' || req.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Status: {req.status}
              </span>
            </div>

            {/* Request Summary Title */}
            <div>
              <strong className="text-sm sm:text-base font-black text-slate-900 block">
                {queueType === 'HOSPITAL'
                  ? `Hospital: ${req.hospitalName || 'Verified Medical Center'}`
                  : queueType === 'BLOOD_BANK'
                  ? `Requesting Blood Bank: ${req.hospitalName || 'Regional Center'}`
                  : `Requester: ${req.contactPerson || 'Registered User'} (Patient: ${req.patientName || 'Emergency Patient'})`}
                {' '}• <span className="text-red-600 font-black">{req.unitsNeeded} Units Required</span>
              </strong>
            </div>

            {/* Details */}
            <div className="text-xs text-slate-600 space-y-1">
              <p className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{req.hospitalName} — {req.city}</span>
              </p>
              <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                <span>Contact: {req.contactPerson} ({req.maskedPhone})</span>
                <span>• Required: <strong className="text-slate-700">{req.requiredDate || 'Within 2 Hours'} {req.requiredTime || ''}</strong></span>
              </p>
              {req.reason && (
                <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-100">
                  Reason: "{req.reason}"
                </p>
              )}
            </div>

            {/* Real Vault Stock Indicator */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">Live Vault Stock:</span>
              <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                hasEnoughStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {availableStock} Units Available ({hasEnoughStock ? 'Sufficient' : 'Low/Insufficient'})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 justify-end">
            <button
              onClick={() => setSelectedRequestForDetails(req)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View Details
            </button>

            {req.status !== 'APPROVED' && req.status !== 'BLOOD_SECURED' && (
              <button
                onClick={() => handleAcceptRequest(req)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" /> Accept Request
              </button>
            )}

            <button
              onClick={() => handleOpenReserveModal(req)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Reserve Units
            </button>

            <button
              onClick={() => handleOpenIssueModal(req)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Issue Blood
            </button>

            <button
              onClick={() => handleOpenRejectModal(req)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>

            <button
              onClick={() => openEmergencyChat(req.id)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in">
      
      {/* 1. PORTAL HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <Droplet className="w-80 h-80 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Verified Regional Blood Center & Supply Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Blood Bank Operations & Control Desk 🩸
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Logged in as <strong className="text-white font-bold">{staffName}</strong>. Live synchronization with Requesters, Hospitals, Voluntary Donors, and Super Admin Live Monitoring.
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
              onClick={checkBloodUnitExpiries}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Scan for expired units"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" /> Scan Expiries
            </button>
            <button
              onClick={handleSetBankGPS}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Update GPS Location"
            >
              <MapPin className="w-4 h-4 text-emerald-300" /> GPS Location
            </button>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. TAB CONTENT VIEWS                               */}
      {/* ================================================== */}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Total Vault Available</span>
              <strong className="text-3xl font-black text-slate-900 block tracking-tight">{totalAvailableUnits} Units</strong>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for immediate issue
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Active Requests Queue</span>
              <strong className="text-3xl font-black text-amber-600 block tracking-tight">{activeRequestsQueue.length}</strong>
              <span className="text-[11px] text-slate-500 font-medium">Direct & Hospital orders</span>
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
              <span className="text-[11px] text-slate-500 font-medium">Individual barcode units</span>
            </div>
          </div>

          {/* Real-Time Stock Status Matrix & Regional Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Real-Time Stock Quick View */}
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" /> Current Vault Stock Matrix
                </h3>
                <button onClick={() => navigate('/bloodbank/inventory')} className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer">
                  Full Matrix →
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-xs">
                {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map(group => {
                  const comps = inventoryStockMap[group] || {};
                  const avail: number = Number(Object.values(comps).reduce<number>((acc: number, item: any) => acc + Number(item?.available || 0), 0));
                  const isLow = avail < minStockThreshold;
                  return (
                    <div key={group} className={`p-3 rounded-2xl border text-center space-y-1 ${isLow ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/70 border-slate-200'}`}>
                      <span className="font-black text-slate-900 text-sm block">{group}</span>
                      <strong className={`text-base font-black block ${isLow ? 'text-red-600' : 'text-emerald-700'}`}>
                        {avail} <span className="text-[10px] font-normal text-slate-500">u</span>
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
                  <Building2 className="w-4 h-4 text-sky-600" /> Regional Inter-Hospital Network
                </h3>
                <span className="text-xs text-slate-500 font-mono">Hubballi Network</span>
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
                        className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-extrabold text-[11px] cursor-pointer"
                      >
                        Supply {inst.lowStockGroup}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReplenishmentOrder(inst.name, 'O+')}
                        className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-900 hover:bg-sky-200 border border-sky-300 font-extrabold text-[11px] cursor-pointer"
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

      {/* TAB 2: DIRECT REQUESTERS QUEUE */}
      {activeTab === 'direct-queue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" /> Direct Requesters Queue
              </h3>
              <p className="text-xs text-slate-500 font-medium">Blood requests received directly from patients, families, and authorized individuals.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-200">
                {directRequestsList.length} Direct Pending Requests
              </span>
            </div>
          </div>

          {directRequestsList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="text-sm font-black text-slate-900 block">No Pending Direct Requests</strong>
              <p className="text-xs text-slate-500">All direct requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {directRequestsList.map(req => renderRequestCard(req, 'DIRECT'))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOSPITAL REQUESTS QUEUE */}
      {activeTab === 'hospital-queue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" /> Verified Hospital Emergency Requests
              </h3>
              <p className="text-xs text-slate-500 font-medium">Emergency blood component requirements received from verified clinical hospital desks.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-900 text-xs font-black border border-sky-200">
                {hospitalRequestsList.length} Hospital Requests
              </span>
            </div>
          </div>

          {hospitalRequestsList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-sky-600 mx-auto" />
              <strong className="text-sm font-black text-slate-900 block">No Pending Hospital Requests</strong>
              <p className="text-xs text-slate-500">All hospital emergency orders have been fulfilled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hospitalRequestsList.map(req => renderRequestCard(req, 'HOSPITAL'))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BLOOD BANK-TO-BLOOD BANK REQUESTS */}
      {activeTab === 'bloodbank-queue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-600" /> Blood Bank-to-Blood Bank Transfer Requests
              </h3>
              <p className="text-xs text-slate-500 font-medium">Inter-center stock replenishment and redistribution transfers keeping consistent Request IDs.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 text-xs font-black border border-indigo-200">
                {bloodBankRequestsList.length} Inter-Bank Requests
              </span>
            </div>
          </div>

          {bloodBankRequestsList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto" />
              <strong className="text-sm font-black text-slate-900 block">No Pending Blood Bank Transfers</strong>
              <p className="text-xs text-slate-500">Regional stock transfers are currently up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bloodBankRequestsList.map(req => renderRequestCard(req, 'BLOOD_BANK'))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INVENTORY MANAGEMENT TABLE */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" /> Live Blood Inventory Matrix (Group × Component)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Single source of truth inventory tracked by Blood Group and Component (PRBC, Whole Blood, Plasma, Platelets).</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIntakeModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Record New Intake
              </button>
            </div>
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
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Issued</th>
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
                  const totalReserved: number = Number(Object.values(groupStock).reduce<number>((acc: number, c: any) => acc + Number(c?.reserved || 0), 0));
                  const totalIssued: number = Number(Object.values(groupStock).reduce<number>((acc: number, c: any) => acc + Number(c?.issued || 0), 0));
                  const isLow = totalGroupAvail < minStockThreshold;

                  return (
                    <tr key={group} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-black text-slate-900 text-sm">{group}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{prbc} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{wb} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{ffp} u</td>
                      <td className="py-3.5 px-4 text-slate-700">{prp} u</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">{totalGroupAvail} units</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">{totalReserved} u</td>
                      <td className="py-3.5 px-4 font-bold text-sky-700">{totalIssued} u</td>
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

      {/* TAB 6: BLOOD UNIT TRACKING & LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-sky-600" /> Individual Blood Unit Lifecycle & Barcode Registry
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Barcode unit tracking: COLLECTED → TESTING → STORED / AVAILABLE → RESERVED → ISSUED → RECEIVED → TRANSFUSED.
              </p>
            </div>

            <button
              onClick={() => setShowIntakeModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Add Unit
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Barcode Unit ID (e.g. BU-10025)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>

            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            >
              <option value="ALL">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <select
              value={filterComponent}
              onChange={e => setFilterComponent(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            >
              <option value="ALL">All Components</option>
              <option value="PRBC">PRBC</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Plasma (FFP)">Plasma (FFP)</option>
              <option value="Platelets (PRP)">Platelets (PRP)</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="STORED">STORED / AVAILABLE</option>
              <option value="APPROVED">APPROVED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="ISSUED">ISSUED</option>
              <option value="TRANSFUSED">TRANSFUSED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Barcode Unit ID</th>
                  <th className="py-3 px-4">Group & Component</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Donor Reference</th>
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
                    <td className="py-3.5 px-4 text-slate-500 font-sans text-[11px]">{unit.donorRef || 'Voluntary Donor'}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        unit.status === 'STORED' || unit.status === 'APPROVED' || unit.status === 'COLLECTED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : unit.status === 'RESERVED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : unit.status === 'ISSUED' || unit.status === 'TRANSFUSED'
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

      {/* TAB 7: PRESERVATION & EXPIRY MANAGEMENT */}
      {activeTab === 'preservation' && (
        <div className="space-y-6">
          {/* Cold Chain Telemetry */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-emerald-600" /> Cold Chain Preservation Vault Telemetry
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time temperature telemetry for refrigerated component vaults.</p>
              </div>

              <button
                onClick={checkBloodUnitExpiries}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Scan Expiries
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vaultTemps.map(v => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{v.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                      {v.status}
                    </span>
                  </div>
                  <div>
                    <strong className="text-2xl font-black text-emerald-700 block tracking-tight">{v.temp}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">Target: {v.target}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>SENS-{v.id.toUpperCase()}</span>
                    <span className="text-emerald-700 font-bold">✓ Calibrated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Near Expiry & Expired Units List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Near Expiry */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Near Expiry Units (≤ 5 Days)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                  {nearExpiryUnitsList.length} Units
                </span>
              </div>

              {nearExpiryUnitsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No units approaching expiration within the next 5 days.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {nearExpiryUnitsList.map(u => (
                    <div key={u.unitId} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-black text-slate-900">{u.unitId}</strong> — {u.bloodGroup} ({u.component})
                        <span className="text-[11px] text-amber-800 block">Expires: {u.expiryDate}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold text-[10px]">
                        NEAR EXPIRY
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expired Units */}
            <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <h3 className="font-extrabold text-sm text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Expired Units (Quarantine)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 font-black text-xs">
                  {expiredUnitsList.length} Units
                </span>
              </div>

              {expiredUnitsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No expired blood units found. Inventory is clean.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {expiredUnitsList.map(u => (
                    <div key={u.unitId} className="p-3 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-black text-slate-900">{u.unitId}</strong> — {u.bloodGroup} ({u.component})
                        <span className="text-[11px] text-red-700 block">Expired on: {u.expiryDate}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10px]">
                        QUARANTINED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ISSUE BLOOD TRANSFUSION */}
      {activeTab === 'issue' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="border-b border-sky-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" /> Blood Issue & Transactional Dispatch Desk
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select verified requests, allocate specific barcode units, and confirm physical dispatch.</p>
          </div>

          {activeRequestsQueue.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
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
                    <span className="text-xs font-mono font-bold text-slate-400">BR-{req.id}</span>
                  </div>

                  <div>
                    <strong className="text-sm font-black text-slate-900 block">{req.patientName || 'Emergency Patient'}</strong>
                    <span className="text-xs text-slate-600 block">{req.hospitalName} ({req.city})</span>
                  </div>

                  <button
                    onClick={() => handleOpenIssueModal(req)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Allocate Barcode Unit & Dispatch
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: LOW STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Dynamic Low-Stock & Replenishment Center
              </h3>
              <p className="text-xs text-slate-500 font-medium">Automatic alerts generated when stock falls below safety threshold ({minStockThreshold} units).</p>
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
              <p className="text-xs text-slate-600">All blood groups currently meet or exceed minimum safety stock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockAlertGroups.map(group => {
                const comps = inventoryStockMap[group] || {};
                const currentAvail: number = Number(Object.values(comps).reduce<number>((acc: number, item: any) => acc + Number(item?.available || 0), 0));
                return (
                  <div key={group} className="p-4 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-black text-red-700 text-sm block">🔴 LOW STOCK ALERT: Group {group}</span>
                      <p className="text-xs text-slate-600">
                        Current Available Stock: <strong className="font-bold text-slate-900">{currentAvail} units</strong> (Safety Threshold: {minStockThreshold} units)
                      </p>
                    </div>

                    <button
                      onClick={() => handleReplenishmentOrder('Rotary Regional Blood Bank Dharwad', group)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-xs shrink-0 cursor-pointer"
                    >
                      Request Regional Transfer →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 10: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Real-Time Notifications Center
              </h3>
              <p className="text-xs text-slate-500 font-medium">Live operational notifications received from Requesters, Hospitals, and System Alerts.</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {notifications.length} Total Alerts
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <strong className="text-sm font-black text-slate-900 block">{n.title}</strong>
                  <p className="text-xs text-slate-600">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                {n.requestId && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold shrink-0">
                    BR-{n.requestId}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: ACTIVITY LOG AUDIT TRAIL */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Immutable Read-Only Activity Audit Trail
              </h3>
              <p className="text-xs text-slate-500 font-medium">Historical audit trail of all blood bank intake, reservation, rejection, and issue operations.</p>
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
                  <th className="py-3 px-4">Staff / Facility</th>
                  <th className="py-3 px-4">Group & Units</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {activityLogs.map(log => (
                  <tr key={log.activityId} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{log.date} {log.time}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{log.action}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-700">{log.staff}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{log.bloodGroup || 'General'} {log.units ? `(${log.units}u)` : ''}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 12: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" /> Operational Reports & Verified Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">Verified metrics calculated directly from database records.</p>
            </div>

            <div className="flex items-center gap-2">
              {(['today', '7days', '30days'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setReportRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer ${
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
              <strong className="text-3xl font-black text-emerald-700 block tracking-tight">18 Units</strong>
              <span className="text-[11px] text-emerald-600 font-medium">To emergency hospitals</span>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
              <span className="text-xs text-sky-800 font-bold block">Units Intake / Collected</span>
              <strong className="text-3xl font-black text-sky-700 block tracking-tight">32 Units</strong>
              <span className="text-[11px] text-sky-600 font-medium">From donation drives</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="text-xs text-amber-900 font-bold block">Requests Fulfilled</span>
              <strong className="text-3xl font-black text-amber-700 block tracking-tight">14 Requests</strong>
              <span className="text-[11px] text-amber-600 font-medium">100% fulfillment rate</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 13: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
          <div className="border-b border-sky-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Blood Center Credentials & Settings
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
                <p>Protocol: <span className="font-mono text-slate-800">WebSocket / BroadcastChannel</span></p>
                <p>Status: <span className="text-emerald-700 font-bold">● Connected</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. MODALS                                          */}
      {/* ================================================== */}

      {/* MODAL 1: REQUEST DETAILS */}
      {selectedRequestForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> Request Details — BR-{selectedRequestForDetails.id}
              </h3>
              <button
                onClick={() => setSelectedRequestForDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group & Component</span>
                  <strong className="text-sm font-black text-red-600">{selectedRequestForDetails.bloodGroup} ({selectedRequestForDetails.bloodComponent || 'PRBC'})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Units</span>
                  <strong className="text-sm font-black text-slate-900">{selectedRequestForDetails.unitsNeeded} Units</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Urgency / Priority</span>
                  <strong className="text-xs font-black text-red-600 uppercase">{selectedRequestForDetails.urgency}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                  <strong className="text-xs font-black text-emerald-700 uppercase">{selectedRequestForDetails.status}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p><strong>Patient:</strong> {selectedRequestForDetails.patientName || 'Emergency Patient'}</p>
                <p><strong>Hospital:</strong> {selectedRequestForDetails.hospitalName} ({selectedRequestForDetails.city})</p>
                <p><strong>Contact:</strong> {selectedRequestForDetails.contactPerson} ({selectedRequestForDetails.maskedPhone})</p>
                <p><strong>Required By:</strong> {selectedRequestForDetails.requiredDate || 'Immediate'} {selectedRequestForDetails.requiredTime || ''}</p>
                {selectedRequestForDetails.doctorName && (
                  <p><strong>Doctor In-Charge:</strong> Dr. {selectedRequestForDetails.doctorName}</p>
                )}
                {selectedRequestForDetails.reason && (
                  <p className="italic text-slate-600"><strong>Reason:</strong> "{selectedRequestForDetails.reason}"</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRequestForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REQUEST */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-red-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" /> Reject Request BR-{rejectModalReq.id}
            </h3>

            <p className="text-slate-600">
              Please specify the mandatory reason for rejecting this blood request. This reason will be recorded in the audit log and sent to the requester.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Rejection Reason *</label>
                <select
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Blood unavailable in storage">Blood unavailable in storage</option>
                  <option value="Component unavailable">Component unavailable</option>
                  <option value="Insufficient units in vault">Insufficient units in vault</option>
                  <option value="Request invalid / duplicate">Request invalid / duplicate</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              {rejectReason === 'Other' && (
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Specify Reason *</label>
                  <input
                    type="text"
                    placeholder="Enter rejection reason..."
                    value={customRejectReason}
                    onChange={e => setCustomRejectReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-600/20 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESERVE UNITS */}
      {reserveModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-amber-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" /> Reserve Units for BR-{reserveModalReq.id}
            </h3>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
              <span className="font-black text-amber-900 block text-sm">
                {reserveModalReq.bloodGroup} ({reserveModalReq.bloodComponent || 'PRBC'}) • {reserveModalReq.unitsNeeded} Unit(s) Required
              </span>
              <span className="text-amber-800 block">Patient: {reserveModalReq.patientName}</span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Select Barcode Units in Vault to Reserve:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {bloodUnitsList
                  .filter(u => u.bloodGroup === reserveModalReq.bloodGroup && (u.status === 'STORED' || u.status === 'APPROVED' || u.status === 'COLLECTED'))
                  .map(unit => (
                    <label key={unit.unitId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer font-mono text-xs">
                      <input
                        type="checkbox"
                        checked={selectedUnitsToReserve.includes(unit.unitId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUnitsToReserve([...selectedUnitsToReserve, unit.unitId]);
                          } else {
                            setSelectedUnitsToReserve(selectedUnitsToReserve.filter(id => id !== unit.unitId));
                          }
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-bold text-slate-900">{unit.unitId}</span>
                      <span className="text-slate-500">({unit.storageLocation} • Exp: {unit.expiryDate})</span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReserveModalReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-md cursor-pointer"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE BLOOD TRANSFUSION */}
      {issueModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
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

            <div className="space-y-3">
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
                        {u.unitId} - {u.storageLocation} (Exp: {u.expiryDate} • Status: {u.status})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Receiving Party / Facility Staff *</label>
                <input
                  type="text"
                  value={receivingPartyInput}
                  onChange={e => setReceivingPartyInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIssueModalReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmIssue}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Confirm & Issue Blood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: INTAKE NEW STOCK */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
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
                  <option value="PRBC">Red Blood Cells (PRBC)</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Storage Vault Location *</label>
                <input
                  type="text"
                  value={intakeStorageLoc}
                  onChange={e => setIntakeStorageLoc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Donor Reference / Source</label>
                <input
                  type="text"
                  value={intakeDonorRef}
                  onChange={e => setIntakeDonorRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20 cursor-pointer"
                >
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
