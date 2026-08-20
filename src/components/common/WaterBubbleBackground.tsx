import React from 'react';

export const WaterBubbleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Translucent Water Bubbles */}
      <div className="absolute top-6 left-10 w-32 h-32 rounded-full bg-sky-200/30 blur-xl animate-bubble-float" />
      <div className="absolute top-1/4 right-12 w-48 h-48 rounded-full bg-sky-300/20 blur-2xl animate-bubble-slow" />
      <div className="absolute bottom-10 left-1/3 w-40 h-40 rounded-full bg-blue-200/25 blur-xl animate-bubble-pulse" />
      <div className="absolute top-2/3 right-1/4 w-28 h-28 rounded-full bg-sky-400/15 blur-lg animate-bubble-float" />
      <div className="absolute -bottom-8 right-8 w-56 h-56 rounded-full bg-sky-100/50 blur-2xl animate-bubble-slow" />
    </div>
  );
};
