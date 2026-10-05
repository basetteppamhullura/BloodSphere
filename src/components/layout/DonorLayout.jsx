import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { DonorSidebar } from './DonorSidebar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { EmergencyPostModal } from '../modals/EmergencyPostModal';
import { EmergencyChatModal } from '../chat/EmergencyChatModal';
import { WaterBubbleBackground } from '../common/WaterBubbleBackground';
import donorBg from '../../assets/donor_portal_bg.jpg';
export const DonorLayout = () => {
    const { toastMessage } = useApp();
    return (<div className="min-h-screen text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white relative water-bubble-bg">
      {/* Donor Portal Background Photo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={donorBg} alt="" className="w-full h-full object-cover object-center" aria-hidden="true"/>
        {/* Warm rose-white overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/93 via-white/88 to-slate-50/96"/>
      </div>
      <WaterBubbleBackground />
      {/* Toast Notification Container */}
      {toastMessage && (<div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-extrabold shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"/>
          <span>{toastMessage}</span>
        </div>)}

      {/* Top Header */}
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-10">
        {/* Donor Navigation Sidebar */}
        <DonorSidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <EmergencyPostModal />
      <EmergencyChatModal />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>);
};
