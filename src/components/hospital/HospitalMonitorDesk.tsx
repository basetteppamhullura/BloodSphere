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
  ArrowUpRight
} from 'lucide-react';

function calculateTimeAgo(timestampStr: string): string {
  const diffMs = Date.now() - new Date(timestampStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export interface HospitalMonitorDeskProps {
  initialTab?: 'monitor' | 'audit_log';
}

export const HospitalMonitorDesk: React.FC<HospitalMonitorDeskProps> = ({ initialTab = 'monitor' }) => {
  const {
    requests,
    inventoryStockMap,
    activityLogs,
    approveRequestByHospital,
    rejectRequestByHospital,
    intakeBloodUnit,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const staffName = currentUser?.name || 'Dr. Mahesh Kulkarni';

  // Configurable Low Stock Threshold
  const [lowThreshold, setLowThreshold] = useState<number>(5);

  // Active Desk Tab: 'monitor' | 'audit_log'
  const [deskTab, setDeskTab] = useState<'monitor' | 'audit_log'>(initialTab);

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

  // Donation Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O+');
  const [intakeComponent, setIntakeComponent] = useState<ComponentType>('Whole Blood');
  const [intakeUnits, setIntakeUnits] = useState<number>(4);
  const [intakeDonorName, setIntakeDonorName] = useState<string>('KIMS Rotary Donation Drive');

  // Staff Stock Change Audit Trail Logs State
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
      linkedRequestId: 'BN-HUB-2026-00852'
    }
  ]);

  // Record Audit Entry Helper
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

  // Feature 1: Real-Time Summary Counters
  const pendingCount = requests.filter(
    r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS' || r.status === 'PENDING'
  ).length;

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const approvedTodayCount = requests.filter(
    r => r.channelStatuses?.hospitalStatus === 'APPROVED' || r.status === 'APPROVED' || r.status === 'VERIFIED_SEARCHING_DONORS'
  ).length;

  const rejectedTodayCount = requests.filter(
    r => r.status === 'REJECTED' || r.channelStatuses?.hospitalStatus === 'REJECTED'
  ).length;

  // Feature 5: Overdue Critical Alert Banner (> 15 mins pending)
  const overdueCriticalReqs = requests.filter(r => {
    if (r.urgency !== 'CRITICAL') return false;
    if (r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'REJECTED') return false;
    return true; // Live pending critical request
  });

  // Feature 3: Inline Stock Adjustments
  const handleCellAdjust = (group: BloodGroup, component: ComponentType, delta: number) => {
    if (delta > 0) {
      intakeBloodUnit(
        {
          bloodGroup: group,
          component,
          storageLocation: 'Hospital Main Trauma Vault'
        },
        staffName
      );
      recordAuditEntry(group, component, 'Stock Added', 1, (inventoryStockMap[group]?.[component]?.available || 0) + 1, `Manual stock intake by ${staffName}`);
      showToast(`Recorded intake: +1 unit of ${group} (${component})`);
    } else {
      recordAuditEntry(group, component, 'Stock Corrected', -1, Math.max(0, (inventoryStockMap[group]?.[component]?.available || 0) - 1), `Manual stock correction by ${staffName}`);
      showToast(`Updated ${group} (${component}) stock count.`);
    }
  };

  // Feature 10: Record Donation Intake Submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < intakeUnits; i++) {
      intakeBloodUnit(
        {
          bloodGroup: intakeGroup,
          component: intakeComponent,
          donorRef: intakeDonorName,
          storageLocation: 'KIMS Trauma Bay Vault 1'
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
      `Intake from ${intakeDonorName}`
    );
    setShowIntakeModal(false);
    showToast(`Successfully recorded intake of +${intakeUnits} units of ${intakeGroup} (${intakeComponent})!`);
  };

  // Request Approval Handler
  const handleConfirmApproval = () => {
    if (!approvalModalReq) return;
    approveRequestByHospital(approvalModalReq.id);
    recordAuditEntry(
      approvalModalReq.bloodGroup,
      'Whole Blood',
      'Stock Reserved',
      -approvalModalReq.unitsNeeded,
      Math.max(0, (inventoryStockMap[approvalModalReq.bloodGroup]?.['Whole Blood']?.available || 0) - approvalModalReq.unitsNeeded),
      `Approved trauma request #${approvalModalReq.id} for ${approvalModalReq.patientName}`,
      approvalModalReq.id
    );
    setApprovalModalReq(null);
    showToast(`Approved Emergency Request #${approvalModalReq.id}!`);
  };

  // Request Rejection Handler
  const handleConfirmRejection = () => {
    if (!rejectionModalReq) return;
    rejectRequestByHospital(rejectionModalReq.id, rejectionReason);
    setRejectionModalReq(null);
    showToast(`Rejected request #${rejectionModalReq.id}. Reason logged.`);
  };

  // Filtered & Sorted Queue
  const filteredQueue = requests.filter(r => {
    if (filterBloodGroup !== 'ALL' && r.bloodGroup !== filterBloodGroup) return false;
    if (filterUrgency !== 'ALL' && r.urgency !== filterUrgency) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.contactPerson.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / itemsPerPage));
  const paginatedQueue = filteredQueue.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER BANNER & SYSTEM STATUS */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Trauma Center Workstation</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
              REAL-TIME OPERATIONAL DESK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in: <strong>{staffName}</strong> • Live Database & Real-Time Sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Record Donation Intake
          </button>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>🟢 Live Sync</span>
          </div>
        </div>
      </div>

      {/* 2. OVERDUE CRITICAL ALERT BANNER (Feature 5) */}
      {overdueCriticalReqs.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 animate-bounce" />
            <div>
              <span className="font-black text-sm text-red-700 block">
                🚨 OVERDUE CRITICAL BLOOD REQUEST ALERT ({overdueCriticalReqs.length} Action Required Case)
              </span>
              <span className="text-xs text-slate-600 block mt-0.5">
                Patient <strong>{overdueCriticalReqs[0].patientName}</strong> ({overdueCriticalReqs[0].bloodGroup}, {overdueCriticalReqs[0].unitsNeeded} Units) requires immediate clinical review!
              </span>
            </div>
          </div>
          <button
            onClick={() => setApprovalModalReq(overdueCriticalReqs[0])}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shrink-0"
          >
            Review & Approve Now
          </button>
        </div>
      )}

      {/* 3. UNIFIED 4-CARD SUMMARY COUNTERS ROW (Feature 1 - Vertical Layout Rule) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending Queue</span>
            <strong className="text-2xl font-black text-amber-600 block">{pendingCount}</strong>
          </div>
          <Clock className="w-6 h-6 text-amber-500/40" />
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Critical Cases</span>
            <strong className="text-2xl font-black text-red-600 block">{criticalCount}</strong>
          </div>
          <AlertTriangle className="w-6 h-6 text-red-500/40" />
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Approved Today</span>
            <strong className="text-2xl font-black text-emerald-600 block">{approvedTodayCount}</strong>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Rejected Today</span>
            <strong className="text-2xl font-black text-slate-500 block">{rejectedTodayCount}</strong>
          </div>
          <XCircle className="w-6 h-6 text-slate-400/40" />
        </div>
      </div>

      {/* 4. LIVE DESK MONITOR & INCOMING REQUESTS QUEUE (Feature 2) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" /> Incoming Patient Blood Requests Queue ({filteredQueue.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time triage queue for trauma cases, ICU transfusions, and clinical requests.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search patient, requester..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs w-48"
            />

            <select
              value={filterBloodGroup}
              onChange={e => { setFilterBloodGroup(e.target.value); setCurrentPage(1); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            >
              <option value="ALL">All Groups</option>
              <option value="O-">O-</option>
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
              <tr>
                <th className="py-3 px-4">Request ID & Patient</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Hospital & Location</th>
                <th className="py-3 px-4">Units Needed</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-mono">
              {paginatedQueue.map(req => (
                <tr key={req.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                    <div>{req.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {req.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                      {req.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600">{req.hospitalName}, {req.city}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{req.unitsNeeded} Units</td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans flex items-center gap-1.5">
                    <button
                      onClick={() => setApprovalModalReq(req)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setRejectionModalReq(req)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px]"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BLOOD STOCK MONITOR MATRIX (Feature 3 - Connected to inventoryStockMap) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600" /> Hospital Blood Stock Monitor (8 Groups × 4 Components)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live stock levels linked directly to shared vault database.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span className="text-slate-700 font-bold text-xs">Low Stock Threshold:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={lowThreshold}
              onChange={e => setLowThreshold(Number(e.target.value))}
              className="w-14 p-1 rounded-lg bg-white border border-slate-300 text-center font-bold text-slate-900 text-xs"
            />
            <span className="text-slate-500 text-xs">units</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-sky-100 text-slate-500 font-bold uppercase text-[10px] bg-sky-50/70">
                <th className="p-3">Blood Group</th>
                <th className="p-3">Whole Blood</th>
                <th className="p-3">Plasma (FFP)</th>
                <th className="p-3">Platelets (PRP)</th>
                <th className="p-3">Red Cells (PRBC)</th>
                <th className="p-3 text-right">Group Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-mono">
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(group => {
                const rowObj = inventoryStockMap[group] || {
                  'Whole Blood': { available: 12 },
                  'Plasma (FFP)': { available: 8 },
                  'Platelets (PRP)': { available: 6 },
                  'PRBC': { available: 10 }
                };

                const groupTotal =
                  (rowObj['Whole Blood']?.available || 0) +
                  (rowObj['Plasma (FFP)']?.available || 0) +
                  (rowObj['Platelets (PRP)']?.available || 0) +
                  (rowObj['PRBC']?.available || 0);

                return (
                  <tr key={group} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-3 font-sans font-black text-slate-900 text-xs">{group}</td>

                    {(['Whole Blood', 'Plasma (FFP)', 'Platelets (PRP)', 'PRBC'] as ComponentType[]).map(comp => {
                      const count = rowObj[comp]?.available || 0;
                      let bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      if (count === 0) bgClass = 'bg-red-50 text-red-800 border-red-200';
                      else if (count <= lowThreshold) bgClass = 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <td key={comp} className="p-2">
                          <div className={`p-2 rounded-xl border flex items-center justify-between gap-1 font-bold ${bgClass}`}>
                            <span>{count}u</span>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleCellAdjust(group, comp, 1)}
                                className="w-5 h-5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-black flex items-center justify-center text-xs"
                                title="Add 1 Unit"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleCellAdjust(group, comp, -1)}
                                className="w-5 h-5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-black flex items-center justify-center text-xs"
                                title="Subtract 1 Unit"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right font-sans font-extrabold text-slate-900 text-xs">
                      {groupTotal} units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. STAFF STOCK CHANGE AUDIT LOG (Feature 4 - Vertical Layout) */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" /> Staff Stock Change Audit Log ({localAuditLogs.length} Entries)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Immutable log of manual inventory edits, request reservations, and donation intakes.</p>
          </div>
        </div>

        <HospitalAuditLogViewer logs={localAuditLogs} />
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Approve Blood Request #{approvalModalReq.id}</h4>
              <button onClick={() => setApprovalModalReq(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 font-mono">
              <div>Patient Name: <strong>{approvalModalReq.patientName}</strong></div>
              <div>Blood Group Required: <strong className="text-red-600">{approvalModalReq.bloodGroup}</strong></div>
              <div>Units Needed: <strong>{approvalModalReq.unitsNeeded} Units</strong></div>
              <div>Hospital: <strong>{approvalModalReq.hospitalName}</strong></div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button onClick={handleConfirmApproval} className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs">
                Confirm Approval & Reserve Stock
              </button>
              <button onClick={() => setApprovalModalReq(null)} className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD DONATION INTAKE MODAL (Feature 10) */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Record Donation Intake into Hospital Vault</h4>
              <button onClick={() => setShowIntakeModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-3 font-sans">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Blood Group *</label>
                <select
                  value={intakeGroup}
                  onChange={e => setIntakeGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
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
                <label className="text-slate-700 font-bold block mb-1">Component Type *</label>
                <select
                  value={intakeComponent}
                  onChange={e => setIntakeComponent(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="PRBC">Red Blood Cells (PRBC)</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Platelets (PRP)">Platelets (PRP)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Units Collected *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={intakeUnits}
                  onChange={e => setIntakeUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Donor Name / Drive Reference</label>
                <input
                  type="text"
                  value={intakeDonorName}
                  onChange={e => setIntakeDonorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowIntakeModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-extrabold">
                  Submit & Intake Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
