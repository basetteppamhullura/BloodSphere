import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  PlusCircle,
  Bell,
  User,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const {
    currentRole,
    switchRole,
    currentUser,
    notifications,
    setActiveAIPostModal,
    isDarkMode,
    toggleTheme
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles = [
    { key: 'donor', label: 'Blood Donor', icon: Heart, desc: 'Donate blood, view requests & earn badges' },
    { key: 'requester', label: 'Requester / Patient', icon: Users, desc: 'Post emergency blood needs with AI' },
    { key: 'hospital', label: 'Hospital & Blood Bank', icon: Building2, desc: 'Manage stock inventory & camp drives' },
    { key: 'admin', label: 'Super Admin', icon: ShieldCheck, desc: 'Platform oversight & safety verification' }
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 shadow-lg shadow-red-900/50">
            <Heart className="w-6 h-6 text-white fill-white animate-heartbeat" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg lg:text-xl tracking-tight text-white">
                Blood Donor<span className="text-red-500"> Network</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
                LIVE MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Real-time Emergency & AI Matching System</p>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-sm font-medium text-slate-200 transition-all shadow-inner"
          >
            <span className="text-xs text-slate-400">View as:</span>
            <span className="font-semibold text-red-400 flex items-center gap-1.5 capitalize">
              {currentRole === 'donor' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
              {currentRole === 'requester' && <Users className="w-4 h-4 text-blue-400" />}
              {currentRole === 'hospital' && <Building2 className="w-4 h-4 text-emerald-400" />}
              {currentRole === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
              {currentRole}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Role Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 glass-card p-2 z-50 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Switch Perspective
              </div>
              <div className="mt-1 space-y-1">
                {roles.map(r => {
                  const IconComp = r.icon;
                  const isActive = currentRole === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => {
                        switchRole(r.key);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 transition-colors ${
                        isActive ? 'bg-red-950/60 border border-red-800/50 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <IconComp className={`w-5 h-5 mt-0.5 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-medium text-sm text-slate-200">{r.label}</div>
                        <div className="text-xs text-slate-400">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 lg:gap-3">
          
          {/* Post Emergency Request Button */}
          <button
            onClick={() => setActiveAIPostModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold shadow-lg shadow-red-900/40 hover:shadow-red-800/60 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">+ Emergency Need</span>
            <span className="flex items-center gap-1 text-[10px] bg-red-950/60 px-1.5 py-0.5 rounded text-red-200 border border-red-500/30">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card p-3 z-50 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-sm text-slate-200">Alerts & Notifications</span>
                  <span className="text-xs text-red-400 font-medium">{unreadCount} new</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs border ${
                        n.read ? 'bg-slate-800/30 border-slate-800 text-slate-400' : 'bg-red-950/40 border-red-800/50 text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white border border-slate-500">
              {currentUser?.bloodGroup || "O-"}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
