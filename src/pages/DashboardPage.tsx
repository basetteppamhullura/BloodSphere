import React from 'react';
import { useApp } from '../context/AppContext';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  LayoutDashboard,
  Heart,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp,
  PlusCircle,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { navigateTo, isLoading, requests, bloodBanks, donors, setActiveEmergencyPostModal } = useApp();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-red-500" /> Executive Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time emergency monitoring, donor availability & stock gauges</p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> Post Emergency Need
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Emergency Needs', count: `${requests.filter(r => r.status === 'ACTIVE').length} Active`, icon: AlertTriangle, color: 'text-red-400', link: 'emergency-requests' },
          { title: 'Verified Donors Nearby', count: `${donors.length} Donors`, icon: Users, color: 'text-blue-400', link: 'donor-search' },
          { title: 'Blood Banks Active', count: `${bloodBanks.length} Facilities`, icon: Building2, color: 'text-emerald-400', link: 'blood-banks' },
          { title: 'Critical Stock Groups', count: 'O-, AB-', icon: ShieldAlert, color: 'text-amber-400', link: 'blood-banks' }
        ].map((widget, i) => (
          <div
            key={i}
            onClick={() => navigateTo(widget.link as any)}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">{widget.title}</span>
              <widget.icon className={`w-5 h-5 ${widget.color}`} />
            </div>
            <div className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
              {widget.count}
            </div>
            <span className="text-[10px] text-slate-500 block">Click to manage & view directory</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Urgent Requests Feed + Blood Bank Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Urgent Requests */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> Recent Emergency Requests
            </h3>
            <button
              onClick={() => navigateTo('emergency-requests')}
              className="text-xs font-bold text-red-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center">
                    {req.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{req.patientName}</h4>
                    <p className="text-[11px] text-slate-400">{req.hospitalName}, {req.city}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                  {req.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Inventory Stock Gauges */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> KIMS Blood Bank Live Stock
            </h3>
            <button
              onClick={() => navigateTo('blood-banks')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Full Inventory
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bloodBanks[0]?.inventory.map(item => (
              <div key={item.group} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-center">
                <span className="font-extrabold text-lg text-white block">{item.group}</span>
                <span className="text-xl font-black text-emerald-400">{item.units}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
