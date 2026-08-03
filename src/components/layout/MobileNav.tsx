import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageTab } from '../../types';
import { Home, LayoutDashboard, AlertTriangle, Search, Tent, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activePage, navigateTo } = useApp();

  const tabs: { tab: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'landing', label: 'Home', icon: Home },
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'emergency-requests', label: 'Requests', icon: AlertTriangle },
    { tab: 'donor-search', label: 'Search', icon: Search },
    { tab: 'camps', label: 'Camps', icon: Tent },
    { tab: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {tabs.map(item => {
        const IconComp = item.icon;
        const isActive = activePage === item.tab;

        return (
          <button
            key={item.tab}
            onClick={() => navigateTo(item.tab)}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              isActive ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <IconComp className={`w-5 h-5 mb-0.5 ${isActive ? 'text-red-500 scale-110' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
