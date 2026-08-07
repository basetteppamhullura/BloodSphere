import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PageTab, PortalAccount, AccountVerificationStatus } from '../types';
import { MOCK_CURRENT_USER } from '../data/mockData.ts';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, role: UserRole) => { success: boolean; message: string };
  logout: () => void;
  isPageAllowedForRole: (page: PageTab, role: UserRole) => boolean;
  
  // Portal Registration & Approval System
  portalAccounts: PortalAccount[];
  registerPortalAccount: (acc: Partial<PortalAccount>) => PortalAccount;
  updateAccountStatusByAdmin: (accountId: string, status: AccountVerificationStatus) => void;
}

const ROLE_STORAGE_KEY = 'bloodsphere_active_role';
const ACCOUNTS_STORAGE_KEY = 'bloodsphere_portal_accounts';

const SEED_PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    id: 'acc_admin_001',
    email: 'admin@bloodnet.gov.in',
    role: 'admin',
    name: 'National Super Admin',
    phone: '+91 800 256 6343',
    city: 'Hubballi',
    status: 'Verified'
  },
  {
    id: 'acc_hosp_001',
    email: 'admin@kims.edu.in',
    role: 'hospital',
    name: 'KIMS Teaching Hospital',
    phone: '+91 836 2378000',
    licenseNumber: 'LIC-HUB-4482',
    address: 'PB Road, Vidyanagar',
    city: 'Hubballi',
    state: 'Karnataka',
    contactPerson: 'Dr. Mahesh Kulkarni',
    status: 'Verified'
  },
  {
    id: 'acc_bb_001',
    email: 'contact@rotaryblood.org',
    role: 'bloodbank',
    name: 'Rotary Regional Blood Center',
    phone: '+91 836 2254321',
    licenseNumber: 'LIC-BB-9901',
    address: 'Deshpande Nagar',
    city: 'Hubballi',
    state: 'Karnataka',
    contactPerson: 'Sunil Patil',
    status: 'Verified'
  },
  {
    id: 'acc_donor_001',
    email: 'ananya.sharma@example.com',
    role: 'donor',
    name: 'Dr. Ananya Sharma',
    phone: '+91 98765 43210',
    city: 'Hubballi',
    status: 'Verified'
  },
  {
    id: 'acc_req_001',
    email: 'rohan.deshmukh@example.com',
    role: 'requester',
    name: 'Rohan Deshmukh',
    phone: '+91 97412 88901',
    city: 'Hubballi',
    status: 'Verified'
  }
];

const ROLE_PERMISSIONS: Record<UserRole, PageTab[]> = {
  donor: ['landing', 'login', 'register', 'dashboard', 'emergency-requests', 'rare-registry', 'group-circles', 'donor-search', 'leaderboard', 'profile'],
  requester: ['landing', 'login', 'register', 'dashboard', 'emergency-requests', 'rare-registry', 'donor-search', 'blood-banks'],
  hospital: ['landing', 'login', 'register', 'dashboard', 'emergency-requests', 'blood-bridge', 'blood-banks', 'camps'],
  bloodbank: ['landing', 'login', 'register', 'dashboard', 'blood-banks', 'blood-bridge'],
  admin: ['landing', 'login', 'register', 'dashboard', 'emergency-requests', 'rare-registry', 'group-circles', 'blood-bridge', 'donor-search', 'blood-banks', 'camps', 'leaderboard', 'profile']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    return (saved as UserRole) || 'donor';
  });

  const [portalAccounts, setPortalAccounts] = useState<PortalAccount[]>(() => {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_PORTAL_ACCOUNTS;
      }
    }
    return SEED_PORTAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => ({
    ...MOCK_CURRENT_USER,
    role: (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole) || 'donor'
  }));

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(portalAccounts));
  }, [portalAccounts]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const login = (email: string, role: UserRole): { success: boolean; message: string } => {
    const account = portalAccounts.find(
      a => a.email.toLowerCase().trim() === email.toLowerCase().trim() && a.role === role
    );

    // Dynamic accounts check
    if (account) {
      if (account.status === 'Pending Verification') {
        return { success: false, message: 'Your account is waiting for Admin verification.' };
      }
      if (account.status === 'Disabled') {
        return { success: false, message: 'Your account has been disabled. Please contact Blood Net support.' };
      }
    }

    switchRole(role);
    setCurrentUser({
      ...MOCK_CURRENT_USER,
      email,
      role,
      name: account?.name || MOCK_CURRENT_USER.name
    });

    return { success: true, message: `Logged in successfully as ${role.toUpperCase()}!` };
  };

  const registerPortalAccount = (newAcc: Partial<PortalAccount>): PortalAccount => {
    const isSpecialRole = newAcc.role === 'hospital' || newAcc.role === 'bloodbank';
    const created: PortalAccount = {
      id: `acc_${newAcc.role}_${Date.now()}`,
      email: newAcc.email || '',
      role: newAcc.role || 'donor',
      name: newAcc.name || 'New User',
      phone: newAcc.phone || '+91 98000 00000',
      licenseNumber: newAcc.licenseNumber,
      address: newAcc.address,
      city: newAcc.city || 'Hubballi',
      state: newAcc.state || 'Karnataka',
      contactPerson: newAcc.contactPerson,
      status: isSpecialRole ? 'Pending Verification' : 'Verified'
    };

    setPortalAccounts(prev => [created, ...prev]);
    return created;
  };

  const updateAccountStatusByAdmin = (accountId: string, status: AccountVerificationStatus) => {
    setPortalAccounts(prev =>
      prev.map(acc => (acc.id === accountId ? { ...acc, status } : acc))
    );
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isPageAllowedForRole = (page: PageTab, role: UserRole): boolean => {
    const allowed = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.donor;
    return allowed.includes(page);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        login,
        logout,
        isPageAllowedForRole,
        portalAccounts,
        registerPortalAccount,
        updateAccountStatusByAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
