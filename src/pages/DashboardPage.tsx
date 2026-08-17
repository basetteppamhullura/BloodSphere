import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RealtimeRequesterPortal } from '../components/requester/RealtimeRequesterPortal';
import { RealtimeDonorPortal } from '../components/donor/RealtimeDonorPortal';
import { HospitalMonitorDesk } from '../components/hospital/HospitalMonitorDesk';
import { BloodBankPortalDesk } from '../components/bloodbank/BloodBankPortalDesk';
import { AdminControlCenterDesk } from '../components/admin/AdminControlCenterDesk';

export const DashboardPage: React.FC = () => {
  const { currentRole } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* 1. DONOR PERSPECTIVE */}
      {currentRole === 'donor' && <RealtimeDonorPortal />}

      {/* 2. REQUESTER PERSPECTIVE */}
      {currentRole === 'requester' && <RealtimeRequesterPortal />}

      {/* 3. HOSPITAL PERSPECTIVE */}
      {currentRole === 'hospital' && <HospitalMonitorDesk />}

      {/* 4. BLOOD BANK PERSPECTIVE */}
      {currentRole === 'bloodbank' && <BloodBankPortalDesk />}

      {/* 5. SUPER ADMIN PERSPECTIVE */}
      {currentRole === 'admin' && <AdminControlCenterDesk />}

    </div>
  );
};
