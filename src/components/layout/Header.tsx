import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  PlusCircle,
  Sun,
  Moon,
  Heart,
  Sparkles,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export const Header: React.FC = () => {
  const { navigateTo, notifications, setActiveEmergencyPostModal } = useApp();
  const { currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="font-extrabold text-base text-white">Blood<span className="text-red-500">Net</span></span>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            onClick={() => navigateTo('donor-search')}
            placeholder="Search donors by blood group, hospital, city..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Post Emergency Request Button */}
          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-950 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Emergency Need</span>
          </button>

          {/* Theme Toggle (Mobile) */}
          <button
            onClick={toggleTheme}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center border border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-xs text-slate-200">Alert Notifications</span>
                  <span className="text-[10px] text-red-400 font-bold">{unreadCount} new</span>
                </div>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-800/50 border border-slate-800 text-xs">
                      <div className="font-bold text-slate-200">{n.title}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge Trigger */}
          <button
            onClick={() => navigateTo('profile')}
            className="flex items-center gap-2 pl-2 border-l border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-extrabold text-xs flex items-center justify-center border border-red-400/40">
              {currentUser?.bloodGroup || 'O-'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-200">
              {currentUser?.name || 'Dr. Ananya'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
