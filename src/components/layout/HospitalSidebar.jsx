import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Home, LayoutDashboard, AlertTriangle, Search, Heart, FileText, Sun, Moon, ChevronRight, Boxes, Activity, Landmark } from 'lucide-react';
export const HospitalSidebar = () => {
    const { requests, notifications, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
    const { isDarkMode, toggleTheme } = useTheme();
    const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
    const pendingRequestsCount = requests.filter(r => r.status === 'PENDING_HOSPITAL_APPROVAL' || r.status === 'VERIFIED_SEARCHING_DONORS' || r.status === 'PENDING').length;
    const unreadNotifsCount = notifications.filter(n => !n.read).length;
    const navSections = [
        {
            title: 'HOSPITAL OPERATIONS',
            items: [
                { to: '/hospital/home', label: 'Home / Operations', icon: Home },
                { to: '/hospital/requests', label: 'Incoming Blood Requests', icon: AlertTriangle, badge: pendingRequestsCount || criticalCount },
                { to: '/hospital/dashboard', label: 'Blood Stock Monitor', icon: LayoutDashboard },
                { to: '/hospital/unit-details', label: 'Blood Unit Tracking', icon: Boxes }
            ]
        },
        {
            title: 'NETWORK & LOGISTICS',
            items: [
                { to: '/hospital/blood-banks', label: 'Blood Bank Requests', icon: Landmark },
                { to: '/hospital/donors', label: 'Donor Responses & Drives', icon: Heart },
                { to: '/hospital/blood-availability', label: 'Blood Availability Search', icon: Search }
            ]
        },
        {
            title: 'GOVERNANCE & REPORTS',
            items: [
                { to: '/hospital/reports', label: 'Hospital Reports & Audit', icon: FileText },
                { to: '/hospital/activity', label: 'Hospital Activity Log', icon: Activity }
            ]
        }
    ];
    return (<>
      {/* 1. DESKTOP / TABLET VERTICAL LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-[#DCEAF5] rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-[#16324F]">
        
        {/* Hospital Portal Branding */}
        <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E8F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] font-bold shadow-2xs">
              <Building2 className="w-5 h-5 text-[#2563EB]"/>
            </div>
            <div>
              <span className="text-xs font-black text-[#16324F] tracking-tight uppercase block leading-tight">
                HOSPITAL PORTAL
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">Operations & Trauma</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" title="Connected to BloodNet"/>
        </div>

        {/* Navigation Sections */}
        <nav className="w-full flex flex-col space-y-4 text-xs font-extrabold">
          {navSections.map(section => (<div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-black tracking-wider text-[#94A3B8] uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map(item => {
                const IconComp = item.icon;
                return (<NavLink key={item.to} to={item.to} onClick={() => setIsMobileSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 ${isActive
                        ? 'bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black shadow-xs'
                        : 'text-[#16324F] hover:text-[#2563EB] hover:bg-[#F0F9FF] border border-transparent'}`}>
                      {({ isActive }) => (<>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}/>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 ? (<span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-[#2563EB] text-white' : 'bg-[#EF4444] text-white font-mono'}`}>
                              {item.badge}
                            </span>) : isActive ? (<ChevronRight className="w-4 h-4 text-[#2563EB] shrink-0"/>) : null}
                        </>)}
                    </NavLink>);
            })}
              </div>
            </div>))}
        </nav>

        {/* Footer with Mode Toggle */}
        <div className="pt-3 border-t border-[#DCEAF5] flex items-center justify-between text-xs text-[#64748B] font-medium">
          <span className="text-[10px] font-mono text-[#64748B]">BloodNet • Clinical</span>
          <button onClick={toggleTheme} className="p-1.5 rounded-xl bg-[#F5FAFF] hover:bg-[#E8F4FF] text-[#16324F] border border-[#DCEAF5] transition-all cursor-pointer" title="Toggle Light/Dark Mode">
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]"/> : <Moon className="w-3.5 h-3.5 text-[#2563EB]"/>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SLIDE-OUT DRAWER */}
      {isMobileSidebarOpen && (<div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileSidebarOpen(false)}/>
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2563EB]"/>
                  <span className="font-black text-sm text-[#16324F]">Hospital Menu</span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-[#64748B] hover:text-[#16324F]">
                  ✕
                </button>
              </div>

              <nav className="space-y-4 text-xs font-extrabold">
                {navSections.map(section => (<div key={section.title} className="space-y-1">
                    <div className="text-[10px] font-black text-[#94A3B8] uppercase px-2">
                      {section.title}
                    </div>
                    {section.items.map(item => {
                    const IconComp = item.icon;
                    return (<NavLink key={item.to} to={item.to} onClick={() => setIsMobileSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center justify-between px-3 py-2.5 rounded-xl ${isActive ? 'bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black' : 'text-[#16324F] hover:bg-[#F0F9FF]'}`}>
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4"/>
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (<span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EF4444] text-white">
                              {item.badge}
                            </span>)}
                        </NavLink>);
                })}
                  </div>))}
              </nav>
            </div>
          </div>
        </div>)}
    </>);
};
