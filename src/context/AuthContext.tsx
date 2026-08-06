import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PageTab } from '../types';
import { MOCK_CURRENT_USER } from '../data/mockData.ts';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isPageAllowedForRole: (page: PageTab, role: UserRole) => boolean;
}

const STORAGE_KEY = 'bloodsphere_active_role';

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
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as UserRole) || 'donor';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => ({
    ...MOCK_CURRENT_USER,
    role: (localStorage.getItem(STORAGE_KEY) as UserRole) || 'donor'
  }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentRole);
  }, [currentRole]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem(STORAGE_KEY, role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const login = (email: string, role: UserRole) => {
    switchRole(role);
    setCurrentUser({
      ...MOCK_CURRENT_USER,
      email,
      role
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isPageAllowedForRole = (page: PageTab, role: UserRole): boolean => {
    const allowed = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.donor;
    return allowed.includes(page);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, switchRole, login, logout, isPageAllowedForRole }}>
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
