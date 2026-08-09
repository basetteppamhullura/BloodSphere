import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Building2, KeyRound, ShieldCheck, ShieldAlert, LogIn, Lock } from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp, failedAttemptsMap } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [licenseNumber, setLicenseNumber] = useState('LIC-HUB-4482');
  const [email, setEmail] = useState('admin@kims.edu.in');
  const [password, setPassword] = useState('••••••••');

  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email, 'hospital', licenseNumber);
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

  const attempts = failedAttemptsMap[`${email}_hospital`] || 0;

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Route Badge */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-blue-950">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Hospital Desk Login</h2>
        <div className="flex items-center justify-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 uppercase flex items-center gap-1">
            <Lock className="w-3 h-3 text-blue-400" /> Restricted Medical Portal
          </span>
          <code className="text-xs text-blue-400 font-mono">/login/hospital</code>
        </div>
      </div>

      {attempts > 0 && attempts < 5 && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-bold text-center">
          ⚠️ Warning: {attempts} failed attempt(s). Account locks after 5 failed attempts.
        </div>
      )}

      {loginError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      {is2FAScreen ? (
        <form onSubmit={handleVerifyOtpSubmit} className="p-6 rounded-3xl bg-slate-900 border border-blue-600 space-y-4 shadow-xl text-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">2-Factor Security Step</h3>
              <p className="text-[11px] text-slate-400">Enter 6-digit OTP code sent to hospital phone</p>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Enter 6-Digit 2FA OTP *</label>
            <input
              type="text"
              placeholder="778899"
              value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-lg tracking-widest focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Verify 2FA & Open Hospital Dashboard
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Hospital License Registration Number *</label>
            <input
              type="text"
              placeholder="LIC-HUB-4482"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Official Hospital Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Enter Hospital Desk
          </button>

          <div className="pt-2 text-center text-slate-400">
            <p>
              New Hospital Desk?{' '}
              <button type="button" onClick={() => navigateTo('register')} className="text-blue-400 font-bold underline">
                Register Hospital (License Verification)
              </button>
            </p>
          </div>
        </form>
      )}

    </div>
  );
};
