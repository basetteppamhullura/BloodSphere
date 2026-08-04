import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, ShieldCheck, PlusCircle, CheckCircle2, Building2, User } from 'lucide-react';

export const GroupCirclesPage: React.FC = () => {
  const { groupCircles, toggleCircleJoin, showToast } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Family & Group Donor Circles</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Private circles (College, Corporate, Family) notified first before public emergency broadcast
          </p>
        </div>

        <button
          onClick={() => showToast("New Private Circle creation modal opened! Invite link generated.")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950"
        >
          <PlusCircle className="w-4 h-4" /> Create Private Circle
        </button>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groupCircles.map((circle) => (
          <div key={circle.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {circle.category} Circle
                </span>
                {circle.isVerified && (
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-white">{circle.name}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Members</span>
                  <span className="font-bold text-slate-100">{circle.membersCount} Donors</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Active Need</span>
                  <span className="font-bold text-red-400">{circle.activeRequests} Urgent</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleCircleJoin(circle.id)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                circle.joined
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {circle.joined ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Circle Member</> : 'Join Circle'}
            </button>

          </div>
        ))}
      </div>

    </div>
  );
};
