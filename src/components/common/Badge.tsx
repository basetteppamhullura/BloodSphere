import React from 'react';
import { BloodGroup } from '../../types';

interface BloodBadgeProps {
  group: BloodGroup;
  size?: 'sm' | 'md' | 'lg';
}

export const BloodGroupBadge: React.FC<BloodBadgeProps> = ({ group, size = 'md' }) => {
  const isRare = ['O-', 'AB-', 'A-'].includes(group);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold rounded-lg',
    md: 'w-12 h-12 text-base font-black rounded-xl',
    lg: 'w-16 h-16 text-xl font-black rounded-2xl'
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-extrabold shadow-md ${
        isRare
          ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-950/50 border border-red-400/30 animate-pulse'
          : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-950/50 border border-blue-400/30'
      }`}
    >
      {group}
    </div>
  );
};
