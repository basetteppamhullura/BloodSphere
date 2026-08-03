import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Flame, Star, ShieldCheck, Zap } from 'lucide-react';

export default function Leaderboard() {
  const { leaderboard } = useApp();
  const [tab, setTab] = useState('monthly'); // 'monthly' | 'allTime'

  const currentList = leaderboard[tab] || [];

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/50 shadow-md shadow-amber-950/30">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Lifesavers Leaderboard & Recognition</h3>
            <p className="text-xs text-slate-400">Celebrating top blood donors, corporate teams, and college heroes</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'monthly'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 August 2026
          </button>
          <button
            onClick={() => setTab('allTime')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'allTime'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👑 All-Time Hall of Fame
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/60 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Donor Name</th>
              <th className="py-3 px-4">City & Organization</th>
              <th className="py-3 px-4">Donations</th>
              <th className="py-3 px-4">Points</th>
              <th className="py-3 px-4">Achievement Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {currentList.map((item) => {
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;

              return (
                <tr
                  key={item.rank}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isTop1 ? 'bg-amber-950/20' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-bold text-sm">
                    {isTop1 && <span className="text-amber-400 text-base">🥇 1</span>}
                    {isTop2 && <span className="text-slate-300 text-base">🥈 2</span>}
                    {isTop3 && <span className="text-amber-600 text-base">🥉 3</span>}
                    {!isTop1 && !isTop2 && !isTop3 && <span className="text-slate-500">#{item.rank}</span>}
                  </td>

                  {/* Donor Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                    <span>{item.name}</span>
                    {isTop1 && <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </td>

                  {/* City & Org */}
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="text-slate-200 font-medium">{item.city}</span>
                    <span className="block text-[10px] text-slate-500">{item.college}</span>
                  </td>

                  {/* Total Donations */}
                  <td className="py-3.5 px-4 font-bold text-red-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> {item.donations} Rides
                    </span>
                  </td>

                  {/* Recognition Points */}
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {item.points.toLocaleString()} pts
                  </td>

                  {/* Badge */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700 inline-block">
                      {item.badge}
                    </span>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
