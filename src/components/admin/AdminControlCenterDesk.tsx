import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';
import {
  ShieldCheck,
  Users,
  Building2,
  Droplet,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Package,
  Heart,
  UserCheck,
  History,
  BarChart3,
  Globe,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  Ban,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  Activity
} from 'lucide-react';

export interface FraudReportItem {
  id: string;
  reporterName: string;
  targetEntity: string;
  entityType: 'Request' | 'Hospital' | 'BloodBank' | 'Donor';
  reason: string;
  timestamp: string;
  status: 'New' | 'Under Review' | 'Resolved' | 'Rejected';
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetEntity: string;
  entityId: string;
  details: string;
}

export const AdminControlCenterDesk: React.FC = () => {
  const { requests, showToast } = useApp();
  const { portalAccounts, updateAccountStatusByAdmin, currentUser } = useAuth();
  const adminName = currentUser?.name || 'Super Admin (System Control)';

  // Active Admin Sub-View Tab (16 Sub-Views)
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'hospitals'
    | 'bloodbanks'
    | 'requests'
    | 'emergency'
    | 'shortages'
    | 'inventory'
    | 'donors'
    | 'requesters'
    | 'fraud'
    | 'notifications'
    | 'audit'
    | 'analytics'
    | 'health'
    | 'settings'
  >('dashboard');

  // Search & Filter State for Users
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Fraud Reports State
  const [fraudReports, setFraudReports] = useState<FraudReportItem[]>([
    { id: 'RPT-101', reporterName: 'Dr. Mahesh Kulkarni', targetEntity: 'REQ-BN-9921', entityType: 'Request', reason: 'Suspected duplicate entry for same patient', timestamp: 'Today, 11:20 AM', status: 'New' },
    { id: 'RPT-102', reporterName: 'Rotary Blood Center', targetEntity: 'DNR-Hubballi-099', entityType: 'Donor', reason: 'Failed 3-month donation interval check', timestamp: 'Yesterday, 04:15 PM', status: 'Under Review' }
  ]);

  // Immutable Admin Audit Logs State
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditEntry[]>([
    { id: 'ADM-AUD-001', timestamp: '2026-08-11 09:30 AM', adminName, action: 'HOSPITAL_VERIFIED', targetEntity: 'Hospital', entityId: 'hosp_kims', details: 'KIMS Teaching Hospital verified by Super Admin' },
    { id: 'ADM-AUD-002', timestamp: '2026-08-11 10:15 AM', adminName, action: 'BLOODBANK_VERIFIED', targetEntity: 'BloodBank', entityId: 'bank_rotary', details: 'Rotary Blood Bank license verified' }
  ]);

  // Platform Threshold Settings State
  const [stockThreshold, setStockThreshold] = useState<number>(5);
  const [emergencyThresholdMins, setEmergencyThresholdMins] = useState<number>(15);

  const logAdminAction = (action: string, targetEntity: string, entityId: string, details: string) => {
    const entry: AdminAuditEntry = {
      id: `ADM-AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      adminName,
      action,
      targetEntity,
      entityId,
      details
    };
    setAdminAuditLogs(prev => [entry, ...prev]);
  };

  const handleVerifyHospital = (accountId: string, hospName: string) => {
    updateAccountStatusByAdmin(accountId, 'Verified');
    logAdminAction('HOSPITAL_VERIFIED', 'Hospital', accountId, `Verified hospital registration for ${hospName}`);
    showToast(`✅ Hospital "${hospName}" verified successfully! Access granted.`);
  };

  const handleVerifyBloodBank = (accountId: string, bankName: string) => {
    updateAccountStatusByAdmin(accountId, 'Verified');
    logAdminAction('BLOODBANK_VERIFIED', 'BloodBank', accountId, `Verified blood bank license for ${bankName}`);
    showToast(`✅ Blood Bank "${bankName}" verified successfully! Access granted.`);
  };

  const handleToggleUserStatus = (accountId: string, userName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Suspended' ? 'Verified' : 'Suspended';
    updateAccountStatusByAdmin(accountId, newStatus);
    logAdminAction(newStatus === 'Suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED', 'User', accountId, `${newStatus} user account for ${userName}`);
    showToast(`User "${userName}" account status updated to ${newStatus}.`);
  };

  const handleResolveFraudReport = (reportId: string, status: 'Resolved' | 'Rejected') => {
    setFraudReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status } : r))
    );
    logAdminAction('FRAUD_REPORT_ACTION', 'FraudReport', reportId, `Marked report ${reportId} as ${status}`);
    showToast(`Report ${reportId} marked as ${status}.`);
  };

  // Filtered Users
  const filteredUsers = portalAccounts.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate System Metrics
  const pendingHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Pending Verification').length;
  const verifiedHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Verified').length + 42;
  const pendingBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Pending Verification').length;
  const verifiedBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Verified').length + 18;
  const totalRequestsCount = requests.length;
  const criticalRequestsCount = requests.filter(r => r.urgency === 'CRITICAL').length;

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Top Super Admin Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Super Admin<span className="text-emerald-400"> Control & Monitoring Portal</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SUPER_ADMIN ROLE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Platform-Wide Verification, Fraud Resolution, & Network Health Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-extrabold text-xs">
            Logged in as: <strong className="text-emerald-400">{adminName}</strong>
          </span>
        </div>
      </div>

      {/* 16 SUB-VIEWS NAVIGATION BAR */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'hospitals' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Hospitals ({pendingHospitalsCount})
        </button>

        <button
          onClick={() => setActiveTab('bloodbanks')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'bloodbanks' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplet className="w-4 h-4" /> Blood Banks ({pendingBloodBanksCount})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'requests' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Request Monitor
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'emergency' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" /> Emergency ({criticalRequestsCount})
        </button>

        <button
          onClick={() => setActiveTab('shortages')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'shortages' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Shortages
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'fraud' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" /> Fraud Reports ({fraudReports.filter(r => r.status === 'New').length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'audit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> Audit Log ({adminAuditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'settings' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 1: REAL-TIME DASHBOARD                      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-extrabold">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Verified Hospitals</span>
              <span className="text-2xl font-black text-blue-400 block">{verifiedHospitalsCount}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Verified Blood Banks</span>
              <span className="text-2xl font-black text-emerald-400 block">{verifiedBloodBanksCount}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Pending Verifications</span>
              <span className="text-2xl font-black text-amber-400 block">
                {pendingHospitalsCount + pendingBloodBanksCount}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total Blood Requests</span>
              <span className="text-2xl font-black text-white block">{totalRequestsCount}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" /> City-Wise Regional Network Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-extrabold text-white text-sm">Hubballi</h4>
                <p className="text-slate-400 text-[11px] mt-1">Requests: 120 • Available Units: 850</p>
                <span className="text-emerald-400 font-bold block mt-1">Shortages: 0</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-extrabold text-white text-sm">Dharwad</h4>
                <p className="text-slate-400 text-[11px] mt-1">Requests: 45 • Available Units: 340</p>
                <span className="text-emerald-400 font-bold block mt-1">Shortages: 0</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-extrabold text-white text-sm">Belagavi</h4>
                <p className="text-slate-400 text-[11px] mt-1">Requests: 82 • Available Units: 610</p>
                <span className="text-amber-400 font-bold block mt-1">Shortages: 1</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-extrabold text-white text-sm">Bengaluru</h4>
                <p className="text-slate-400 text-[11px] mt-1">Requests: 450 • Available Units: 4,200</p>
                <span className="text-emerald-400 font-bold block mt-1">Shortages: 0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 2: USER MANAGEMENT                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Platform User Management (/admin/users)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total Users: {portalAccounts.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search users by name, email, or ID..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
            >
              <option value="ALL">All Roles</option>
              <option value="donor">Donor</option>
              <option value="requester">Requester</option>
              <option value="hospital">Hospital</option>
              <option value="bloodbank">Blood Bank</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-2.5">User ID</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="p-2.5 text-blue-400 font-bold">{u.id}</td>
                    <td className="p-2.5 font-sans font-bold text-white">{u.name}</td>
                    <td className="p-2.5 text-slate-300">{u.email}</td>
                    <td className="p-2.5 font-sans uppercase text-[10px] font-black text-amber-400">{u.role}</td>
                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        u.status === 'Verified' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-sans">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border ${
                          u.status === 'Suspended'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}
                      >
                        {u.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 3: HOSPITAL VERIFICATION DESK               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'hospitals' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" /> Hospital Verification & License Desk (/admin/hospitals)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Pending: {pendingHospitalsCount}</span>
          </div>

          <div className="space-y-3">
            {portalAccounts.filter(a => a.role === 'hospital').map(h => (
              <div key={h.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm">{h.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      h.status === 'Verified' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Email: {h.email} • ID: <span className="font-mono text-slate-300">{h.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {h.status !== 'Verified' && (
                    <button
                      onClick={() => handleVerifyHospital(h.id, h.name)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Verify Hospital License
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleUserStatus(h.id, h.name, h.status)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-red-400 font-bold text-xs border border-slate-800"
                  >
                    {h.status === 'Suspended' ? 'Activate' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 4: BLOOD BANK VERIFICATION DESK             */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'bloodbanks' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-emerald-400" /> Blood Bank License Verification Desk (/admin/bloodbanks)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Pending: {pendingBloodBanksCount}</span>
          </div>

          <div className="space-y-3">
            {portalAccounts.filter(a => a.role === 'bloodbank').map(b => (
              <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm">{b.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      b.status === 'Verified' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    License: <span className="font-mono text-slate-300">BB-LIC-2026-HUB</span> • Email: {b.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {b.status !== 'Verified' && (
                    <button
                      onClick={() => handleVerifyBloodBank(b.id, b.name)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Verify License
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleUserStatus(b.id, b.name, b.status)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-red-400 font-bold text-xs border border-slate-800"
                  >
                    {b.status === 'Suspended' ? 'Activate' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 8: FRAUD & ABUSE REPORTS                    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'fraud' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" /> Fraud & Abuse Resolution Desk (/admin/reports)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Open Reports: {fraudReports.filter(r => r.status === 'New').length}</span>
          </div>

          <div className="space-y-3">
            {fraudReports.map(rpt => (
              <div key={rpt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold">{rpt.id}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold text-[10px] uppercase">{rpt.entityType}</span>
                    <h4 className="font-extrabold text-white text-sm">{rpt.targetEntity}</h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">Reason: {rpt.reason}</p>
                  <span className="text-[10px] text-slate-500">Reported by: {rpt.reporterName} ({rpt.timestamp})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveFraudReport(rpt.id, 'Resolved')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolveFraudReport(rpt.id, 'Rejected')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 9: IMMUTABLE AUDIT LOG                      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" /> Immutable Administrative Audit Log (/admin/audit-log)
            </h3>
            <span className="text-xs text-slate-400 font-mono">No Edit / Delete Control Buttons</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {adminAuditLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>[{l.timestamp}] <strong>{l.adminName}</strong>: {l.details}</span>
                <span className="text-emerald-400 font-bold text-xs">{l.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 10: PLATFORM SETTINGS                       */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-5 h-5 text-amber-400" /> Platform Configuration Thresholds (/admin/settings)
          </h3>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Global Low Stock Minimum Threshold (Units)</label>
              <input
                type="number"
                value={stockThreshold}
                onChange={e => setStockThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Request Un-Actioned Alert Threshold (Minutes)</label>
              <input
                type="number"
                value={emergencyThresholdMins}
                onChange={e => setEmergencyThresholdMins(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <button
              onClick={() => showToast('Platform settings updated successfully!')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md"
            >
              Save Configuration Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
