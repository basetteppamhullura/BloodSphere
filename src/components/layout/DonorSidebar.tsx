import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Users,
  Search,
  Trophy,
  User,
  Sun,
  Moon,
  ChevronRight,
  Heart
} from 'lucide-react';

export const DonorSidebar: React.FC = () => {
  const { requests, connectionStatus } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const navItems = [
    { to: '/donor/dashboard', label: 'Donor Overview', icon: LayoutDashboard },
    { to: '/donor/emergency', label: 'Emergency Requests', icon: AlertTriangle, badge: criticalCount },
    { to: '/donor/rare-blood', label: 'Rare Blood Registry', icon: ShieldCheck },
    { to: '/donor/family', label: 'Family & Circles', icon: Users },
    { to: '/donor/directory', label: 'Donor Directory', icon: Search },
    { to: '/donor/leaderboard', label: 'Honor Leaderboard', icon: Trophy },
    { to: '/donor/profile', label: 'Health Profile', icon: User }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
      
      {/* Donor Portal Branding */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold">
            <Heart className="w-4 h-4 text-red-600 fill-red-500" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
              DONOR PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Voluntary Network</span>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
            connectionStatus === 'ONLINE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          LIVE
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="w-full flex flex-col space-y-2 text-xs font-extrabold">
        {navItems.map(item => {
          const IconComp = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-sky-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-red-600' : 'bg-red-100 text-red-700 font-mono'}`}>
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4 h-4 text-white shrink-0" />
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="text-[10px] text-slate-400 font-mono">Blood Net • Donor</span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-600 border border-sky-100 transition-all"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
        </button>
      </div>

    </aside>
  );
};
