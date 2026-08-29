import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Droplet,
  LayoutDashboard,
  Boxes,
  Package,
  AlertTriangle,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const BloodBankHomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { bloodUnitsList } = useApp();
  const navigate = useNavigate();

  const totalUnits = bloodUnitsList.length;
  const expiredCount = bloodUnitsList.filter(u => u.status === 'EXPIRED').length;
  const availableCount = bloodUnitsList.filter(u => u.status === 'APPROVED' || u.status === 'STORED' || u.status === 'COLLECTED').length;

  const handleLogout = () => {
    logout();
    navigate('/login/bloodbank', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Droplet className="w-96 h-96 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Regional Blood Center & Storage Bank</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Rotary Blood Center'} 🩸
            </h1>
            <p className="text-sm text-emerald-100 font-medium leading-relaxed">
              Manage blood unit inventories, component separation, hospital reservation queues, and automated expiration monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/bloodbank/dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-700" />
              <span>Open Blood Bank Dashboard</span>
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
            to="/bloodbank/home"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-sm font-black flex items-center gap-1.5"
          >
            <Droplet className="w-4 h-4" /> Home
          </Link>

          <Link
            to="/bloodbank/dashboard"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard
          </Link>

          <Link
            to="/bloodbank/inventory"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <Boxes className="w-4 h-4 text-sky-600" /> Inventory Matrix
          </Link>

          <Link
            to="/bloodbank/requests"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4 text-amber-600" /> Requester Queue
          </Link>

          <Link
            to="/bloodbank/alerts"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" /> Expiry Alerts
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-slate-400 font-mono">Role: BLOOD BANK</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* 3. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Available Units</span>
          <strong className="text-2xl font-black text-emerald-600 block">{availableCount} Units</strong>
          <span className="text-[10px] text-slate-400 font-medium">Ready for immediate issue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Total Inventory Tracked</span>
          <strong className="text-2xl font-black text-slate-900 block">{totalUnits} Units</strong>
          <span className="text-[10px] text-slate-400 font-medium">Whole blood, PRBC, Platelets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Expired / Low Stock Alerts</span>
          <strong className="text-2xl font-black text-red-600 block">{expiredCount} Alerts</strong>
          <span className="text-[10px] text-red-500 font-bold">Action required</span>
        </div>
      </div>

      {/* 4. Portal Overview Banner */}
      <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4 text-emerald-950">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Live Inventory Sync Active
          </h3>
          <p className="text-xs text-emerald-800 font-medium">
            Your blood bank is connected to 4 regional hospitals and voluntary donor networks in real time.
          </p>
        </div>

        <button
          onClick={() => navigate('/bloodbank/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors"
        >
          Manage Blood Bank Desk
        </button>
      </div>

    </div>
  );
};
