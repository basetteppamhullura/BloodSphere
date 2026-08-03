import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SocialProofToast from './components/dashboard/SocialProofToast';
import TrendingFeed from './components/dashboard/TrendingFeed';
import ShortageHeatmap from './components/dashboard/ShortageHeatmap';
import Leaderboard from './components/dashboard/Leaderboard';
import DemandForecastChart from './components/ai/DemandForecastChart';
import SmartMatchModal from './components/ai/SmartMatchModal';
import AIPostExtractorModal from './components/ai/AIPostExtractorModal';
import AIChatbotDrawer from './components/ai/AIChatbotDrawer';
import BloodBankInventory from './components/inventory/BloodBankInventory';
import CampsManager from './components/inventory/CampsManager';
import DonorProfile from './components/profile/DonorProfile';
import CertificateModal from './components/profile/CertificateModal';
import PrivacyChatModal from './components/chat/PrivacyChatModal';
import Footer from './components/Footer';

import {
  Flame,
  Map,
  TrendingUp,
  Building2,
  Tent,
  Trophy,
  User,
  Heart,
  Bot,
  Sparkles
} from 'lucide-react';

function MainAppContent() {
  const [activeNavTab, setActiveNavTab] = useState('trending');
  const { setActiveAIChatbotDrawer } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-slate-100 selection:bg-red-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar />

      {/* Live Activity Ticker */}
      <SocialProofToast />

      {/* Secondary Category Nav Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between overflow-x-auto py-2.5">
          
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'trending', label: 'Urgent Requests', icon: Flame },
              { id: 'shortage', label: 'City Shortage Map', icon: Map },
              { id: 'forecast', label: 'AI Demand Forecast', icon: TrendingUp },
              { id: 'inventory', label: 'Blood Bank Inventory', icon: Building2 },
              { id: 'camps', label: 'Donation Camps', icon: Tent },
              { id: 'leaderboard', label: 'Top Donors', icon: Trophy },
              { id: 'profile', label: 'My Profile & Eligibility', icon: User }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {activeNavTab === 'trending' && <TrendingFeed />}
        {activeNavTab === 'shortage' && <ShortageHeatmap />}
        {activeNavTab === 'forecast' && <DemandForecastChart />}
        {activeNavTab === 'inventory' && <BloodBankInventory />}
        {activeNavTab === 'camps' && <CampsManager />}
        {activeNavTab === 'leaderboard' && <Leaderboard />}
        {activeNavTab === 'profile' && <DonorProfile />}

      </main>

      {/* Floating AI Chatbot Trigger (Bottom Right) */}
      <button
        onClick={() => setActiveAIChatbotDrawer(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-900/60 border border-indigo-400/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
        title="Open AI Lifesaver Assistant"
      >
        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-bold text-xs pr-1">AI Assistant</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900 animate-ping"></span>
      </button>

      {/* All Active Modals */}
      <SmartMatchModal />
      <AIPostExtractorModal />
      <AIChatbotDrawer />
      <CertificateModal />
      <PrivacyChatModal />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
