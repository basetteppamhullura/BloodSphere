import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Home, LayoutDashboard, AlertTriangle, Search, User, Menu, Droplet, Building2, ShieldCheck } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
  const { currentRole } = useAuth();

  const getRoleNavItems = () => {
    switch (currentRole) {
      case 'donor':
        return [
          { to: '/donor/dashboard', label: 'Home', icon: LayoutDashboard },
          { to: '/donor/emergency', label: 'Requests', icon: AlertTriangle },
          { to: '/donor/directory', label: 'Donors', icon: Search },
          { to: '/donor/profile', label: 'Profile', icon: User }
        ];
      case 'requester':
        return [
          { to: '/requester/dashboard', label: 'Home', icon: LayoutDashboard },
          { to: '/requester/requests', label: 'Requests', icon: AlertTriangle },
          { to: '/requester/find-blood', label: 'Find Stock', icon: Search },
          { to: '/requester/profile', label: 'Profile', icon: User }
        ];
      case 'hospital':
        return [
          { to: '/hospital/dashboard', label: 'Home', icon: Building2 },
          { to: '/hospital/requests', label: 'Requests', icon: AlertTriangle },
          { to: '/hospital/blood-banks', label: 'Supplies', icon: Search },
          { to: '/hospital/reports', label: 'Reports', icon: User }
        ];
      case 'bloodbank':
        return [
          { to: '/bloodbank/dashboard', label: 'Home', icon: Droplet },
          { to: '/bloodbank/requests', label: 'Queue', icon: AlertTriangle },
          { to: '/bloodbank/inventory', label: 'Stock', icon: Search },
          { to: '/bloodbank/reports', label: 'Reports', icon: User }
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Admin', icon: ShieldCheck },
          { to: '/admin/users', label: 'Users', icon: User },
          { to: '/admin/requests', label: 'Requests', icon: AlertTriangle },
          { to: '/admin/reports', label: 'Reports', icon: Search }
        ];
      default:
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/login', label: 'Login', icon: User }
        ];
    }
  };

  const roleNavItems = getRoleNavItems();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 px-2 py-2 flex items-center justify-around text-slate-500 shadow-lg">
      
      {/* Menu Toggle Drawer Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
          isMobileSidebarOpen ? 'text-sky-600 font-extrabold bg-sky-50' : 'hover:text-slate-900'
        }`}
      >
        <Menu className="w-5 h-5 text-sky-600" />
        <span className="text-[10px]">Menu</span>
      </button>

      {roleNavItems.map(item => {
        const IconComp = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-600 font-extrabold bg-sky-50'
                  : 'hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <IconComp className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="text-[10px]">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

