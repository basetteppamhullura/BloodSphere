import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  PlusCircle,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart
} from 'lucide-react';

export const Header: React.FC = () => {
  const { notifications, setActiveEmergencyPostModal, navigateTo } = useApp();
  const { currentRole, switchRole, currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'donor', label: 'Donor' },
    { role: 'requester', label: 'Requester' },
    { role: 'hospital', label: 'Hospital' },
    { role: 'bloodbank', label: 'Blood Bank' },
    { role: 'admin', label: 'Admin' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 text-slate-200">
      
      {/* Search Input */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search blood group, hospital, city or donor ID..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-all"
        />
      </div>

      {/* Role Switcher Pill (Header bar) */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
        {roles.map(r => (
          <button
            key={r.role}
            onClick={() => switchRole(r.role)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              currentRole === r.role
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Post Request CTA */}
        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold shadow-md shadow-red-950 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden md:inline">Post Emergency Need</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in space-y-2">
              <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Notifications ({notifications.length})</span>
                <span className="text-[10px] text-slate-400 font-medium">Real-time alerts</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition-all">
                    <span className="font-bold text-white text-[11px] block">{n.title}</span>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                    <span className="text-[9px] text-slate-500 block text-right">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
            {currentUser?.bloodGroup || 'O-'}
          </div>
          <span className="text-xs font-bold text-slate-200 hidden lg:inline">{currentUser?.name?.split(' ')[0]}</span>
        </button>

      </div>

    </header>
  );
};
