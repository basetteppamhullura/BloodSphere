import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  Bell,
  PlusCircle,
  User,
  Building2,
  Droplet,
  Lock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  AlertTriangle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { navigateTo, setActiveEmergencyPostModal, notifications } = useApp();
  const { currentRole, currentUser, logout } = useAuth();

  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="cursor-pointer" onClick={() => navigateTo('landing')}>
          <BloodNetLogo size="md" showTagline={true} />
        </div>

        {/* Navigation Actions Hub */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setActiveEmergencyPostModal(true)}
            className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-sm shadow-red-500/20 items-center gap-1.5 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" /> Post Emergency Need
          </button>

          {/* 4 Separate Portal Login Routes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100/70 text-slate-800 font-extrabold text-xs border border-sky-100 flex items-center gap-1.5 transition-all"
            >
              <User className="w-4 h-4 text-red-600" />
              <span>Portal Logins</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLoginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-sky-100 shadow-xl p-2 z-50 space-y-1 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Login Portal
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-donor-requester');
                  }}
                  className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" />
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
                  className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="font-bold block">Hospital Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/hospital</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-bloodbank');
                  }}
                  className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold block">Blood Bank Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/bloodbank</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                <div
                  onClick={() => {
                    setIsLoginDropdownOpen(false);
                    navigateTo('login-admin');
                  }}
                  className="p-2.5 rounded-xl hover:bg-amber-50 cursor-pointer flex items-center justify-between text-slate-800 border-t border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold block text-amber-700">Super Admin</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/admin</span>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="font-bold text-xs text-slate-800 hidden md:inline">{currentUser.name}</span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Logout"
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
