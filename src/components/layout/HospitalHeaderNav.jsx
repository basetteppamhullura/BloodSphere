import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import { Building2, LayoutDashboard, AlertTriangle, Search, Heart, FileText, PlusCircle, LogOut, MessageSquare } from 'lucide-react';
export const HospitalHeaderNav = () => {
    const { requests, setActiveEmergencyPostModal, chatSessions, openEmergencyChat } = useApp();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
    const activeChats = chatSessions.filter(s => s.status === 'active');
    const handleLogout = () => {
        logout();
        navigate('/login/hospital', { replace: true });
    };
    const navItems = [
        { to: '/hospital/home', label: 'Hospital Home', icon: Building2 },
        { to: '/hospital/dashboard', label: 'Hospital Dashboard', icon: LayoutDashboard },
        { to: '/hospital/requests', label: 'Patient Requests Board', icon: AlertTriangle, badge: criticalCount },
        { to: '/hospital/blood-availability', label: 'Blood Availability Search', icon: Search },
        { to: '/hospital/donors', label: 'Donation Drives & Donors', icon: Heart },
        { to: '/hospital/reports', label: 'Audit Logs & Reports', icon: FileText }
    ];
    return (<header className="sticky top-0 z-40 bg-white border-b border-[#DCEAF5] shadow-xs">
      {/* Top Branding & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 border-b border-[#DCEAF5]">
        
        {/* Hospital Branding */}
        <div className="flex items-center gap-3">
          <Link to="/hospital/home" className="flex items-center gap-2.5">
            <BloodNetLogo size="md" showTagline={false}/>
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#DCEAF5]">
            <div className="w-7 h-7 rounded-lg bg-[#E8F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Building2 className="w-4 h-4 text-[#2563EB]"/>
            </div>
            <div>
              <span className="text-xs font-black text-[#16324F] tracking-tight uppercase block leading-none">
                HOSPITAL PORTAL
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">Trauma & Emergency Care</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          {activeChats.length > 0 && (<button onClick={() => openEmergencyChat(activeChats[0].requestId)} className="px-3 py-1.5 rounded-xl bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] font-extrabold flex items-center gap-1.5 hover:bg-[#FFE4E6] transition-colors cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5 text-[#EF4444]"/>
              <span className="hidden sm:inline">Emergency Chat</span>
            </button>)}

          <button onClick={() => setActiveEmergencyPostModal(true)} className="hidden md:flex px-3.5 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs shadow-xs items-center gap-1.5 transition-all cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5"/> Post Emergency Need
          </button>

          {currentUser && (<div className="flex items-center gap-2 pl-2 border-l border-[#DCEAF5]">
              <span className="font-bold text-xs text-[#16324F] hidden lg:inline">{currentUser.name}</span>
              <button onClick={handleLogout} className="p-1.5 rounded-xl text-[#64748B] hover:text-[#EF4444] hover:bg-[#FFF1F2] transition-all flex items-center gap-1 font-bold text-xs cursor-pointer" title="Logout">
                <LogOut className="w-4 h-4"/>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>)}
        </div>
      </div>

      {/* Horizontal Navigation Menu Row */}
      <div className="bg-[#F5FAFF] border-t border-[#DCEAF5]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-extrabold whitespace-nowrap scroll-smooth">
            {navItems.map(item => {
            const IconComp = item.icon;
            return (<NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${isActive
                    ? 'bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black shadow-2xs'
                    : 'text-[#16324F] hover:text-[#2563EB] hover:bg-[#F0F9FF] border border-transparent'}`}>
                  {({ isActive }) => (<>
                      <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}/>
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 ? (<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-[#2563EB] text-white' : 'bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] font-mono'}`}>
                          {item.badge}
                        </span>) : null}
                    </>)}
                </NavLink>);
        })}
          </nav>
        </div>
      </div>
    </header>);
};
