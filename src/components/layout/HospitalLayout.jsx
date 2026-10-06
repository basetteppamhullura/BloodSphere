import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { HospitalSidebar } from './HospitalSidebar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { EmergencyPostModal } from '../modals/EmergencyPostModal';
import { EmergencyChatModal } from '../chat/EmergencyChatModal';
import { SkyWaterBackground } from '../common/SkyWaterBackground';

export const HospitalLayout = () => {
    const { toastMessage } = useApp();
    return (
        <div className="min-h-screen text-[#0D2B45] flex flex-col font-sans selection:bg-[#0EA5E9] selection:text-white relative overflow-x-hidden water-bubble-bg">
          {/* Sky + Water unified theme — hospital variant (structured blue/white) */}
          <SkyWaterBackground variant="hospital" />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-extrabold shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A86B] animate-ping"/>
              <span>{toastMessage}</span>
            </div>
          )}

          <Header />

          <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-10">
            <HospitalSidebar />
            <main className="flex-1 min-w-0 pb-16 md:pb-0">
              <Outlet />
            </main>
          </div>

          <EmergencyPostModal />
          <EmergencyChatModal />
          <Footer />
          <MobileNav />
        </div>
    );
};
