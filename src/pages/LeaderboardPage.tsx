import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Flame, Zap } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { leaderboard, donors } = useApp();
  const [tab, setTab] = useState<'monthly' | 'allTime'>('monthly');

  // Compute live ranking from actual backend donors state
  const liveDonorsRanked = [...donors]
    .sort((a, b) => b.totalDonations - a.totalDonations || b.points - a.points)
    .map((donor, idx) => ({
      rank: idx + 1,
      donorId: donor.id,
      name: donor.name,
      city: donor.city,
      bloodGroup: donor.bloodGroup,
      donationsCount: donor.totalDonations,
      points: donor.points || donor.totalDonations * 250,
      badgeTitle: donor.totalDonations >= 25 ? '👑 Centurion Lifesaver' : donor.totalDonations >= 10 ? '🛡️ Universal Guardian' : '🥇 Gold Responder'
    }));

  const currentList = tab === 'allTime' ? liveDonorsRanked : (leaderboard.monthly || []);

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 border border-amber-200 shadow-sm">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Top Verified Lifesavers Leaderboard</h2>
            <p className="text-xs text-slate-500">Ranks updated automatically upon hospital-verified donation completions</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sky-100 font-extrabold shadow-xs">
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs transition-all ${
              tab === 'monthly' ? 'bg-amber-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔥 August 2026 Monthly
          </button>
          <button
            onClick={() => setTab('allTime')}
            className={`px-4 py-2 rounded-xl text-xs transition-all ${
              tab === 'allTime' ? 'bg-amber-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👑 Live All-Time Verified
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-white border border-sky-100 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-sky-50/70 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-sky-100">
            <tr>
              <th className="py-4 px-5">Rank</th>
              <th className="py-4 px-5">Donor Name</th>
              <th className="py-4 px-5">Blood Group & City</th>
              <th className="py-4 px-5">Verified Donations</th>
              <th className="py-4 px-5">Backend Points</th>
              <th className="py-4 px-5">Achievement Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100 font-mono">
            {currentList.map((item, index) => {
              const rankNum = item.rank || index + 1;

              return (
                <tr key={index} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-4 px-5 font-black text-sm">
                    {rankNum === 1 && <span className="text-amber-500 text-base font-black">🥇 #1</span>}
                    {rankNum === 2 && <span className="text-slate-400 text-base font-black">🥈 #2</span>}
                    {rankNum === 3 && <span className="text-amber-700 text-base font-black">🥉 #3</span>}
                    {rankNum > 3 && <span className="text-slate-500 font-bold">#{rankNum}</span>}
                  </td>

                  <td className="py-4 px-5 font-sans font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{item.name}</span>
                    {rankNum === 1 && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </td>

                  <td className="py-4 px-5 font-sans text-slate-600">
                    <span className="text-slate-900 font-bold">{item.bloodGroup}</span> • {item.city}
                  </td>

                  <td className="py-4 px-5 font-black text-red-600">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" /> {item.donationsCount || (item as any).donations} Verified
                    </span>
                  </td>

                  <td className="py-4 px-5 font-black text-amber-600">
                    {item.points.toLocaleString()} pts
                  </td>

                  <td className="py-4 px-5 font-sans">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-50 text-slate-800 border border-sky-100">
                      {item.badgeTitle || (item as any).badge}
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
};
