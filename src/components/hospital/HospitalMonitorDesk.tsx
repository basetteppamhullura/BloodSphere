import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, UrgencyLevel } from '../../types';
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
  MapPin
} from 'lucide-react';

type ComponentType = 'Whole Blood' | 'Plasma' | 'Platelets' | 'Red Blood Cells';

interface ExpiryItem {
  id: string;
  group: BloodGroup;
  component: ComponentType;
  units: number;
  expiringInDays: number;
}

function calculateTimeAgo(timestampStr: string): string {
  const diffMs = Date.now() - new Date(timestampStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export const HospitalMonitorDesk: React.FC = () => {
  const {
    requests,
    approveRequestByHospital,
    rejectRequestByHospital,
    scheduleDonationAppointment,
    markDonationCompleted,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Mahesh Kulkarni';

  // Configurable Low Stock Threshold
  const [lowThreshold, setLowThreshold] = useState<number>(5);

  // Active Desk Tab: 'monitor' | 'audit_log'
  const [deskTab, setDeskTab] = useState<'monitor' | 'audit_log'>('monitor');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Modals State
  const [approvalModalReq, setApprovalModalReq] = useState<any | null>(null);
  const [rejectionModalReq, setRejectionModalReq] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Insufficient Stock');
  const [infoReqId, setInfoReqId] = useState<string | null>(null);
  const [infoNoteText, setInfoNoteText] = useState<string>('Please provide attending doctor phone & prescription copy.');
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState<string | null>(null);

  // Trigger 4 Modal: Donation Intake Modal
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComponent, setIntakeComponent] = useState<ComponentType>('Whole Blood');
  const [intakeUnits, setIntakeUnits] = useState<number>(4);
  const [intakeDonorName, setIntakeDonorName] = useState<string>('KIMS Rotary Donation Drive');

  // 8 Blood Groups x 4 Components Stock Matrix State
  const [matrixStock, setMatrixStock] = useState<Record<BloodGroup, Record<ComponentType, number>>>({
    'A+': { 'Whole Blood': 12, 'Plasma': 8, 'Platelets': 6, 'Red Blood Cells': 10 },
    'A-': { 'Whole Blood': 3, 'Plasma': 2, 'Platelets': 1, 'Red Blood Cells': 4 },
    'B+': { 'Whole Blood': 16, 'Plasma': 10, 'Platelets': 8, 'Red Blood Cells': 14 },
    'B-': { 'Whole Blood': 4, 'Plasma': 3, 'Platelets': 2, 'Red Blood Cells': 5 },
    'AB+': { 'Whole Blood': 8, 'Plasma': 6, 'Platelets': 4, 'Red Blood Cells': 6 },
    'AB-': { 'Whole Blood': 2, 'Plasma': 1, 'Platelets': 1, 'Red Blood Cells': 2 },
    'O+': { 'Whole Blood': 22, 'Plasma': 14, 'Platelets': 12, 'Red Blood Cells': 18 },
    'O-': { 'Whole Blood': 2, 'Plasma': 2, 'Platelets': 1, 'Red Blood Cells': 3 },
    'Bombay Phenotype (O-h)': { 'Whole Blood': 1, 'Plasma': 0, 'Platelets': 0, 'Red Blood Cells': 1 }
  });

  // Comprehensive Immutable Audit Trail Logs State
  const [comprehensiveAuditLogs, setComprehensiveAuditLogs] = useState<ComprehensiveAuditLogEntry[]>([
    {
      id: 'log_001',
      timestamp: '2026-08-11, 09:15 AM',
      staffName: 'Dr. Mahesh Kulkarni',
      group: 'O-',
      component: 'Whole Blood',
      changeType: 'Stock Corrected',
      unitsChanged: 1,
      resultingStock: 2,
      reason: 'Manual inventory count verification'
    },
    {
      id: 'log_002',
      timestamp: '2026-08-11, 08:30 AM',
      staffName: 'Nurse Radhika S',
      group: 'A+',
      component: 'Platelets',
      changeType: 'Stock Used',
      unitsChanged: -2,
      resultingStock: 6,
      reason: 'Fulfilled ICU trauma transfusion',
      linkedRequestId: 'BN-HUB-2026-00852'
    },
    {
      id: 'log_003',
      timestamp: '2026-08-10, 04:20 PM',
      staffName: 'Dr. Mahesh Kulkarni',
      group: 'B-',
      component: 'Plasma',
      changeType: 'Stock Expired/Removed',
      unitsChanged: -3,
      resultingStock: 3,
      reason: 'Discarded due to 30-day storage expiration'
    },
    {
      id: 'log_004',
      timestamp: '2026-08-10, 02:00 PM',
      staffName: 'Nurse Radhika S',
      group: 'O+',
      component: 'Whole Blood',
      changeType: 'Stock Added',
      unitsChanged: 8,
      resultingStock: 22,
      reason: 'Rotary Blood Drive intake received'
    }
  ]);

  // Expiry Tracking State
  const [expiringUnits, setExpiringUnits] = useState<ExpiryItem[]>([
    { id: 'exp_1', group: 'O+', component: 'Whole Blood', units: 4, expiringInDays: 2 },
    { id: 'exp_2', group: 'A+', component: 'Platelets', units: 2, expiringInDays: 1 },
    { id: 'exp_3', group: 'B-', component: 'Plasma', units: 3, expiringInDays: 4 }
  ]);

  // Helper to record a new immutable Audit Entry
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

    setComprehensiveAuditLogs(prev => [entry, ...prev]);
  };

  // TRIGGER 1: Manual inline stock adjust (+ / -)
  const handleCellAdjust = (group: BloodGroup, component: ComponentType, delta: number) => {
    setMatrixStock(prev => {
      const current = prev[group]?.[component] || 0;
      const updated = Math.max(0, current + delta);

      recordAuditEntry(
        group,
        component,
        delta > 0 ? 'Stock Added' : 'Stock Corrected',
        delta,
        updated,
        `Manual stock count adjustment by ${staffName}`
      );

      showToast(`Updated ${group} (${component}) to ${updated} units.`);
      return {
        ...prev,
        [group]: {
          ...prev[group],
          [component]: updated
        }
      };
    });
  };

  // TRIGGER 2: Request approval confirmation (Stock Used linked to Request ID)
  const handleConfirmApproval = () => {
    if (!approvalModalReq) return;
    const { id, bloodGroup, unitsNeeded, patientName } = approvalModalReq;

    const currentUnits = matrixStock[bloodGroup as BloodGroup]?.['Whole Blood'] || 0;
    const updatedUnits = Math.max(0, currentUnits - unitsNeeded);

    setMatrixStock(prev => ({
      ...prev,
      [bloodGroup as BloodGroup]: {
        ...prev[bloodGroup as BloodGroup],
        'Whole Blood': updatedUnits
      }
    }));

    // Record Audit Log with Request ID
    recordAuditEntry(
      bloodGroup as BloodGroup,
      'Whole Blood',
      'Stock Used',
      -unitsNeeded,
      updatedUnits,
      `Fulfilled approved blood request for patient ${patientName}`,
      id
    );

    approveRequestByHospital(id);
    setApprovalModalReq(null);
  };

  // TRIGGER 3: Expiry-related removal
  const handleDiscardExpiringUnit = (item: ExpiryItem) => {
    const currentUnits = matrixStock[item.group]?.[item.component] || 0;
    const updatedUnits = Math.max(0, currentUnits - item.units);

    setMatrixStock(prev => ({
      ...prev,
      [item.group]: {
        ...prev[item.group],
        [item.component]: updatedUnits
      }
    }));

    recordAuditEntry(
      item.group,
      item.component,
      'Stock Expired/Removed',
      -item.units,
      updatedUnits,
      `Discarded ${item.units} units due to storage expiration (${item.expiringInDays} days remaining)`
    );

    setExpiringUnits(prev => prev.filter(e => e.id !== item.id));
    showToast(`Logged expiry removal of ${item.units} units of ${item.group} (${item.component}).`);
  };

  // TRIGGER 4: Hospital donation intake
  const handleConfirmIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUnits = matrixStock[intakeGroup]?.[intakeComponent] || 0;
    const updatedUnits = currentUnits + intakeUnits;

    setMatrixStock(prev => ({
      ...prev,
      [intakeGroup]: {
        ...prev[intakeGroup],
        [intakeComponent]: updatedUnits
      }
    }));

    recordAuditEntry(
      intakeGroup,
      intakeComponent,
      'Stock Added',
      intakeUnits,
      updatedUnits,
      `Donation intake received from: ${intakeDonorName}`
    );

    setShowIntakeModal(false);
    showToast(`Recorded intake of ${intakeUnits} units of ${intakeGroup} (${intakeComponent})!`);
  };

  const handleConfirmRejection = () => {
    if (!rejectionModalReq) return;
    rejectRequestByHospital(rejectionModalReq.id, rejectionReason);
    setRejectionModalReq(null);
  };

  const handleSendInfoRequest = (requestId: string) => {
    showToast(`Information request sent to requester: "${infoNoteText}"`);
    setInfoReqId(null);
  };

  // Workload Counters
  const pendingCount = requests.filter(r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS').length;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;
  const approvedTodayCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'DONOR_CONFIRMED' || r.status === 'COMPLETED').length;
  const rejectedTodayCount = requests.filter(r => r.status === 'REJECTED').length;

  const overdueCriticalReq = requests.find(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED');

  // Queue Filter & Sort
  const filteredQueue = requests.filter(r => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = filterBloodGroup === 'ALL' || r.bloodGroup === filterBloodGroup;
    const matchesUrgency = filterUrgency === 'ALL' || r.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchesSearch && matchesGroup && matchesUrgency && matchesStatus;
  });

  const sortedQueue = [...filteredQueue].sort((a, b) => {
    if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
    if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  const totalPages = Math.ceil(sortedQueue.length / itemsPerPage) || 1;
  const paginatedQueue = sortedQueue.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Navigation Desk Sub-Tabs */}
      <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeskTab('monitor')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              deskTab === 'monitor' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Desk Monitor & Queue
          </button>
          
          <button
            onClick={() => setDeskTab('audit_log')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              deskTab === 'audit_log' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Staff Stock Change Audit Log ({comprehensiveAuditLogs.length})
          </button>
        </div>

        <button
          onClick={() => setShowIntakeModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Record Donation Intake
        </button>
      </div>

      {/* VIEW 1: LIVE DESK MONITOR & QUEUE */}
      {deskTab === 'monitor' && (
        <div className="space-y-6">
          
          {/* Top Workload Summary Bar & Overdue Critical Alert */}
          <div className="space-y-3">
            {overdueCriticalReq && (
              <div className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-600 text-white flex items-center justify-between shadow-xl shadow-red-950 animate-pulse">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-red-200">⚠️ OVERDUE CRITICAL REQUEST ALERT</h4>
                    <p className="text-xs text-red-300">
                      Patient <strong>{overdueCriticalReq.patientName}</strong> ({overdueCriticalReq.bloodGroup}) requires <strong>{overdueCriticalReq.unitsNeeded} units</strong> immediately!
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase">
                  Action Required Now
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-extrabold">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Pending Queue</span>
                <span className="text-xl font-black text-amber-400">{pendingCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Critical Cases</span>
                <span className="text-xl font-black text-red-500">{criticalCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Approved Today</span>
                <span className="text-xl font-black text-emerald-400">{approvedTodayCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Rejected Today</span>
                <span className="text-xl font-black text-slate-500">{rejectedTodayCount}</span>
              </div>
            </div>
          </div>

          {/* BLOOD STOCK MONITOR MATRIX (8 GROUPS x 4 COMPONENTS) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-500" /> Hospital Blood Stock Monitor (8 Groups × 4 Components)
                </h3>
                <p className="text-[11px] text-slate-400">Inline quick-edit controls with automated audit trail logging</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-bold">Low Stock Threshold:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={lowThreshold}
                  onChange={e => setLowThreshold(Number(e.target.value))}
                  className="w-14 p-1 rounded-lg bg-slate-900 border border-slate-700 text-center font-bold text-white"
                />
                <span className="text-slate-400">units</span>
              </div>
            </div>

            {/* 8x4 Grid Table */}
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
                    const rowObj = matrixStock[group] || { 'Whole Blood': 0, 'Plasma': 0, 'Platelets': 0, 'Red Blood Cells': 0 };
                    const groupTotal = Object.values(rowObj).reduce((a, b) => a + b, 0);

                    return (
                      <tr key={group} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-2.5 font-sans font-black text-white text-xs">{group}</td>
                        
                        {(['Whole Blood', 'Plasma', 'Platelets', 'Red Blood Cells'] as ComponentType[]).map(comp => {
                          const count = rowObj[comp] || 0;
                          let bgClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80';
                          if (count === 0) bgClass = 'bg-red-950/60 text-red-300 border-red-800/80';
                          else if (count <= lowThreshold) bgClass = 'bg-amber-950/50 text-amber-300 border-amber-800/80';

                          return (
                            <td key={comp} className="p-2">
                              <div className={`p-2 rounded-xl border flex items-center justify-between gap-1 font-bold ${bgClass}`}>
                                <span>{count}u</span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => handleCellAdjust(group, comp, 1)}
                                    className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs"
                                    title="Add 1 Unit (Trigger 1: Manual Edit)"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => handleCellAdjust(group, comp, -1)}
                                    className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs"
                                    title="Subtract 1 Unit (Trigger 1: Manual Edit)"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        <td className="p-2.5 text-right font-sans font-extrabold text-white text-xs">
                          {groupTotal} units
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expiry Tracking Section (Trigger 3: Expiry Removal Action) */}
            <div className="pt-3 border-t border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Units Nearing Expiry (Action logs Trigger 3: Stock Expired/Removed):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {expiringUnits.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{item.group} ({item.component})</span>
                        <span className="text-[10px] text-amber-300 font-bold">{item.units} units • Expiring in {item.expiringInDays} days</span>
                      </div>

                      <button
                        onClick={() => handleDiscardExpiringUnit(item)}
                        className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 font-bold text-[10px] border border-red-800 flex items-center gap-1 shrink-0"
                        title="Discard & Log Expiry Removal"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* INCOMING BLOOD REQUESTS QUEUE */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base text-white">Incoming Blood Requests Queue</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Showing {paginatedQueue.length} of {sortedQueue.length} Requests</span>
            </div>

            {/* Search & Filters */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Patient Name, Requester Name, or Request ID..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Group Filter</label>
                  <select
                    value={filterBloodGroup}
                    onChange={e => { setFilterBloodGroup(e.target.value); setCurrentPage(1); }}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="ALL">All Blood Groups</option>
                    {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Urgency Level</label>
                  <select
                    value={filterUrgency}
                    onChange={e => { setFilterUrgency(e.target.value); setCurrentPage(1); }}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="ALL">All Emergency Levels</option>
                    <option value="CRITICAL">Critical (Within 2 Hours)</option>
                    <option value="HIGH">Urgent (Today)</option>
                    <option value="MODERATE">Normal (24-48 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Request Workflow Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="ALL">All Workflow Statuses</option>
                    <option value="PENDING_HOSPITAL_APPROVAL">Pending Approval</option>
                    <option value="VERIFIED_SEARCHING_DONORS">Verified - Searching Donors</option>
                    <option value="DONOR_CONFIRMED">Donor Confirmed</option>
                    <option value="APPOINTMENT_SCHEDULED">Appointment Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
              {paginatedQueue.map(req => {
                const stockCount = matrixStock[req.bloodGroup]?.['Whole Blood'] || 0;
                const hasSufficientStock = stockCount >= req.unitsNeeded;
                const timeAgoStr = calculateTimeAgo(req.requestedAt);
                const isCritical = req.urgency === 'CRITICAL';

                return (
                  <div
                    key={req.id}
                    className={`p-6 rounded-3xl bg-slate-950 border space-y-4 transition-all ${
                      isCritical
                        ? 'border-2 border-red-600/90 shadow-xl shadow-red-950/40 ring-1 ring-red-500 animate-pulse'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-sm shadow">
                            {req.bloodGroup}
                          </span>
                          <h4 className="font-extrabold text-base text-white">
                            {req.patientName} <span className="text-slate-400 font-normal">({req.patientAge || 34} yrs, {req.patientGender || 'Male'})</span>
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-amber-400 border border-slate-800">
                            {req.unitsNeeded} Units ({req.bloodComponent || 'Whole Blood'})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : req.urgency === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}>
                            Urgency: {req.urgency}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400" /> Requester ~4.2 km away
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Request ID: <span className="font-mono text-slate-300">{req.id}</span> • Required: <strong>{req.requiredDate} at {req.requiredTime || '10:00 AM'}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 block">Submitted {timeAgoStr}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1 inline-block ${
                          hasSufficientStock
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {hasSufficientStock ? `✅ In Stock (${stockCount}u avail)` : `⚠️ Insufficient (${stockCount}u avail)`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-slate-300">
                          Requester: <strong>{req.contactPerson}</strong> ({req.relationship || 'Family'})
                        </p>
                        <div className="flex items-center gap-3">
                          <a href={`tel:${req.contactPhone}`} className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Call ({req.contactPhone})
                          </a>
                          <button
                            type="button"
                            onClick={() => setViewAttachmentUrl(req.patientName)}
                            className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> View Prescription Slip
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {(req.status === 'PENDING_HOSPITAL_APPROVAL' || req.status === 'VERIFIED_SEARCHING_DONORS') && (
                          <>
                            <button
                              onClick={() => setApprovalModalReq(req)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => setInfoReqId(req.id)}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Ask Info
                            </button>
                            <button
                              onClick={() => setRejectionModalReq(req)}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 font-bold text-xs border border-slate-800 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-bold">
                  Page {currentPage} of {totalPages} ({sortedQueue.length} total items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold disabled:opacity-40 flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: DEDICATED AUDIT LOG TAB */}
      {deskTab === 'audit_log' && (
        <HospitalAuditLogViewer logs={comprehensiveAuditLogs} />
      )}

      {/* TRIGGER 4 MODAL: RECORD DONATION INTAKE FORM */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-600/80 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Record Donation Intake (Logs Trigger 4)
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">Stock Added</span>
            </div>

            <form onSubmit={handleConfirmIntake} className="space-y-3">
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
                  value={intakeComponent}
                  onChange={e => setIntakeComponent(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma">Plasma (FFP)</option>
                  <option value="Platelets">Platelets (PRP)</option>
                  <option value="Red Blood Cells">Red Blood Cells (PRBC)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Intake Unit Count *</label>
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
                <label className="text-slate-300 font-bold block mb-1">Donation Source / Drive Name *</label>
                <input
                  type="text"
                  value={intakeDonorName}
                  onChange={e => setIntakeDonorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIntakeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black">
                  Record Intake & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL (TRIGGER 2: Stock Used Linked to Request ID) */}
      {approvalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-600/80 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" /> Confirm Stock Reservation & Log Audit (Trigger 2)
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-slate-200 space-y-2">
              <p className="font-bold text-white">
                Approve request for <strong>{approvalModalReq.patientName}</strong>?
              </p>
              
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1 text-xs">
                <div>Blood Group: <strong className="text-red-400">{approvalModalReq.bloodGroup}</strong></div>
                <div>Units Needed: <strong className="text-white">{approvalModalReq.unitsNeeded} units</strong></div>
                <div>Linked Request ID: <strong className="text-blue-400">{approvalModalReq.id}</strong></div>
                <div>Change Type: <strong className="text-emerald-300">Stock Used</strong></div>
                <div className="text-emerald-300 pt-1 border-t border-slate-900">
                  Stock After Approval: <strong>{Math.max(0, (matrixStock[approvalModalReq.bloodGroup as BloodGroup]?.['Whole Blood'] || 0) - approvalModalReq.unitsNeeded)} units</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setApprovalModalReq(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Cancel
              </button>
              <button onClick={handleConfirmApproval} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black">
                Confirm Approval & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectionModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-600/80 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Reject Request (Record Reason)
            </h3>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Select Reason for Rejection *</label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="Insufficient Stock">Insufficient Hospital Stock</option>
                <option value="Invalid Request Credentials">Invalid Patient Credentials / ID</option>
                <option value="Duplicate Request Entry">Duplicate Request Entry</option>
                <option value="Other Medical Reason">Other Medical Reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectionModalReq(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Cancel
              </button>
              <button onClick={handleConfirmRejection} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
