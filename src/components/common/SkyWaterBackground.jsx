import React from 'react';

/**
 * SkyWaterBackground — BloodNet unified sky + water visual theme
 * Pure CSS + SVG, no external images, lightweight, fully responsive.
 *
 * Props:
 *   variant: 'default' | 'donor' | 'requester' | 'hospital' | 'bloodbank' | 'admin'
 *   Each variant shares the same sky/aqua/white language but has subtle accent differences.
 */
export const SkyWaterBackground = ({ variant = 'default' }) => {
  // Variant-specific accent tints — all stay within the sky/aqua/white palette
  const variantConfig = {
    default: {
      skyTop: '#EAF7FF',
      skyMid: '#DDF4FF',
      skyBot: '#CFF3FA',
      orb1: 'rgba(14,165,233,0.13)',
      orb2: 'rgba(56,189,248,0.10)',
      orb3: 'rgba(186,230,255,0.22)',
      waveFill1: 'rgba(186,230,255,0.35)',
      waveFill2: 'rgba(224,242,254,0.50)',
      waveFill3: 'rgba(240,249,255,0.70)',
      dropAccent: 'rgba(239,68,68,0.14)',   // subtle red for blood drops
    },
    donor: {
      skyTop: '#FFF1F2',
      skyMid: '#EAF7FF',
      skyBot: '#DDF4FF',
      orb1: 'rgba(244,63,94,0.10)',
      orb2: 'rgba(14,165,233,0.12)',
      orb3: 'rgba(253,164,175,0.15)',
      waveFill1: 'rgba(186,230,255,0.32)',
      waveFill2: 'rgba(253,205,211,0.28)',
      waveFill3: 'rgba(240,249,255,0.65)',
      dropAccent: 'rgba(239,68,68,0.18)',
    },
    requester: {
      skyTop: '#EAF7FF',
      skyMid: '#E0F7FA',
      skyBot: '#F5FCFF',
      orb1: 'rgba(6,182,212,0.12)',
      orb2: 'rgba(14,165,233,0.10)',
      orb3: 'rgba(165,243,252,0.20)',
      waveFill1: 'rgba(165,243,252,0.35)',
      waveFill2: 'rgba(224,247,250,0.52)',
      waveFill3: 'rgba(240,249,255,0.68)',
      dropAccent: 'rgba(239,68,68,0.12)',
    },
    hospital: {
      skyTop: '#E8F4FF',
      skyMid: '#DDF4FF',
      skyBot: '#EAF7FF',
      orb1: 'rgba(37,99,235,0.09)',
      orb2: 'rgba(14,165,233,0.13)',
      orb3: 'rgba(186,230,255,0.20)',
      waveFill1: 'rgba(191,219,254,0.38)',
      waveFill2: 'rgba(219,234,254,0.52)',
      waveFill3: 'rgba(240,249,255,0.70)',
      dropAccent: 'rgba(239,68,68,0.12)',
    },
    bloodbank: {
      skyTop: '#ECFDF5',
      skyMid: '#DDF4FF',
      skyBot: '#CFF3FA',
      orb1: 'rgba(16,185,129,0.10)',
      orb2: 'rgba(14,165,233,0.11)',
      orb3: 'rgba(167,243,208,0.18)',
      waveFill1: 'rgba(167,243,208,0.30)',
      waveFill2: 'rgba(186,230,255,0.42)',
      waveFill3: 'rgba(240,249,255,0.65)',
      dropAccent: 'rgba(239,68,68,0.13)',
    },
    admin: {
      skyTop: '#EEF2FF',
      skyMid: '#E0F2FE',
      skyBot: '#DDF4FF',
      orb1: 'rgba(99,102,241,0.09)',
      orb2: 'rgba(14,165,233,0.11)',
      orb3: 'rgba(199,210,254,0.20)',
      waveFill1: 'rgba(199,210,254,0.32)',
      waveFill2: 'rgba(186,230,255,0.45)',
      waveFill3: 'rgba(240,249,255,0.68)',
      dropAccent: 'rgba(239,68,68,0.11)',
    },
  };

  const c = variantConfig[variant] || variantConfig.default;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* ── 1. Sky Gradient Base ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, ${c.skyTop} 0%, ${c.skyMid} 35%, ${c.skyBot} 65%, #F5FCFF 85%, #FFFFFF 100%)`,
        }}
      />

      {/* ── 2. Cloud Orbs (top layer, large, soft blur) ── */}
      <div
        className="absolute animate-cloud-float"
        style={{
          top: '-5%', left: '-8%',
          width: 480, height: 280,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${c.orb3} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute animate-cloud-float2"
        style={{
          top: '2%', right: '-6%',
          width: 420, height: 260,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${c.orb2} 0%, transparent 68%)`,
          filter: 'blur(36px)',
        }}
      />
      <div
        className="absolute animate-orb-drift"
        style={{
          top: '30%', left: '15%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.orb1} 0%, transparent 65%)`,
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute animate-cloud-float"
        style={{
          bottom: '20%', right: '10%',
          width: 440, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${c.orb3} 0%, transparent 70%)`,
          filter: 'blur(45px)',
          animationDelay: '4s',
        }}
      />
      <div
        className="absolute animate-orb-drift"
        style={{
          bottom: '5%', left: '5%',
          width: 320, height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.orb2} 0%, transparent 60%)`,
          filter: 'blur(38px)',
          animationDelay: '7s',
        }}
      />

      {/* ── 3. Small Floating Water Bubbles ── */}
      <div className="absolute top-[8%]  left-[12%] w-14 h-14 rounded-full animate-bubble-float"
           style={{ background: 'rgba(186,230,255,0.22)', border: '1px solid rgba(147,210,255,0.3)', filter: 'blur(2px)' }} />
      <div className="absolute top-[22%] right-[18%] w-9 h-9 rounded-full animate-bubble-slow"
           style={{ background: 'rgba(165,243,252,0.20)', border: '1px solid rgba(103,232,249,0.25)', filter: 'blur(1px)', animationDelay: '2s' }} />
      <div className="absolute top-[55%] left-[6%] w-12 h-12 rounded-full animate-bubble-pulse"
           style={{ background: 'rgba(186,230,255,0.18)', border: '1px solid rgba(147,210,255,0.25)', filter: 'blur(2px)', animationDelay: '3.5s' }} />
      <div className="absolute top-[38%] right-[8%] w-16 h-16 rounded-full animate-bubble-float"
           style={{ background: 'rgba(224,242,254,0.22)', border: '1px solid rgba(186,230,255,0.3)', filter: 'blur(3px)', animationDelay: '1.5s' }} />
      <div className="absolute bottom-[15%] right-[22%] w-10 h-10 rounded-full animate-bubble-slow"
           style={{ background: 'rgba(165,243,252,0.18)', border: '1px solid rgba(103,232,249,0.22)', filter: 'blur(1px)', animationDelay: '5s' }} />
      <div className="absolute bottom-[28%] left-[28%] w-8 h-8 rounded-full animate-bubble-pulse"
           style={{ background: 'rgba(186,230,255,0.20)', border: '1px solid rgba(147,210,255,0.28)', filter: 'blur(1px)', animationDelay: '6s' }} />

      {/* ── 4. Subtle Blood-Drop Accent Shapes (variant-specific) ── */}
      <svg
        className="absolute animate-drop-pulse"
        style={{ top: '12%', right: '14%', width: 28, height: 36, opacity: 0.22 }}
        viewBox="0 0 28 36" fill="none"
      >
        <path d="M14 2 C14 2 2 14 2 22 A12 12 0 0 0 26 22 C26 14 14 2 14 2Z" fill={c.dropAccent.replace('rgba', 'rgb').replace(/,[\d.]+\)/, ')')} fillOpacity="0.6"/>
      </svg>
      <svg
        className="absolute animate-drop-pulse"
        style={{ top: '65%', left: '18%', width: 20, height: 26, opacity: 0.18, animationDelay: '3s' }}
        viewBox="0 0 28 36" fill="none"
      >
        <path d="M14 2 C14 2 2 14 2 22 A12 12 0 0 0 26 22 C26 14 14 2 14 2Z" fill={c.dropAccent.replace('rgba', 'rgb').replace(/,[\d.]+\)/, ')')} fillOpacity="0.55"/>
      </svg>
      <svg
        className="absolute animate-drop-pulse"
        style={{ bottom: '18%', right: '6%', width: 16, height: 21, opacity: 0.15, animationDelay: '5s' }}
        viewBox="0 0 28 36" fill="none"
      >
        <path d="M14 2 C14 2 2 14 2 22 A12 12 0 0 0 26 22 C26 14 14 2 14 2Z" fill={c.dropAccent.replace('rgba', 'rgb').replace(/,[\d.]+\)/, ')')} fillOpacity="0.5"/>
      </svg>

      {/* ── 5. Wave Layers (bottom of viewport) ── */}
      {/* Wave layer 1 — furthest back, most transparent */}
      <svg
        className="absolute bottom-0 left-0 w-full animate-wave-drift"
        style={{ height: 180, minWidth: '100%' }}
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,120 C180,90 360,150 540,120 C720,90 900,150 1080,120 C1260,90 1350,140 1440,120 L1440,180 L0,180 Z"
          fill={c.waveFill1}
        />
      </svg>

      {/* Wave layer 2 — mid */}
      <svg
        className="absolute bottom-0 left-0 w-full animate-wave-drift2"
        style={{ height: 130, minWidth: '100%' }}
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,80 C200,55 400,110 600,80 C800,50 1000,105 1200,75 C1330,55 1400,95 1440,80 L1440,130 L0,130 Z"
          fill={c.waveFill2}
        />
      </svg>

      {/* Wave layer 3 — foreground, most opaque */}
      <svg
        className="absolute bottom-0 left-0 w-full animate-wave-drift"
        style={{ height: 80, minWidth: '100%', animationDuration: '7s', animationDelay: '1s' }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 C240,30 480,70 720,50 C960,30 1200,65 1440,50 L1440,80 L0,80 Z"
          fill={c.waveFill3}
        />
      </svg>

      {/* ── 6. Top shimmer highlight (glass-like horizontal glow) ── */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, rgba(186,230,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(186,230,255,0.7) 70%, transparent 100%)',
        }}
      />

      {/* ── 7. Mid-page soft horizontal gradient band (light reflection) ── */}
      <div
        className="absolute left-0 w-full"
        style={{
          top: '42%',
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(165,243,252,0.35) 20%, rgba(224,242,254,0.5) 50%, rgba(165,243,252,0.35) 80%, transparent 100%)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
};
