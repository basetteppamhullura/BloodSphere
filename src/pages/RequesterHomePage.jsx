import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LifeBuoy, LayoutDashboard, PlusCircle, Search, AlertTriangle, User, LogOut, ArrowRight } from 'lucide-react';
import { PortalHero } from '../components/common/PortalHero';
export const RequesterHomePage = () => {
    const { currentUser, logout } = useAuth();
    const { requests, notifications, setActiveEmergencyPostModal } = useApp();
    const navigate = useNavigate();
    const myRequests = requests.slice(0, 3);
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };
    return (<div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. Hero Welcome Header */}
      <PortalHero
        portalLabel="Patient & Caregiver Portal"
        badgePulseColor="bg-cyan-300"
        title={`Hello, ${currentUser?.name || 'Caregiver'} 🆘`}
        description="Track blood requests, availability, responses and emergency needs."
        bgImage="/bloodnet-hero-bg.jpg"
        bgPosition="center"
        gradientOverlay="linear-gradient(95deg, rgba(16, 37, 66, 0.90) 0%, rgba(37, 99, 235, 0.75) 50%, rgba(6, 182, 212, 0.55) 100%)"
        decorativeIcon={LifeBuoy}
        actions={
          <>
            <button onClick={() => navigate('/requester/dashboard')} className="px-6 py-3.5 rounded-2xl bg-white text-[#2563EB] hover:bg-cyan-50 font-black text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
              <LayoutDashboard className="w-5 h-5 text-[#2563EB]"/>
              <span>Open Requester Dashboard</span>
              <ArrowRight className="w-4 h-4"/>
            </button>

            <button onClick={handleLogout} className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4"/>
              <span>Logout</span>
            </button>
          </>
        }
      />

      {/* 2. Primary Navigation Bar */}
      <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/requester/home" className="px-4 py-2 rounded-xl bg-[#2563EB] text-white shadow-sm font-black flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4"/> Home
          </Link>

          <Link to="/requester/dashboard" className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-sky-600"/> Dashboard
          </Link>

          <Link to="/requester/create-request" className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-black flex items-center gap-1.5 transition-colors">
            <PlusCircle className="w-4 h-4 text-red-600"/> Create Request
          </Link>

          <Link to="/requester/find-blood" className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors">
            <Search className="w-4 h-4 text-emerald-600"/> Find Blood
          </Link>

          <Link to="/requester/profile" className="px-4 py-2 rounded-xl text-slate-700 hover:bg-sky-50 flex items-center gap-1.5 transition-colors">
            <User className="w-4 h-4 text-indigo-600"/> Profile
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-slate-400 font-mono">Role: REQUESTER</span>
          <span className="w-2 h-2 rounded-full bg-cyan-500"/>
        </div>
      </div>

      {/* 3. Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setActiveEmergencyPostModal(true)} className="p-6 rounded-2xl bg-[#FFF1F2] border border-red-200 text-[#16324F] shadow-xs cursor-pointer hover:scale-[1.02] transition-all space-y-2">
          <PlusCircle className="w-8 h-8 text-[#EF4444]"/>
          <h3 className="font-extrabold text-base text-[#16324F]">Create Emergency Request</h3>
          <p className="text-xs text-slate-600 font-medium">Broadcast urgent blood needs to all nearby donors immediately.</p>
        </div>

        <div onClick={() => navigate('/requester/find-blood')} className="p-6 rounded-2xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 cursor-pointer hover:scale-[1.02] transition-all space-y-2">
          <Search className="w-8 h-8 text-sky-600"/>
          <h3 className="font-extrabold text-base text-slate-900">Search Blood Inventory</h3>
          <p className="text-xs text-slate-500">Search real-time unit counts in regional blood banks & hospitals.</p>
        </div>

        <div onClick={() => navigate('/requester/dashboard')} className="p-6 rounded-2xl bg-white border border-sky-100 shadow-xs hover:border-emerald-300 cursor-pointer hover:scale-[1.02] transition-all space-y-2">
          <LayoutDashboard className="w-8 h-8 text-emerald-600"/>
          <h3 className="font-extrabold text-base text-slate-900">Track Active Requests</h3>
          <p className="text-xs text-slate-500">Monitor response counts, donor matchings, and delivery status.</p>
        </div>
      </div>

      {/* 4. Active Requests Feed */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600"/> Active Patient Requests Status
          </h2>
          <Link to="/requester/requests" className="text-xs text-sky-600 font-bold hover:underline">
            View All Requests
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {myRequests.map(req => (<div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-600">{req.bloodGroup} Needed</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  {req.status}
                </span>
              </div>
              <strong className="text-sm font-black text-slate-900 block">{req.patientName}</strong>
              <p className="text-[11px] text-slate-500">{req.hospitalName}</p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono">
                <span>{req.unitsNeeded} Units Required</span>
                <span className="text-emerald-600 font-bold">{req.unitsFulfilled} Responded</span>
              </div>
            </div>))}
        </div>
      </div>

    </div>);
};
