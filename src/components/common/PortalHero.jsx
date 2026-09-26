import React from 'react';

/**
 * Unified BloodNet PortalHero Visual Component
 * 
 * Used consistently across all 5 BloodNet Portals:
 * 1. Donor Portal
 * 2. Requester Portal
 * 3. Hospital Portal
 * 4. Blood Bank Portal
 * 5. Super Admin Portal
 */
export const PortalHero = ({
  portalLabel,
  badgeIcon: BadgeIcon,
  badgePulseColor = 'bg-emerald-400',
  title,
  description,
  actions,
  bgImage = '/bloodnet-hero-full.png',
  bgPosition = 'center right',
  gradientOverlay = 'linear-gradient(95deg, rgba(16, 37, 66, 0.90) 0%, rgba(37, 99, 235, 0.82) 50%, rgba(6, 182, 212, 0.55) 100%)',
  decorativeIcon: DecorativeIcon,
  showEcgWave = true,
  children
}) => {
  return (
    <div 
      className="w-full rounded-3xl shadow-lg relative overflow-hidden border border-blue-400/30 text-white min-h-[340px] md:min-h-[360px] flex flex-col justify-between transition-all"
      style={{
        backgroundImage: `${gradientOverlay}, url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 1. Background ECG Pulse Line Graphic (Bottom Layer) */}
      {showEcgWave && (
        <div className="absolute right-0 bottom-0 w-full md:w-3/5 h-24 pointer-events-none opacity-20 z-0">
          <svg className="w-full h-full" viewBox="0 0 500 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 0 50 L 140 50 L 155 20 L 175 75 L 195 10 L 215 65 L 230 40 L 245 50 L 500 50" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* 2. Watermark / Large Decorative Medical Motif */}
      {DecorativeIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none z-0 hidden sm:block">
          <DecorativeIcon className="w-80 h-80 lg:w-96 lg:h-96 text-white stroke-[1.2]" />
        </div>
      )}

      {/* 3. Hero Inner Content Container with Spacing: Desktop 40-48px, Tablet 32px, Mobile 24px */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 my-auto">
        <div className="space-y-3 max-w-2xl">
          {/* Portal Badge */}
          {portalLabel && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/25 shadow-xs">
              {BadgeIcon ? (
                <BadgeIcon className="w-4 h-4 text-cyan-300" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${badgePulseColor} animate-ping`} />
              )}
              <span>{portalLabel}</span>
            </div>
          )}

          {/* Portal Welcome Title */}
          {title && (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
          )}

          {/* Portal Description */}
          {description && (
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          {children}
        </div>

        {/* Portal Right-Side Actions Area */}
        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-20">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
