import React, { useEffect, useRef } from 'react';

export type JarvisState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Jarvis3DCoreProps {
  state: JarvisState;
  transcript?: string;
  response?: string;
}

export const Jarvis3DCore: React.FC<Jarvis3DCoreProps> = ({ state, transcript, response }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Swarm 3D Nodes
    const particleCount = 180;
    const particles = Array.from({ length: particleCount }, () => {
      const radius = 90 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        baseRadius: radius,
        speed: 0.005 + Math.random() * 0.015,
        size: 1.5 + Math.random() * 2.5
      };
    });

    let angleX = 0;
    let angleY = 0;
    let pulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Color Palette according to JARVIS State
      let primaryColor = '0, 240, 255'; // Cyan (Idle)
      let secondaryColor = '0, 150, 255';
      let speedMultiplier = 1;

      if (state === 'listening') {
        primaryColor = '0, 220, 255'; // Vibrant Cyan Pulse
        secondaryColor = '0, 100, 255';
        speedMultiplier = 2.5;
      } else if (state === 'thinking') {
        primaryColor = '176, 38, 255'; // Violet / Purple Shimmer
        secondaryColor = '236, 72, 153';
        speedMultiplier = 3.2;
      } else if (state === 'speaking') {
        primaryColor = '0, 255, 136'; // Neon Emerald
        secondaryColor = '16, 185, 129';
        speedMultiplier = 2.0;
      }

      pulsePhase += 0.04 * speedMultiplier;
      angleX += 0.008 * speedMultiplier;
      angleY += 0.012 * speedMultiplier;

      const pulseScale = 1 + Math.sin(pulsePhase) * 0.08;

      // 1. Ambient Background Radial Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260);
      bgGlow.addColorStop(0, `rgba(${primaryColor}, 0.25)`);
      bgGlow.addColorStop(0.5, `rgba(${secondaryColor}, 0.08)`);
      bgGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.fill();

      // 2. Central Core Holographic Orb
      const coreGradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65 * pulseScale);
      coreGradient.addColorStop(0, `rgba(255, 255, 255, 0.95)`);
      coreGradient.addColorStop(0.3, `rgba(${primaryColor}, 0.9)`);
      coreGradient.addColorStop(0.7, `rgba(${secondaryColor}, 0.4)`);
      coreGradient.addColorStop(1, `rgba(${primaryColor}, 0)`);

      ctx.save();
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 65 * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Concentric Orbital Energy Rings (3D Rotated)
      for (let ring = 1; ring <= 4; ring++) {
        const rRadius = (70 + ring * 35) * pulseScale;
        const ringAngle = angleY * (ring % 2 === 0 ? 1 : -1) * 0.8 + ring;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringAngle);
        ctx.scale(1, 0.45 + Math.sin(pulsePhase + ring) * 0.1);

        ctx.beginPath();
        ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryColor}, ${0.6 - ring * 0.12})`;
        ctx.lineWidth = ring === 2 ? 2.5 : 1.2;
        if (ring % 2 === 0) ctx.setLineDash([12, 18]);
        ctx.stroke();

        // Ring Node Beads
        for (let bead = 0; bead < 3; bead++) {
          const beadAngle = (Math.PI * 2 / 3) * bead + pulsePhase * (ring % 2 === 0 ? 1 : -1);
          const bx = rRadius * Math.cos(beadAngle);
          const by = rRadius * Math.sin(beadAngle);

          ctx.beginPath();
          ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. 3D Particle Swarm Projection
      particles.forEach(p => {
        // Rotate around Y and X axes
        let cosY = Math.cos(angleY * 0.5);
        let sinY = Math.sin(angleY * 0.5);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        let cosX = Math.cos(angleX * 0.5);
        let sinX = Math.sin(angleX * 0.5);
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Depth perspective projection
        const fov = 400;
        const scale = fov / (fov + z2);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;
        const alpha = Math.max(0.1, Math.min(0.9, (z2 + 200) / 400));

        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryColor}, ${alpha})`;
        ctx.fill();

        // Draw node connection lines for near particles
        if (z2 > 0 && Math.random() < 0.05) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(${primaryColor}, ${alpha * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 5. Sound Wave Pulses (Speaking Mode)
      if (state === 'speaking') {
        const waveRadius = (60 + (pulsePhase * 40) % 180);
        ctx.beginPath();
        ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${Math.max(0, 1 - waveRadius / 180)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [state]);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Holographic Status Overlay Chips */}
      <div className="absolute top-6 left-6 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md font-mono text-[10px] text-cyan-400 space-y-0.5 shadow-lg pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-2 h-2 rounded-full ${
            state === 'listening' ? 'bg-cyan-400 animate-ping' :
            state === 'thinking' ? 'bg-purple-400 animate-pulse' :
            state === 'speaking' ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
          }`} />
          <span>JARVIS CORE v4.2 • ONLINE</span>
        </div>
        <div className="text-slate-400">STATE: <strong className="text-white uppercase">{state}</strong></div>
      </div>

      <div className="absolute top-6 right-6 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md font-mono text-[10px] text-cyan-400 space-y-0.5 shadow-lg pointer-events-none text-right">
        <div>WAKE WORD: <strong className="text-white">"JARVIS"</strong></div>
        <div className="text-slate-400">AUDIO BUS: <strong className="text-emerald-400">432Hz ACTIVE</strong></div>
      </div>

      {/* Live Transcript / Speech Bubbles Overlay */}
      {transcript && (
        <div className="absolute bottom-16 px-6 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-2xl backdrop-blur-md animate-in fade-in max-w-md text-center">
          <span className="text-[10px] text-slate-400 block font-sans">You said:</span>
          "{transcript}"
        </div>
      )}

      {response && !transcript && (
        <div className="absolute bottom-16 px-6 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-2xl backdrop-blur-md animate-in fade-in max-w-lg text-center">
          <span className="text-[10px] text-slate-400 block font-sans">JARVIS:</span>
          "{response}"
        </div>
      )}
    </div>
  );
};
