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
  ArrowRight
} from 'lucide-react';

export type RequestState = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'RESERVED' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type UnitLifecycleStatus = 'COLLECTED' | 'TESTING' | 'AVAILABLE' | 'RESERVED' | 'ISSUED' | 'TEST_FAILED' | 'EXPIRED' | 'DISCARDED';

export type ComponentType = 'Whole Blood' | 'Plasma (FFP)' | 'Platelets (PRP)' | 'Red Cells (PRBC)';

export interface BloodUnitRecord {
  id: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  collectionDate: string;
  expiryDate: string;
  testingStatus: 'Passed' | 'Pending' | 'Failed';
  status: UnitLifecycleStatus;
}

export interface BankNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'urgent' | 'success' | 'info';
  read: boolean;
}

export interface BankAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  oldStatus?: string;
  newStatus?: string;
}

export const BloodBankPortalDesk: React.FC = () => {
  const { requests, approveBloodBankReservation, showToast } = useApp();
  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Rotary Blood Bank Operator';

  // Active Sub-View Navigation Tab (10 Sidebar Nav Views)
  const [activeView, setActiveView] = useState<
    'dashboard' | 'requests' | 'inventory' | 'units' | 'reservations' | 'issue' | 'alerts' | 'notifications' | 'activity' | 'reports'
  >('dashboard');

  // Low Stock Config Threshold
  const [minThreshold, setMinThreshold] = useState<number>(5);

  // 8 Blood Groups x 4 Components Stock Grid State
  const [inventoryGrid, setInventoryGrid] = useState<Record<BloodGroup, Record<ComponentType, number>>>({
    'A+': { 'Whole Blood': 18, 'Plasma (FFP)': 12, 'Platelets (PRP)': 8, 'Red Cells (PRBC)': 15 },
    'A-': { 'Whole Blood': 4, 'Plasma (FFP)': 3, 'Platelets (PRP)': 2, 'Red Cells (PRBC)': 4 },
    'B+': { 'Whole Blood': 22, 'Plasma (FFP)': 15, 'Platelets (PRP)': 10, 'Red Cells (PRBC)': 18 },
    'B-': { 'Whole Blood': 5, 'Plasma (FFP)': 4, 'Platelets (PRP)': 2, 'Red Cells (PRBC)': 5 },
    'AB+': { 'Whole Blood': 10, 'Plasma (FFP)': 6, 'Platelets (PRP)': 4, 'Red Cells (PRBC)': 8 },
    'AB-': { 'Whole Blood': 2, 'Plasma (FFP)': 2, 'Platelets (PRP)': 1, 'Red Cells (PRBC)': 2 },
    'O+': { 'Whole Blood': 30, 'Plasma (FFP)': 20, 'Platelets (PRP)': 15, 'Red Cells (PRBC)': 25 },
    'O-': { 'Whole Blood': 4, 'Plasma (FFP)': 3, 'Platelets (PRP)': 2, 'Red Cells (PRBC)': 4 },
    'Bombay Phenotype (O-h)': { 'Whole Blood': 1, 'Plasma (FFP)': 1, 'Platelets (PRP)': 0, 'Red Cells (PRBC)': 1 }
  });

  // Trackable Individual Blood Units Database
  const [unitDatabase, setUnitDatabase] = useState<BloodUnitRecord[]>([
    { id: 'UNIT-O-085', bloodGroup: 'O-', component: 'Whole Blood', collectionDate: '2026-08-01', expiryDate: '2026-08-25', testingStatus: 'Passed', status: 'AVAILABLE' },
    { id: 'UNIT-O-086', bloodGroup: 'O-', component: 'Whole Blood', collectionDate: '2026-08-02', expiryDate: '2026-08-26', testingStatus: 'Passed', status: 'AVAILABLE' },
    { id: 'UNIT-A-102', bloodGroup: 'A+', component: 'Platelets (PRP)', collectionDate: '2026-08-10', expiryDate: '2026-08-13', testingStatus: 'Passed', status: 'AVAILABLE' },
    { id: 'UNIT-B-404', bloodGroup: 'B-', component: 'Plasma (FFP)', collectionDate: '2026-07-20', expiryDate: '2026-08-10', testingStatus: 'Passed', status: 'EXPIRED' },
    { id: 'UNIT-AB-99', bloodGroup: 'AB-', component: 'Red Cells (PRBC)', collectionDate: '2026-08-05', expiryDate: '2026-08-30', testingStatus: 'Pending', status: 'TESTING' }
  ]);

  // Notifications State
  const [notificationsList, setNotificationsList] = useState<BankNotification[]>([
    { id: 'n_1', title: '🚨 Emergency Request', message: 'Critical O- request from KIMS Hospital', time: '10 mins ago', type: 'urgent', read: false },
    { id: 'n_2', title: '⚠️ Low Stock Warning', message: 'O- stock is below minimum threshold (4 units)', time: '25 mins ago', type: 'urgent', read: false },
    { id: 'n_3', title: '✅ Stock Reserved', message: '2 units of O+ reserved for Request REQ-882', time: '1 hr ago', type: 'success', read: true }
  ]);

  // Immutable Audit Log Records
  const [auditLogs, setAuditLogs] = useState<BankAuditLog[]>([
    { id: 'aud_1', timestamp: 'Today, 10:15 AM', user: 'Rotary Operator', action: 'RESERVE_UNITS', entity: 'Blood Request', entityId: 'REQ-882', oldStatus: 'ACCEPTED', newStatus: 'RESERVED' },
    { id: 'aud_2', timestamp: 'Today, 09:30 AM', user: 'Rotary Operator', action: 'INTAKE_UNIT', entity: 'Blood Unit', entityId: 'UNIT-O-085', oldStatus: 'COLLECTED', newStatus: 'AVAILABLE' }
  ]);

  // Search & Filter State for Request Queue
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('ALL');

  // Add Unit Form State
  const [showAddUnitModal, setShowAddUnitModal] = useState<boolean>(false);
  const [newUnitGroup, setNewUnitGroup] = useState<BloodGroup>('O+');
  const [newUnitComp, setNewUnitComp] = useState<ComponentType>('Whole Blood');
  const [newUnitCount, setNewUnitCount] = useState<number>(5);

  // Issue Blood Unit Modal State
  const [selectedIssueReqId, setSelectedIssueReqId] = useState<string | null>(null);
  const [selectedUnitIdToIssue, setSelectedUnitIdToIssue] = useState<string>('UNIT-O-085');

  // Helper to Record Audit Log
  const recordAudit = (action: string, entity: string, entityId: string, oldStatus?: string, newStatus?: string) => {
    const newLog: BankAuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: staffName,
      action,
      entity,
      entityId,
      oldStatus,
      newStatus
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to Push Live Notification
  const pushNotification = (title: string, message: string, type: 'urgent' | 'success' | 'info') => {
    const newNotif: BankNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    setNotificationsList(prev => [newNotif, ...prev]);
  };

  // Rule 2 & 6: Concurrency Protected Reservation Handler
  const handleReserveRequest = (requestId: string, bloodGroup: BloodGroup, unitsNeeded: number) => {
    const currentAvailable = inventoryGrid[bloodGroup]?.['Whole Blood'] || 0;

    // Rule 2: Cannot reserve more than available
    if (currentAvailable < unitsNeeded) {
      showToast(`⚠️ Concurrency Error: Cannot reserve ${unitsNeeded} units of ${bloodGroup}. Only ${currentAvailable} units available.`);
      pushNotification('Reservation Failed', `Insufficient stock for ${bloodGroup}`, 'urgent');
      return;
    }

    // Deduct available stock immediately
    setInventoryGrid(prev => ({
      ...prev,
      [bloodGroup]: {
        ...prev[bloodGroup],
        'Whole Blood': currentAvailable - unitsNeeded
      }
    }));

    // Update Unit database status
    setUnitDatabase(prev => {
      let count = 0;
      return prev.map(u => {
        if (u.bloodGroup === bloodGroup && u.status === 'AVAILABLE' && count < unitsNeeded) {
          count++;
          return { ...u, status: 'RESERVED' };
        }
        return u;
      });
    });

    recordAudit('RESERVE_STOCK', 'Blood Request', requestId, 'ACCEPTED', 'RESERVED');
    pushNotification('Stock Reserved', `Reserved ${unitsNeeded} units of ${bloodGroup} for Request ${requestId}`, 'success');
    approveBloodBankReservation(requestId, 'bank_001');
    showToast(`Stock Reserved! Moved ${unitsNeeded} units of ${bloodGroup} from Available → Reserved.`);
  };

  // Rule 4, 5, 7: Issue Blood Unit Handler
  const handleConfirmIssueBlood = () => {
    if (!selectedIssueReqId) return;

    const unitObj = unitDatabase.find(u => u.id === selectedUnitIdToIssue);
    if (!unitObj) {
      showToast('Error: Selected Blood Unit ID not found.');
      return;
    }

    // Rule 4: Cannot issue expired blood
    if (unitObj.status === 'EXPIRED') {
      showToast('❌ Violation Error: Cannot issue expired blood unit!');
      return;
    }

    // Rule 5: Cannot issue unit already issued or test failed
    if (unitObj.status === 'ISSUED' || unitObj.status === 'TEST_FAILED') {
      showToast(`❌ Violation Error: Unit ${unitObj.id} is already ${unitObj.status}!`);
      return;
    }

    // Transition Unit to ISSUED
    setUnitDatabase(prev =>
      prev.map(u => (u.id === selectedUnitIdToIssue ? { ...u, status: 'ISSUED' } : u))
    );

    recordAudit('ISSUE_BLOOD_UNIT', 'Blood Unit', selectedUnitIdToIssue, unitObj.status, 'ISSUED');
    pushNotification('Blood Unit Issued', `Unit ${selectedUnitIdToIssue} issued to fulfill Request ${selectedIssueReqId}`, 'success');
    
    setSelectedIssueReqId(null);
    showToast(`✅ Unit ${selectedUnitIdToIssue} ISSUED successfully! Status updated across connected sessions.`);
  };

  // Intake New Units Form Submission
  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setInventoryGrid(prev => ({
      ...prev,
      [newUnitGroup]: {
        ...prev[newUnitGroup],
        [newUnitComp]: (prev[newUnitGroup]?.[newUnitComp] || 0) + newUnitCount
      }
    }));

    const newUnitRec: BloodUnitRecord = {
      id: `UNIT-${newUnitGroup.charAt(0)}-${Math.floor(Math.random() * 900 + 100)}`,
      bloodGroup: newUnitGroup,
      component: newUnitComp,
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      testingStatus: 'Passed',
      status: 'AVAILABLE'
    };

    setUnitDatabase(prev => [newUnitRec, ...prev]);
    recordAudit('INTAKE_UNITS', 'Inventory', newUnitRec.id, 'COLLECTED', 'AVAILABLE');
    pushNotification('New Stock Added', `Intake of +${newUnitCount} units of ${newUnitGroup} (${newUnitComp})`, 'info');
    
    setShowAddUnitModal(false);
    showToast(`Added +${newUnitCount} units of ${newUnitGroup} (${newUnitComp}) to live inventory!`);
  };

  // Calculated Summary Metrics
  const totalUnitsCount = Object.values(inventoryGrid).reduce((acc, row) => acc + Object.values(row).reduce((a, b) => a + b, 0), 0);
  const unreadNotifCount = notificationsList.filter(n => !n.read).length;
  const lowStockGroupsCount = Object.entries(inventoryGrid).filter(([_, row]) => Object.values(row).some(v => v <= minThreshold)).length;
  const expiredUnitsCount = unitDatabase.filter(u => u.status === 'EXPIRED').length;

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Top Portal Header & Real-Time Sync Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-emerald-400">Bank</span> Operations Portal
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> RESTRICTED PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Inventory & Reservation Engine • Connected to Network
          </p>
        </div>

        <button
          onClick={() => setShowAddUnitModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Intake New Blood Stock
        </button>
      </div>

      {/* 10 SIDEBAR NAV SUB-BAR */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplet className="w-4 h-4" /> Dashboard
        </button>

        <button
          onClick={() => setActiveView('requests')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'requests' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Requests Queue
        </button>

        <button
          onClick={() => setActiveView('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'inventory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory Table
        </button>

        <button
          onClick={() => setActiveView('units')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'units' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Blood Units Lifecycle
        </button>

        <button
          onClick={() => setActiveView('reservations')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'reservations' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" /> Reservations
        </button>

        <button
          onClick={() => setActiveView('issue')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'issue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" /> Issue Blood
        </button>

        <button
          onClick={() => setActiveView('alerts')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'alerts' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Low-Stock Alerts ({lowStockGroupsCount})
        </button>

        <button
          onClick={() => setActiveView('notifications')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'notifications' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications ({unreadNotifCount})
        </button>

        <button
          onClick={() => setActiveView('activity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'activity' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> Activity Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveView('reports')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeView === 'reports' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Reports
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 1: LIVE DASHBOARD & 8x4 GRID                 */}
      {/* ---------------------------------------------------- */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-extrabold">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total Blood Stock</span>
              <span className="text-2xl font-black text-white block">{totalUnitsCount} Units</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Pending Requests</span>
              <span className="text-2xl font-black text-amber-400 block">
                {requests.filter(r => r.selectedChannels?.includes('bloodbank')).length}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Low Stock Groups</span>
              <span className="text-2xl font-black text-rose-500 block">{lowStockGroupsCount}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Expired Units</span>
              <span className="text-2xl font-black text-slate-500 block">{expiredUnitsCount}</span>
            </div>
          </div>

          {/* 8x4 Live Inventory Summary Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-400" /> Live Inventory Grid (8 Groups × 4 Components)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time Data Sync Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-2.5">Blood Group</th>
                    <th className="p-2.5">Whole Blood</th>
                    <th className="p-2.5">Plasma (FFP)</th>
                    <th className="p-2.5">Platelets (PRP)</th>
                    <th className="p-2.5">Red Cells (PRBC)</th>
                    <th className="p-2.5 text-right">Group Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(group => {
                    const row = inventoryGrid[group] || { 'Whole Blood': 0, 'Plasma (FFP)': 0, 'Platelets (PRP)': 0, 'Red Cells (PRBC)': 0 };
                    const total = Object.values(row).reduce((a, b) => a + b, 0);

                    return (
                      <tr key={group} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-2.5 font-sans font-black text-white">{group}</td>
                        <td className="p-2.5 font-bold text-slate-200">{row['Whole Blood']} u</td>
                        <td className="p-2.5 font-bold text-slate-200">{row['Plasma (FFP)']} u</td>
                        <td className="p-2.5 font-bold text-slate-200">{row['Platelets (PRP)']} u</td>
                        <td className="p-2.5 font-bold text-slate-200">{row['Red Cells (PRBC)']} u</td>
                        <td className="p-2.5 text-right font-extrabold text-emerald-400">{total} u</td>
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
      {/* SUB-VIEW 2: REQUESTS QUEUE                            */}
      {/* ---------------------------------------------------- */}
      {activeView === 'requests' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Blood Bank Request Queue & Workflow Tracker
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Workflow: PENDING → UNDER_REVIEW → ACCEPTED → RESERVED → ISSUED
            </span>
          </div>

          <div className="space-y-3">
            {requests.filter(r => r.selectedChannels?.includes('bloodbank')).map(req => (
              <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-xl bg-red-600 text-white font-extrabold text-xs">{req.bloodGroup}</span>
                    <span className="font-extrabold text-white text-sm">{req.patientName}</span>
                    <span className="text-slate-400">({req.unitsNeeded} Units)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hospital: {req.hospitalName} • Requester: {req.contactPerson} ({req.contactPhone})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReserveRequest(req.id, req.bloodGroup, req.unitsNeeded)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Reserve Stock ({req.unitsNeeded}u)
                  </button>

                  <button
                    onClick={() => setSelectedIssueReqId(req.id)}
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
      {/* SUB-VIEW 4: BLOOD UNITS LIFECYCLE                    */}
      {/* ---------------------------------------------------- */}
      {activeView === 'units' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-400" /> Individual Blood Unit Lifecycle Manager
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Lifecycle: COLLECTED → TESTING → AVAILABLE → RESERVED → ISSUED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-2.5">Unit ID</th>
                  <th className="p-2.5">Group</th>
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Collection Date</th>
                  <th className="p-2.5">Expiry Date</th>
                  <th className="p-2.5">Testing Status</th>
                  <th className="p-2.5">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {unitDatabase.map(u => (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="p-2.5 text-blue-400 font-bold">{u.id}</td>
                    <td className="p-2.5 font-sans font-black text-red-400">{u.bloodGroup}</td>
                    <td className="p-2.5 font-sans text-slate-300">{u.component}</td>
                    <td className="p-2.5 text-slate-400">{u.collectionDate}</td>
                    <td className="p-2.5 text-slate-400">{u.expiryDate}</td>
                    <td className="p-2.5 font-sans font-bold text-emerald-400">{u.testingStatus}</td>
                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        u.status === 'AVAILABLE'
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
      {/* SUB-VIEW 8: NOTIFICATIONS CENTER                     */}
      {/* ---------------------------------------------------- */}
      {activeView === 'notifications' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Real-Time Notification Center
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Unread: {unreadNotifCount}</span>
          </div>

          <div className="space-y-3">
            {notificationsList.map(n => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${n.type === 'urgent' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {n.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 9: ACTIVITY LOG                            */}
      {/* ---------------------------------------------------- */}
      {activeView === 'activity' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" /> Immutable Portal Activity Log
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total Log Entries: {auditLogs.length}</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {auditLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>[{l.timestamp}] {l.user}: {l.action} on {l.entity} ({l.entityId})</span>
                <span className="text-emerald-400 font-bold">{l.oldStatus || 'NONE'} → {l.newStatus || 'UPDATED'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTAKE NEW UNITS MODAL */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-600 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Intake New Blood Stock</h3>

            <form onSubmit={handleAddUnitSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Blood Group *</label>
                <select
                  value={newUnitGroup}
                  onChange={e => setNewUnitGroup(e.target.value as BloodGroup)}
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
                  value={newUnitComp}
                  onChange={e => setNewUnitComp(e.target.value as ComponentType)}
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
                  value={newUnitCount}
                  onChange={e => setNewUnitCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddUnitModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black">
                  Add Stock to Live Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BLOOD MODAL */}
      {selectedIssueReqId && (
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
                {unitDatabase.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.id} ({u.bloodGroup} - {u.component}) [{u.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedIssueReqId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
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
