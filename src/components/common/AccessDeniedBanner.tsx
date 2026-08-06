import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard } from 'lucide-react';

export const AccessDeniedBanner: React.FC = () => {
  const { navigateTo, activePage } = useApp();
  const { currentRole } = useAuth();

  return (
    <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border-2 border-red-800/80 shadow-2xl text-center space-y-5 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-950/80 text-red-500 border border-red-800 flex items-center justify-center mx-auto shadow-lg">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-red-950 text-red-300 border border-red-800 uppercase tracking-wider">
          Access Restricted • 403 Forbidden
        </span>
        <h2 className="text-2xl font-black text-white">Access Denied for {currentRole.toUpperCase()} Role</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Your current perspective (<strong className="text-red-400 capitalize">{currentRole}</strong>) does not have permission to view the <strong className="text-white capitalize">{activePage.replace('-', ' ')}</strong> section.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigateTo('dashboard')}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" /> Return to My {currentRole.toUpperCase()} Dashboard
        </button>
      </div>
    </div>
  );
};
