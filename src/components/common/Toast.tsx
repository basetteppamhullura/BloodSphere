import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Activity } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4">
      <div className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold shadow-2xl shadow-slate-950 flex items-center gap-2.5">
        <Activity className="w-4 h-4 text-red-500 animate-pulse" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
