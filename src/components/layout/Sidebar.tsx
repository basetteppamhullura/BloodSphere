import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageTab } from '../../types';
import {
  Heart,
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
  Moon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, navigateTo } = useApp();
  const { currentRole, switchRole } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems: { tab: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800/80 min-h-screen sticky top-0 z-40 text-slate-300">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-950">
          <Heart className="w-6 h-6 fill-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
            Blood<span className="text-red-500">Net</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Healthcare Donor Network</p>
        </div>
      </div>

      {/* Role Switcher Pill */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1.5">
          Role Perspective:
        </span>
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['donor', 'requester', 'hospital', 'admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`py-1 rounded text-[10px] font-bold capitalize transition-all ${
                currentRole === role
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold px-3 py-1 block">
          Navigation Pages
        </span>

        {navItems.map(item => {
          const IconComp = item.icon;
          const isActive = activePage === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => navigateTo(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
        </button>

        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Online
        </span>
      </div>

    </aside>
  );
};
