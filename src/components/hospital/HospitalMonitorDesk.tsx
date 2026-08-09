import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, UrgencyLevel } from '../../types';
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
  User
} from 'lucide-react';

type ComponentType = 'Whole Blood' | 'Plasma' | 'Platelets' | 'Red Blood Cells';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  staffName: string;
  group: BloodGroup;
  component: ComponentType;
  change: number;
  newCount: number;
}

interface ExpiryItem {
  id: string;
  group: BloodGroup;
  component: ComponentType;
  units: number;
  expiringInDays: number;
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

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log_1',
      timestamp: 'Today, 09:15 AM',
      staffName: 'Dr. Mahesh Kulkarni',
      group: 'O-',
      component: 'Whole Blood',
      change: 1,
      newCount: 2
    },
    {
      id: 'log_2',
      timestamp: 'Today, 08:30 AM',
      staffName: 'Nurse Radhika S',
      group: 'A+',
      component: 'Platelets',
      change: -2,
      newCount: 6
    }
  ]);

  // Expiry Tracking State
  const [expiringUnits] = useState<ExpiryItem[]>([
    { id: 'exp_1', group: 'O+', component: 'Whole Blood', units: 4, expiringInDays: 2 },
    { id: 'exp_2', group: 'A+', component: 'Platelets', units: 2, expiringInDays: 1 },
    { id: 'exp_3', group: 'B-', component: 'Plasma', units: 3, expiringInDays: 4 }
  ]);

  // Ask for Info Note Popover State
  const [infoReqId, setInfoReqId] = useState<string | null>(null);
  const [infoNoteText, setInfoNoteText] = useState<string>('Please provide attending doctor phone & prescription copy.');

  // Inline Quick Stock Edit Handler
  const handleCellAdjust = (group: BloodGroup, component: ComponentType, delta: number) => {
    setMatrixStock(prev => {
      const current = prev[group]?.[component] || 0;
      const updated = Math.max(0, current + delta);

      // Log Audit Entry
      const newLog: AuditLogEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        staffName,
        group,
        component,
        change: delta,
        newCount: updated
      };
      setAuditLogs(l => [newLog, ...l]);

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

  const handleSendInfoRequest = (requestId: string) => {
    showToast(`Information request sent to requester: "${infoNoteText}"`);
    setInfoReqId(null);
  };

  // Workload Counters
  const pendingCount = requests.filter(r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS').length;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;
  const approvedTodayCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'DONOR_CONFIRMED' || r.status === 'COMPLETED').length;

  // Overdue Critical Requests Alert (Pending > 15 mins)
  const overdueCriticalReq = requests.find(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED');

  // Sorted Queue: Critical first, then by date
  const sortedQueue = [...requests].sort((a, b) => {
    if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
    if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL') return 1;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Workload Bar & Overdue Alert */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-extrabold">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Pending Requests Queue</span>
            <span className="text-xl font-black text-amber-400">{pendingCount}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Critical ICU Trauma Cases</span>
            <span className="text-xl font-black text-red-500">{criticalCount}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Actioned / Approved Today</span>
            <span className="text-xl font-black text-emerald-400">{approvedTodayCount}</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PART 1: BLOOD STOCK MONITOR MATRIX (8 GROUPS x 4 COMPONENTS) */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-500" /> Hospital Blood Stock Monitor (8 Groups × 4 Components)
            </h3>
            <p className="text-[11px] text-slate-400">Inline quick-edit controls with automated threshold alerts</p>
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
                                title="Add 1 Unit"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleCellAdjust(group, comp, -1)}
                                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs"
                                title="Subtract 1 Unit"
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

        {/* Expiry Tracking & Audit Logs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
          
          {/* Expiry Tracking Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Units Nearing Expiry (Prioritize Transfusion/Transfer):
            </span>
            <div className="space-y-1.5">
              {expiringUnits.map(item => (
                <div key={item.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">{item.group} ({item.component}) — {item.units} Units</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                    Expiring in {item.expiringInDays} days
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Log Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-extrabold text-blue-400 flex items-center gap-1.5">
              <History className="w-4 h-4" /> Staff Stock Change Audit Log:
            </span>
            <div className="space-y-1.5 max-h-28 overflow-y-auto font-mono text-[10px]">
              {auditLogs.map(log => (
                <div key={log.id} className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>[{log.timestamp}] {log.staffName}: {log.group} ({log.component}) {log.change > 0 ? `+${log.change}` : log.change} → {log.newCount}u</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* PART 2: INCOMING BLOOD REQUESTS QUEUE                 */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" /> Incoming Hospital Blood Requests Queue ({sortedQueue.length})
          </h3>
          <span className="text-[10px] text-slate-400">Prioritized by Urgency First</span>
        </div>

        <div className="space-y-4">
          {sortedQueue.map(req => {
            // Check Hospital Stock Coverage for requested blood group
            const stockCount = matrixStock[req.bloodGroup]?.['Whole Blood'] || 0;
            const hasSufficientStock = stockCount >= req.unitsNeeded;

            return (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                        {req.bloodGroup}
                      </span>
                      <h4 className="font-extrabold text-base text-white">{req.patientName}</h4>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        req.urgency === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : req.urgency === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        Urgency: {req.urgency}
                      </span>

                      {/* Stock Coverage Indicator */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        hasSufficientStock
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {hasSufficientStock ? `✅ In Stock (${stockCount}u avail)` : `⚠️ Insufficient Stock (${stockCount}u avail)`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Requester: <strong>{req.contactPerson} ({req.contactPhone})</strong> • Required Date: <strong>{req.requiredDate} at {req.requiredTime || '10:00 AM'}</strong>
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {req.status === 'PENDING_HOSPITAL_APPROVAL' && (
                      <>
                        <button
                          onClick={() => approveRequestByHospital(req.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>

                        <button
                          onClick={() => setInfoReqId(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Ask Info
                        </button>

                        <button
                          onClick={() => rejectRequestByHospital(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs border border-slate-700 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {req.status === 'DONOR_CONFIRMED' && (
                      <button
                        onClick={() => scheduleDonationAppointment(req.id, '2026-08-10', '10:00 AM', 'KIMS Blood Unit')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                      >
                        <Calendar className="w-4 h-4" /> Schedule Appt
                      </button>
                    )}

                    {req.status === 'APPOINTMENT_SCHEDULED' && (
                      <button
                        onClick={() => markDonationCompleted(req.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Ask Info Note Field Popover */}
                {infoReqId === req.id && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 text-xs">
                    <label className="font-bold text-slate-300 block">Note for Requester:</label>
                    <input
                      type="text"
                      value={infoNoteText}
                      onChange={e => setInfoNoteText(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setInfoReqId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 font-bold">
                        Cancel
                      </button>
                      <button onClick={() => handleSendInfoRequest(req.id)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">
                        Send Note
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
