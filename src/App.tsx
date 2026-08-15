import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DonorRequesterLoginPage } from './pages/DonorRequesterLoginPage';
import { HospitalLoginPage } from './pages/HospitalLoginPage';
import { BloodBankLoginPage } from './pages/BloodBankLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { RareRegistryPage } from './pages/RareRegistryPage';
import { GroupCirclesPage } from './pages/GroupCirclesPage';
import { DonorSearchPage } from './pages/DonorSearchPage';
import { BloodBridgePage } from './pages/BloodBridgePage';
import { BloodBanksPage } from './pages/BloodBanksPage';
import { DonationCampsPage } from './pages/DonationCampsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';

// Modals
import { EmergencyPostModal } from './components/modals/EmergencyPostModal';
import { AccessDeniedBanner } from './components/common/AccessDeniedBanner';

const MainLayout: React.FC = () => {
  const { activePage, toastMessage } = useApp();
  const { currentRole, isPageAllowedForRole } = useAuth();

  // Role Permission Guard
  const isAllowed = isPageAllowedForRole(activePage, currentRole);

  const renderCurrentPage = () => {
    if (!isAllowed) {
      return <AccessDeniedBanner />;
    }

    switch (activePage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <DonorRequesterLoginPage />;
      case 'login-donor-requester':
        return <DonorRequesterLoginPage />;
      case 'login-hospital':
        return <HospitalLoginPage />;
      case 'login-bloodbank':
        return <BloodBankLoginPage />;
      case 'login-admin':
        return <AdminLoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'emergency-requests':
        return <EmergencyRequestsPage />;
      case 'rare-registry':
        return <RareRegistryPage />;
      case 'group-circles':
        return <GroupCirclesPage />;
      case 'blood-bridge':
        return <BloodBridgePage />;
      case 'donor-search':
        return <DonorSearchPage />;
      case 'blood-banks':
        return <BloodBanksPage />;
      case 'camps':
        return <DonationCampsPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-extrabold shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Desktop Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {renderCurrentPage()}
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
