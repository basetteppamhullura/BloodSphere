import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Layouts & Role Guard
import { PublicLayout } from './components/layout/PublicLayout';
import { DonorLayout } from './components/layout/DonorLayout';
import { RequesterLayout } from './components/layout/RequesterLayout';
import { HospitalLayout } from './components/layout/HospitalLayout';
import { BloodBankLayout } from './components/layout/BloodBankLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { RoleProtectedRoute } from './components/common/RoleProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { DonorRequesterLoginPage } from './pages/DonorRequesterLoginPage';
import { HospitalLoginPage } from './pages/HospitalLoginPage';
import { BloodBankLoginPage } from './pages/BloodBankLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Common / Shared Pages
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { RareRegistryPage } from './pages/RareRegistryPage';
import { GroupCirclesPage } from './pages/GroupCirclesPage';
import { DonorSearchPage } from './pages/DonorSearchPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';

// Role Portal Specific Views & Desks
import { RealtimeDonorPortal } from './components/donor/RealtimeDonorPortal';
import { RealtimeRequesterPortal } from './components/requester/RealtimeRequesterPortal';
import { RequesterActionHub } from './components/requester/RequesterActionHub';
import { HospitalBloodStockFinder } from './components/requester/HospitalBloodStockFinder';

import { HospitalMonitorDesk } from './components/hospital/HospitalMonitorDesk';
import { HospitalEmergencyBoard } from './components/hospital/HospitalEmergencyBoard';
import { HospitalDonationDrives } from './components/hospital/HospitalDonationDrives';
import { HospitalInterCitySupply } from './components/hospital/HospitalInterCitySupply';

import { BloodBankPortalDesk } from './components/bloodbank/BloodBankPortalDesk';
import { AdminControlCenterDesk } from './components/admin/AdminControlCenterDesk';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* ================================================== */}
              {/* PUBLIC ROUTES                                      */}
              {/* ================================================== */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<DonorRequesterLoginPage />} />
                <Route path="/login/donor-requester" element={<DonorRequesterLoginPage />} />
                <Route path="/login/hospital" element={<HospitalLoginPage />} />
                <Route path="/login/bloodbank" element={<BloodBankLoginPage />} />
                <Route path="/login/admin" element={<AdminLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* ================================================== */}
              {/* DONOR PORTAL ROUTES (/donor/*)                    */}
              {/* ================================================== */}
              <Route
                path="/donor"
                element={
                  <RoleProtectedRoute requiredRole="donor">
                    <DonorLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/donor/dashboard" replace />} />
                <Route path="dashboard" element={<RealtimeDonorPortal />} />
                <Route path="emergency" element={<EmergencyRequestsPage />} />
                <Route path="rare-blood" element={<RareRegistryPage />} />
                <Route path="family" element={<GroupCirclesPage />} />
                <Route path="directory" element={<DonorSearchPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* ================================================== */}
              {/* REQUESTER PORTAL ROUTES (/requester/*)              */}
              {/* ================================================== */}
              <Route
                path="/requester"
                element={
                  <RoleProtectedRoute requiredRole="requester">
                    <RequesterLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/requester/dashboard" replace />} />
                <Route path="dashboard" element={<RealtimeRequesterPortal />} />
                <Route path="create-request" element={<RequesterActionHub />} />
                <Route path="requests" element={<EmergencyRequestsPage />} />
                <Route path="find-blood" element={<HospitalBloodStockFinder />} />
                <Route path="notifications" element={<RealtimeRequesterPortal />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* ================================================== */}
              {/* HOSPITAL PORTAL ROUTES (/hospital/*)               */}
              {/* ================================================== */}
              <Route
                path="/hospital"
                element={
                  <RoleProtectedRoute requiredRole="hospital">
                    <HospitalLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/hospital/dashboard" replace />} />
                <Route path="dashboard" element={<HospitalMonitorDesk initialTab="monitor" />} />
                <Route path="requests" element={<HospitalEmergencyBoard />} />
                <Route path="blood-availability" element={<HospitalBloodStockFinder />} />
                <Route path="donors" element={<HospitalDonationDrives />} />
                <Route path="blood-banks" element={<HospitalInterCitySupply />} />
                <Route path="reports" element={<HospitalMonitorDesk initialTab="audit_log" />} />
              </Route>

              {/* ================================================== */}
              {/* BLOOD BANK PORTAL ROUTES (/bloodbank/*)            */}
              {/* ================================================== */}
              <Route
                path="/bloodbank"
                element={
                  <RoleProtectedRoute requiredRole="bloodbank">
                    <BloodBankLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/bloodbank/dashboard" replace />} />
                <Route path="dashboard" element={<BloodBankPortalDesk initialTab="dashboard" />} />
                <Route path="requests" element={<BloodBankPortalDesk initialTab="queue" />} />
                <Route path="inventory" element={<BloodBankPortalDesk initialTab="inventory" />} />
                <Route path="reservations" element={<BloodBankPortalDesk initialTab="lifecycle" />} />
                <Route path="issue-blood" element={<BloodBankPortalDesk initialTab="lifecycle" />} />
                <Route path="alerts" element={<BloodBankPortalDesk initialTab="alerts" />} />
                <Route path="activity-log" element={<BloodBankPortalDesk initialTab="activity" />} />
                <Route path="reports" element={<BloodBankPortalDesk initialTab="reports" />} />
              </Route>

              {/* ================================================== */}
              {/* SUPER ADMIN PORTAL ROUTES (/admin/*)              */}
              {/* ================================================== */}
              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminControlCenterDesk initialTab="overview" />} />
                <Route path="users" element={<AdminControlCenterDesk initialTab="users" initialRoleFilter="ALL" />} />
                <Route path="donors" element={<AdminControlCenterDesk initialTab="users" initialRoleFilter="donor" />} />
                <Route path="requesters" element={<AdminControlCenterDesk initialTab="users" initialRoleFilter="requester" />} />
                <Route path="hospitals" element={<AdminControlCenterDesk initialTab="users" initialRoleFilter="hospital" />} />
                <Route path="bloodbanks" element={<AdminControlCenterDesk initialTab="users" initialRoleFilter="bloodbank" />} />
                <Route path="requests" element={<AdminControlCenterDesk initialTab="requests" />} />
                <Route path="reports" element={<AdminControlCenterDesk initialTab="analytics" />} />
                <Route path="settings" element={<AdminControlCenterDesk initialTab="audit" />} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
