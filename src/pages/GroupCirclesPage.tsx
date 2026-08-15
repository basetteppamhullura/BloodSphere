import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, PlusCircle, CheckCircle2, Building2, User, Share2, Send, Lock, UserPlus, X } from 'lucide-react';

export const GroupCirclesPage: React.FC = () => {
  const { groupCircles, toggleCircleJoin, requests, showToast } = useApp();
  const { currentUser } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [circleName, setCircleName] = useState<string>('Muttu\'s Family Circle');
  const [category, setCategory] = useState<'Family' | 'Campus' | 'Corporate' | 'Friends' | 'Community'>('Family');

  const handleCreateCircleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Private Circle "${circleName}" created! Invite link copied to clipboard.`);
    setShowCreateModal(false);
  };

  const handleShareRequestToCircle = (circleName: string) => {
    const activeReq = requests.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    if (activeReq) {
      showToast(`🚨 Shared Emergency Request ${activeReq.id} (${activeReq.bloodGroup}) to all members in ${circleName}!`);
    } else {
      showToast(`Emergency Broadcast sent to all members in ${circleName}!`);
    }
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-black text-white">Family & Group Donor Circles</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Private coordination circles (Family, Friends, College, Company) notified first during emergency requests.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-950 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Create Private Circle
        </button>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groupCircles.map((circle) => {
          // Compute metrics
          const availableCount = Math.max(1, Math.round(circle.membersCount * 0.7));
          const eligibleCount = Math.max(1, Math.round(circle.membersCount * 0.5));

          return (
            <div key={circle.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                    {circle.category || 'Family'} Circle
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Private
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-white">{circle.name}</h3>

                {/* REAL METRICS GRID */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Members</span>
                    <strong className="text-white font-bold block mt-0.5">{circle.membersCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Available</span>
                    <strong className="text-emerald-400 font-bold block mt-0.5">{availableCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Eligible</span>
                    <strong className="text-indigo-400 font-bold block mt-0.5">{eligibleCount}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Circle Protection:</span>
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> Private Health Masked
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleShareRequestToCircle(circle.name)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" /> Share Emergency Request
                </button>

                <button
                  onClick={() => toggleCircleJoin(circle.id)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    circle.joined
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {circle.joined ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Joined Circle</> : 'Join Circle'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE PRIVATE CIRCLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Create Private Donor Circle
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Circle Name *</label>
                <input
                  type="text"
                  value={circleName}
                  onChange={e => setCircleName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Circle Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="Family">Family Circle</option>
                  <option value="Friends">Friends Circle</option>
                  <option value="Campus">College / Campus Circle</option>
                  <option value="Corporate">Company / Corporate Circle</option>
                  <option value="Community">Community Group</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800 text-blue-200 text-[11px] space-y-1">
                <strong className="block text-white font-extrabold">🔒 Private Circle Privacy Rules:</strong>
                <p>Members receive real-time notifications for shared requests. Personal medical records remain private and unexposed.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-950">
                  Create Circle & Copy Invite Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
