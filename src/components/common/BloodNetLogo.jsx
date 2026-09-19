import React from 'react';

export const BloodNetLogo = ({ size = 'md', showTagline = true, className = '' }) => {
    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };
    const titleSizes = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl font-black'
    };
    const taglineSizes = {
        sm: 'text-[9px]',
        md: 'text-[11px]',
        lg: 'text-xs'
    };
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* Blood Drop + Network Icon */}
            <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
                {/* Soft Medical Blue Aura */}
                <div className="absolute inset-0 rounded-full bg-sky-200/40 blur-xs animate-pulse"/>

                {/* Network Nodes Orbit SVG */}
                <svg className="absolute inset-0 w-full h-full text-sky-400" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-40"/>
                    <circle cx="20" cy="4" r="2.5" fill="#0284C7"/>
                    <circle cx="36" cy="20" r="2.5" fill="#0284C7"/>
                    <circle cx="20" cy="36" r="2.5" fill="#0284C7"/>
                    <circle cx="4" cy="20" r="2.5" fill="#0284C7"/>
                    <path d="M20 4 L20 12 M36 20 L28 20 M20 36 L20 28 M4 20 L12 20" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4"/>
                </svg>

                {/* Central Blood Drop */}
                <div className="relative z-10 w-3/5 h-3/5 rounded-t-full rounded-br-full bg-gradient-to-br from-red-600 to-red-700 shadow-sm shadow-red-500/30 transform -rotate-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 transform translate-x-0.5 -translate-y-0.5"/>
                </div>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col min-w-max">
                <div className={`font-black tracking-tight text-[#0F172A] leading-none flex items-center ${titleSizes[size]}`}>
                    <span>Blood</span>
                    <span className="text-[#DC2626]">Net</span>
                    <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Real-Time Network Active"/>
                </div>
                {showTagline && (
                    <span className={`text-slate-500 font-medium tracking-normal mt-0.5 whitespace-nowrap ${taglineSizes[size]}`}>
                        Connecting Lives Through Blood
                    </span>
                )}
            </div>
        </div>
    );
};

