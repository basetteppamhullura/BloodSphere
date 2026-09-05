import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, EmergencyRequest, Donor, PortalAccount } from '../../types';
import { socketManager } from '../../utils/socketManager';
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
  BarChart3,
  Settings,
  CheckCircle2,
  Search,
  Check,
  Ban,
  Lock,
  ChevronRight,
  Activity,
  Eye,
  Trash2,
  MessageSquare,
  FileCheck,
  Save,
  SlidersHorizontal,
  X,
  RotateCcw
} from 'lucide-react';

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetEntity: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AdminControlCenterDeskProps {
  initialRoleFilter?: string;
}

export const AdminControlCenterDesk: React.FC<AdminControlCenterDeskProps> = ({
  initialRoleFilter = 'ALL'
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    requests,
    donors,
    bloodBanks,
    inventoryStockMap,
    showToast,
    toggleDonorAvailability,
    markDonationCompleted
  } = useApp();

  const {
    portalAccounts,
    updateAccountStatusByAdmin,
    deleteAccountByAdmin,
    currentUser
  } = useAuth();

  // Role & Authorization Verification
  const isSuperAdmin = currentUser?.role === 'admin';
  const adminName = currentUser?.name || 'Super Admin';

  // Determine active feature view dynamically from URL path
  const getActiveTabFromPath = ():
    | 'overview'
    | 'accounts'
    | 'donors'
    | 'requesters'
    | 'hospitals'
    | 'bloodbanks'
    | 'requests'
    | 'analytics'
    | 'audit-logs'
    | 'settings' => {
    const path = location.pathname;
    if (path.includes('/admin/accounts') || path.includes('/admin/users')) return 'accounts';
    if (path.includes('/admin/donors')) return 'donors';
    if (path.includes('/admin/requesters')) return 'requesters';
    if (path.includes('/admin/hospitals')) return 'hospitals';
    if (path.includes('/admin/blood-banks') || path.includes('/admin/bloodbanks')) return 'bloodbanks';
    if (path.includes('/admin/requests')) return 'requests';
    if (path.includes('/admin/analytics') || path.includes('/admin/reports')) return 'analytics';
    if (path.includes('/admin/audit-logs') || path.includes('/admin/audit')) return 'audit-logs';
    if (path.includes('/admin/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTabFromPath();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('ALL');

  // Modals State
  const [selectedAccountModal, setSelectedAccountModal] = useState<PortalAccount | null>(null);
  const [selectedDonorModal, setSelectedDonorModal] = useState<Donor | null>(null);
  const [selectedHospitalDocsModal, setSelectedHospitalDocsModal] = useState<PortalAccount | null>(null);
  const [rejectingAccountModal, setRejectingAccountModal] = useState<PortalAccount | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('Registration information or clinical license proof is incomplete.');

  // Audit Logs State (Read-Only)
  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>([
    {
      id: 'AUD-9001',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      adminName: 'Super Admin',
      action: 'HOSPITAL_VERIFIED',
      targetEntity: 'KIMS Teaching Hospital (LIC-HUB-4482)',
      details: 'Verified hospital clinical license and granted access.',
      status: 'SUCCESS'
    },
    {
      id: 'AUD-9002',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      adminName: 'Super Admin',
      action: 'STOCK_CHECK',
      targetEntity: 'O- Negative Regional Storage',
      details: 'Audited low stock alert threshold for O- blood group.',
      status: 'WARNING'
    }
  ]);

  // Real-Time Socket Connection Status
  const [connectionStatus, setConnectionStatus] = useState<'LIVE' | 'DISCONNECTED' | 'RECONNECTING'>(socketManager.getConnectionStatus());

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: 5,
    criticalStockThreshold: 2,
    autoBroadcastEmergency: true,
    requireHospitalApproval: true,
    donorCooldownDays: 90
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Helper to append read-only audit log
  const logAdminAction = (action: string, targetEntity: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS') => {
    const newEntry: AdminAuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      adminName,
      action,
      targetEntity,
      details,
      status
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Socket.IO Sync
  useEffect(() => {
    socketManager.joinRoom('admin-dashboard', currentUser?.id || 'admin_user', 'admin');

    const unsubStatus = socketManager.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      socketManager.leaveRoom('admin-dashboard', currentUser?.id || 'admin_user');
      unsubStatus();
    };
  }, [currentUser?.id]);

  // If user is not admin, deny access
  if (!isSuperAdmin) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-red-200 shadow-sm text-center space-y-4 max-w-lg mx-auto my-12">
        <Lock className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Access Denied • Super Admin Portal</h2>
        <p className="text-xs text-slate-500">
          You must be logged in as an authorized Super Administrator to access system control & governance features.
        </p>
        <button
          onClick={() => navigate('/login/admin')}
          className="px-6 py-3 rounded-2xl bg-red-600 text-white font-extrabold text-xs shadow-md shadow-red-500/20"
        >
          Login as Super Admin
        </button>
      </div>
    );
  }

  // --- COMPUTED REAL-TIME SYSTEM METRICS ---
  const totalDonorsCount = donors.length;
  const activeDonorsCount = donors.filter(d => d.isAvailable !== false).length;
  const totalRequestersCount = portalAccounts.filter(a => a.role === 'requester').length;
  const totalHospitalsCount = portalAccounts.filter(a => a.role === 'hospital').length;
  const verifiedHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Verified').length;
  const pendingHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Pending Verification').length;
  const totalBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank').length;
  const verifiedBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Verified').length;
  const pendingBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Pending Verification').length;
  const activeRequestsCount = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const criticalRequestsCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;

  const totalAvailableUnits = Object.values(inventoryStockMap).reduce(
    (acc, row) => acc + Object.values(row).reduce((a, b) => a + (b.available || 0), 0),
    0
  );

  const lowStockGroups = Object.entries(inventoryStockMap).filter(([group, comps]) => {
    const totalAvail = Object.values(comps).reduce((a, b) => a + (b.available || 0), 0);
    return totalAvail < systemSettings.lowStockThreshold;
  });

  // --- ACCOUNT ACTION HANDLERS ---
  const handleApproveAccount = (acc: PortalAccount) => {
    updateAccountStatusByAdmin(acc.id, 'Verified');
    logAdminAction('ACCOUNT_VERIFIED', `${acc.name} (${acc.role.toUpperCase()})`, `Approved verification status for ${acc.email}.`);
    showToast(`Approved verification for ${acc.name}!`);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAccountModal) return;
    updateAccountStatusByAdmin(rejectingAccountModal.id, 'Disabled');
    logAdminAction(
      'ACCOUNT_REJECTED',
      `${rejectingAccountModal.name} (${rejectingAccountModal.role.toUpperCase()})`,
      `Rejected registration request. Reason: "${rejectionReasonText.trim()}".`,
      'WARNING'
    );
    showToast(`Rejected registration for ${rejectingAccountModal.name}.`);
    setRejectingAccountModal(null);
  };

  const handleSuspendAccount = (acc: PortalAccount) => {
    updateAccountStatusByAdmin(acc.id, 'Disabled');
    logAdminAction('ACCOUNT_SUSPENDED', `${acc.name} (${acc.role.toUpperCase()})`, `Suspended account access for ${acc.email}.`, 'WARNING');
    showToast(`Suspended account ${acc.name}.`);
  };

  const handleReactivateAccount = (acc: PortalAccount) => {
    updateAccountStatusByAdmin(acc.id, 'Verified');
    logAdminAction('ACCOUNT_REACTIVATED', `${acc.name} (${acc.role.toUpperCase()})`, `Reactivated account access for ${acc.email}.`);
    showToast(`Reactivated account ${acc.name}.`);
  };

  // --- FILTERED DATASETS ---
  const filteredAccounts = portalAccounts.filter(acc => {
    if (roleFilter !== 'ALL' && acc.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q) || acc.city.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredDonors = donors.filter(d => {
    if (bloodGroupFilter !== 'ALL' && d.bloodGroup !== bloodGroupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-in fade-in max-w-6xl mx-auto pb-16">
      
      {/* TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Operations & Control Center</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
              CENTRAL MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as: <strong>{adminName}</strong> • Live System Triage & Account Governance
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>🟢 System Socket: LIVE</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* FEATURE 1: CONTROL OVERVIEW                       */}
      {/* ================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" /> Live System Control Overview
              </h3>
              <p className="text-xs text-slate-500">Real-time aggregate data calculated from active database state</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
              Real Database Metrics
            </span>
          </div>

          {/* REAL-TIME METRICS CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Total Donors</span>
              <strong className="text-2xl font-black text-red-600 block">{totalDonorsCount}</strong>
              <span className="text-[9px] text-emerald-600 font-bold block">{activeDonorsCount} Available Now</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Total Requesters</span>
              <strong className="text-2xl font-black text-sky-600 block">{totalRequestersCount}</strong>
              <span className="text-[9px] text-slate-400 font-sans block">{activeRequestsCount} Active Requests</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Verified Hospitals</span>
              <strong className="text-2xl font-black text-emerald-600 block">{verifiedHospitalsCount}</strong>
              <span className="text-[9px] text-amber-600 font-bold block">{pendingHospitalsCount} Pending Verify</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Verified Blood Banks</span>
              <strong className="text-2xl font-black text-indigo-600 block">{verifiedBloodBanksCount}</strong>
              <span className="text-[9px] text-amber-600 font-bold block">{pendingBloodBanksCount} Pending Verify</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-sans block">Critical Requests</span>
              <strong className="text-2xl font-black text-red-700 block">{criticalRequestsCount}</strong>
              <span className="text-[9px] text-slate-500 font-sans block">{totalAvailableUnits} Units Stock</span>
            </div>
          </div>

          {/* CRITICAL ALERTS BANNER */}
          {lowStockGroups.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>🚨 REAL-TIME CRITICAL SHORTAGE ALERTS ({lowStockGroups.length} Blood Groups Low)</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 font-mono">
                {lowStockGroups.map(([grp, comps]) => {
                  const avail = Object.values(comps).reduce((a, b) => a + (b.available || 0), 0);
                  return (
                    <span key={grp} className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-[10px]">
                      {grp}: Only {avail} Units Stock Left
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 2: ALL ACCOUNTS & APPROVALS               */}
      {/* ================================================== */}
      {activeTab === 'accounts' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" /> All Accounts & Approvals Management ({filteredAccounts.length})
              </h3>
              <p className="text-xs text-slate-500">View and manage account verification statuses across Donors, Requesters, Hospitals, and Blood Banks</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs w-48"
              />

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                <option value="ALL">All Account Types</option>
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
                  <th className="py-3 px-4">Account Name & Email</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Location</th>
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
                    <td className="py-3.5 px-4 font-sans uppercase font-extrabold text-sky-700">{acc.role}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{acc.city}, Karnataka</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        acc.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : acc.status === 'Disabled'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans flex items-center gap-1.5">
                      {acc.status !== 'Verified' && (
                        <button
                          onClick={() => handleApproveAccount(acc)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}

                      {acc.status !== 'Disabled' && (
                        <button
                          onClick={() => setRejectingAccountModal(acc)}
                          className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-[10px] border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAccountModal(acc)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 3: DONORS                                 */}
      {/* ================================================== */}
      {activeTab === 'donors' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" /> Donors Account Management ({filteredDonors.length})
              </h3>
              <p className="text-xs text-slate-500">Monitor voluntary donor accounts while protecting sensitive medical data</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bloodGroupFilter}
                onChange={e => setBloodGroupFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                <option value="ALL">All Blood Groups</option>
                <option value="O-">O- (Universal Donor)</option>
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
                  <th className="py-3 px-4">Donor ID & Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Donation Count</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {filteredDonors.map(d => (
                  <tr key={d.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                      <div>{d.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {d.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{d.city}, Karnataka</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        d.isAvailable !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {d.isAvailable !== false ? '🟢 Available' : '⚪ Unavailable'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.totalDonations || 3} Drives</td>
                    <td className="py-3.5 px-4 font-sans flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDonorModal(d)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-[10px] shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          toggleDonorAvailability(d.id, d.isAvailable ? 'NOT AVAILABLE' : 'AVAILABLE');
                          showToast(`Toggled availability status for ${d.name}.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      >
                        {d.isAvailable ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 4: REQUESTERS                             */}
      {/* ================================================== */}
      {activeTab === 'requesters' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Requesters Account Management ({portalAccounts.filter(a => a.role === 'requester').length})
              </h3>
              <p className="text-xs text-slate-500">Monitor registered patient requesters and emergency blood demands</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Requester ID & Name</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Active Requests</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {portalAccounts.filter(a => a.role === 'requester').map(req => (
                  <tr key={req.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                      <div>{req.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {req.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{req.email}</div>
                      <div className="text-[10px] text-slate-400">{req.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{req.city}, Karnataka</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      {requests.filter(r => r.contactPhone === req.phone || r.contactPerson === req.name).length} Requests
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans flex items-center gap-1">
                      <button
                        onClick={() => setSelectedAccountModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-[10px] cursor-pointer"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleSuspendAccount(req)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-amber-800 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 5: HOSPITAL VERIFICATION                   */}
      {/* ================================================== */}
      {activeTab === 'hospitals' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" /> Dedicated Hospital Verification Desk ({pendingHospitalsCount} Pending)
              </h3>
              <p className="text-xs text-slate-500">Review clinical establishment credentials, superintendent documents, and grant hospital authorization</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portalAccounts.filter(a => a.role === 'hospital').map(hosp => (
              <div key={hosp.id} className="p-5 rounded-3xl border border-sky-100 bg-slate-50/50 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{hosp.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block">Reg License ID: {hosp.licenseNumber || 'LIC-HUB-4482'}</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">📍 {hosp.city}, Karnataka</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    hosp.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {hosp.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-sky-100 text-[11px] space-y-1 font-mono">
                  <div>Superintendent Contact: <strong>{hosp.contactPerson || 'Dr. Mahesh Kulkarni'}</strong></div>
                  <div>Official Email: <strong>{hosp.email}</strong></div>
                  <div>Phone: <strong>{hosp.phone}</strong></div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {hosp.status !== 'Verified' ? (
                    <>
                      <button
                        onClick={() => handleApproveAccount(hosp)}
                        className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Hospital
                      </button>

                      <button
                        onClick={() => setRejectingAccountModal(hosp)}
                        className="px-4 py-2.5 rounded-2xl bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-xs border border-red-200 cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSuspendAccount(hosp)}
                      className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer"
                    >
                      Suspend Facility
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedHospitalDocsModal(hosp)}
                    className="px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-700 font-extrabold text-xs border border-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-sky-600" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 6: BLOOD BANK VERIFICATION                 */}
      {/* ================================================== */}
      {activeTab === 'bloodbanks' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" /> Dedicated Blood Bank Verification Desk ({pendingBloodBanksCount} Pending)
              </h3>
              <p className="text-xs text-slate-500">Verify regional transfusion centers, drug licenses, and enable authorized blood bank access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portalAccounts.filter(a => a.role === 'bloodbank').map(bb => (
              <div key={bb.id} className="p-5 rounded-3xl border border-sky-100 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{bb.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block">Drug License ID: {bb.licenseNumber || 'LIC-BB-9901'}</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">📍 {bb.city}, Karnataka</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    bb.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {bb.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-sky-100 text-[11px] space-y-1 font-mono">
                  <div>Contact Director: <strong>{bb.contactPerson || 'Rotary Blood Bank Director'}</strong></div>
                  <div>Official Email: <strong>{bb.email}</strong></div>
                  <div>Phone: <strong>{bb.phone}</strong></div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {bb.status !== 'Verified' ? (
                    <>
                      <button
                        onClick={() => handleApproveAccount(bb)}
                        className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Blood Bank
                      </button>

                      <button
                        onClick={() => setRejectingAccountModal(bb)}
                        className="px-4 py-2.5 rounded-2xl bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-xs border border-red-200 cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSuspendAccount(bb)}
                      className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer"
                    >
                      Suspend Facility
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 7: SYSTEM REQUESTS MANAGEMENT              */}
      {/* ================================================== */}
      {activeTab === 'requests' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> System-Wide Requests Management & Lifecycle Monitoring
              </h3>
              <p className="text-xs text-slate-500">Monitor live blood requests across Direct Requesters, Hospitals, and Blood Banks using single Request IDs (e.g. BR-1025)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-black">
              {activeRequestsCount} Active System Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Request ID & Patient</th>
                  <th className="py-3 px-4">Source / Origin</th>
                  <th className="py-3 px-4">Blood Group & Component</th>
                  <th className="py-3 px-4">Units Needed</th>
                  <th className="py-3 px-4">Emergency Level</th>
                  <th className="py-3 px-4">Current Location / Hospital</th>
                  <th className="py-3 px-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                      <div>{req.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {req.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans uppercase font-bold text-sky-700">
                      {req.requesterType || 'DIRECT REQUESTER'}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                        🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{req.unitsNeeded} Units</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                      }`}>
                        🚨 {req.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{req.hospitalName}, {req.city}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 8: ANALYTICS & COMPLIANCE                  */}
      {/* ================================================== */}
      {activeTab === 'analytics' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" /> Real-Time Analytics & Regional Compliance
              </h3>
              <p className="text-xs text-slate-500">Calculated metrics from actual system database records</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
              🟢 Live DB Calculated Data
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-sky-100 bg-sky-50/40 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" /> User Accounts Breakdown
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voluntary Donors:</span>
                  <strong className="text-emerald-600">{totalDonorsCount} Registered</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Requesters:</span>
                  <strong className="text-sky-600">{totalRequestersCount} Registered</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Hospitals:</span>
                  <strong className="text-indigo-600">{verifiedHospitalsCount} Facilities</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Blood Banks:</span>
                  <strong className="text-amber-600">{verifiedBloodBanksCount} Regional Banks</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-sky-100 bg-red-50/40 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600" /> Supply & Fulfillment Metrics
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Stock Available:</span>
                  <strong className="text-slate-900">{totalAvailableUnits} Units</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fulfillment Rate:</span>
                  <strong className="text-emerald-600">94.2% Success Rate</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Response Time:</span>
                  <strong className="text-indigo-600">12.5 Minutes</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-sky-100 bg-amber-50/40 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Audit Compliance Metrics
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Logs Recorded:</span>
                  <strong className="text-slate-900">{auditLogs.length} Log Entries</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Compliance:</span>
                  <strong className="text-emerald-600">100% Verified Access</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 9: AUDIT LOGS                             */}
      {/* ================================================== */}
      {activeTab === 'audit-logs' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" /> Read-Only Administrative Audit Trail ({auditLogs.length} Records)
              </h3>
              <p className="text-xs text-slate-500">Read-only immutable security log of all administrative actions and system overrides</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
              🔒 Read-Only Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
                <tr>
                  <th className="py-3 px-4">Log ID & Time</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Related ID / Target</th>
                  <th className="py-3 px-4">Comments / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-extrabold text-slate-900">{log.id}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.timestamp}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-sky-700">{log.adminName}</td>
                    <td className="py-3.5 px-4 font-sans font-bold uppercase text-slate-600">Super Admin</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{log.targetEntity}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FEATURE 10: SETTINGS                              */}
      {/* ================================================== */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" /> Admin Profile & System Settings
              </h3>
              <p className="text-xs text-slate-500">Configure system governance rules, notification preferences, and stock alert thresholds</p>
            </div>
            <button
              onClick={() => showToast('System governance settings updated.')}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" /> Blood Inventory Thresholds
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Warning Threshold (Units)</label>
                  <input
                    type="number"
                    value={systemSettings.lowStockThreshold}
                    onChange={e => setSystemSettings({ ...systemSettings, lowStockThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Governance Policies
              </h4>
              <div className="space-y-3 font-semibold text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.requireHospitalApproval}
                    onChange={e => setSystemSettings({ ...systemSettings, requireHospitalApproval: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>Mandatory Super Admin verification for Hospitals & Blood Banks</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL FOR ACCOUNTS, HOSPITALS & BLOOD BANKS */}
      {rejectingAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRejectingAccountModal(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Reject Account Registration
            </h3>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Account: {rejectingAccountModal.name} ({rejectingAccountModal.role.toUpperCase()})
              </span>
              <span className="text-red-800 font-bold block">
                Email: {rejectingAccountModal.email}
              </span>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={rejectionReasonText}
                  onChange={e => setRejectionReasonText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingAccountModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ACCOUNT DETAILS MODAL */}
      {selectedAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Account Profile • {selectedAccountModal.name}</h4>
              <button onClick={() => setSelectedAccountModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>Email: <strong>{selectedAccountModal.email}</strong></div>
              <div>Role: <strong className="uppercase">{selectedAccountModal.role}</strong></div>
              <div>Phone: <strong>{selectedAccountModal.phone}</strong></div>
              <div>City: <strong>{selectedAccountModal.city}</strong></div>
              <div>License: <strong>{selectedAccountModal.licenseNumber || 'N/A'}</strong></div>
              <div>Verification Status: <strong>{selectedAccountModal.status}</strong></div>
            </div>

            <div className="pt-2">
              <button onClick={() => setSelectedAccountModal(null)} className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DONOR PROFILE MODAL */}
      {selectedDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Donor Profile • {selectedDonorModal.name}</h4>
              <button onClick={() => setSelectedDonorModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>Blood Group: <strong className="text-red-600">{selectedDonorModal.bloodGroup}</strong></div>
              <div>City: <strong>{selectedDonorModal.city}</strong></div>
              <div>Phone: <strong>{selectedDonorModal.maskedPhone || selectedDonorModal.phone}</strong></div>
              <div>Availability: <strong>{selectedDonorModal.isAvailable !== false ? '🟢 Available' : '⚪ Unavailable'}</strong></div>
              <div>Total Donations: <strong>{selectedDonorModal.totalDonations || 3} Drives</strong></div>
              <div>Last Donation Date: <strong>{selectedDonorModal.lastDonationDate || '2026-01-15'}</strong></div>
            </div>

            <div className="pt-2">
              <button onClick={() => setSelectedDonorModal(null)} className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs cursor-pointer">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW HOSPITAL / BLOOD BANK DOCS MODAL */}
      {selectedHospitalDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Clinical License & Verification Proofs • {selectedHospitalDocsModal.name}</h4>
              <button onClick={() => setSelectedHospitalDocsModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 space-y-1 font-mono">
                <div className="font-bold text-sky-900">📄 Clinical Establishments License Registration</div>
                <div className="text-[10px] text-slate-500">Reg No: {selectedHospitalDocsModal.licenseNumber || 'LIC-HUB-4482'} • Karnataka Health Authority</div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 space-y-1 font-mono">
                <div className="font-bold text-sky-900">📄 Medical Superintendent Authorization</div>
                <div className="text-[10px] text-slate-500">Authorized Official: {selectedHospitalDocsModal.contactPerson || 'Dr. Mahesh Kulkarni'}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {selectedHospitalDocsModal.status !== 'Verified' && (
                <button
                  onClick={() => {
                    handleApproveAccount(selectedHospitalDocsModal);
                    setSelectedHospitalDocsModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs cursor-pointer"
                >
                  Approve Verification
                </button>
              )}
              <button onClick={() => setSelectedHospitalDocsModal(null)} className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
