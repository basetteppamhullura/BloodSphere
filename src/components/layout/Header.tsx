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
  Menu,
  MessageSquare,
  Shield,
  Users,
  Heart
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    setActiveEmergencyPostModal,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    chatSessions,
    openEmergencyChat,
    showToast
  } = useApp();

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

  // Compute real unread count and active emergency chats
  const activeChats = chatSessions.filter(s => s.status === 'active');
  const unreadChatCount = activeChats.reduce((sum, s) => {
    if (currentRole === 'requester') return sum + (s.unreadCountRequester || 0);
    if (currentRole === 'donor') return sum + (s.unreadCountDonor || 0);
    return sum + (s.unreadCountRequester || 0) + (s.unreadCountDonor || 0);
  }, 0);

  // Real count badge
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100/90 shadow-2xs relative overflow-visible">
      {/* Subtle Background Healthcare Graphics inside Header */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30">
        <div className="absolute -top-10 left-1/4 w-72 h-32 bg-sky-100/40 rounded-full blur-2xl" />
        <div className="absolute -top-10 right-1/4 w-72 h-32 bg-red-100/20 rounded-full blur-2xl" />
        {/* Subtle Wave SVG */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-4 text-sky-200/40"
          preserveAspectRatio="none"
          viewBox="0 0 1200 40"
          fill="none"
        >
          <path
            d="M0,20 C300,5 600,35 900,15 C1050,5 1150,25 1200,20 L1200,40 L0,40 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Main Container — Generous Height (approx 80-90px on Desktop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4 relative z-10">
        
        {/* ================================================== */}
        {/* 1. LEFT SIDE — BLOODNET BRAND                      */}
        {/* ================================================== */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile Drawer Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-sky-600" />
          </button>

          {/* BloodNet Logo & Brand Text */}
          <Link to="/" className="cursor-pointer flex items-center group">
            <BloodNetLogo size="md" showTagline={true} />
          </Link>
        </div>

        {/* ================================================== */}
        {/* 2. CENTER / RIGHT ACTIONS (One Clean Row)          */}
        {/* ================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5">
          
          {/* 2.1 EMERGENCY CHAT BUTTON (Rounded Outline Style) */}
          <button
            type="button"
            onClick={handleEmergencyChatClick}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white hover:bg-red-50/60 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-102 shrink-0"
            title="Open Private Real-Time Emergency Chat"
          >
            <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
            <span className="hidden sm:inline font-bold">Emergency Chat</span>
            {chatBadgeCount > 0 && (
              <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {chatBadgeCount}
              </span>
            )}
          </button>

          {/* 2.2 POST EMERGENCY NEED (Prominent Red Pill Button) */}
          <button
            type="button"
            onClick={() => setActiveEmergencyPostModal(true)}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-sm shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98 shrink-0"
            title="Create an emergency blood request"
          >
            <PlusCircle className="w-4 h-4 text-white shrink-0" />
            <span className="hidden xs:inline sm:inline">Post Emergency Need</span>
            <span className="inline xs:hidden sm:hidden">Post Need</span>
          </button>

          {/* 2.3 PORTAL LOGIN (Light Blue Rounded Button + Dropdown) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              aria-expanded={isLoginDropdownOpen}
              aria-haspopup="true"
            >
              <User className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="hidden sm:inline">Portal Login</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#0284C7] transition-transform duration-200 ${
                  isLoginDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isLoginDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white border border-sky-100 shadow-xl p-2 z-50 space-y-1 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
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

          {/* 2.4 AUTHENTICATED USER PROFILE & LOGOUT SECTION */}
          {currentUser && (
            <>
              {/* Subtle Vertical Divider */}
              <div className="h-6 w-px bg-slate-200/90 mx-0.5 sm:mx-1 hidden md:block" />

              {/* User Profile Area */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Small circular light-blue profile icon */}
                <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-4 h-4 text-[#0284C7]" />
                </div>

                {/* User Name (ROLE) */}
                <span className="font-bold text-xs text-slate-800 hidden md:inline whitespace-nowrap" title={currentUser.name}>
                  {currentUser.name} <span className="text-slate-500 font-extrabold uppercase">({currentRole})</span>
                </span>
              </div>

              {/* Subtle Vertical Divider */}
              <div className="h-6 w-px bg-slate-200/90 mx-0.5 sm:mx-1 hidden md:block" />

              {/* 2.5 LOGOUT BUTTON */}
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-2 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs shrink-0"
                title="Logout from BloodNet"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Soft Blue Wave / Accent Line at bottom */}
      <div className="h-[2px] w-full bg-gradient-to-r from-sky-400/20 via-sky-500/30 to-sky-400/20" />
    </header>
  );
};
