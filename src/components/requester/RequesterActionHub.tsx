import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyQuickModal } from '../modals/EmergencyQuickModal';
import { HospitalBloodStockFinder } from './HospitalBloodStockFinder';
import {
  Zap,
  Building2,
  Droplet,
  MapPin,
  Search,
  PhoneCall,
  Star,
  CheckCircle2,
  Clock,
  Navigation,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const RequesterActionHub: React.FC = () => {
  const { setActiveEmergencyPostModal, showToast } = useApp();

  const [showEmergencyQuickModal, setShowEmergencyQuickModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'hospital_finder'>('hub');

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 3 Main Action Cards Hub */}
      {activeTab === 'hub' ? (
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">Select Blood Request Path</h3>
            <p className="text-xs text-slate-400">Choose how you want to request or locate blood in Hubballi-Dharwad region</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TILE 1: Emergency Blood Need */}
            <div
              onClick={() => setShowEmergencyQuickModal(true)}
              className="p-6 rounded-3xl bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 border-2 border-red-600/80 hover:border-red-500 cursor-pointer space-y-4 shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-red-950">
                  <Zap className="w-6 h-6 fill-white animate-pulse" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider animate-bounce">
                  ⚡ 1-Min Trauma Form
                </span>
              </div>

              <div>
                <h4 className="font-black text-lg text-white group-hover:text-red-400 transition-colors">
                  Emergency Blood Need
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Fast 1-minute quick form for critical trauma cases. Dispatches Hospital, Donors, and Blood Banks simultaneously.
                </p>
              </div>

              <div className="pt-2 text-xs font-black text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch Emergency Form <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* TILE 2: Find Hospital & Request Blood (Connects to Live Hospital Stock Portal) */}
            <div
              onClick={() => setActiveTab('hospital_finder')}
              className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer space-y-4 shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800">
                  📍 GPS Distance Search
                </span>
              </div>

              <div>
                <h4 className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">
                  Find Blood in Hospitals
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Search live hospital stock with Haversine GPS distance radius (5km - 50km) and pre-fill blood requests.
                </p>
              </div>

              <div className="pt-2 text-xs font-black text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Hospital Stock Finder <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* TILE 3: Find Blood Bank & Reserve Stock */}
            <div
              onClick={() => setActiveEmergencyPostModal(true)}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer space-y-4 shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center">
                  <Droplet className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  🏦 Direct Reserve
                </span>
              </div>

              <div>
                <h4 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors">
                  Find Blood Bank & Reserve Stock
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Check regional blood bank stock levels (e.g. O+: 12 units) and reserve units directly.
                </p>
              </div>

              <div className="pt-2 text-xs font-black text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Reserve Blood Bank Stock <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Standalone Hospital Stock Finder View */
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('hub')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 flex items-center gap-1"
          >
            ← Back to Requester Action Hub
          </button>
          <HospitalBloodStockFinder />
        </div>
      )}

      {/* Emergency Quick 1-Minute Modal */}
      {showEmergencyQuickModal && (
        <EmergencyQuickModal onClose={() => setShowEmergencyQuickModal(false)} />
      )}

    </div>
  );
};
