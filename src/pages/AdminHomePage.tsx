import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  Droplet,
  ShieldAlert,
  Bell,
  User,
  LogOut,
  ArrowRight,
  Activity,
  FileText
} from 'lucide-react';

export const AdminHomePage: React.FC = () => {
  const { currentUser, logout, portalAccounts } = useAuth();
  const { requests, connectionStatus } = useApp();
  const navigate = useNavigate();

  const pendingAccounts = portalAccounts.filter(a => a.status === 'Pending Verification');
  const activeRequestsCount = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;

  const handleLogout = () => {
    logout();
    navigate('/login/admin', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>National Super Admin Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Administrator'} 🛡️
            </h1>
            <p className="text-sm text-amber-100 font-medium leading-relaxed">
              Supervise all registered user accounts, approve hospital/blood-bank licenses, monitor real-time Socket.IO connections, and enforce platform security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5 text-amber-800" />
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/home"
            className="px-4 py-2 rounded-xl bg-amber-600 text-white shadow-sm font-black flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Home
          </Link>

          <Link
            to="/admin/dashboard"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-600" /> Dashboard
          </Link>

          <Link
            to="/admin/accounts"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-sky-600" /> Accounts & Approvals ({pendingAccounts.length})
          </Link>

          <Link
            to="/admin/hospitals"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-4 h-4 text-indigo-600" /> Hospitals
          </Link>

          <Link
            to="/admin/blood-banks"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
          >
            <Droplet className="w-4 h-4 text-emerald-600" /> Blood Banks
          </Link>

          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-600" /> Audit Logs
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-slate-400 font-mono">Role: ADMIN</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
      </div>

      {/* 3. Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Pending Verification</span>
          <strong className="text-2xl font-black text-amber-600 block">{pendingAccounts.length} Accounts</strong>
          <span className="text-[10px] text-slate-400 font-medium">Hospitals & Blood Banks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Active Network Requests</span>
          <strong className="text-2xl font-black text-red-600 block">{activeRequestsCount} Active</strong>
          <span className="text-[10px] text-slate-400 font-medium">System-wide emergency requests</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Total Accounts</span>
          <strong className="text-2xl font-black text-slate-900 block">{portalAccounts.length} Total</strong>
          <span className="text-[10px] text-slate-400 font-medium">Across all 5 roles</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Real-time Socket.IO</span>
          <strong className="text-2xl font-black text-emerald-600 block">{connectionStatus}</strong>
          <span className="text-[10px] text-emerald-600 font-bold">Online Connection Monitor</span>
        </div>
      </div>

      {/* 4. Quick Action & Control Banner */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-amber-950">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" /> Platform Security & Verification Active
          </h3>
          <p className="text-xs text-amber-900 font-medium">
            Review pending hospital licenses, unlock locked login attempts, and monitor real-time activity logs.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
        >
          Open Admin Control Center
        </button>
      </div>

    </div>
  );
};
