import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { Droplet, LogIn, Lock, AlertCircle, KeyRound, Check, RefreshCw, ArrowLeft } from 'lucide-react';

export const BloodBankLoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('contact@rotaryblood.org');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-BB-9901');

  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password || !licenseNumber) {
      setLoginError('Please fill in all required credentials, including License Number.');
      return;
    }

    const res = login(email, 'bloodbank', licenseNumber);

    if (res.requires2FA) {
      setIs2FAScreen(true);
      showToast(res.message);
    } else if (res.success) {
      showToast(res.message);
      const targetRole = res.userRole || 'bloodbank';
      navigate(`/${targetRole}/home`, { replace: true });
    } else {
      setLoginError(res.message);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!otpInput || otpInput.trim().length !== 6) {
      setLoginError('Invalid OTP. Please enter a valid 6-digit code.');
      return;
    }

    const res = verifyTwoFactorOtp(otpInput.trim());
    if (res.success) {
      showToast(res.message);
      const targetRole = res.userRole || 'bloodbank';
      navigate(`/${targetRole}/home`, { replace: true });
    } else {
      setLoginError(res.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = () => {
    setIsResending(true);
    setLoginError(null);
    setTimeout(() => {
      setIsResending(false);
      showToast('A new 6-digit 2FA OTP code has been dispatched to your registered phone number.');
    }, 600);
  };

  const handleBackToLogin = () => {
    setIs2FAScreen(false);
    setLoginError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BloodNetLogo size="lg" showTagline={true} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold mt-2 shadow-2xs">
          <Droplet className="w-4 h-4 text-emerald-600" /> Blood Bank Operational Portal
        </div>
      </div>

      {/* Login Card */}
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-xl space-y-5">
        
        {loginError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {!is2FAScreen ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Blood Bank Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="contact@rotaryblood.org"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Blood Bank License Number *</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 uppercase tracking-wider transition-colors"
                placeholder="LIC-BB-9901"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" /> Log In to Blood Bank Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1.5">
              <KeyRound className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="block text-slate-900 font-extrabold text-sm">Two-Factor Authentication (2FA)</strong>
              <p className="text-[11px] text-slate-600">Enter the 6-digit OTP code sent to your registered blood bank authorization device.</p>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">6-Digit OTP Code *</label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
                placeholder="778899"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Check className="w-4 h-4" /> Verify 2FA OTP Code
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-emerald-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending...' : 'Resend OTP Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
