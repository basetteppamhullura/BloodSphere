import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Droplet, Package, Boxes, FileText, AlertTriangle, History, BarChart3, Sun, Moon, ChevronRight, Send, FlaskConical, Thermometer, Settings } from 'lucide-react';
export const BloodBankSidebar = () => {
    const { requests, bloodUnitsList, inventoryStockMap, notifications } = useApp();
    const { isDarkMode, toggleTheme } = useTheme();
    // Active pending requests
    const inactiveStatuses = ['FULFILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
    const activeRequests = requests.filter(r => !inactiveStatuses.includes(r.status));
    const directReqCount = activeRequests.filter(r => r.requesterType === 'DIRECT_REQUESTER' || (!r.isVerifiedByHospital && r.requesterType !== 'HOSPITAL' && r.requesterType !== 'BLOOD_BANK')).length;
    const hospitalReqCount = activeRequests.filter(r => r.requesterType === 'HOSPITAL' || (r.isVerifiedByHospital && r.requesterType !== 'BLOOD_BANK')).length;
    const bloodBankReqCount = activeRequests.filter(r => r.requesterType === 'BLOOD_BANK' || (r.hospitalName && r.hospitalName.toLowerCase().includes('blood bank'))).length;
    // Expired / Near expiry count
    const todayStr = new Date().toISOString().split('T')[0];
    const expiredUnitsCount = bloodUnitsList.filter(u => u.status === 'EXPIRED' || u.expiryDate < todayStr).length;
    // Unread notifications count
    const unreadNotifsCount = notifications.filter(n => !n.read).length;
    // Low stock alerts count
    const lowStockCount = Object.values(inventoryStockMap).reduce((acc, comps) => {
        const totalGroup = Object.values(comps).reduce((sub, item) => sub + (item.available || 0), 0);
        return totalGroup < 5 ? acc + 1 : acc;
    }, 0);
    const navItems = [
        { to: '/bloodbank/home', label: 'Home / Operations', icon: Droplet },
        { to: '/bloodbank/requests', label: 'Requester Queue', icon: Package, badge: directReqCount },
        { to: '/bloodbank/hospital-requests', label: 'Hospital Requests', icon: FileText, badge: hospitalReqCount },
        { to: '/bloodbank/bloodbank-requests', label: 'Blood Bank Requests', icon: Boxes, badge: bloodBankReqCount },
        { to: '/bloodbank/inventory', label: 'Inventory Matrix', icon: Boxes },
        { to: '/bloodbank/units', label: 'Blood Unit Tracking', icon: FlaskConical },
        { to: '/bloodbank/preservation', label: 'Preservation & Expiry', icon: Thermometer, badge: expiredUnitsCount > 0 ? expiredUnitsCount : undefined },
        { to: '/bloodbank/issue', label: 'Issue Blood', icon: Send },
        { to: '/bloodbank/alerts', label: 'Low Stock Alerts', icon: AlertTriangle, badge: lowStockCount > 0 ? lowStockCount : undefined },
        { to: '/bloodbank/notifications', label: 'Notifications', icon: History, badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
        { to: '/bloodbank/activity', label: 'Activity Log', icon: History },
        { to: '/bloodbank/reports', label: 'Reports & Analytics', icon: BarChart3 },
        { to: '/bloodbank/settings', label: 'Settings', icon: Settings }
    ];
    return (<aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-sky-100 rounded-3xl p-5 shadow-xs sticky top-20 h-fit space-y-5 text-slate-800">
      
      {/* Blood Bank Portal Branding */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-500"/>
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">
              BLOOD BANK PORTAL
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Regional Supply Bank</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="w-full flex flex-col space-y-2 text-xs font-extrabold">
        {navItems.map(item => {
            const IconComp = item.icon;
            return (<NavLink key={item.to} to={item.to} className={({ isActive }) => `w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'}`}>
              {({ isActive }) => (<>
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`}/>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (<span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-800'}`}>
                      {item.badge}
                    </span>) : isActive ? (<ChevronRight className="w-4 h-4 text-white shrink-0"/>) : null}
                </>)}
            </NavLink>);
        })}
      </nav>

      {/* Footer */}
      <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="text-[10px] text-slate-400 font-mono">Blood Net • Blood Bank</span>
        <button onClick={toggleTheme} className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-600 border border-sky-100 transition-all">
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500"/> : <Moon className="w-3.5 h-3.5 text-sky-600"/>}
        </button>
      </div>

    </aside>);
};
