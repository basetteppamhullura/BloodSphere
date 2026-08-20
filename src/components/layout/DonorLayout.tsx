import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { DonorSidebar } from './DonorSidebar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { EmergencyPostModal } from '../modals/EmergencyPostModal';
import { WaterBubbleBackground } from '../common/WaterBubbleBackground';

export const DonorLayout: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white relative water-bubble-bg">
      <WaterBubbleBackground />
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-extrabold shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
