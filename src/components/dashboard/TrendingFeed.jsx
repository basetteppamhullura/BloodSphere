import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmergencyRequestCard from './EmergencyRequestCard';
import { Flame, Filter, Search, PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

export default function TrendingFeed() {
  const { requests, setActiveAIPostModal } = useApp();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CRITICAL, RARE, HUBBALLI
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'CRITICAL') return req.urgency === 'CRITICAL';
    if (activeTab === 'RARE') return ['O-', 'AB-', 'A-'].includes(req.bloodGroup);
    if (activeTab === 'HUBBALLI') return req.city.toLowerCase() === 'hubballi';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">Trending Emergency Requests</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency blood requests sorted by AI urgency score and proximity
          </p>
        </div>

        <button
          onClick={() => setActiveAIPostModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Emergency Need</span>
          <span className="flex items-center gap-1 bg-red-950/60 px-1.5 py-0.5 rounded text-[10px] text-amber-300 border border-red-500/30">
            <Sparkles className="w-3 h-3" /> Natural Language AI
          </span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'CRITICAL', label: '🚨 Critical Only' },
            { id: 'RARE', label: '🛡️ Rare Groups (O-, AB-)' },
            { id: 'HUBBALLI', label: '📍 Hubballi Region' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital, city, blood group..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(req => (
            <EmergencyRequestCard key={req.id} request={req} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No matching requests found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filter tabs or search query.</p>
        </div>
      )}

    </div>
  );
}
