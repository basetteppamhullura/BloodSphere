import React from 'react';

interface BloodNetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BloodNetLogo: React.FC<BloodNetLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Blood Drop + Network Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {/* Soft Water Bubble Aura */}
        <div className="absolute inset-0 rounded-full bg-sky-200/50 blur-sm animate-pulse-glow" />

        {/* Network Nodes Orbit SVG */}
        <svg className="absolute inset-0 w-full h-full text-sky-400" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
          <circle cx="20" cy="4" r="2.5" fill="#0284C7" />
          <circle cx="36" cy="20" r="2.5" fill="#0284C7" />
          <circle cx="20" cy="36" r="2.5" fill="#0284C7" />
          <circle cx="4" cy="20" r="2.5" fill="#0284C7" />
          <path d="M20 4 L20 12 M36 20 L28 20 M20 36 L20 28 M4 20 L12 20" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4" />
        </svg>

        {/* Central Blood Drop */}
        <div className="relative z-10 w-3/5 h-3/5 rounded-t-full rounded-br-full bg-gradient-to-br from-red-500 to-rose-700 shadow-md shadow-red-500/30 transform -rotate-45 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 transform translate-x-0.5 -translate-y-0.5" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-black tracking-tight text-slate-900 leading-none flex items-center ${titleSizes[size]}`}>
          Blood<span className="text-red-600">Net</span>
          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Real-Time Network Active" />
        </div>
        {showTagline && (
          <span className={`text-slate-500 font-medium tracking-wide mt-0.5 ${taglineSizes[size]}`}>
            Connecting Lives Through Blood
          </span>
        )}
      </div>
    </div>
  );
};
