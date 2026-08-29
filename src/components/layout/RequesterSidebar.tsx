import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  PlusCircle,
  AlertTriangle,
  Search,
  Bell,
  User,
  Sun,
  Moon,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';

export const RequesterSidebar: React.FC = () => {
  const { notifications } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems = [
    { to: '/requester/home', label: 'Requester Home', icon: LifeBuoy },
    { to: '/requester/dashboard', label: 'Requester Overview', icon: LayoutDashboard },
    { to: '/requester/create-request', label: 'Create Emergency Request', icon: PlusCircle, isHighlight: true },
    { to: '/requester/requests', label: 'Active Requests', icon: AlertTriangle },
    { to: '/requester/find-blood', label: 'Find Blood Availability', icon: Search },
    { to: '/requester/notifications', label: 'Realtime Alerts', icon: Bell, badge: unreadNotifs },
    { to: '/requester/profile', label: 'My Account', icon: User }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
      
      {/* Requester Portal Branding */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
            <LifeBuoy className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
              REQUESTER PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Patient Care Desk</span>
          </div>
        </div>
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
                    : item.isHighlight
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-black'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.isHighlight ? 'text-red-600' : 'text-sky-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-sky-600' : 'bg-sky-100 text-sky-800'}`}>
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
        <span className="text-[10px] text-slate-400 font-mono">Blood Net • Requester</span>
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
