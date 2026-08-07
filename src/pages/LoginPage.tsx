import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Heart, LogIn, ShieldCheck, User, Building2, Droplet, Lock, AlertCircle, Building, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, portalAccounts } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [activePortalTab, setActivePortalTab] = useState<'donor_requester' | 'hospital' | 'bloodbank' | 'admin'>('donor_requester');
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');

  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');

  const [loginError, setLoginError] = useState<string | null>(null);

  const handlePortalSwitch = (portal: 'donor_requester' | 'hospital' | 'bloodbank' | 'admin') => {
    setActivePortalTab(portal);
    setLoginError(null);

    if (portal === 'donor_requester') {
      setSelectedRole('donor');
      setEmail('ananya.sharma@example.com');
    } else if (portal === 'hospital') {
      setSelectedRole('hospital');
      setEmail('admin@kims.edu.in');
    } else if (portal === 'bloodbank') {
      setSelectedRole('bloodbank');
      setEmail('contact@rotaryblood.org');
    } else if (portal === 'admin') {
      setSelectedRole('admin');
      setEmail('admin@bloodnet.gov.in');
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    if (role === 'donor') setEmail('ananya.sharma@example.com');
    if (role === 'requester') setEmail('rohan.deshmukh@example.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email, selectedRole);
    if (res.success) {
      showToast(res.message);
      navigateTo('dashboard');
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-red-950">
          <Heart className="w-8 h-8 fill-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Choose how you want to access Blood Net</h2>
        <p className="text-xs text-slate-400">Select your access portal to enter your dedicated system</p>
      </div>

      {/* 4 Separate Login Portal Choice Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          type="button"
          onClick={() => handlePortalSwitch('donor_requester')}
          className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
            activePortalTab === 'donor_requester'
              ? 'bg-red-950/80 border-red-600 text-white shadow-lg ring-1 ring-red-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <User className="w-5 h-5 mx-auto text-red-500" />
          <span className="font-extrabold block text-[11px]">🩸 Donor / Requester</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('hospital')}
          className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
            activePortalTab === 'hospital'
              ? 'bg-blue-950/80 border-blue-600 text-white shadow-lg ring-1 ring-blue-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Building2 className="w-5 h-5 mx-auto text-blue-400" />
          <span className="font-extrabold block text-[11px]">🏥 Hospital Portal</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('bloodbank')}
          className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
            activePortalTab === 'bloodbank'
              ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-lg ring-1 ring-emerald-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Droplet className="w-5 h-5 mx-auto text-emerald-400" />
          <span className="font-extrabold block text-[11px]">🏦 Blood Bank Portal</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('admin')}
          className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
            activePortalTab === 'admin'
              ? 'bg-amber-950/80 border-amber-600 text-white shadow-lg ring-1 ring-amber-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Lock className="w-5 h-5 mx-auto text-amber-400" />
          <span className="font-extrabold block text-[11px]">👨‍💼 Super Admin</span>
        </button>
      </div>

      {/* Shared Donor/Requester Role Selector Toggle */}
      {activePortalTab === 'donor_requester' && (
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 text-xs">
          <button
            type="button"
            onClick={() => handleRoleToggle('donor')}
            className={`py-2 rounded-xl font-bold transition-all ${
              selectedRole === 'donor' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🩸 Voluntary Donor
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('requester')}
            className={`py-2 rounded-xl font-bold transition-all ${
              selectedRole === 'requester' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🆘 Patient Requester
          </button>
        </div>
      )}

      {/* Error Message Banner */}
      {loginError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        
        <div>
          <label className="text-slate-300 font-bold block mb-1">
            {activePortalTab === 'hospital' ? 'Official Hospital Email *' : activePortalTab === 'bloodbank' ? 'Official Blood Bank Email *' : activePortalTab === 'admin' ? 'Admin Credential Email *' : 'Email Address or Mobile Number *'}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Enter Portal as {selectedRole.toUpperCase()}
        </button>

        {/* Portal Registration Links */}
        <div className="pt-2 text-center text-slate-400">
          {activePortalTab === 'hospital' && (
            <p>
              New Hospital Desk?{' '}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-blue-400 font-bold underline"
              >
                Register Hospital (License Verification)
              </button>
            </p>
          )}

          {activePortalTab === 'bloodbank' && (
            <p>
              New Blood Bank?{' '}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-emerald-400 font-bold underline"
              >
                Register Blood Bank Unit
              </button>
            </p>
          )}

          {activePortalTab === 'donor_requester' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-red-400 font-bold underline"
              >
                Register New Donor/Requester
              </button>
            </p>
          )}
        </div>

      </form>

    </div>
  );
};
