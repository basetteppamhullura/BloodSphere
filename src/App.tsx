import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { AccessDeniedBanner } from './components/common/AccessDeniedBanner';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DonorSearchPage } from './pages/DonorSearchPage';
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { BloodBanksPage } from './pages/BloodBanksPage';
import { DonationCampsPage } from './pages/DonationCampsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { RareRegistryPage } from './pages/RareRegistryPage';
import { GroupCirclesPage } from './pages/GroupCirclesPage';
import { BloodBridgePage } from './pages/BloodBridgePage';

import { EmergencyPostModal } from './components/modals/EmergencyPostModal';
import { SmartMatchModal } from './components/modals/SmartMatchModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { PrivacyChatModal } from './components/modals/PrivacyChatModal';
import { HealthPassportModal } from './components/modals/HealthPassportModal';
import { CorporateImpactModal } from './components/modals/CorporateImpactModal';

const PageContent: React.FC = () => {
  const { activePage } = useApp();
  const { currentRole, isPageAllowedForRole } = useAuth();

  const isAllowed = isPageAllowedForRole(activePage, currentRole);

  if (!isAllowed) {
    return <AccessDeniedBanner />;
  }

  switch (activePage) {
    case 'landing': return <LandingPage />;
    case 'login': return <LoginPage />;
    case 'register': return <RegisterPage />;
    case 'dashboard': return <DashboardPage />;
    case 'donor-search': return <DonorSearchPage />;
    case 'emergency-requests': return <EmergencyRequestsPage />;
    case 'rare-registry': return <RareRegistryPage />;
    case 'group-circles': return <GroupCirclesPage />;
    case 'blood-bridge': return <BloodBridgePage />;
    case 'blood-banks': return <BloodBanksPage />;
    case 'camps': return <DonationCampsPage />;
    case 'leaderboard': return <LeaderboardPage />;
    case 'profile': return <ProfilePage />;
    default: return <DashboardPage />;
  }
};

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <Toast />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
            <PageContent />
          </main>

          <Footer />
        </div>
      </div>

      <MobileNav />

      {/* Interactive Modals */}
      <EmergencyPostModal />
      <SmartMatchModal />
      <CertificateModal />
      <PrivacyChatModal />
      <HealthPassportModal />
      <CorporateImpactModal />

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
