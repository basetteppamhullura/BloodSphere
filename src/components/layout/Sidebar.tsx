import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageTab } from '../../types';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  Home,
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Users,
  Search,
  Trophy,
  User,
  ChevronRight,
  Sun,
  Moon,
  X,
  Radio
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    navigateTo,
    requests,
    connectionStatus,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const { currentRole } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Active Critical Emergency Requests Count for Real-Time Badge
  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  // The 8 Donor Portal Menu Items in Exact Vertical Order Required
  const donorNavItems: { tab: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'landing', label: 'Home Landing', icon: Home },
    { tab: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { tab: 'emergency-requests', label: 'Emergency Board', icon: AlertTriangle },
    { tab: 'rare-registry', label: 'Rare Blood Registry', icon: ShieldCheck },
    { tab: 'group-circles', label: 'Family & Circles', icon: Users },
    { tab: 'donor-search', label: 'Donor Directory', icon: Search },
    { tab: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { tab: 'profile', label: 'My Health Profile', icon: User }
  ];

  const handleNavClick = (tab: PageTab) => {
    navigateTo(tab);
    setIsMobileSidebarOpen(false);
  };

  const renderVerticalMenu = () => (
    <nav className="w-full flex flex-col space-y-3 font-sans">
      {donorNavItems.map(item => {
        const IconComp = item.icon;
        const isActive = activePage === item.tab;
        const isEmergency = item.tab === 'emergency-requests';

        return (
          <button
            key={item.tab}
            onClick={() => handleNavClick(item.tab)}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              isActive
                ? isEmergency
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : isEmergency
                ? 'text-red-600 hover:bg-red-50/80 border border-red-100/60'
                : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50/80'
            }`}
          >
            {/* Left: Icon + Label */}
            <div className="flex items-center gap-3 min-w-0">
              <IconComp
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : isEmergency ? 'text-red-600' : 'text-sky-600'
                }`}
              />
              <span className="truncate tracking-tight">{item.label}</span>
            </div>

            {/* Right: Badge / Status Arrow */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {isEmergency && criticalCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isActive
                      ? 'bg-white text-red-600 font-black'
                      : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                  }`}
                >
                  {criticalCount} LIVE
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-white" />}
            </div>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ================================================== */}
      {/* 1. DESKTOP & TABLET FIXED VERTICAL SIDEBAR MENU     */}
      {/* ================================================== */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-sm sticky top-20 h-fit space-y-5 text-slate-800">
        
        {/* DONOR PORTAL HEADER & REAL-TIME CONNECTION STATUS */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
              DONOR PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Real-Time Network</span>
          </div>

          {/* Real-time Connection Status Indicator */}
          <span
            className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
              connectionStatus === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : connectionStatus === 'RECONNECTING'
                ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
            title="Real-Time Network Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'ONLINE'
                  ? 'bg-emerald-500 animate-ping'
                  : connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />
            {connectionStatus === 'ONLINE' ? '🟢 LIVE' : connectionStatus === 'RECONNECTING' ? '🟡 RECONNECTING' : '🔴 OFFLINE'}
          </span>
        </div>

        {/* VERTICAL MENU STACK */}
        {renderVerticalMenu()}

        {/* FOOTER INFO & THEME TOGGLE */}
        <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="text-[10px] text-slate-400 font-mono">Blood Net v2.4</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-600 border border-sky-100 transition-all"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
          </button>
        </div>

      </aside>

      {/* ================================================== */}
      {/* 2. MOBILE OVERLAY VERTICAL SIDEBAR DRAWER          */}
      {/* ================================================== */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Vertical Slide-Over Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 border-r border-sky-100 overflow-y-auto space-y-5">
            
            <div className="space-y-5">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <BloodNetLogo size="sm" showTagline={false} />
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DONOR PORTAL STATUS */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
                <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
                  DONOR PORTAL
                </span>
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    connectionStatus === 'ONLINE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : connectionStatus === 'RECONNECTING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'ONLINE'
                        ? 'bg-emerald-500 animate-ping'
                        : connectionStatus === 'RECONNECTING'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  {connectionStatus === 'ONLINE' ? '🟢 LIVE' : connectionStatus === 'RECONNECTING' ? '🟡 RECONNECTING' : '🔴 OFFLINE'}
                </span>
              </div>

              {/* VERTICAL MENU STACK IN MOBILE DRAWER */}
              {renderVerticalMenu()}
            </div>

            {/* Mobile Footer */}
            <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-[10px] text-slate-400">Blood Net Real-Time System</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl bg-sky-50 text-slate-600 border border-sky-100"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
