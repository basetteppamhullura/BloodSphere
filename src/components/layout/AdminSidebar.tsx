import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  ShieldCheck,
  Users,
  Building2,
  Droplet,
  FileText,
  BarChart3,
  Settings,
  Heart,
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert,
  X,
  Lock,
  PieChart,
  UserCheck
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { portalAccounts } = useAuth();
  const { requests, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const pendingHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Pending Verification').length;
  const pendingBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Pending Verification').length;
  const pendingAccountsCount = portalAccounts.filter(a => a.status === 'Pending Verification').length;
  const activeRequestsCount = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  
  // Total pending system requests queue count
  const pendingSystemRequestsCount = pendingHospitalsCount + pendingBloodBanksCount + activeRequestsCount;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { to: '/admin/home', label: 'Admin Home', icon: ShieldCheck },
        { to: '/admin/dashboard', label: 'Control Overview', icon: ShieldCheck }
      ]
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { to: '/admin/accounts', label: 'All Accounts & Approvals', icon: Users, badge: pendingAccountsCount },
        { to: '/admin/donors', label: 'Donors Management', icon: Heart },
        { to: '/admin/requesters', label: 'Requesters Management', icon: FileText }
      ]
    },
    {
      title: 'VERIFICATION',
      items: [
        { to: '/admin/hospitals', label: 'Hospitals Verification', icon: Building2, badge: pendingHospitalsCount },
        { to: '/admin/blood-banks', label: 'Blood Banks Verification', icon: Droplet, badge: pendingBloodBanksCount }
      ]
    },
    {
      title: 'SYSTEM MANAGEMENT',
      items: [
        { to: '/admin/requests', label: 'System Requests Management', icon: ShieldAlert, badge: pendingSystemRequestsCount },
        { to: '/admin/analytics', label: 'Analytics & Compliance', icon: BarChart3 }
      ]
    },
    {
      title: 'SECURITY',
      items: [
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: Settings },
        { to: '/admin/settings', label: 'Settings', icon: Lock }
      ]
    }
  ];

  const renderSectionNav = () => (
    <nav className="w-full flex flex-col space-y-5 text-xs font-extrabold">
      {navSections.map(section => (
        <div key={section.title} className="space-y-1.5">
          {/* Subtle Section Header */}
          <div className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
            {section.title}
          </div>

          {/* Section Vertical Links */}
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
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 font-black'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-amber-50/80 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-800'
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
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT VERTICAL LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
        
        {/* Admin Portal Header */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
                BLOOD NET
              </span>
              <span className="text-[10px] text-amber-700 font-bold">ADMIN PORTAL</span>
            </div>
          </div>
        </div>

        {/* Grouped Vertical Navigation */}
        {renderSectionNav()}

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="text-[10px] text-slate-400 font-mono">Blood Net • Admin</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-600 border border-sky-100 transition-all"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
          </button>
        </div>

      </aside>

      {/* 2. MOBILE COLLAPSIBLE VERTICAL DRAWER */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Vertical Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 border-r border-sky-100 overflow-y-auto space-y-5">
            
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
                      BLOOD NET
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold">ADMIN PORTAL</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Vertical Navigation */}
              {renderSectionNav()}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-[10px] text-slate-400 font-mono">Blood Net Admin System</span>
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
