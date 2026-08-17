import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PageTab } from '../../types';
import { Home, LayoutDashboard, AlertTriangle, Building2, User, Search } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activePage, navigateTo } = useApp();
  const { currentRole, isPageAllowedForRole } = useAuth();

  const allNavItems: { tab: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'landing', label: 'Home', icon: Home },
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'emergency-requests', label: 'Requests', icon: AlertTriangle },
    { tab: 'donor-search', label: 'Donors', icon: Search },
    { tab: 'blood-banks', label: 'Banks', icon: Building2 },
    { tab: 'profile', label: 'Profile', icon: User }
  ];

  const permittedNavItems = allNavItems.filter(item => isPageAllowedForRole(item.tab, currentRole));

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 px-2 py-2 flex items-center justify-around text-slate-500 shadow-lg">
      {permittedNavItems.map(item => {
        const IconComp = item.icon;
        const isActive = activePage === item.tab;
        const isEmergency = item.tab === 'emergency-requests';

        return (
          <button
            key={item.tab}
            onClick={() => navigateTo(item.tab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive
                ? isEmergency
                  ? 'text-red-600 font-extrabold bg-red-50'
                  : 'text-sky-600 font-extrabold bg-sky-50'
                : 'hover:text-slate-900'
            }`}
          >
            <IconComp className={`w-5 h-5 ${isActive ? (isEmergency ? 'text-red-600' : 'text-sky-600') : 'text-slate-400'}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
