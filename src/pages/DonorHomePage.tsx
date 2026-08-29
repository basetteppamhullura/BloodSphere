import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Heart,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Activity
} from 'lucide-react';

export const DonorHomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { requests, notifications } = useApp();
  const navigate = useNavigate();

  const urgentRequests = requests.filter(
    r => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).slice(0, 3);

  const unreadNotifs = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Heart className="w-96 h-96 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Voluntary Donor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {currentUser?.name || 'Valued Donor'}! ❤️
            </h1>
            <p className="text-sm text-red-100 font-medium leading-relaxed">
              Your voluntary blood donations save lives across our medical network. Check urgent emergency requests below or enter your full management dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/donor/dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-white text-red-600 hover:bg-red-50 font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5 text-red-600" />
              <span>Open Donor Dashboard</span>
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
            to="/donor/home"
            className="px-4 py-2 rounded-xl bg-red-600 text-white shadow-sm font-black flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4" /> Home
          </Link>

          <Link
            to="/donor/dashboard"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-sky-600" /> Dashboard
          </Link>

          <Link
            to="/donor/emergency"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Emergency Requests
          </Link>

          <Link
            to="/donor/rare-blood"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Rare Registry
          </Link>

          <Link
            to="/donor/profile"
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors"
          >
            <User className="w-4 h-4 text-indigo-600" /> Profile
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-slate-400 font-mono">Role: DONOR</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* 3. Stat Highlights Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Donation Eligibility</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">Eligible Now</div>
          <p className="text-[11px] text-slate-400 font-medium">Ready for next voluntary donation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Urgent Needs Nearby</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">{urgentRequests.length} Active</div>
          <p className="text-[11px] text-slate-400 font-medium">Matching O+ / B+ Blood Groups</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Lives Saved</span>
            <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">12 Lives</div>
          <p className="text-[11px] text-slate-400 font-medium">Across 4 voluntary donations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Unread Notifications</span>
            <Bell className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-600">{unreadNotifs.length} Alerts</div>
          <p className="text-[11px] text-slate-400 font-medium">Real-time network updates</p>
        </div>
      </div>

      {/* 4. Main Body: Urgent Blood Requests & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Urgent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-1">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Urgent Blood Requests Nearby
            </h2>
            <Link to="/donor/emergency" className="text-xs text-sky-600 hover:underline font-bold">
              View All ({requests.length})
            </Link>
          </div>

          <div className="space-y-3">
            {urgentRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3 hover:border-red-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-black text-[11px]">
                        {req.bloodGroup} Needed
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                        {req.urgency} URGENCY
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">{req.patientName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.hospitalName}, {req.city}
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-lg font-black text-red-600 block">{req.unitsNeeded} Units</span>
                    <span className="text-[10px] text-slate-400">{req.unitsFulfilled} Fulfilled</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Requested {req.requestedAt || 'recently'}
                  </span>

                  <button
                    onClick={() => navigate('/donor/dashboard')}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                  >
                    Respond & Donate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Donation Info & Upcoming Reminders */}
        <div className="space-y-5">
          
          {/* Donation Eligibility Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Donation Readiness</span>
            </div>
            <ul className="text-xs text-emerald-900 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Last Donation: 94 days ago</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Weight & Health Checklist: Verified</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hemoglobin Count: 14.2 g/dL</span>
              </li>
            </ul>
          </div>

          {/* Activity Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" /> Recent Donor Activity
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="font-bold text-slate-800 block">Verified Health Badge Awarded</span>
                <span className="text-[10px] text-slate-400">Completed medical pre-screening</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="font-bold text-slate-800 block">Blood Unit Transfused</span>
                <span className="text-[10px] text-slate-400">Hubballi Civil Hospital • 3 weeks ago</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
