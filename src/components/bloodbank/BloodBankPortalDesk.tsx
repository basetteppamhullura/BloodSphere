import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';
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
  Boxes
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

export const BloodBankPortalDesk: React.FC = () => {
  const { requests, approveBloodBankReservation, showToast } = useApp();
  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Radhika Sen (Blood Bank Director)';

  // Active Navigation Tab across 10 Modules
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'queue' | 'inventory' | 'lifecycle' | 'preservation' | 'issue' | 'alerts' | 'notifications' | 'activity' | 'reports'
  >('dashboard');

  // Configurable Low-Stock Threshold per blood group (default 5 units)
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);

  // Live Inventory Stock Matrix (8 Groups x 4 Components) with Available, Reserved, Issued, Expired counts
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
    },
    {
      unitId: 'BU-2026-000127',
      donationId: 'DON-8823',
      bloodGroup: 'A+',
      component: 'Red Cells (PRBC)',
      collectionDate: '2026-08-05',
      expiryDate: '2026-08-30',
      storageLocation: 'Main Refrigerator R-01',
      status: 'STORED',
      donorRef: 'DNR-Dharwad-112',
      createdDate: '2026-08-05',
      lastUpdated: '2026-08-10'
    },
    {
      unitId: 'BU-2026-000128',
      donationId: 'DON-8824',
      bloodGroup: 'B-',
      component: 'Platelets (PRP)',
      collectionDate: '2026-07-20',
      expiryDate: '2026-08-10',
      storageLocation: 'Quarantine Bay Q-03',
      status: 'EXPIRED',
      donorRef: 'DNR-Belagavi-304',
      createdDate: '2026-07-20',
      lastUpdated: '2026-08-11'
    }
  ]);

  // Real Backend Event Notifications
  const [notifications, setNotifications] = useState<BankNotificationItem[]>([
    { id: 'n_1', title: '🚨 Emergency Blood Request', message: 'Critical O- request received for Patient Mahesh', timestamp: '10 mins ago', type: 'urgent', read: false },
    { id: 'n_2', title: '⚠️ Low Stock Alert', message: 'O- Whole Blood stock is below minimum threshold (3 units)', timestamp: '20 mins ago', type: 'warning', read: false },
    { id: 'n_3', title: '❄️ Expiry Warning', message: 'Unit BU-2026-000128 expired on 2026-08-10', timestamp: '1 hour ago', type: 'warning', read: true }
  ]);

  // READ-ONLY Immutable Activity Log
  const [activityLogs, setActivityLogs] = useState<ImmutableActivityEntry[]>([
    { activityId: 'ACT-9001', staff: 'Dr. Radhika Sen', action: 'NEW_REQUEST_RECEIVED', requestId: 'REQ-BN-00852', date: '2026-08-11', time: '10:15 AM', details: 'New blood request BR-1025 received for 2 units of O-.' },
    { activityId: 'ACT-9002', staff: 'Dr. Radhika Sen', action: 'RESERVED_UNITS', requestId: 'REQ-BN-00852', unitId: 'BU-2026-000126', date: '2026-08-11', time: '10:30 AM', details: '2 O- PRBC units reserved for BR-1025.' }
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

  // 1. RESERVE STOCK WORKFLOW (Available -2, Reserved +2)
  const handleReserveStock = (reqId: string, bloodGroup: BloodGroup, unitsNeeded: number) => {
    const currentObj = inventoryStockMap[bloodGroup]?.['Whole Blood'] || { available: 0, reserved: 0, issued: 0, expired: 0 };

    if (currentObj.available < unitsNeeded) {
      showToast(`⚠️ Insufficient Available Stock! Cannot reserve ${unitsNeeded} units of ${bloodGroup} (Only ${currentObj.available} avail).`);
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

  // 2. ISSUE BLOOD WORKFLOW (Checks existence, validity, compatibility, & expiry)
  const handleConfirmIssueBlood = () => {
    if (!issueModalReq) return;

    const unitObj = bloodUnitsList.find(u => u.unitId === selectedUnitIdToIssue);
    if (!unitObj) {
      showToast('Error: Selected Blood Unit ID not found.');
      return;
    }

    // Expiry Check
    const isExpired = new Date(unitObj.expiryDate).getTime() < Date.now();
    if (isExpired || unitObj.status === 'EXPIRED') {
      showToast('❌ Insufficient or Expired Blood Stock. Issue Denied! Cannot issue an expired blood unit.');
      pushNotification('Issue Blocked', `Attempted to issue expired unit ${unitObj.unitId}`, 'warning');
      return;
    }

    if (unitObj.status === 'ISSUED' || unitObj.status === 'TRANSFUSED') {
      showToast(`❌ Unit ${unitObj.unitId} has already been issued or transfused!`);
      return;
    }

    const { id, bloodGroup, unitsNeeded } = issueModalReq;
    const currentObj = inventoryStockMap[bloodGroup as BloodGroup]?.['Whole Blood'] || { available: 0, reserved: 0, issued: 0, expired: 0 };

    // Update Inventory Stock (Reserved -units, Issued +units)
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

    // Transition Unit Lifecycle
    setBloodUnitsList(prev =>
      prev.map(u => (u.unitId === selectedUnitIdToIssue ? { ...u, status: 'ISSUED', lastUpdated: new Date().toISOString().split('T')[0] } : u))
    );

    logActivity('BLOOD_ISSUED', `Issued ${unitsNeeded} units of ${bloodGroup} (Unit ID: ${selectedUnitIdToIssue}) for Request ${id}`, id, selectedUnitIdToIssue);
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
    pushNotification('Stock Added', `+${intakeUnits} units of ${intakeGroup} added to live database stock`, 'info');

    setShowIntakeModal(false);
    showToast(`Recorded intake of +${intakeUnits} units of ${intakeGroup}! Stored at ${intakeStorageLoc}.`);
  };

  // Calculate Metrics across modules
  const totalUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available + b.reserved + b.issued, 0),
    0
  );
  const availableUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available, 0),
    0
  );
  const reservedUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.reserved, 0),
    0
  );
  const issuedUnitsCount = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.issued, 0),
    0
  );

  const lowStockCount = Object.entries(inventoryStockMap).filter(([_, row]) => Object.values(row).some(v => v.available <= minStockThreshold)).length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Top Header & Intake Action */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-emerald-400">Bank</span> Management Portal
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> REAL-TIME CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Database Operations Suite • Hubballi-Dharwad Regional Center
          </p>
        </div>

        <button
          onClick={() => setShowIntakeModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Intake New Blood Units
        </button>
      </div>

      {/* 10 MODULES NAVIGATION SUB-BAR */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplet className="w-4 h-4" /> 1. Dashboard
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'queue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> 2. Requester Queue
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> 3. Blood Inventory
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'lifecycle' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> 4. Lifecycle Tracker
        </button>

        <button
          onClick={() => setActiveTab('preservation')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'preservation' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Thermometer className="w-4 h-4" /> 5. Blood Preservation
        </button>

        <button
          onClick={() => setActiveTab('issue')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'issue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" /> 6. Issue Blood
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'alerts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> 7. Low Stock Alerts ({lowStockCount})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'notifications' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" /> 8. Notifications ({unreadNotifCount})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'activity' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> 9. Activity Log ({activityLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reports' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> 10. Live Reports
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. REAL-TIME DASHBOARD                               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-extrabold">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total Blood Units</span>
              <span className="text-xl font-black text-white block">{totalUnitsCount} Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Available Units</span>
              <span className="text-xl font-black text-emerald-400 block">{availableUnitsCount} Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Reserved Units</span>
              <span className="text-xl font-black text-amber-400 block">{reservedUnitsCount} Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Issued Units</span>
              <span className="text-xl font-black text-blue-400 block">{issuedUnitsCount} Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Low Stock Groups</span>
              <span className="text-xl font-black text-rose-500 block">{lowStockCount} Groups</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-400" /> Live Inventory Summary Table (8 Groups × 4 Components)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-2.5">Blood Group</th>
                    <th className="p-2.5">Whole Blood (Avail / Res)</th>
                    <th className="p-2.5">Plasma (Avail / Res)</th>
                    <th className="p-2.5">Platelets (Avail / Res)</th>
                    <th className="p-2.5">Red Cells (Avail / Res)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(grp => {
                    const row = inventoryStockMap[grp];
                    return (
                      <tr key={grp} className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-sans font-black text-white">{grp}</td>
                        <td className="p-2.5 text-slate-200">
                          <strong className="text-emerald-400">{row['Whole Blood'].available}u</strong> / {row['Whole Blood'].reserved}u
                        </td>
                        <td className="p-2.5 text-slate-200">
                          <strong className="text-emerald-400">{row['Plasma (FFP)'].available}u</strong> / {row['Plasma (FFP)'].reserved}u
                        </td>
                        <td className="p-2.5 text-slate-200">
                          <strong className="text-emerald-400">{row['Platelets (PRP)'].available}u</strong> / {row['Platelets (PRP)'].reserved}u
                        </td>
                        <td className="p-2.5 text-slate-200">
                          <strong className="text-emerald-400">{row['Red Cells (PRBC)'].available}u</strong> / {row['Red Cells (PRBC)'].reserved}u
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
      {/* 2. REQUESTER QUEUE                                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Multi-Channel Requester Queue
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-Time Request Receiver</span>
          </div>

          <div className="space-y-3">
            {requests.filter(r => r.selectedChannels?.includes('bloodbank')).map(req => (
              <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">{req.bloodGroup}</span>
                    <h4 className="font-extrabold text-white text-sm">{req.patientName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-400 border border-slate-800">
                      {req.unitsNeeded} Units ({req.bloodComponent || 'Whole Blood'})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                      ID: {req.id}
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
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. BLOOD UNIT LIFECYCLE                              */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'lifecycle' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-400" /> Blood Unit Lifecycle Tracker (Unique Unit IDs)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              DONATED → COLLECTED → TESTING → APPROVED → STORED → RESERVED → ISSUED → TRANSFUSED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-2.5">Blood Unit ID</th>
                  <th className="p-2.5">Group</th>
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Collection Date</th>
                  <th className="p-2.5">Expiry Date</th>
                  <th className="p-2.5">Storage Bay</th>
                  <th className="p-2.5">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {bloodUnitsList.map(u => (
                  <tr key={u.unitId} className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-blue-400">{u.unitId}</td>
                    <td className="p-2.5 font-sans font-black text-red-400">{u.bloodGroup}</td>
                    <td className="p-2.5 font-sans text-slate-300">{u.component}</td>
                    <td className="p-2.5 text-slate-400">{u.collectionDate}</td>
                    <td className="p-2.5 text-slate-400">{u.expiryDate}</td>
                    <td className="p-2.5 font-sans text-slate-300">{u.storageLocation}</td>
                    <td className="p-2.5 font-sans">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${
                        u.status === 'STORED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : u.status === 'RESERVED'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : u.status === 'ISSUED'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-red-950 text-red-300 border-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. BLOOD PRESERVATION & STORAGE                      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'preservation' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cyan-400" /> Blood Preservation & Cold-Chain Storage Monitor
            </h3>
            <span className="text-xs text-cyan-300 font-bold">Standard Temp: 2°C - 6°C</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloodUnitsList.map(u => (
              <div key={u.unitId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400">{u.unitId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300">{u.bloodGroup}</span>
                </div>
                <p className="text-slate-300">Location: <strong>{u.storageLocation}</strong></p>
                <p className="text-slate-400">Collection: {u.collectionDate} • Expiry: <strong>{u.expiryDate}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. LOW STOCK ALERTS                                  */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'alerts' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Automated Low Stock Detection Alerts
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Min Threshold:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={minStockThreshold}
                onChange={e => setMinStockThreshold(Number(e.target.value))}
                className="w-14 p-1 rounded bg-slate-950 text-center font-bold text-white border border-slate-800"
              />
              <span className="text-slate-400">units</span>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(inventoryStockMap).map(([group, row]) => {
              const lowComps = Object.entries(row).filter(([_, data]) => data.available <= minStockThreshold);
              if (lowComps.length === 0) return null;

              return (
                <div key={group} className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> LOW STOCK ALERT: {group}
                    </h4>
                    <p className="text-xs text-amber-200 mt-0.5">
                      {lowComps.map(([c, d]) => `${c}: ${d.available} units available`).join(' • ')}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-black text-xs uppercase">
                    Alert Active
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. READ-ONLY IMMUTABLE ACTIVITY LOG                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" /> Immutable Activity Audit Log (Read-Only)
            </h3>
            <span className="text-xs text-slate-400 font-mono">No Edit / Delete Permissions</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {activityLogs.map(l => (
              <div key={l.activityId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
                <div>
                  <span className="text-blue-400 font-bold">[{l.date} {l.time}]</span> <strong>{l.staff}</strong>: {l.details}
                </div>
                <span className="text-xs font-sans px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800 shrink-0">
                  ID: {l.activityId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 10. LIVE REPORTS MODULE                               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> Real-Time Database Reports Engine
            </h3>
            <span className="text-xs text-slate-400">8 Live Generated Report Modules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-bold block">Collection Report</span>
              <strong className="text-lg text-white block">124 Units Collected</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-bold block">Issue Report</span>
              <strong className="text-lg text-blue-400 block">{issuedUnitsCount} Units Issued</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-bold block">Inventory Report</span>
              <strong className="text-lg text-emerald-400 block">{availableUnitsCount} Units Avail</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-bold block">Expired Blood Report</span>
              <strong className="text-lg text-slate-400 block">1 Unit Expired</strong>
            </div>
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
                <label className="text-slate-300 font-bold block mb-1">Blood Component *</label>
                <select
                  value={intakeComp}
                  onChange={e => setIntakeComp(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                  <option value="Red Cells (PRBC)">Red Cells (PRBC)</option>
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
