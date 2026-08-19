import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { Building2, LogIn, Lock, AlertCircle, KeyRound, Check } from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@kims.edu.in');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-HUB-4482');

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
      navigate('/hospital/dashboard', { replace: true });
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
      navigate('/hospital/dashboard', { replace: true });
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BloodNetLogo size="lg" showTagline={true} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold mt-2">
          <Building2 className="w-4 h-4 text-sky-600" /> Hospital Trauma Center Portal
        </div>
      </div>

      {/* Login Card */}
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-lg space-y-5">
        
        {loginError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {!is2FAScreen ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Hospital Official Email *</label>
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

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" /> Log In to Hospital Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-1">
              <KeyRound className="w-8 h-8 text-sky-600 mx-auto" />
              <strong className="block text-slate-900 font-extrabold text-sm">Two-Factor Authentication (2FA)</strong>
              <p className="text-[11px] text-slate-600">Enter the 6-digit OTP code sent to your registered hospital device.</p>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">6-Digit OTP Code *</label>
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
