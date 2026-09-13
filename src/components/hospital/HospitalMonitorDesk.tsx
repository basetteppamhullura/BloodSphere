import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, UrgencyLevel, ComponentType } from '../../types';
import { HospitalAuditLogViewer, ComprehensiveAuditLogEntry, ChangeType } from './HospitalAuditLogViewer';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Check,
  XCircle,
  FileText,
  Phone,
  Droplet,
  Sliders,
  History,
  MessageSquare,
  Radio,
  Sparkles,
  ShieldAlert,
  User,
  Search,
  Filter,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  MapPin,
  Package,
  Layers,
  ArrowUpRight,
  Landmark,
  Boxes,
  Send,
  Truck
} from 'lucide-react';

export interface HospitalMonitorDeskProps {
  initialTab?: 'monitor' | 'audit_log' | 'activity' | 'reports';
}

export const HospitalMonitorDesk: React.FC<HospitalMonitorDeskProps> = ({ initialTab = 'monitor' }) => {
  const {
    requests,
    inventoryStockMap,
    bloodUnitsList,
    activityLogs,
    bloodBanks,
    approveRequestByHospital,
    rejectRequestByHospital,
    intakeBloodUnit,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Mahesh Kulkarni';

  // Configurable Low Stock Threshold
  const [lowThreshold, setLowThreshold] = useState<number>(5);

  // Active Desk Tab: 'monitor' | 'audit_log' | 'reports' | 'activity'
  const [deskTab, setDeskTab] = useState<'monitor' | 'audit_log' | 'reports' | 'activity'>(
    initialTab === 'activity' ? 'activity' : initialTab === 'audit_log' || initialTab === 'reports' ? 'reports' : 'monitor'
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reportDateFilter, setReportDateFilter] = useState<'today' | '7days' | '30days' | 'custom'>('today');

  // Donation Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComponent, setIntakeComponent] = useState<ComponentType>('Whole Blood');
  const [intakeUnits, setIntakeUnits] = useState<number>(4);
  const [intakeDonorName, setIntakeDonorName] = useState<string>('KIMS Rotary Blood Drive / Regional Hub');

  // Issue Blood Unit Modal State
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [issueRequestId, setIssueRequestId] = useState<string>('BR-1025');
  const [issueGroup, setIssueGroup] = useState<BloodGroup>('O+');
  const [issueComponent, setIssueComponent] = useState<ComponentType>('PRBC');
  const [issueQuantity, setIssueQuantity] = useState<number>(2);
  const [issueDepartment, setIssueDepartment] = useState<string>('Emergency Trauma ICU');

  // Request From Blood Bank Modal State
  const [showBankRequestModal, setShowBankRequestModal] = useState<boolean>(false);
  const [bankReqGroup, setBankReqGroup] = useState<BloodGroup>('B-');
  const [bankReqComponent, setBankReqComponent] = useState<ComponentType>('Whole Blood');
  const [bankReqUnits, setBankReqUnits] = useState<number>(3);
  const [selectedBloodBankTarget, setSelectedBloodBankTarget] = useState<string>('Rotary Regional Blood Center');

  // Audit Logs State
  const [localAuditLogs, setLocalAuditLogs] = useState<ComprehensiveAuditLogEntry[]>([
    {
      id: 'log_001',
      timestamp: new Date(Date.now() - 3600000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      staffName,
      group: 'O-',
      component: 'Whole Blood',
      changeType: 'Stock Corrected',
      unitsChanged: 1,
      resultingStock: 2,
      reason: 'Manual inventory count verification'
    },
    {
      id: 'log_002',
      timestamp: new Date(Date.now() - 7200000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      staffName: 'Nurse Radhika S',
      group: 'A+',
      component: 'Platelets (PRP)',
      changeType: 'Stock Used',
      unitsChanged: -2,
      resultingStock: 6,
      reason: 'Fulfilled ICU trauma transfusion',
      linkedRequestId: 'BR-1025'
    }
  ]);

  const recordAuditEntry = (
    group: BloodGroup,
    component: ComponentType,
    changeType: ChangeType,
    unitsChanged: number,
    resultingStock: number,
    reason?: string,
    linkedRequestId?: string
  ) => {
    const entry: ComprehensiveAuditLogEntry = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      staffName,
      group,
      component,
      changeType,
      unitsChanged,
      resultingStock,
      reason,
      linkedRequestId
    };
    setLocalAuditLogs(prev => [entry, ...prev]);
  };

  // Real-Time Summary Counters
  const pendingCount = requests.filter(
    r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS' || r.status === 'PENDING'
  ).length;

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const totalAvailableUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + (b.available || 0), 0),
    0
  );

  const lowStockGroups = Object.entries(inventoryStockMap).filter(([group, comps]) => {
    const totalAvail = Object.values(comps).reduce((a, b) => a + (b.available || 0), 0);
    return totalAvail < lowThreshold;
  });

  // Handle Intake Form Submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < intakeUnits; i++) {
      intakeBloodUnit(
        {
          bloodGroup: intakeGroup,
          component: intakeComponent,
          donorRef: intakeDonorName,
          storageLocation: 'KIMS Hospital Main Trauma Vault'
        },
        staffName
      );
    }
    const newCount = (inventoryStockMap[intakeGroup]?.[intakeComponent]?.available || 0) + intakeUnits;
    recordAuditEntry(
      intakeGroup,
      intakeComponent,
      'Stock Added',
      intakeUnits,
      newCount,
      `Received intake from ${intakeDonorName}`
    );
    setShowIntakeModal(false);
    showToast(`Recorded intake of +${intakeUnits} units of ${intakeGroup} (${intakeComponent})!`);
  };

  // Handle Issue / Transfusion Submit
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCount = inventoryStockMap[issueGroup]?.[issueComponent]?.available || 0;
    if (currentCount < issueQuantity) {
      showToast(`Warning: Only ${currentCount} units of ${issueGroup} ${issueComponent} available.`);
      return;
    }

    recordAuditEntry(
      issueGroup,
      issueComponent,
      'Stock Used',
      -issueQuantity,
      Math.max(0, currentCount - issueQuantity),
      `Issued to ${issueDepartment} for Request ${issueRequestId}`,
      issueRequestId
    );
    setShowIssueModal(false);
    showToast(`Issued ${issueQuantity} units of ${issueGroup} ${issueComponent} to ${issueDepartment}!`);
  };

  // Handle Request From Blood Bank Submit
  const handleBankRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBankRequestModal(false);
    showToast(`Emergency order of ${bankReqUnits} units of ${bankReqGroup} ${bankReqComponent} routed to ${selectedBloodBankTarget}!`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto pb-16">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Blood Stock & Clinical Desk</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
              OPERATIONS DESK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in: <strong>{staffName}</strong> • Real-time clinical blood inventory, donation intake, and transfusion records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Record Blood Intake
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Issue Blood Unit
          </button>
        </div>
      </div>

      {/* 2. DESK TABS SELECTOR */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setDeskTab('monitor')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
            deskTab === 'monitor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Blood Stock Monitor
        </button>
        <button
          onClick={() => setDeskTab('reports')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
            deskTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hospital Reports & Audit
        </button>
        <button
          onClick={() => setDeskTab('activity')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
            deskTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Activity Log ({activityLogs.length})
        </button>
      </div>

      {/* 3. LOW STOCK & CRITICAL ALERTS BANNER (REQUIREMENT 11) */}
      {lowStockGroups.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-200 text-red-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-black text-red-800 block">
                Low Blood Stock Warning ({lowStockGroups.length} Groups Below Threshold)
              </strong>
              <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-xs font-bold">
                {lowStockGroups.map(([grp, comps]) => {
                  const avail = Object.values(comps).reduce((a, b) => a + (b.available || 0), 0);
                  return (
                    <span key={grp} className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white text-[11px]">
                      {grp}: {avail} Units Left
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowBankRequestModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Landmark className="w-4 h-4" /> Request From Blood Bank
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: BLOOD STOCK MONITOR                                                */}
      {/* ========================================================================= */}
      {deskTab === 'monitor' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" /> Hospital Blood Inventory Matrix
              </h3>
              <p className="text-xs text-slate-500">Live units available, reserved for surgery/ICU, and safety thresholds</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-mono font-bold text-xs">
              Total In Stock: {totalAvailableUnits} Units
            </span>
          </div>

          {/* INVENTORY TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">PRBC</th>
                  <th className="py-3 px-4">Whole Blood</th>
                  <th className="py-3 px-4">Plasma (FFP)</th>
                  <th className="py-3 px-4">Platelets (PRP)</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(grp => {
                  const comps = inventoryStockMap[grp] || {
                    'PRBC': { available: 0, reserved: 0, issued: 0, expired: 0 },
                    'Whole Blood': { available: 0, reserved: 0, issued: 0, expired: 0 },
                    'Plasma (FFP)': { available: 0, reserved: 0, issued: 0, expired: 0 },
                    'Platelets (PRP)': { available: 0, reserved: 0, issued: 0, expired: 0 }
                  };
                  const totalGrpAvail = Object.values(comps).reduce((a, b) => a + (b.available || 0), 0);
                  const isLow = totalGrpAvail < lowThreshold;

                  return (
                    <tr key={grp} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-black">
                          🩸 {grp}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{comps['PRBC']?.available || 0} units</td>
                      <td className="py-3.5 px-4 font-bold">{comps['Whole Blood']?.available || 0} units</td>
                      <td className="py-3.5 px-4 font-bold">{comps['Plasma (FFP)']?.available || 0} units</td>
                      <td className="py-3.5 px-4 font-bold">{comps['Platelets (PRP)']?.available || 0} units</td>
                      <td className="py-3.5 px-4 font-black text-sm text-slate-900">{totalGrpAvail} Units</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isLow ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLow ? 'LOW STOCK' : 'AVAILABLE'}
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

      {/* ========================================================================= */}
      {/* VIEW 2: HOSPITAL REPORTS & AUDIT TRAIL                                     */}
      {/* ========================================================================= */}
      {deskTab === 'reports' && (
        <div className="space-y-6">
          <HospitalAuditLogViewer logs={localAuditLogs} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: HOSPITAL ACTIVITY LOG STREAM                                       */}
      {/* ========================================================================= */}
      {deskTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" /> Hospital Operational Activity Log
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live Database Logs</span>
          </div>

          <div className="space-y-2.5 font-mono">
            {activityLogs.map((log) => (
              <div key={log.activityId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-sans font-extrabold">{log.action}</strong>
                  <p className="text-slate-600 text-[11px] font-sans mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400 font-sans">Staff: {log.staff} • {log.date} {log.time}</span>
                </div>
                <span className="text-slate-400 text-[10px] font-bold">{log.activityId}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleIntakeSubmit}
            className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowIntakeModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-600" /> Record Blood Unit Intake
            </h3>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Blood Group *</label>
              <select
                value={intakeGroup}
                onChange={e => setIntakeGroup(e.target.value as BloodGroup)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Component *</label>
              <select
                value={intakeComponent}
                onChange={e => setIntakeComponent(e.target.value as ComponentType)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
              >
                <option value="PRBC">PRBC (Packed Red Blood Cells)</option>
                <option value="Whole Blood">Whole Blood</option>
                <option value="Plasma (FFP)">Plasma (FFP)</option>
                <option value="Platelets (PRP)">Platelets (PRP)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Quantity (Units) *</label>
              <input
                type="number"
                min={1}
                max={20}
                value={intakeUnits}
                onChange={e => setIntakeUnits(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Source / Batch Reference *</label>
              <input
                type="text"
                value={intakeDonorName}
                onChange={e => setIntakeDonorName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                placeholder="e.g. Rotary Blood Center Shipment / Drive"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIntakeModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-extrabold shadow-sm hover:bg-sky-700 cursor-pointer"
              >
                Confirm Intake
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ISSUE BLOOD UNIT MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleIssueSubmit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowIssueModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-slate-900" /> Issue Blood for Transfusion
            </h3>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Linked Request ID *</label>
              <input
                type="text"
                value={issueRequestId}
                onChange={e => setIssueRequestId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Blood Group *</label>
                <select
                  value={issueGroup}
                  onChange={e => setIssueGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Component *</label>
                <select
                  value={issueComponent}
                  onChange={e => setIssueComponent(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
                >
                  <option value="PRBC">PRBC</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Receiving Department / Ward *</label>
              <input
                type="text"
                value={issueDepartment}
                onChange={e => setIssueDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-extrabold shadow-sm hover:bg-slate-800 cursor-pointer"
              >
                Confirm Blood Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST FROM BLOOD BANK MODAL */}
      {showBankRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleBankRequestSubmit}
            className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowBankRequestModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" /> Request Blood From Regional Blood Bank
            </h3>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Select Blood Bank *</label>
              <select
                value={selectedBloodBankTarget}
                onChange={e => setSelectedBloodBankTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
              >
                <option value="Rotary Regional Blood Center">Rotary Regional Blood Center (Hubballi)</option>
                <option value="Red Cross Society Blood Bank">Red Cross Society Blood Bank (Dharwad)</option>
                <option value="LifeLine Charitable Blood Center">LifeLine Charitable Blood Center (Gokul Road)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Blood Group *</label>
                <select
                  value={bankReqGroup}
                  onChange={e => setBankReqGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold cursor-pointer"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Units Required *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bankReqUnits}
                  onChange={e => setBankReqUnits(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBankRequestModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold shadow-sm hover:bg-emerald-700 cursor-pointer"
              >
                Send Blood Bank Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
