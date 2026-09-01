import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  Home,
  LayoutDashboard,
  AlertTriangle,
  Search,
  Heart,
  FileText,
  Sun,
  Moon,
  ChevronRight,
  X
} from 'lucide-react';

export const HospitalSidebar: React.FC = () => {
  const { requests, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const navItems = [
    { to: '/hospital/home', label: 'Hospital Home', icon: Home },
    { to: '/hospital/dashboard', label: 'Hospital Dashboard', icon: LayoutDashboard },
    { to: '/hospital/requests', label: 'Patient Requests Board', icon: AlertTriangle, badge: criticalCount || 5 },
    { to: '/hospital/unit-details', label: 'Hospital Blood Unit Details', icon: Search },
    { to: '/hospital/blood-availability', label: 'Blood Availability Search', icon: Search },
    { to: '/hospital/donors', label: 'Donation Drives & Donors', icon: Heart },
    { to: '/hospital/reports', label: 'Audit Logs & Reports', icon: FileText }
  ];

  const renderNavLinks = () => (
    <nav className="w-full flex flex-col space-y-2 text-xs font-extrabold">
      {navItems.map(item => {
        const IconComp = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#0EA5E9] text-white shadow-md shadow-[#0EA5E9]/25 font-black border-l-4 border-l-white'
                  : 'text-[#0D2B45] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0EA5E9]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-2xs ${
                      isActive
                        ? 'bg-white text-[#0284C7]'
                        : 'bg-red-500 text-white font-mono animate-pulse'
                    }`}
                  >
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
  );

  return (
    <>
      {/* 1. DESKTOP / TABLET VERTICAL LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-sky-100/90 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-[#0D2B45]">
        
        {/* Hospital Portal Branding */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E0F2FE] border border-sky-200 flex items-center justify-center text-[#0EA5E9] font-bold shadow-2xs">
              <Building2 className="w-5 h-5 text-[#0EA5E9]" />
            </div>
            <div>
              <span className="text-xs font-black text-[#0D2B45] tracking-tight uppercase block leading-tight">
                HOSPITAL PORTAL
              </span>
              <span className="text-[10px] text-sky-700 font-medium">Trauma & Emergency</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        {renderNavLinks()}

        {/* Footer */}
        <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-sky-700 font-medium">
          <span className="text-[10px] font-mono text-sky-700">Blood Net • Hospital</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0D2B45] border border-sky-200 transition-all"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#0EA5E9]" />}
          </button>
        </div>

      </aside>

      {/* 2. MOBILE SLIDE-OUT DRAWER */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 border-r border-sky-100 overflow-y-auto space-y-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] border border-sky-200 flex items-center justify-center text-[#0EA5E9] font-bold">
                    <Building2 className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#0D2B45] tracking-tight uppercase block">
                      HOSPITAL PORTAL
                    </span>
                    <span className="text-[10px] text-sky-700 font-medium">Trauma & Emergency</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavLinks()}
            </div>

            <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-sky-700 font-medium">
              <span className="text-[10px] font-mono text-sky-700">Blood Net Hospital System</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl bg-[#F0F9FF] text-[#0D2B45] border border-sky-200"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#0EA5E9]" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
