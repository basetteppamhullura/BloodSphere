import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { HospitalSidebar } from './HospitalSidebar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { EmergencyPostModal } from '../modals/EmergencyPostModal';
import { EmergencyChatModal } from '../chat/EmergencyChatModal';
import { WaterBubbleBackground } from '../common/WaterBubbleBackground';

export const HospitalLayout: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-white text-[#0D2B45] flex flex-col font-sans selection:bg-[#0EA5E9] selection:text-white relative overflow-x-hidden">
      <WaterBubbleBackground />

      {/* Sky Blue Theme Background Decorative Orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[500px] h-[500px] bg-[#0EA5E9]/15 rounded-full blur-3xl opacity-70 z-0" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-[450px] h-[450px] bg-[#0284C7]/15 rounded-full blur-3xl opacity-60 z-0" />
      <div className="pointer-events-none absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-[#38BDF8]/15 rounded-full blur-3xl opacity-50 z-0" />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-extrabold shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A86B] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Global Header */}
      <Header />

      {/* Layout Grid: Left Vertical Sidebar + Right Content Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-10">
        {/* Hospital Portal Vertical Sidebar */}
        <HospitalSidebar />

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
    </div>
  );
};
