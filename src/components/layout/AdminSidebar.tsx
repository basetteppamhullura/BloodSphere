import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldCheck,
  Users,
  Building2,
  Droplet,
  FileText,
  BarChart3,
  Settings,
  Heart,
  ChevronRight,
  ShieldAlert,
  Lock,
  Layers,
  Activity,
  Boxes,
  Clock,
  Landmark
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { portalAccounts } = useAuth();
  const { requests, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const pendingHospitalsCount = portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Pending Verification').length;
  const pendingBloodBanksCount = portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Pending Verification').length;
  const pendingAccountsCount = portalAccounts.filter(a => a.status === 'Pending Verification').length;
  const activeRequestsCount = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const criticalRequestsCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;

  const navSections = [
    {
      title: 'CONTROL & MONITORING',
      items: [
        { to: '/admin/dashboard', label: 'Control Overview', icon: ShieldCheck },
        { to: '/admin/live-activity', label: 'Live System Activity', icon: Activity },
        { to: '/admin/requests', label: 'System Blood Requests', icon: ShieldAlert, badge: activeRequestsCount }
      ]
    },
    {
      title: 'PORTAL ENTITIES',
      items: [
        { to: '/admin/accounts', label: 'All Accounts & Approvals', icon: Users, badge: pendingAccountsCount },
        { to: '/admin/requesters', label: 'Requesters Monitoring', icon: FileText },
        { to: '/admin/donors', label: 'Donors Monitoring', icon: Heart },
        { to: '/admin/hospitals', label: 'Hospitals Monitoring', icon: Building2, badge: pendingHospitalsCount },
        { to: '/admin/blood-banks', label: 'Blood Banks Monitoring', icon: Landmark, badge: pendingBloodBanksCount }
      ]
    },
    {
      title: 'INVENTORY & GOVERNANCE',
      items: [
        { to: '/admin/inventory', label: 'Blood Inventory Monitor', icon: Boxes },
        { to: '/admin/analytics', label: 'Analytics & Compliance', icon: BarChart3 },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: Clock },
        { to: '/admin/settings', label: 'Settings & Live Status', icon: Settings }
      ]
    }
  ];

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
              <span className="text-[10px] text-amber-700 font-bold">CENTRAL CONTROL</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Real-Time Socket Connected" />
        </div>

        {/* Navigation List */}
        <nav className="w-full flex flex-col space-y-5 text-xs font-extrabold">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1.5">
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

        {/* Quick System Badge */}
        <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            LIVE AUDIT
          </span>
          <span className="text-amber-700">v2.5 PROD</span>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="font-black text-sm text-slate-900">Super Admin Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
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
                              isActive ? 'bg-amber-600 text-white font-black' : 'text-slate-700 hover:bg-amber-50'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
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
