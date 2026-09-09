import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
  LogIn,
  ShieldCheck,
  User,
  Building2,
  Droplet,
  Lock,
  AlertCircle,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Heart,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp, failedAttemptsMap } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  // Active Portal Mode: 'donor' | 'requester' | 'hospital' | 'admin'
  const [activePortalTab, setActivePortalTab] = useState<'donor' | 'requester' | 'hospital' | 'admin'>('donor');

  // Input State
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-HUB-4482');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2FA OTP State
  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case 'donor':
        return '/donor/home';
      case 'requester':
        return '/requester/home';
      case 'hospital':
        return '/hospital/home';
      case 'bloodbank':
        return '/bloodbank/home';
      case 'admin':
        return '/admin/home';
      default:
        return '/donor/home';
    }
  };

  const handlePortalSelect = (portal: 'donor' | 'requester' | 'hospital' | 'bloodbank' | 'admin') => {
    // REQUIREMENT 4: BLOOD BANK BUTTON MUST REDIRECT DIRECTLY TO /login/bloodbank
    if (portal === 'bloodbank') {
      showToast('Redirecting to Blood Bank Operational Portal login...');
      navigate('/login/bloodbank');
      return;
    }

    setActivePortalTab(portal);
    setLoginError(null);
    setIs2FAScreen(false);

    if (portal === 'donor') {
      setEmail('ananya.sharma@example.com');
    } else if (portal === 'requester') {
      setEmail('rohan.deshmukh@example.com');
    } else if (portal === 'hospital') {
      setEmail('admin@kims.edu.in');
      setLicenseNumber('LIC-HUB-4482');
    } else if (portal === 'admin') {
      setEmail('admin@bloodnet.gov.in');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter your email and password.');
      return;
    }

    if (activePortalTab === 'hospital' && !licenseNumber) {
      setLoginError('Hospital License Registration Number is required.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, activePortalTab, activePortalTab === 'hospital' ? licenseNumber : undefined);
      setIsSubmitting(false);

      if (res.requires2FA) {
        setIs2FAScreen(true);
        showToast(res.message);
      } else if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || activePortalTab), { replace: true });
      } else {
        setLoginError(res.message);
      }
    }, 400);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!otpInput || otpInput.trim().length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      const res = verifyTwoFactorOtp(otpInput.trim());
      setIsVerifyingOtp(false);

      if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || activePortalTab), { replace: true });
      } else {
        setLoginError(res.message);
      }
    }, 400);
  };

  const currentAttempts = failedAttemptsMap[`${email}_${activePortalTab}`] || 0;

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col justify-center items-center overflow-hidden">

      {/* SUBTLE MEDICAL BACKGROUND BUBBLE ELEMENTS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10 animate-in fade-in duration-300">

        {/* 1. BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Blood Net Portal Access
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto">
            Choose your dedicated portal to sign in to the unified real-time blood management network
          </p>
        </div>

        {/* 2. 5 SEPARATE PORTAL SELECTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* DONOR CARD */}
          <button
            type="button"
            onClick={() => handlePortalSelect('donor')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${activePortalTab === 'donor'
                ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-600 shadow-lg shadow-red-500/25 scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-red-300 hover:bg-red-50/50 shadow-xs'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${activePortalTab === 'donor' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                ❤️
              </div>
              {activePortalTab === 'donor' && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div>
              <strong className="font-extrabold text-sm block">Donor</strong>
              <p className={`text-[11px] mt-0.5 leading-snug ${activePortalTab === 'donor' ? 'text-red-100' : 'text-slate-500'}`}>
                Donate blood & respond to emergency requests
              </p>
            </div>
          </button>

          {/* REQUESTER CARD */}
          <button
            type="button"
            onClick={() => handlePortalSelect('requester')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${activePortalTab === 'requester'
                ? 'bg-gradient-to-br from-rose-600 to-pink-700 text-white border-rose-600 shadow-lg shadow-rose-500/25 scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 shadow-xs'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${activePortalTab === 'requester' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                🆘
              </div>
              {activePortalTab === 'requester' && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div>
              <strong className="font-extrabold text-sm block">Requester</strong>
              <p className={`text-[11px] mt-0.5 leading-snug ${activePortalTab === 'requester' ? 'text-rose-100' : 'text-slate-500'}`}>
                Create & track patient emergency blood requests
              </p>
            </div>
          </button>

          {/* HOSPITAL CARD */}
          <button
            type="button"
            onClick={() => handlePortalSelect('hospital')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${activePortalTab === 'hospital'
                ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-600 shadow-lg shadow-sky-500/25 scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 shadow-xs'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${activePortalTab === 'hospital' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-600'
                }`}>
                🏥
              </div>
              {activePortalTab === 'hospital' && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div>
              <strong className="font-extrabold text-sm block">Hospital</strong>
              <p className={`text-[11px] mt-0.5 leading-snug ${activePortalTab === 'hospital' ? 'text-sky-100' : 'text-slate-500'}`}>
                Manage patient requests & hospital blood stock
              </p>
            </div>
          </button>

          {/* BLOOD BANK CARD (REDIRECTS TO /login/bloodbank) */}
          <button
            type="button"
            onClick={() => handlePortalSelect('bloodbank')}
            className="p-4 rounded-3xl border border-slate-200 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                🩸
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                OTP Auth
              </span>
            </div>
            <div>
              <strong className="font-extrabold text-sm block text-slate-900 flex items-center gap-1">
                Blood Bank <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Manage inventory, requests & blood units
              </p>
            </div>
          </button>

          {/* SUPER ADMIN CARD */}
          <button
            type="button"
            onClick={() => handlePortalSelect('admin')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${activePortalTab === 'admin'
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-lg shadow-slate-900/25 scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${activePortalTab === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                🛡️
              </div>
              {activePortalTab === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div>
              <strong className="font-extrabold text-sm block">Super Admin</strong>
              <p className={`text-[11px] mt-0.5 leading-snug ${activePortalTab === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>
                System-wide control, approvals & monitoring
              </p>
            </div>
          </button>

        </div>

        {/* 3. DEDICATED LOGIN FORM CONTAINER */}
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">

          {/* BADGE HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base font-bold ${activePortalTab === 'donor'
                  ? 'bg-red-100 text-red-700'
                  : activePortalTab === 'requester'
                    ? 'bg-rose-100 text-rose-700'
                    : activePortalTab === 'hospital'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-800'
                }`}>
                {activePortalTab === 'donor' ? '❤️' : activePortalTab === 'requester' ? '🆘' : activePortalTab === 'hospital' ? '🏥' : '🛡️'}
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {activePortalTab === 'donor' && 'Voluntary Donor Sign In'}
                  {activePortalTab === 'requester' && 'Patient Requester Sign In'}
                  {activePortalTab === 'hospital' && 'Hospital Operational Sign In'}
                  {activePortalTab === 'admin' && 'National Super Admin Control Sign In'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Authenticated against backend Blood Net database
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              🟢 SECURE SSL
            </span>
          </div>

          {/* FAILED ATTEMPTS WARNING */}
          {currentAttempts > 0 && currentAttempts < 5 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Warning: {currentAttempts} failed attempt(s). Account locks automatically after 5 failed attempts.</span>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {!is2FAScreen ? (
            /* STANDARD CREDENTIALS FORM */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">

              <div>
                <label className="text-slate-700 font-extrabold block mb-1">
                  {activePortalTab === 'hospital' ? 'Hospital Official Email / ID *' : 'Registered Email Address / Phone *'}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={activePortalTab === 'hospital' ? 'admin@kims.edu.in' : 'name@example.com'}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-extrabold block">Password *</label>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset link has been dispatched to your registered email.')}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* HOSPITAL LICENSE NUMBER REQUIREMENT */}
              {activePortalTab === 'hospital' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-extrabold block">Hospital License Registration Number *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LIC-HUB-4482"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Verified against State Health Authority records
                  </span>
                </div>
              )}

              {/* SUBMIT ACTION BUTTON WITH LOADING STATE */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${activePortalTab === 'hospital'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/20'
                    : activePortalTab === 'admin'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-500/20'
                  } ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in to Blood Net...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to {activePortalTab.toUpperCase()} Portal</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* 2FA OTP SCREEN */
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-1">
                <KeyRound className="w-8 h-8 text-sky-600 mx-auto" />
                <strong className="block text-slate-900 font-extrabold text-sm">Two-Factor Authentication (2FA) Required</strong>
                <p className="text-[11px] text-slate-600">Enter the 6-digit OTP code dispatched to your registered authorization device.</p>
              </div>

              <div>
                <label className="text-slate-700 font-extrabold block mb-1">Enter 6-Digit OTP Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-xl tracking-widest focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP Code...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify 2FA OTP & Open Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER & HELP FOOTER LINKS */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Don't have an account yet?</span>
            <button
              onClick={() => navigate('/register')}
              className="text-red-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Register Portal Account <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
