import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  AlertTriangle,
  Droplet,
  Users,
  Boxes,
  FileText,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

export const HospitalSidebar: React.FC = () => {
  const { requests } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const navItems = [
    { to: '/hospital/home', label: 'Hospital Home', icon: Building2 },
    { to: '/hospital/dashboard', label: 'Hospital Dashboard', icon: Building2 },
    { to: '/hospital/requests', label: 'Patient Requests Board', icon: AlertTriangle, badge: criticalCount },
    { to: '/hospital/blood-availability', label: 'Blood Availability Search', icon: Droplet },
    { to: '/hospital/donors', label: 'Donation Drives & Donors', icon: Users },
    { to: '/hospital/blood-banks', label: 'Blood Bank Requests', icon: Boxes },
    { to: '/hospital/reports', label: 'Audit Logs & Reports', icon: FileText }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
      
      {/* Hospital Portal Branding */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold">
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
              HOSPITAL PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Trauma & Emergency</span>
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
        <span className="text-[10px] text-slate-400 font-mono">Blood Net • Hospital</span>
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
