import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Flame, ShieldAlert, X } from 'lucide-react';

export default function SocialProofToast() {
  const { socialFeed, toastMessage } = useApp();
  const [feedIndex, setFeedIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % socialFeed.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [socialFeed]);

  if (dismissed && !toastMessage) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 via-slate-900/90 to-red-950/80 border-b border-red-900/40 px-4 py-2 text-xs font-medium text-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Dynamic Toast Message (if triggered) OR Live Social Ticker */}
        {toastMessage ? (
          <div className="flex items-center gap-2 text-amber-300 font-semibold animate-in fade-in">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{toastMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-hidden text-slate-300">
            <span className="flex items-center gap-1 text-red-400 font-bold uppercase tracking-wider text-[11px] bg-red-950 px-2 py-0.5 rounded border border-red-800/40 shrink-0">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Pulse
            </span>
            <span className="truncate transition-all duration-500 font-medium">
              {socialFeed[feedIndex]}
            </span>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
