import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  Menu,
  MessageSquare
} from 'lucide-react';

export const Header: React.FC = () => {
  const { setActiveEmergencyPostModal, isMobileSidebarOpen, setIsMobileSidebarOpen, chatSessions, openEmergencyChat } = useApp();
  const { currentRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const activeChats = chatSessions.filter(s => s.status === 'active');

  const handleLogout = () => {
    const roleBeforeLogout = currentRole;
    logout();
    const loginPaths: Record<string, string> = {
      donor: '/login',
      requester: '/login',
      hospital: '/login/hospital',
      bloodbank: '/login/bloodbank',
      admin: '/login/admin'
    };
    navigate(loginPaths[roleBeforeLogout] || '/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name + Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-800 border border-sky-100 flex items-center justify-center"
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-sky-600" />
          </button>

          <Link to="/" className="cursor-pointer">
            <BloodNetLogo size="md" showTagline={true} />
          </Link>
        </div>

        {/* Navigation Actions Hub */}
        <div className="flex items-center gap-3">
          
          {/* Emergency Chat Launcher */}
          {activeChats.length > 0 && (
            <button
              onClick={() => openEmergencyChat(activeChats[0].requestId)}
              className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-extrabold text-xs flex items-center gap-1.5 hover:bg-red-100 transition-colors relative"
              title="Open Private Real-Time Emergency Chat"
            >
              <MessageSquare className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Emergency Chat</span>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                {activeChats.length}
              </span>
            </button>
          )}

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

                <Link
                  to="/login"
                  onClick={() => setIsLoginDropdownOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" />
                    <div>
                      <span className="font-bold block">Donor & Requester</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login</span>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/login/hospital"
                  onClick={() => setIsLoginDropdownOpen(false)}
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
                </Link>

                <Link
                  to="/login/bloodbank"
                  onClick={() => setIsLoginDropdownOpen(false)}
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
                </Link>

                <Link
                  to="/login/admin"
                  onClick={() => setIsLoginDropdownOpen(false)}
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
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="font-bold text-xs text-slate-800 hidden md:inline">{currentUser.name} ({currentRole.toUpperCase()})</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-bold text-slate-600 hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
