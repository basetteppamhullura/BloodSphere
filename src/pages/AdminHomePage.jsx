import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldCheck, LayoutDashboard, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';
import { PortalHero } from '../components/common/PortalHero';
export const AdminHomePage = () => {
    const { currentUser, logout, portalAccounts } = useAuth();
    const { requests, connectionStatus } = useApp();
    const navigate = useNavigate();
    const pendingAccounts = portalAccounts.filter(a => a.status === 'Pending Verification');
    const activeRequestsCount = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
    const handleLogout = () => {
        logout();
        navigate('/login/admin', { replace: true });
    };
    return (<div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <PortalHero
        portalLabel="National Super Admin Command Center"
        badgeIcon={ShieldCheck}
        badgePulseColor="bg-amber-400"
        title={`Welcome, ${currentUser?.name || 'Administrator'} 🛡️`}
        description="Supervise registered accounts, hospital/blood-bank verification, system activity and platform security."
        bgImage="/bloodnet-hero-full.png"
        bgPosition="center right"
        gradientOverlay="linear-gradient(95deg, rgba(16, 37, 66, 0.92) 0%, rgba(217, 119, 6, 0.78) 55%, rgba(37, 99, 235, 0.55) 100%)"
        decorativeIcon={ShieldCheck}
        actions={
          <>
            <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-3.5 rounded-2xl bg-white text-[#16324F] hover:bg-amber-50 font-black text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
              <LayoutDashboard className="w-5 h-5 text-amber-600"/>
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4"/>
            </button>

            <button onClick={handleLogout} className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4"/>
              <span>Logout</span>
            </button>
          </>
        }
      />

      {/* 2. Executive Metrics */}
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
            <ShieldAlert className="w-5 h-5 text-amber-600"/> Platform Security & Verification Active
          </h3>
          <p className="text-xs text-amber-900 font-medium">
            Review pending hospital licenses, unlock locked login attempts, and monitor real-time activity logs.
          </p>
        </div>

        <button onClick={() => navigate('/admin/dashboard')} className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors">
          Open Admin Control Center
        </button>
      </div>

    </div>);
};
