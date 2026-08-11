import React, { useState } from 'react';
import { BloodGroup } from '../../types';
import { History, Search, Download, ShieldCheck, Filter, FileText } from 'lucide-react';

export type ChangeType = 'Stock Added' | 'Stock Used' | 'Stock Corrected' | 'Stock Expired/Removed';

export interface ComprehensiveAuditLogEntry {
  id: string;
  timestamp: string;
  staffName: string;
  group: BloodGroup;
  component: string;
  changeType: ChangeType;
  unitsChanged: number;
  resultingStock: number;
  reason?: string;
  linkedRequestId?: string;
}

interface HospitalAuditLogViewerProps {
  logs: ComprehensiveAuditLogEntry[];
}

export const HospitalAuditLogViewer: React.FC<HospitalAuditLogViewerProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStaff, setFilterStaff] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterChangeType, setFilterChangeType] = useState<string>('ALL');

  // Extract unique staff members
  const staffList = Array.from(new Set(logs.map(l => l.staffName)));

  // Filter & Search Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.linkedRequestId && log.linkedRequestId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.staffName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStaff = filterStaff === 'ALL' || log.staffName === filterStaff;
    const matchesGroup = filterGroup === 'ALL' || log.group === filterGroup;
    const matchesType = filterChangeType === 'ALL' || log.changeType === filterChangeType;

    return matchesSearch && matchesStaff && matchesGroup && matchesType;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Staff Name', 'Blood Group', 'Component', 'Change Type', 'Units Changed', 'Resulting Stock', 'Reason', 'Linked Request ID'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.staffName}"`,
      l.group,
      l.component,
      l.changeType,
      l.unitsChanged,
      l.resultingStock,
      `"${l.reason || ''}"`,
      l.linkedRequestId || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hospital_stock_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs animate-in fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" /> Permanent Staff Stock Change Audit Log
          </h3>
          <p className="text-[11px] text-slate-400">Immutable record of all stock additions, usage, adjustments, and expiry removals</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Export CSV Log
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Reason text, Request ID, or Staff Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Staff Member</label>
            <select
              value={filterStaff}
              onChange={e => setFilterStaff(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
            >
              <option value="ALL">All Staff Members</option>
              {staffList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Blood Group</label>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
            >
              <option value="ALL">All Blood Groups</option>
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Change Type</label>
            <select
              value={filterChangeType}
              onChange={e => setFilterChangeType(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
            >
              <option value="ALL">All Change Types</option>
              <option value="Stock Added">Stock Added (Intake / Donation)</option>
              <option value="Stock Used">Stock Used (Approved Request)</option>
              <option value="Stock Corrected">Stock Corrected (Manual Edit)</option>
              <option value="Stock Expired/Removed">Stock Expired / Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <th className="p-2.5">Time</th>
              <th className="p-2.5">Staff Member</th>
              <th className="p-2.5">Group</th>
              <th className="p-2.5">Component</th>
              <th className="p-2.5">Change Type</th>
              <th className="p-2.5">Units</th>
              <th className="p-2.5">New Total</th>
              <th className="p-2.5">Reason / Note</th>
              <th className="p-2.5">Linked Request</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500 font-sans">
                  No audit log entries match current search or filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-2.5 text-slate-400 font-sans text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-2.5 font-sans font-bold text-white whitespace-nowrap">{log.staffName}</td>
                  <td className="p-2.5 font-sans font-black text-red-400">{log.group}</td>
                  <td className="p-2.5 font-sans text-slate-300">{log.component}</td>
                  
                  <td className="p-2.5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      log.changeType === 'Stock Added'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : log.changeType === 'Stock Used'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : log.changeType === 'Stock Expired/Removed'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {log.changeType}
                    </span>
                  </td>

                  <td className={`p-2.5 font-bold ${log.unitsChanged > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {log.unitsChanged > 0 ? `+${log.unitsChanged}` : log.unitsChanged} u
                  </td>

                  <td className="p-2.5 text-white font-extrabold">{log.resultingStock} u</td>

                  <td className="p-2.5 font-sans text-slate-300 max-w-xs truncate">
                    {log.reason || 'Standard system adjustment'}
                  </td>

                  <td className="p-2.5 font-mono text-slate-400">
                    {log.linkedRequestId ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400">
                        {log.linkedRequestId}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
