import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageTab } from '../../types';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  Home,
  LayoutDashboard,
  Search,
  AlertTriangle,
  Building2,
  Tent,
  Trophy,
  User,
  ShieldCheck,
  Users,
  Truck,
  ChevronRight,
  Sun,
  Moon,
  Radio
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, navigateTo } = useApp();
  const { currentRole, isPageAllowedForRole } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const allNavItems: { tab: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'landing', label: 'Home Landing', icon: Home },
    { tab: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { tab: 'emergency-requests', label: 'Emergency Board', icon: AlertTriangle },
    { tab: 'rare-registry', label: 'Rare Blood Registry', icon: ShieldCheck },
    { tab: 'group-circles', label: 'Family & Circles', icon: Users },
    { tab: 'blood-bridge', label: 'Inter-City Supply', icon: Truck },
    { tab: 'donor-search', label: 'Donor Directory', icon: Search },
    { tab: 'blood-banks', label: 'Blood Banks & Stock', icon: Building2 },
    { tab: 'camps', label: 'Donation Drives', icon: Tent },
    { tab: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { tab: 'profile', label: 'My Health Profile', icon: User }
  ];

  // Filter navigation links based on current role permissions
  const permittedNavItems = allNavItems.filter(item => isPageAllowedForRole(item.tab, currentRole));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sky-100/80 min-h-screen sticky top-0 z-40 text-slate-800 shadow-xs">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-sky-100 flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
        <BloodNetLogo size="sm" showTagline={false} />
      </div>

      {/* Permitted Navigation Links */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1 mb-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
            {currentRole.toUpperCase()} PORTAL
          </span>
          <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
          </span>
        </div>

        {permittedNavItems.map(item => {
          const IconComp = item.icon;
          const isActive = activePage === item.tab;
          const isEmergency = item.tab === 'emergency-requests';

          return (
            <button
              key={item.tab}
              onClick={() => navigateTo(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? isEmergency
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : isEmergency
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : isEmergency ? 'text-red-600' : 'text-sky-600'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-sky-100 bg-sky-50/40 text-xs flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-medium">Blood Net Operational</span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-white border border-sky-100 text-slate-600 hover:text-slate-900 shadow-2xs"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
        </button>
      </div>

    </aside>
  );
};
