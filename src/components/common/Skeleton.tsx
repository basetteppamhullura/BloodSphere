import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-700/60"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 rounded bg-slate-700/60"></div>
            <div className="w-24 h-3 rounded bg-slate-700/40"></div>
          </div>
        </div>
        <div className="w-16 h-6 rounded-full bg-slate-700/60"></div>
      </div>
      <div className="w-full h-12 rounded-xl bg-slate-700/40"></div>
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-9 rounded-xl bg-slate-700/50"></div>
        <div className="flex-1 h-9 rounded-xl bg-slate-700/50"></div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 w-full bg-slate-800/40 rounded-xl flex items-center justify-between px-4">
          <div className="w-8 h-4 bg-slate-700/60 rounded"></div>
          <div className="w-32 h-4 bg-slate-700/60 rounded"></div>
          <div className="w-20 h-4 bg-slate-700/40 rounded"></div>
          <div className="w-16 h-4 bg-slate-700/50 rounded"></div>
        </div>
      ))}
    </div>
  );
};
