import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { LogIn, ShieldCheck, User, Building2, Droplet, Lock, AlertCircle, KeyRound, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp, failedAttemptsMap } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [activePortalTab, setActivePortalTab] = useState<'donor_requester' | 'hospital' | 'bloodbank' | 'admin'>('donor_requester');
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');

  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-HUB-4482');

  // 2FA OTP State
  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');

  const [loginError, setLoginError] = useState<string | null>(null);

  const handlePortalSwitch = (portal: 'donor_requester' | 'hospital' | 'bloodbank' | 'admin') => {
    setActivePortalTab(portal);
    setLoginError(null);
    setIs2FAScreen(false);

    if (portal === 'donor_requester') {
      setSelectedRole('donor');
      setEmail('ananya.sharma@example.com');
    } else if (portal === 'hospital') {
      setSelectedRole('hospital');
      setEmail('admin@kims.edu.in');
      setLicenseNumber('LIC-HUB-4482');
    } else if (portal === 'bloodbank') {
      setSelectedRole('bloodbank');
      setEmail('contact@rotaryblood.org');
      setLicenseNumber('LIC-BB-9901');
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

    const res = login(email, selectedRole, activePortalTab === 'hospital' ? licenseNumber : undefined);
    
    if (res.requires2FA) {
      setIs2FAScreen(true);
      showToast(res.message);
    } else if (res.success) {
      showToast(res.message);
      navigateTo('dashboard');
    } else {
      setLoginError(res.message);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = verifyTwoFactorOtp(otpInput);
    if (res.success) {
      showToast(res.message);
      navigateTo('dashboard');
    } else {
      setLoginError(res.message);
    }
  };

  const currentAttempts = failedAttemptsMap[`${email}_${selectedRole}`] || 0;

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BloodNetLogo size="lg" showTagline={true} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Access Your Dedicated Portal</h2>
        <p className="text-xs text-slate-500">Choose how you want to connect to the real-time blood network</p>
      </div>

      {/* 4 Separate Login Portal Choice Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          type="button"
          onClick={() => handlePortalSwitch('donor_requester')}
          className={`p-3 rounded-2xl border text-center transition-all font-bold ${
            activePortalTab === 'donor_requester'
              ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
              : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50'
          }`}
        >
          <User className="w-5 h-5 mx-auto mb-1" />
          <span>Donor / Requester</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('hospital')}
          className={`p-3 rounded-2xl border text-center transition-all font-bold ${
            activePortalTab === 'hospital'
              ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
              : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50'
          }`}
        >
          <Building2 className="w-5 h-5 mx-auto mb-1" />
          <span>Hospital Portal</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('bloodbank')}
          className={`p-3 rounded-2xl border text-center transition-all font-bold ${
            activePortalTab === 'bloodbank'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50'
          }`}
        >
          <Droplet className="w-5 h-5 mx-auto mb-1" />
          <span>Blood Bank</span>
        </button>

        <button
          type="button"
          onClick={() => handlePortalSwitch('admin')}
          className={`p-3 rounded-2xl border text-center transition-all font-bold ${
            activePortalTab === 'admin'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-700 border-sky-100 hover:bg-sky-50'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mx-auto mb-1" />
          <span>Super Admin</span>
        </button>
      </div>

      {/* Login Form Container */}
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-lg space-y-5">
        
        {/* Failed Attempt Warning Banner */}
        {currentAttempts > 0 && currentAttempts < 5 && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Warning: {currentAttempts} failed attempt(s). Account locks after 5 failed attempts.</span>
          </div>
        )}

        {/* Login Error Banner */}
        {loginError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {!is2FAScreen ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Donor vs Requester role selector */}
            {activePortalTab === 'donor_requester' && (
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-sky-50 border border-sky-100 font-extrabold">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('donor')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedRole === 'donor' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ❤️ Voluntary Donor
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleToggle('requester')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedRole === 'requester' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🆘 Patient Requester
                </button>
              </div>
            )}

            <div>
              <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {activePortalTab === 'hospital' && (
              <div>
                <label className="text-slate-700 font-bold block mb-1">Hospital License Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" /> Log In to Blood Net
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-1">
              <KeyRound className="w-8 h-8 text-sky-600 mx-auto" />
              <strong className="block text-slate-900 font-extrabold text-sm">Two-Factor Authentication (2FA) Required</strong>
              <p className="text-[11px] text-slate-600">Enter the 6-digit OTP code sent to your registered mobile device.</p>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Enter 6-Digit OTP Code *</label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Verify 2FA OTP Code
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
