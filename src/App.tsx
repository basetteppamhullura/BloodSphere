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
                <Route path="dashboard" element={<BloodBankPortalDesk />} />
                <Route path="requests" element={<BloodBankPortalDesk />} />
                <Route path="requests/:requestId" element={<BloodBankPortalDesk />} />
                <Route path="inventory" element={<BloodBankPortalDesk />} />
                <Route path="units" element={<BloodBankPortalDesk />} />
                <Route path="units/:unitId" element={<BloodBankPortalDesk />} />
                <Route path="reservations" element={<BloodBankPortalDesk />} />
                <Route path="issue" element={<BloodBankPortalDesk />} />
                <Route path="issue-blood" element={<Navigate to="/bloodbank/issue" replace />} />
                <Route path="alerts" element={<BloodBankPortalDesk />} />
                <Route path="activity" element={<BloodBankPortalDesk />} />
                <Route path="activity-log" element={<Navigate to="/bloodbank/activity" replace />} />
                <Route path="reports" element={<BloodBankPortalDesk />} />
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
                <Route path="dashboard" element={<AdminControlCenterDesk />} />
                <Route path="accounts" element={<AdminControlCenterDesk />} />
                <Route path="users" element={<Navigate to="/admin/accounts" replace />} />
                <Route path="donors" element={<AdminControlCenterDesk />} />
                <Route path="donors/:donorId" element={<AdminControlCenterDesk />} />
                <Route path="requesters" element={<AdminControlCenterDesk />} />
                <Route path="requesters/:requesterId" element={<AdminControlCenterDesk />} />
                <Route path="hospitals" element={<AdminControlCenterDesk />} />
                <Route path="hospitals/:hospitalId" element={<AdminControlCenterDesk />} />
                <Route path="blood-banks" element={<AdminControlCenterDesk />} />
                <Route path="bloodbanks" element={<Navigate to="/admin/blood-banks" replace />} />
                <Route path="blood-banks/:bloodBankId" element={<AdminControlCenterDesk />} />
                <Route path="requests" element={<AdminControlCenterDesk />} />
                <Route path="requests/:requestId" element={<AdminControlCenterDesk />} />
                <Route path="analytics" element={<AdminControlCenterDesk />} />
                <Route path="reports" element={<Navigate to="/admin/analytics" replace />} />
                <Route path="audit-logs" element={<AdminControlCenterDesk />} />
                <Route path="audit" element={<Navigate to="/admin/audit-logs" replace />} />
                <Route path="settings" element={<AdminControlCenterDesk />} />
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
