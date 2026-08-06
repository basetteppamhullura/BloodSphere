import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PageTab } from '../../types';
import { Home, LayoutDashboard, AlertTriangle, Building2, User, Search, ShieldCheck, Users, Truck, Trophy } from 'lucide-react';

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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around text-slate-400">
      {permittedNavItems.map(item => {
        const IconComp = item.icon;
        const isActive = activePage === item.tab;

        return (
          <button
            key={item.tab}
            onClick={() => navigateTo(item.tab)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-red-500 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <IconComp className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
