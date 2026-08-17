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
  const { requests, inventoryStockMap, bloodUnitsList, showToast } = useApp();
  const { portalAccounts, updateAccountStatusByAdmin, currentUser } = useAuth();
  const adminName = currentUser?.name || 'Super Admin (System Control)';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'requests' | 'fraud' | 'audit' | 'analytics' | 'network'
  >('overview');

  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Compute live admin statistics
  const totalAccountsCount = portalAccounts.length;
  const verifiedHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.verificationStatus === 'VERIFIED').length;
  const verifiedBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.verificationStatus === 'VERIFIED').length;
  const totalRequestsCount = requests.length;

  const totalAvailableUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.available, 0),
    0
  );

  const totalIssuedUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + b.issued, 0),
    0
  );

  const expiredUnitsCount = bloodUnitsList.filter(u => u.status === 'EXPIRED').length;

  const filteredAccounts = portalAccounts.filter(acc => {
    if (roleFilter !== 'ALL' && acc.role !== roleFilter) return false;
    if (searchAccountQuery.trim()) {
      const q = searchAccountQuery.toLowerCase().trim();
      return acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q) || (acc.licenseNumber || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Operations Center</h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
              GOVERNANCE PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Logged in as: <strong>{adminName}</strong> • Real-Time Administrative Control</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> Network Healthy
          </span>
        </div>
      </div>

      {/* ADMIN SUB-NAV TABS */}
      <div className="p-1.5 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center gap-1 overflow-x-auto font-extrabold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> System Overview
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Account Verification ({totalAccountsCount})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'requests' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Requests Monitor ({totalRequestsCount})
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'fraud' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-500" /> Anti-Fraud Audit
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Supply Analytics
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
              <span className="text-[10px] text-slate-500 font-sans block">Total Portal Accounts</span>
              <strong className="text-2xl font-black text-slate-900 block mt-1">{totalAccountsCount}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
              <span className="text-[10px] text-slate-500 font-sans block">Verified Hospitals</span>
              <strong className="text-2xl font-black text-sky-600 block mt-1">{verifiedHospitalsCount} Facilities</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
              <span className="text-[10px] text-slate-500 font-sans block">Verified Blood Banks</span>
              <strong className="text-2xl font-black text-emerald-600 block mt-1">{verifiedBloodBanksCount} Centers</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
              <span className="text-[10px] text-slate-500 font-sans block">Total Available Stock</span>
              <strong className="text-2xl font-black text-indigo-600 block mt-1">{totalAvailableUnits} Units</strong>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-3">
              <Globe className="w-5 h-5 text-sky-600" /> Regional Healthcare Network Health
            </h3>
            <p className="text-xs text-slate-500">
              Blood Net operates uninterrupted across Karnataka regional healthcare hubs (Hubballi, Dharwad, Belagavi, Bengaluru).
            </p>
          </div>
        </div>
      )}

      {/* USERS ACCOUNT VERIFICATION TAB */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" /> Multi-Role Account Management ({filteredAccounts.length})
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search name / email..."
                value={searchAccountQuery}
                onChange={e => setSearchAccountQuery(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              />

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                <option value="ALL">All Roles</option>
                <option value="donor">Donors</option>
                <option value="requester">Requesters</option>
                <option value="hospital">Hospitals</option>
                <option value="bloodbank">Blood Banks</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">License / Reg Number</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {filteredAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                      <div>{acc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">{acc.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans uppercase font-bold text-sky-700">{acc.role}</td>
                    <td className="py-3.5 px-4 text-slate-600">{acc.licenseNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        acc.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : acc.verificationStatus === 'SUSPENDED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {acc.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {acc.verificationStatus !== 'VERIFIED' ? (
                        <button
                          onClick={() => updateAccountStatusByAdmin(acc.id, 'VERIFIED')}
                          className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shadow-xs"
                        >
                          Approve Verification
                        </button>
                      ) : (
                        <button
                          onClick={() => updateAccountStatusByAdmin(acc.id, 'SUSPENDED')}
                          className="px-3 py-1 rounded-xl bg-red-100 text-red-700 font-bold text-[11px] border border-red-200"
                        >
                          Suspend Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
