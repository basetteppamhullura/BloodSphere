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
  ShieldAlert,
  Boxes,
  Truck,
  Bell,
  Activity,
  Settings,
  Landmark,
  Radio,
  Clock
} from 'lucide-react';

export const HospitalSidebar: React.FC = () => {
  const { requests, notifications, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const criticalCount = requests.filter(
    r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  ).length;

  const pendingRequestsCount = requests.filter(
    r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS' || r.status === 'PENDING'
  ).length;

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navSections = [
    {
      title: 'HOSPITAL OPERATIONS',
      items: [
        { to: '/hospital/home', label: 'Home / Operations', icon: Home },
        { to: '/hospital/requests', label: 'Incoming Blood Requests', icon: AlertTriangle, badge: pendingRequestsCount || criticalCount },
        { to: '/hospital/dashboard', label: 'Blood Stock Monitor', icon: LayoutDashboard },
        { to: '/hospital/unit-details', label: 'Blood Unit Tracking', icon: Boxes }
      ]
    },
    {
      title: 'NETWORK & LOGISTICS',
      items: [
        { to: '/hospital/blood-banks', label: 'Blood Bank Requests', icon: Landmark },
        { to: '/hospital/donors', label: 'Donor Responses & Drives', icon: Heart },
        { to: '/hospital/blood-availability', label: 'Blood Availability Search', icon: Search }
      ]
    },
    {
      title: 'GOVERNANCE & REPORTS',
      items: [
        { to: '/hospital/reports', label: 'Hospital Reports & Audit', icon: FileText },
        { to: '/hospital/activity', label: 'Hospital Activity Log', icon: Activity }
      ]
    }
  ];

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
              <span className="text-[10px] text-sky-700 font-medium">Operations & Trauma</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected to Blood Net" />
        </div>

        {/* Navigation Sections */}
        <nav className="w-full flex flex-col space-y-4 text-xs font-extrabold">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map(item => {
                  const IconComp = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                          isActive
                            ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/20 font-black'
                            : 'text-[#0D2B45] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0284C7]'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isActive ? 'bg-white text-[#0284C7]' : 'bg-red-500 text-white font-mono'
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
              </div>
            </div>
          ))}
        </nav>

        {/* Footer with Mode Toggle */}
        <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-sky-700 font-medium">
          <span className="text-[10px] font-mono text-sky-700">Blood Net • Clinical</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0D2B45] border border-sky-200 transition-all cursor-pointer"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#0EA5E9]" />}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SLIDE-OUT DRAWER */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0284C7]" />
                  <span className="font-black text-sm text-[#0D2B45]">Hospital Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-4 text-xs font-extrabold">
                {navSections.map(section => (
                  <div key={section.title} className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase px-2">
                      {section.title}
                    </div>
                    {section.items.map(item => {
                      const IconComp = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={({ isActive }) =>
                            `w-full flex items-center justify-between px-3 py-2.5 rounded-xl ${
                              isActive ? 'bg-[#0284C7] text-white font-black' : 'text-[#0D2B45] hover:bg-[#E0F2FE]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
