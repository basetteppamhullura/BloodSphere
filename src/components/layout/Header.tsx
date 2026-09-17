import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  PlusCircle,
  User,
  Building2,
  Droplet,
  Lock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Menu,
  MessageSquare,
  Sparkles,
  Heart,
  Shield,
  Users
} from 'lucide-react';

export const Header: React.FC = () => {
  const { setActiveEmergencyPostModal, isMobileSidebarOpen, setIsMobileSidebarOpen, chatSessions, openEmergencyChat, showToast } = useApp();
  const { currentRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute real unread count and active chats
  const activeChats = chatSessions.filter(s => s.status === 'active');
  const unreadChatCount = activeChats.reduce((sum, s) => {
    if (currentRole === 'requester') return sum + (s.unreadCountRequester || 0);
    if (currentRole === 'donor') return sum + (s.unreadCountDonor || 0);
    return sum + (s.unreadCountRequester || 0) + (s.unreadCountDonor || 0);
  }, 0);

  // Show badge only when real count exists
  const chatBadgeCount = unreadChatCount > 0 ? unreadChatCount : (activeChats.length > 0 ? activeChats.length : 0);

  const handleEmergencyChatClick = () => {
    if (activeChats.length > 0) {
      openEmergencyChat(activeChats[0].requestId);
    } else if (chatSessions.length > 0) {
      openEmergencyChat(chatSessions[0].requestId);
    } else {
      showToast('No active emergency chats at this moment.');
    }
  };

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

  // Role-specific badge styling
  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'hospital':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'bloodbank':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'admin':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'requester':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'donor':
      default:
        return 'bg-red-50 text-red-700 border-red-200/80';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'hospital':
        return <Building2 className="w-3.5 h-3.5 text-sky-600" />;
      case 'bloodbank':
        return <Droplet className="w-3.5 h-3.5 text-emerald-600" />;
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case 'requester':
        return <Users className="w-3.5 h-3.5 text-rose-600" />;
      case 'donor':
      default:
        return <Heart className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100/80 shadow-xs">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* ================================================== */}
        {/* 1. LEFT: BRAND AREA & MOBILE MENU TOGGLE           */}
        {/* ================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 border border-sky-100/80 flex items-center justify-center transition-colors"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-sky-600" />
          </button>

          {/* BloodNet Logo + Tagline */}
          <Link to="/" className="cursor-pointer group flex items-center">
            <BloodNetLogo size="md" showTagline={true} />
          </Link>
        </div>

        {/* ================================================== */}
        {/* 2. CENTER & RIGHT: ACTIONS & CONTROLS               */}
        {/* ================================================== */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 2.1 EMERGENCY CHAT (Soft Medical Style) */}
          {(chatBadgeCount > 0 || chatSessions.length > 0) && (
            <button
              type="button"
              onClick={handleEmergencyChatClick}
              className="px-3 py-2 rounded-xl bg-red-50/90 hover:bg-red-100/90 text-red-700 border border-red-200/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
              title="Open Private Real-Time Emergency Chat"
            >
              <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
              <span className="hidden sm:inline">Emergency Chat</span>
              {chatBadgeCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {chatBadgeCount}
                </span>
              )}
            </button>
          )}

          {/* 2.2 POST EMERGENCY NEED (Primary Medical Red Action) */}
          <button
            type="button"
            onClick={() => setActiveEmergencyPostModal(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-sm shadow-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-98 shrink-0"
            title="Create an emergency blood request"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Post Emergency Need</span>
            <span className="inline xs:hidden sm:hidden">Post Need</span>
          </button>

          {/* 2.3 PORTAL LOGIN BUTTON & DROPDOWN */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="px-3 py-2 rounded-xl bg-sky-50/80 hover:bg-sky-100/80 text-slate-800 font-bold text-xs border border-sky-200/70 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              aria-expanded={isLoginDropdownOpen}
              aria-haspopup="true"
            >
              <User className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span className="hidden sm:inline">Portal Login</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Portal Selection Dropdown Menu */}
            {isLoginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-sky-100 shadow-xl p-2 z-50 space-y-1 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Select Portal</span>
                  <span className="text-sky-600 font-bold">BloodNet</span>
                </div>

                <Link
                  to="/login"
                  onClick={() => setIsLoginDropdownOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-red-50/60 cursor-pointer flex items-center justify-between text-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 leading-tight">Donor & Requester</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login</span>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/login/hospital"
                  onClick={() => setIsLoginDropdownOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-sky-50/60 cursor-pointer flex items-center justify-between text-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 leading-tight">Hospital Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/hospital</span>
                    </div>
                  </div>
                  <Lock className="w-3 h-3 text-sky-600" />
                </Link>

                <Link
                  to="/login/bloodbank"
                  onClick={() => setIsLoginDropdownOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Droplet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 leading-tight">Blood Bank Portal</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/bloodbank</span>
                    </div>
                  </div>
                  <Lock className="w-3 h-3 text-emerald-600" />
                </Link>

                <Link
                  to="/login/admin"
                  onClick={() => setIsLoginDropdownOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-amber-50/60 cursor-pointer flex items-center justify-between text-slate-800 transition-colors border-t border-slate-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block text-amber-800 leading-tight">Super Admin</span>
                      <span className="text-[10px] text-slate-400 font-mono">/login/admin</span>
                    </div>
                  </div>
                  <Lock className="w-3 h-3 text-amber-600" />
                </Link>
              </div>
            )}
          </div>

          {/* 2.4 USER PROFILE SECTION (REAL AUTHENTICATED DATA) */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                {/* Profile Icon / Avatar */}
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs ${getRoleBadgeStyle(currentRole)}`}>
                  {getRoleIcon(currentRole)}
                </div>

                {/* User Name & Role Tag */}
                <div className="hidden md:flex flex-col leading-none">
                  <span className="font-extrabold text-xs text-[#0F172A] truncate max-w-[130px]" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                    {currentRole}
                  </span>
                </div>
              </div>

              {/* 2.5 LOGOUT BUTTON */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/80 border border-transparent hover:border-red-100 transition-all flex items-center gap-1 cursor-pointer"
                title="Logout from BloodNet"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
                <span className="text-[11px] font-bold hidden lg:inline">Logout</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Subtle Healthcare Bottom Line Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-sky-400/20 via-red-400/30 to-sky-400/20" />
    </header>
  );
};
