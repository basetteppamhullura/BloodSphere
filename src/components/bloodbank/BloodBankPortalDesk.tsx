import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';
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
  Truck
} from 'lucide-react';

export type RequestStatusType =
  | 'Pending'
  | 'Verified'
  | 'Processing'
  | 'Reserved'
  | 'Ready for Issue'
  | 'Issued'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type UnitLifecycleStatus =
  | 'DONATED'
  | 'COLLECTED'
  | 'TESTING'
  | 'APPROVED'
  | 'STORED'
  | 'RESERVED'
  | 'ISSUED'
  | 'TRANSFUSED'
  | 'EXPIRED'
  | 'DISCARDED';

export type ComponentType = 'Whole Blood' | 'Plasma (FFP)' | 'Platelets (PRP)' | 'Red Cells (PRBC)';

export interface DetailedBloodUnit {
  unitId: string;
  donationId: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  collectionDate: string;
  expiryDate: string;
  storageLocation: string;
  status: UnitLifecycleStatus;
  donorRef: string;
  createdDate: string;
  lastUpdated: string;
}

export interface BankNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'urgent' | 'success' | 'warning' | 'info';
  read: boolean;
}

export interface ImmutableActivityEntry {
  activityId: string;
  staff: string;
  action: string;
  requestId?: string;
  unitId?: string;
  date: string;
  time: string;
  details: string;
}

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
  const { requests, approveBloodBankReservation, showToast } = useApp();
  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Radhika Sen (Blood Bank Director)';

  // Blood Bank GPS Coordinates (Default: Hubballi Central Blood Bank)
  const [bankLocation, setBankLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.362,
    lng: 75.122
  });

  // Active Navigation Tab across 10 Modules + Nearby Institutions Sub-tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'preservation' | 'issue' | 'alerts' | 'notifications' | 'activity' | 'reports' | 'nearby'
  >('dashboard');

  // Radius Filter for Distance Search
  const [radiusKmFilter, setRadiusKmFilter] = useState<number>(1000); // Default Any

  // Configurable Low-Stock Threshold per blood group (default 5 units)
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);

  // Live Inventory Stock Matrix (8 Groups x 4 Components)
  const [inventoryStockMap, setInventoryStockMap] = useState<
    Record<BloodGroup, Record<ComponentType, { available: number; reserved: number; issued: number; expired: number }>>
  >({
    'A+': {
      'Whole Blood': { available: 16, reserved: 2, issued: 10, expired: 0 },
      'Plasma (FFP)': { available: 12, reserved: 1, issued: 6, expired: 0 },
      'Platelets (PRP)': { available: 8, reserved: 0, issued: 4, expired: 1 },
      'Red Cells (PRBC)': { available: 14, reserved: 2, issued: 8, expired: 0 }
    },
    'A-': {
      'Whole Blood': { available: 3, reserved: 1, issued: 2, expired: 0 },
      'Plasma (FFP)': { available: 3, reserved: 0, issued: 1, expired: 0 },
      'Platelets (PRP)': { available: 2, reserved: 0, issued: 1, expired: 0 },
      'Red Cells (PRBC)': { available: 4, reserved: 1, issued: 2, expired: 0 }
    },
    'B+': {
      'Whole Blood': { available: 20, reserved: 4, issued: 12, expired: 1 },
      'Plasma (FFP)': { available: 14, reserved: 2, issued: 8, expired: 0 },
      'Platelets (PRP)': { available: 10, reserved: 1, issued: 5, expired: 0 },
      'Red Cells (PRBC)': { available: 18, reserved: 3, issued: 10, expired: 0 }
    },
    'B-': {
      'Whole Blood': { available: 4, reserved: 1, issued: 3, expired: 0 },
      'Plasma (FFP)': { available: 3, reserved: 0, issued: 2, expired: 0 },
      'Platelets (PRP)': { available: 2, reserved: 0, issued: 1, expired: 0 },
      'Red Cells (PRBC)': { available: 5, reserved: 1, issued: 3, expired: 0 }
    },
    'AB+': {
      'Whole Blood': { available: 10, reserved: 2, issued: 5, expired: 0 },
      'Plasma (FFP)': { available: 6, reserved: 1, issued: 3, expired: 0 },
      'Platelets (PRP)': { available: 4, reserved: 0, issued: 2, expired: 0 },
      'Red Cells (PRBC)': { available: 8, reserved: 1, issued: 4, expired: 0 }
    },
    'AB-': {
      'Whole Blood': { available: 2, reserved: 0, issued: 1, expired: 0 },
      'Plasma (FFP)': { available: 2, reserved: 0, issued: 1, expired: 0 },
      'Platelets (PRP)': { available: 1, reserved: 0, issued: 1, expired: 0 },
      'Red Cells (PRBC)': { available: 2, reserved: 0, issued: 1, expired: 0 }
    },
    'O+': {
      'Whole Blood': { available: 28, reserved: 5, issued: 18, expired: 1 },
      'Plasma (FFP)': { available: 18, reserved: 3, issued: 10, expired: 0 },
      'Platelets (PRP)': { available: 14, reserved: 2, issued: 8, expired: 0 },
      'Red Cells (PRBC)': { available: 22, reserved: 4, issued: 14, expired: 0 }
    },
    'O-': {
      'Whole Blood': { available: 3, reserved: 2, issued: 6, expired: 0 },
      'Plasma (FFP)': { available: 3, reserved: 1, issued: 2, expired: 0 },
      'Platelets (PRP)': { available: 2, reserved: 0, issued: 1, expired: 0 },
      'Red Cells (PRBC)': { available: 4, reserved: 1, issued: 3, expired: 0 }
    },
    'Bombay Phenotype (O-h)': {
      'Whole Blood': { available: 1, reserved: 0, issued: 1, expired: 0 },
      'Plasma (FFP)': { available: 1, reserved: 0, issued: 0, expired: 0 },
      'Platelets (PRP)': { available: 0, reserved: 0, issued: 0, expired: 0 },
      'Red Cells (PRBC)': { available: 1, reserved: 0, issued: 0, expired: 0 }
    }
  });

  // Trackable Blood Unit Lifecycle Database
  const [bloodUnitsList, setBloodUnitsList] = useState<DetailedBloodUnit[]>([
    {
      unitId: 'BU-2026-000125',
      donationId: 'DON-8821',
      bloodGroup: 'O-',
      component: 'Whole Blood',
      collectionDate: '2026-08-01',
      expiryDate: '2026-08-25',
      storageLocation: 'Cryo-Freezer B-02 (Compartment 4)',
      status: 'STORED',
      donorRef: 'DNR-Hubballi-042',
      createdDate: '2026-08-01',
      lastUpdated: '2026-08-11'
    },
    {
      unitId: 'BU-2026-000126',
      donationId: 'DON-8822',
      bloodGroup: 'O-',
      component: 'Whole Blood',
      collectionDate: '2026-08-02',
      expiryDate: '2026-08-26',
      storageLocation: 'Cryo-Freezer B-02 (Compartment 5)',
      status: 'RESERVED',
      donorRef: 'DNR-Hubballi-098',
      createdDate: '2026-08-02',
      lastUpdated: '2026-08-11'
    }
  ]);

  // Real Backend Event Notifications
  const [notifications, setNotifications] = useState<BankNotificationItem[]>([
    { id: 'n_1', title: '🚨 Emergency Blood Request', message: 'Critical O- request received for Patient Mahesh', timestamp: '10 mins ago', type: 'urgent', read: false },
    { id: 'n_2', title: '⚠️ Low Stock Alert', message: 'O- Whole Blood stock is below minimum threshold (3 units)', timestamp: '20 mins ago', type: 'warning', read: false }
  ]);

  // READ-ONLY Immutable Activity Log
  const [activityLogs, setActivityLogs] = useState<ImmutableActivityEntry[]>([
    { activityId: 'ACT-9001', staff: 'Dr. Radhika Sen', action: 'NEW_REQUEST_RECEIVED', requestId: 'REQ-BN-00852', date: '2026-08-11', time: '10:15 AM', details: 'New blood request BR-1025 received for 2 units of O-.' }
  ]);

  // Issue Blood Modal State
  const [issueModalReq, setIssueModalReq] = useState<any | null>(null);
  const [selectedUnitIdToIssue, setSelectedUnitIdToIssue] = useState<string>('BU-2026-000125');

  // Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComp, setIntakeComp] = useState<ComponentType>('Whole Blood');
  const [intakeUnits, setIntakeUnits] = useState<number>(4);
  const [intakeStorageLoc, setIntakeStorageLoc] = useState<string>('Main Refrigerator R-02');

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

  // Helper to record Immutable Audit Activity
  const logActivity = (action: string, details: string, requestId?: string, unitId?: string) => {
    const entry: ImmutableActivityEntry = {
      activityId: `ACT-${Date.now().toString().slice(-4)}`,
      staff: staffName,
      action,
      requestId,
      unitId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details
    };
    setActivityLogs(prev => [entry, ...prev]);
  };

  // Helper to push Real Notification
  const pushNotification = (title: string, message: string, type: 'urgent' | 'success' | 'warning' | 'info') => {
    const item: BankNotificationItem = {
      id: `n_${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [item, ...prev]);
  };

  // 1. RESERVE STOCK WORKFLOW
  const handleReserveStock = (reqId: string, bloodGroup: BloodGroup, unitsNeeded: number) => {
    const currentObj = inventoryStockMap[bloodGroup]?.['Whole Blood'] || { available: 0, reserved: 0, issued: 0, expired: 0 };

    if (currentObj.available < unitsNeeded) {
      showToast(`⚠️ Insufficient Available Stock! Cannot reserve ${unitsNeeded} units of ${bloodGroup}.`);
      return;
    }

    setInventoryStockMap(prev => ({
      ...prev,
      [bloodGroup]: {
        ...prev[bloodGroup],
        'Whole Blood': {
          ...currentObj,
          available: currentObj.available - unitsNeeded,
          reserved: currentObj.reserved + unitsNeeded
        }
      }
    }));

    approveBloodBankReservation(reqId, 'bank_001');
    logActivity('STOCK_RESERVED', `${unitsNeeded} units of ${bloodGroup} reserved for Request ${reqId}`, reqId);
    pushNotification('Units Reserved', `${unitsNeeded} units of ${bloodGroup} reserved for Request ${reqId}`, 'success');
    showToast(`Reserved ${unitsNeeded} units of ${bloodGroup}! Available: ${currentObj.available - unitsNeeded}, Reserved: ${currentObj.reserved + unitsNeeded}`);
  };

  // 2. ISSUE BLOOD WORKFLOW
  const handleConfirmIssueBlood = () => {
    if (!issueModalReq) return;

    const unitObj = bloodUnitsList.find(u => u.unitId === selectedUnitIdToIssue);
    if (!unitObj) {
      showToast('Error: Selected Blood Unit ID not found.');
      return;
    }

    if (unitObj.status === 'EXPIRED') {
      showToast('❌ Cannot issue an expired blood unit!');
      return;
    }

    const { id, bloodGroup, unitsNeeded } = issueModalReq;
    const currentObj = inventoryStockMap[bloodGroup as BloodGroup]?.['Whole Blood'] || { available: 0, reserved: 0, issued: 0, expired: 0 };

    setInventoryStockMap(prev => ({
      ...prev,
      [bloodGroup as BloodGroup]: {
        ...prev[bloodGroup as BloodGroup],
        'Whole Blood': {
          ...currentObj,
          reserved: Math.max(0, currentObj.reserved - unitsNeeded),
          issued: currentObj.issued + unitsNeeded
        }
      }
    }));

    setBloodUnitsList(prev =>
      prev.map(u => (u.unitId === selectedUnitIdToIssue ? { ...u, status: 'ISSUED', lastUpdated: new Date().toISOString().split('T')[0] } : u))
    );

    logActivity('BLOOD_ISSUED', `Issued ${unitsNeeded} units of ${bloodGroup} for Request ${id}`, id, selectedUnitIdToIssue);
    pushNotification('Blood Issued', `Issued ${unitsNeeded} units of ${bloodGroup} for Request ${id}`, 'success');

    setIssueModalReq(null);
    showToast(`✅ Blood Issued Successfully! Unit ${selectedUnitIdToIssue} transitioned to ISSUED.`);
  };

  // 3. INTAKE STOCK SUBMISSION
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentObj = inventoryStockMap[intakeGroup]?.[intakeComp] || { available: 0, reserved: 0, issued: 0, expired: 0 };
    setInventoryStockMap(prev => ({
      ...prev,
      [intakeGroup]: {
        ...prev[intakeGroup],
        [intakeComp]: {
          ...currentObj,
          available: currentObj.available + intakeUnits
        }
      }
    }));

    const createdUnit: DetailedBloodUnit = {
      unitId: `BU-2026-${Math.floor(Math.random() * 900000 + 100000)}`,
      donationId: `DON-${Math.floor(Math.random() * 9000 + 1000)}`,
      bloodGroup: intakeGroup,
      component: intakeComp,
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      storageLocation: intakeStorageLoc,
      status: 'STORED',
      donorRef: 'Voluntary Donation',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setBloodUnitsList(prev => [createdUnit, ...prev]);
    logActivity('DONATION_INTAKE', `Intake of +${intakeUnits} units of ${intakeGroup} (${intakeComp}) stored at ${intakeStorageLoc}`, undefined, createdUnit.unitId);

    setShowIntakeModal(false);
    showToast(`Recorded intake of +${intakeUnits} units of ${intakeGroup}! Stored at ${intakeStorageLoc}.`);
  };

  const totalUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available + b.reserved + b.issued, 0),
    0
  );
  const availableUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available, 0),
    0
  );
  const lowStockCount = Object.entries(inventoryStockMap).filter(([_, row]) => Object.values(row).some(v => v.available <= minStockThreshold)).length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Top Header & GPS Button */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-emerald-400">Bank</span> Operations Portal
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> REAL-TIME CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Database Operations Suite • Hubballi-Dharwad Regional Center
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSetBankGPS}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
          >
            <Navigation className="w-4 h-4" /> Use Current GPS
          </button>
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Intake Stock
          </button>
        </div>
      </div>

      {/* 10 MODULES + NEARBY INSTITUTIONS SUB-BAR */}
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
          <FileText className="w-4 h-4" /> Requester Queue
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'nearby' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-red-400" /> Nearby Hospitals & Banks
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> Blood Inventory
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'lifecycle' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Lifecycle Tracker
        </button>

        <button
          onClick={() => setActiveTab('preservation')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'preservation' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Thermometer className="w-4 h-4" /> Blood Preservation
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'alerts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Low Stock Alerts ({lowStockCount})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'notifications' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications ({unreadNotifCount})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'activity' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> Activity Log
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. DASHBOARD                                         */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-extrabold">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total Blood Stock</span>
              <span className="text-2xl font-black text-white block">{totalUnitsCount} Units</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Available Units</span>
              <span className="text-2xl font-black text-emerald-400 block">{availableUnitsCount} Units</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Low Stock Groups</span>
              <span className="text-2xl font-black text-rose-500 block">{lowStockCount} Groups</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Pending Requests</span>
              <span className="text-2xl font-black text-amber-400 block">
                {requests.filter(r => r.selectedChannels?.includes('bloodbank')).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. REQUESTER QUEUE WITH DISTANCE BADGE               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Multi-Channel Requester Queue
            </h3>
            <span className="text-xs text-slate-400 font-mono">Distance Context Enabled</span>
          </div>

          <div className="space-y-3">
            {requests.filter(r => r.selectedChannels?.includes('bloodbank')).map((req, idx) => {
              const distKm = (6.5 + idx * 3.2).toFixed(1);

              return (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">{req.bloodGroup}</span>
                      <h4 className="font-extrabold text-white text-sm">{req.patientName}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> Requester ~{distKm} km away
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Hospital: <strong>{req.hospitalName}</strong> • Requester: <strong>{req.contactPerson} ({req.contactPhone})</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReserveStock(req.id, req.bloodGroup, req.unitsNeeded)}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* NEARBY HOSPITALS & BLOOD BANKS (DISTANCE RANKED)     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          {/* Radius Selector */}
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

                  {inst.lowStockGroup && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 font-bold text-[11px]">
                      ⚠️ Low Stock Alert: {inst.lowStockGroup} (May need supply)
                    </div>
                  )}

                  {inst.surplusGroup && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 font-bold text-[11px]">
                      ✅ Surplus Stock: {inst.surplusUnits} units of {inst.surplusGroup}
                    </div>
                  )}
                </div>

                {inst.type === 'bloodbank' && (
                  <button
                    onClick={() => showToast(`Transfer request sent to ${inst.name}!`)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> Request Stock Transfer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-600 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Intake New Blood Stock</h3>

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
                <label className="text-slate-300 font-bold block mb-1">Unit Count *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={intakeUnits}
                  onChange={e => setIntakeUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIntakeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black">
                  Record Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BLOOD MODAL */}
      {issueModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-blue-600 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Select Blood Unit ID to Issue</h3>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Select Available Unit ID *</label>
              <select
                value={selectedUnitIdToIssue}
                onChange={e => setSelectedUnitIdToIssue(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
              >
                {bloodUnitsList.map(u => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.unitId} ({u.bloodGroup} - {u.component}) [{u.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIssueModalReq(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Cancel
              </button>
              <button onClick={handleConfirmIssueBlood} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black">
                Confirm Issue Blood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
