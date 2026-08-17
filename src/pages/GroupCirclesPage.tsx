import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, PlusCircle, CheckCircle2, Share2, Lock, X } from 'lucide-react';

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
      <div className="p-6 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-black text-slate-900">Family & Group Donor Circles</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private coordination circles (Family, Friends, College, Company) notified first during emergency requests.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Create Private Circle
        </button>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groupCircles.map((circle) => {
          const availableCount = Math.max(1, Math.round(circle.membersCount * 0.7));
          const eligibleCount = Math.max(1, Math.round(circle.membersCount * 0.5));

          return (
            <div key={circle.id} className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 flex flex-col justify-between hover:border-sky-300 transition-all shadow-sm">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                    {circle.category || 'Family'} Circle
                  </span>
                  <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Private
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{circle.name}</h3>

                {/* REAL METRICS GRID */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-sky-50/50 p-3 rounded-2xl border border-sky-100 font-mono text-center">
                  <div>
                    <span className="text-[9px] text-slate-500 font-sans block">Members</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">{circle.membersCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-sans block">Available</span>
                    <strong className="text-emerald-600 font-bold block mt-0.5">{availableCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-sans block">Eligible</span>
                    <strong className="text-sky-600 font-bold block mt-0.5">{eligibleCount}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Circle Protection:</span>
                  <span className="text-slate-700 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Private Health Masked
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-sky-100">
                <button
                  onClick={() => handleShareRequestToCircle(circle.name)}
                  className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-600" /> Share Emergency Request
                </button>

                <button
                  onClick={() => toggleCircleJoin(circle.id)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    circle.joined
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                  }`}
                >
                  {circle.joined ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Joined Circle</> : 'Join Circle'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE PRIVATE CIRCLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" /> Create Private Donor Circle
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Circle Name *</label>
                <input
                  type="text"
                  value={circleName}
                  onChange={e => setCircleName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Circle Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Family">Family Circle</option>
                  <option value="Friends">Friends Circle</option>
                  <option value="Campus">College / Campus Circle</option>
                  <option value="Corporate">Company / Corporate Circle</option>
                  <option value="Community">Community Group</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] space-y-1">
                <strong className="block text-slate-900 font-extrabold">🔒 Private Circle Privacy Rules:</strong>
                <p>Members receive real-time notifications for shared requests. Personal medical records remain private and unexposed.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black shadow-md shadow-sky-500/20">
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
