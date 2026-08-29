import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Building2,
  LayoutDashboard,
  AlertTriangle,
  Boxes,
  Users,
  Bell,
  User,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Droplet,
  CheckCircle2
} from 'lucide-react';

export const HospitalHomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { requests, totalAvailableUnits, lowStockGroups } = useApp();
  const navigate = useNavigate();

  const hospitalRequests = requests.slice(0, 3);

  const handleLogout = () => {
    logout();
    navigate('/login/hospital', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Hospital Medical Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Hospital Trauma Center'} 🏥
            </h1>
            <p className="text-sm text-sky-100 font-medium leading-relaxed">
              Manage trauma center blood inventory, broadcast emergency patient requests, and coordinate with connected regional blood banks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/hospital/dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5 text-sky-700" />
              <span>Open Hospital Dashboard</span>
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
            to="/hospital/home"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white shadow-sm font-black flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" /> Home
          </Link>

          <Link
            to="/hospital/dashboard"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-sky-600" /> Dashboard
          </Link>

          <Link
            to="/hospital/requests"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Patient Requests
          </Link>

          <Link
            to="/hospital/blood-banks"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <Boxes className="w-4 h-4 text-emerald-600" /> Blood Banks
          </Link>

          <Link
            to="/hospital/donors"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-600" /> Donation Drives
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-slate-400 font-mono">Role: HOSPITAL</span>
          <span className="w-2 h-2 rounded-full bg-sky-500" />
        </div>
      </div>

      {/* 3. Hospital Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Total Hospital Stock</span>
          <strong className="text-2xl font-black text-sky-600 block">{totalAvailableUnits} Units</strong>
          <span className="text-[10px] text-slate-400 font-medium">Available across 8 blood components</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Critical Low-Stock Alerts</span>
          <strong className="text-2xl font-black text-red-600 block">{lowStockGroups.length} Blood Groups Low</strong>
          <span className="text-[10px] text-red-500 font-bold">Inter-city transfer recommended</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold block">Connected Regional Banks</span>
          <strong className="text-2xl font-black text-emerald-600 block">4 Active Banks</strong>
          <span className="text-[10px] text-emerald-600 font-bold">Real-time sync enabled</span>
        </div>
      </div>

      {/* 4. Patient Emergency Board Preview */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Trauma Emergency Requests Queue
          </h2>
          <button
            onClick={() => navigate('/hospital/dashboard')}
            className="text-xs text-sky-600 font-bold hover:underline"
          >
            Manage Desk
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {hospitalRequests.map(req => (
            <div key={req.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-600">{req.bloodGroup}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  {req.urgency}
                </span>
              </div>
              <strong className="text-sm font-black text-slate-900 block">{req.patientName}</strong>
              <p className="text-[11px] text-slate-500">{req.unitsRequired} Units Required</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
