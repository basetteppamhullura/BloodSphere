import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_CURRENT_USER } from '../data/mockData.ts';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_CURRENT_USER);
  const [currentRole, setCurrentRole] = useState<UserRole>('donor');

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const login = (email: string, role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser({
      ...MOCK_CURRENT_USER,
      email,
      role
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, switchRole, login, logout }}>
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
