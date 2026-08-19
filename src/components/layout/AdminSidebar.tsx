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
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { portalAccounts } = useAuth();
  const { requests } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const pendingAccountsCount = portalAccounts.filter(a => a.verificationStatus === 'PENDING').length;
  const requestsCount = requests.length;

  const navItems = [
    { to: '/admin/dashboard', label: 'Control Overview', icon: ShieldCheck },
    { to: '/admin/users', label: 'All Accounts & Approvals', icon: Users, badge: pendingAccountsCount },
    { to: '/admin/donors', label: 'Donors Management', icon: Heart },
    { to: '/admin/requesters', label: 'Requesters Management', icon: FileText },
    { to: '/admin/hospitals', label: 'Hospitals Verification', icon: Building2 },
    { to: '/admin/bloodbanks', label: 'Blood Banks Verification', icon: Droplet },
    { to: '/admin/requests', label: 'System Requests Monitor', icon: ShieldAlert, badge: requestsCount },
    { to: '/admin/reports', label: 'Analytics & Compliance', icon: BarChart3 },
    { to: '/admin/settings', label: 'Audit Logs & Settings', icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
      
      {/* Admin Portal Branding */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
              SUPER ADMIN PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">System Control Desk</span>
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
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-800'}`}>
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
        <span className="text-[10px] text-slate-400 font-mono">Blood Net • Admin</span>
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
