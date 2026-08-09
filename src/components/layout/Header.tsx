import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  Heart,
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  PlusCircle,
  User,
  Building2,
  Droplet,
  Lock,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { navigateTo, setActiveEmergencyPostModal, notifications } = useApp();
  const { currentRole, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [unreadCount] = useState(2);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-extrabold flex items-center justify-center shadow-lg shadow-red-950">
            <Heart className="w-6 h-6 fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Blood<span className="text-red-500">Net</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase hidden sm:block">
              Blood Donor Network Platform
            </p>
          </div>
        </div>

        {/* Global Action Buttons & 4-Portal Access Hub */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-950 items-center gap-1.5 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" /> Post Emergency Need
          </button>

          {/* 4 Separate Portal Login Routes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-800 flex items-center gap-1.5 transition-all"
            >
              <User className="w-4 h-4 text-red-500" />
              <span>Portal Logins</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLoginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                  Choose Login Portal Route
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-donor-requester');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" />
                    <div>
                      <span className="font-bold block">Donor & Requester</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/donor-requester</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-hospital');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-bold block">Hospital Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/hospital</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-bloodbank');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold block">Blood Bank Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/bloodbank</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-admin');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200 border-t border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold block text-amber-400">Super Admin</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/admin</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="font-bold text-xs text-white hidden md:inline">{currentUser.name}</span>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
