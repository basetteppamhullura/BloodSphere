import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, Flame, Zap } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { leaderboard } = useApp();
  const [tab, setTab] = useState<'monthly' | 'allTime'>('monthly');

  const currentList = leaderboard[tab] || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-800/50">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Lifesavers Leaderboard</h2>
            <p className="text-xs text-slate-400">Recognizing voluntary blood donors, college teams, and corporate lifesavers</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'monthly' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400'
            }`}
          >
            🔥 August 2026
          </button>
          <button
            onClick={() => setTab('allTime')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'allTime' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400'
            }`}
          >
            👑 Hall of Fame
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-4 px-5">Rank</th>
              <th className="py-4 px-5">Donor Name</th>
              <th className="py-4 px-5">City & Institution</th>
              <th className="py-4 px-5">Donations</th>
              <th className="py-4 px-5">Points</th>
              <th className="py-4 px-5">Badge Title</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {currentList.map((item) => (
              <tr key={item.rank} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-5 font-black text-sm">
                  {item.rank === 1 && <span className="text-amber-400 text-base">🥇 1</span>}
                  {item.rank === 2 && <span className="text-slate-300 text-base">🥈 2</span>}
                  {item.rank === 3 && <span className="text-amber-600 text-base">🥉 3</span>}
                  {item.rank > 3 && <span className="text-slate-500">#{item.rank}</span>}
                </td>
                <td className="py-4 px-5 font-bold text-slate-100 flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.rank === 1 && <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </td>
                <td className="py-4 px-5 text-slate-400">
                  <span className="text-slate-200 font-semibold">{item.city}</span>
                  <span className="block text-[10px] text-slate-500">{item.college}</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-red-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> {item.donations} Drives
                  </span>
                </td>
                <td className="py-4 px-5 font-black text-amber-400">
                  {item.points.toLocaleString()} pts
                </td>
                <td className="py-4 px-5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {item.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
