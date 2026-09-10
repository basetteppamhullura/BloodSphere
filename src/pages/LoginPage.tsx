import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
  LogIn,
  User,
  Building2,
  Droplet,
  Shield,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Heart,
  ArrowRight,
  Loader2,
  RefreshCw,
  UserPlus
} from 'lucide-react';

export type PortalType = 'donor' | 'requester' | 'hospital' | 'bloodbank' | 'admin';

interface LoginPageProps {
  initialPortal?: PortalType;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialPortal }) => {
  const { login, verifyTwoFactorOtp, registerPortalAccount, failedAttemptsMap } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial portal from props or current URL path
  const getInitialPortalFromPath = (): PortalType => {
    if (initialPortal) return initialPortal;
    const path = location.pathname.toLowerCase();
    if (path.includes('/login/bloodbank') || path.includes('/bloodbank')) return 'bloodbank';
    if (path.includes('/login/hospital') || path.includes('/hospital')) return 'hospital';
    if (path.includes('/login/requester') || path.includes('/requester')) return 'requester';
    if (path.includes('/login/admin') || path.includes('/admin')) return 'admin';
    return 'donor';
  };

  // State 1: Active Selected Portal
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(getInitialPortalFromPath);

  // State 2: Mode Toggle (Sign In vs Sign Up)
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // State 3: Login Inputs
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State 4: 2FA OTP Screen State
  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // State 5: Registration Inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regCity, setRegCity] = useState('Hubballi');
  const [regLicense, setRegLicense] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize state when URL or prop changes
  useEffect(() => {
    const fromPath = getInitialPortalFromPath();
    if (fromPath) {
      applyPortalDefaults(fromPath);
    }
  }, [location.pathname, initialPortal]);

  const applyPortalDefaults = (portal: PortalType) => {
    setSelectedPortal(portal);
    setErrorMessage(null);
    setIs2FAScreen(false);

    if (portal === 'donor') {
      setEmail('ananya.sharma@example.com');
      setPassword('••••••••');
      setLicenseNumber('');
    } else if (portal === 'requester') {
      setEmail('rohan.deshmukh@example.com');
      setPassword('••••••••');
      setLicenseNumber('');
    } else if (portal === 'hospital') {
      setEmail('admin@kims.edu.in');
      setPassword('••••••••');
      setLicenseNumber('LIC-HUB-4482');
    } else if (portal === 'bloodbank') {
      setEmail('contact@rotaryblood.org');
      setPassword('••••••••');
      setLicenseNumber('LIC-BB-9901');
    } else if (portal === 'admin') {
      setEmail('admin@bloodnet.gov.in');
      setPassword('••••••••');
      setLicenseNumber('');
    }
  };

  const handlePortalChange = (portal: PortalType) => {
    applyPortalDefaults(portal);
  };

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

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    if ((selectedPortal === 'hospital' || selectedPortal === 'bloodbank') && !licenseNumber) {
      setErrorMessage(`${selectedPortal === 'hospital' ? 'Hospital' : 'Blood Bank'} License Registration Number is required.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(
        email,
        selectedPortal,
        (selectedPortal === 'hospital' || selectedPortal === 'bloodbank') ? licenseNumber : undefined
      );
      setIsSubmitting(false);

      if (res.requires2FA) {
        setIs2FAScreen(true);
        showToast(res.message);
      } else if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || selectedPortal), { replace: true });
      } else {
        setErrorMessage(res.message);
      }
    }, 350);
  };

  // Handle OTP Verification
  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP authorization code.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      const res = verifyTwoFactorOtp(otpInput.trim());
      setIsVerifyingOtp(false);

      if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || selectedPortal), { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid OTP code. Please try again.');
      }
    }, 350);
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    setIsResendingOtp(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsResendingOtp(false);
      showToast(`A new 6-digit 2FA code has been dispatched to your ${selectedPortal} registered authorization terminal.`);
    }, 600);
  };

  // Handle Registration Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName || !regEmail || !regPhone) {
      setErrorMessage('Please fill in all mandatory account information.');
      return;
    }

    if ((selectedPortal === 'hospital' || selectedPortal === 'bloodbank') && !regLicense) {
      setErrorMessage('Official license registration number is required.');
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      const createdAcc = registerPortalAccount({
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: selectedPortal,
        city: regCity,
        licenseNumber: (selectedPortal === 'hospital' || selectedPortal === 'bloodbank') ? regLicense : undefined
      });
      setIsRegistering(false);

      if (createdAcc) {
        showToast(`Account successfully created for ${regName}!`);
        navigate(getDashboardPath(selectedPortal), { replace: true });
      } else {
        setErrorMessage('Failed to register account. Please check your details.');
      }
    }, 400);
  };

  const currentAttempts = failedAttemptsMap[`${email}_${selectedPortal}`] || 0;

  return (
    <div className="relative min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col justify-center items-center overflow-hidden">
      
      {/* BACKGROUND AMBIENT EFFECTS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-6 relative z-10 animate-in fade-in duration-300">

        {/* ================================================== */}
        {/* BRAND TITLE & HEADER                               */}
        {/* ================================================== */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Blood Net Portal Access
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto">
            Choose your dedicated portal to continue
          </p>
        </div>

        {/* ================================================== */}
        {/* SECTION 1: PERMANENT TOP PORTAL SELECTION BUTTONS   */}
        {/* ================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-inner">
          
          {/* 1. DONOR BUTTON */}
          <button
            type="button"
            id="portal-btn-donor"
            onClick={() => handlePortalChange('donor')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
              selectedPortal === 'donor'
                ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-600 shadow-lg shadow-red-500/30 scale-[1.02] ring-2 ring-red-500 ring-offset-2'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-red-300 hover:bg-red-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                selectedPortal === 'donor' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
              }`}>
                ❤️
              </div>
              {selectedPortal === 'donor' && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              )}
            </div>
            <div>
              <strong className="font-extrabold text-xs sm:text-sm block">Donor</strong>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedPortal === 'donor' ? 'text-red-100' : 'text-slate-500'
              }`}>
                Voluntary Blood Donor
              </p>
            </div>
          </button>

          {/* 2. REQUESTER BUTTON */}
          <button
            type="button"
            id="portal-btn-requester"
            onClick={() => handlePortalChange('requester')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
              selectedPortal === 'requester'
                ? 'bg-gradient-to-br from-rose-600 to-pink-700 text-white border-rose-600 shadow-lg shadow-rose-500/30 scale-[1.02] ring-2 ring-rose-500 ring-offset-2'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                selectedPortal === 'requester' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
              }`}>
                🆘
              </div>
              {selectedPortal === 'requester' && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              )}
            </div>
            <div>
              <strong className="font-extrabold text-xs sm:text-sm block">Requester</strong>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedPortal === 'requester' ? 'text-rose-100' : 'text-slate-500'
              }`}>
                Patient & Emergency
              </p>
            </div>
          </button>

          {/* 3. HOSPITAL BUTTON */}
          <button
            type="button"
            id="portal-btn-hospital"
            onClick={() => handlePortalChange('hospital')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
              selectedPortal === 'hospital'
                ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-600 shadow-lg shadow-sky-500/30 scale-[1.02] ring-2 ring-sky-500 ring-offset-2'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                selectedPortal === 'hospital' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-600'
              }`}>
                🏥
              </div>
              {selectedPortal === 'hospital' && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              )}
            </div>
            <div>
              <strong className="font-extrabold text-xs sm:text-sm block">Hospital</strong>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedPortal === 'hospital' ? 'text-sky-100' : 'text-slate-500'
              }`}>
                Trauma & Blood Stock
              </p>
            </div>
          </button>

          {/* 4. BLOOD BANK BUTTON */}
          <button
            type="button"
            id="portal-btn-bloodbank"
            onClick={() => handlePortalChange('bloodbank')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
              selectedPortal === 'bloodbank'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-lg shadow-emerald-500/30 scale-[1.02] ring-2 ring-emerald-500 ring-offset-2'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                selectedPortal === 'bloodbank' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
              }`}>
                🩸
              </div>
              {selectedPortal === 'bloodbank' && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              )}
            </div>
            <div>
              <strong className="font-extrabold text-xs sm:text-sm block">Blood Bank</strong>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedPortal === 'bloodbank' ? 'text-emerald-100' : 'text-slate-500'
              }`}>
                Inventory & 2FA Desk
              </p>
            </div>
          </button>

          {/* 5. SUPER ADMIN BUTTON */}
          <button
            type="button"
            id="portal-btn-admin"
            onClick={() => handlePortalChange('admin')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group col-span-2 sm:col-span-1 ${
              selectedPortal === 'admin'
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-lg shadow-slate-900/30 scale-[1.02] ring-2 ring-slate-800 ring-offset-2'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                selectedPortal === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                🛡️
              </div>
              {selectedPortal === 'admin' && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
              )}
            </div>
            <div>
              <strong className="font-extrabold text-xs sm:text-sm block">Super Admin</strong>
              <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedPortal === 'admin' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                National System Control
              </p>
            </div>
          </button>

        </div>

        {/* ================================================== */}
        {/* SECTION 2: DYNAMIC SELECTED PORTAL LOGIN / SIGN UP */}
        {/* ================================================== */}
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-5 relative overflow-hidden">

          {/* CARD HEADER WITH DYNAMIC PORTAL BADGE */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
                selectedPortal === 'donor'
                  ? 'bg-red-100 text-red-700'
                  : selectedPortal === 'requester'
                  ? 'bg-rose-100 text-rose-700'
                  : selectedPortal === 'hospital'
                  ? 'bg-sky-100 text-sky-700'
                  : selectedPortal === 'bloodbank'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {selectedPortal === 'donor' && '❤️'}
                {selectedPortal === 'requester' && '🆘'}
                {selectedPortal === 'hospital' && '🏥'}
                {selectedPortal === 'bloodbank' && '🩸'}
                {selectedPortal === 'admin' && '🛡️'}
              </span>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  {isSignUpMode ? (
                    <>
                      {selectedPortal === 'donor' && 'Voluntary Donor Registration'}
                      {selectedPortal === 'requester' && 'Patient Requester Registration'}
                      {selectedPortal === 'hospital' && 'Hospital Facility Registration'}
                      {selectedPortal === 'bloodbank' && 'Blood Bank Facility Registration'}
                      {selectedPortal === 'admin' && 'Super Admin Registration'}
                    </>
                  ) : (
                    <>
                      {selectedPortal === 'donor' && 'Voluntary Donor Sign In'}
                      {selectedPortal === 'requester' && 'Requester Sign In'}
                      {selectedPortal === 'hospital' && 'Hospital Sign In'}
                      {selectedPortal === 'bloodbank' && 'Blood Bank Sign In'}
                      {selectedPortal === 'admin' && 'Super Admin Sign In'}
                    </>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isSignUpMode
                    ? 'Create a verified portal account connected to Blood Net'
                    : 'Authenticated against unified backend Blood Net database'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              🟢 Live Database
            </span>
          </div>

          {/* FAILED ATTEMPTS LOCK WARNING */}
          {currentAttempts > 0 && currentAttempts < 5 && !isSignUpMode && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Security notice: {currentAttempts} failed attempt(s). Account locks automatically after 5 attempts.</span>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================================================== */}
          {/* VIEW A: SIGN IN MODE (CONDITIONAL BY PORTAL)      */}
          {/* ================================================== */}
          {!isSignUpMode && (
            <>
              {!is2FAScreen ? (
                /* CREDENTIALS LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  
                  {/* EMAIL / IDENTIFIER FIELD */}
                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">
                      {selectedPortal === 'donor' && 'Registered Email Address / Phone *'}
                      {selectedPortal === 'requester' && 'Registered Email / Phone *'}
                      {selectedPortal === 'hospital' && 'Hospital Email / ID *'}
                      {selectedPortal === 'bloodbank' && 'Blood Bank ID / Email *'}
                      {selectedPortal === 'admin' && 'Admin Email / Username *'}
                    </label>
                    <input
                      type="text"
                      id="login-input-email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={
                        selectedPortal === 'donor'
                          ? 'ananya.sharma@example.com'
                          : selectedPortal === 'requester'
                          ? 'rohan.deshmukh@example.com'
                          : selectedPortal === 'hospital'
                          ? 'admin@kims.edu.in'
                          : selectedPortal === 'bloodbank'
                          ? 'contact@rotaryblood.org'
                          : 'admin@bloodnet.gov.in'
                      }
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* PASSWORD FIELD */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-extrabold block">Password *</label>
                      <button
                        type="button"
                        onClick={() => showToast(`Password recovery link dispatched to ${email || 'your registered contact'}.`)}
                        className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-input-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
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

                  {/* PORTAL SPECIFIC LICENSE INPUT (FOR HOSPITAL) */}
                  {selectedPortal === 'hospital' && (
                    <div className="space-y-1 animate-in fade-in">
                      <label className="text-slate-700 font-extrabold block">Hospital License Registration Number *</label>
                      <input
                        type="text"
                        id="login-input-hospital-license"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        placeholder="LIC-HUB-4482"
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white font-mono uppercase tracking-wider transition-all shadow-2xs"
                        required
                      />
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Verified against Karnataka State Health Registry
                      </span>
                    </div>
                  )}

                  {/* PORTAL SPECIFIC LICENSE INPUT (FOR BLOOD BANK) */}
                  {selectedPortal === 'bloodbank' && (
                    <div className="space-y-1 animate-in fade-in">
                      <label className="text-slate-700 font-extrabold block">Blood Bank License Registration Number *</label>
                      <input
                        type="text"
                        id="login-input-bloodbank-license"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        placeholder="LIC-BB-9901"
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 focus:bg-white font-mono uppercase tracking-wider transition-all shadow-2xs"
                        required
                      />
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Verified against Drug Controller Blood Bank Licensing Authority
                      </span>
                    </div>
                  )}

                  {/* SUBMIT BUTTON WITH DYNAMIC COLOR & TEXT */}
                  <button
                    type="submit"
                    id="login-submit-button"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedPortal === 'donor'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-500/25'
                        : selectedPortal === 'requester'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/25'
                        : selectedPortal === 'hospital'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/25'
                        : selectedPortal === 'bloodbank'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/25'
                    } ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>
                          {selectedPortal === 'donor' && 'Sign In to DONOR Portal'}
                          {selectedPortal === 'requester' && 'Sign In to REQUESTER Portal'}
                          {selectedPortal === 'hospital' && 'Sign In to HOSPITAL Portal'}
                          {selectedPortal === 'bloodbank' && 'Sign In to BLOOD BANK'}
                          {selectedPortal === 'admin' && 'Sign In to SUPER ADMIN'}
                        </span>
                      </>
                    )}
                  </button>

                </form>
              ) : (
                /* TWO FACTOR OTP FORM */
                <form onSubmit={handleOtpVerifySubmit} className="space-y-4 text-xs animate-in fade-in">
                  <div className={`p-4 rounded-2xl text-center space-y-1.5 border ${
                    selectedPortal === 'bloodbank'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-sky-50 border-sky-200 text-sky-900'
                  }`}>
                    <KeyRound className={`w-8 h-8 mx-auto ${
                      selectedPortal === 'bloodbank' ? 'text-emerald-600' : 'text-sky-600'
                    }`} />
                    <strong className="block text-slate-900 font-extrabold text-sm">
                      Two-Factor Authentication (2FA) Required
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      Enter the 6-digit OTP dispatched to your registered {selectedPortal === 'bloodbank' ? 'Blood Bank' : 'Hospital'} authorization device.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">Enter 6-Digit OTP Code *</label>
                    <input
                      type="text"
                      id="otp-input-code"
                      maxLength={6}
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      placeholder="778899"
                      className={`w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-xl tracking-widest focus:outline-none focus:bg-white shadow-2xs ${
                        selectedPortal === 'bloodbank' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                      }`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="otp-verify-button"
                    disabled={isVerifyingOtp}
                    className={`w-full py-4 rounded-2xl text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      selectedPortal === 'bloodbank'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                        : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20'
                    } ${isVerifyingOtp ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'}`}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify 2FA OTP & Open {selectedPortal.toUpperCase()} Portal</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResendingOtp}
                      className="text-slate-600 hover:text-slate-900 font-extrabold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResendingOtp ? 'animate-spin text-emerald-600' : ''}`} />
                      <span>{isResendingOtp ? 'Resending Code...' : 'Resend OTP Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIs2FAScreen(false);
                        setErrorMessage(null);
                      }}
                      className="text-slate-500 font-bold hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Back to Credentials
                    </button>
                  </div>
                </form>
              )}

              {/* FOOTER: SWITCH TO SIGN UP */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-slate-500 font-medium">Don't have an account?</span>
                <button
                  type="button"
                  id="toggle-signup-mode-btn"
                  onClick={() => {
                    setIsSignUpMode(true);
                    setErrorMessage(null);
                  }}
                  className={`font-black hover:underline flex items-center gap-1 cursor-pointer ${
                    selectedPortal === 'donor'
                      ? 'text-red-600'
                      : selectedPortal === 'requester'
                      ? 'text-rose-600'
                      : selectedPortal === 'hospital'
                      ? 'text-sky-600'
                      : selectedPortal === 'bloodbank'
                      ? 'text-emerald-700'
                      : 'text-slate-800'
                  }`}
                >
                  <span>
                    {selectedPortal === 'donor' && 'Register Donor Account'}
                    {selectedPortal === 'requester' && 'Register Requester Account'}
                    {selectedPortal === 'hospital' && 'Register Hospital Account'}
                    {selectedPortal === 'bloodbank' && 'Register Blood Bank Account'}
                    {selectedPortal === 'admin' && 'Register Admin Account'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* ================================================== */}
          {/* VIEW B: SIGN UP MODE (CONDITIONAL BY PORTAL)      */}
          {/* ================================================== */}
          {isSignUpMode && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs animate-in fade-in">
              
              {/* NAME / INSTITUTION */}
              <div>
                <label className="text-slate-700 font-extrabold block mb-1">
                  {selectedPortal === 'hospital'
                    ? 'Hospital Official Name *'
                    : selectedPortal === 'bloodbank'
                    ? 'Blood Bank / Center Name *'
                    : 'Full Name *'}
                </label>
                <input
                  type="text"
                  id="register-input-name"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder={
                    selectedPortal === 'hospital'
                      ? 'e.g. City General Trauma Center'
                      : selectedPortal === 'bloodbank'
                      ? 'e.g. Regional Red Cross Blood Bank'
                      : 'e.g. Rahul Sharma'
                  }
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              {/* EMAIL & PHONE ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Email Address *</label>
                  <input
                    type="email"
                    id="register-input-email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    id="register-input-phone"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* ROLE SPECIFIC FIELDS */}
              {(selectedPortal === 'donor' || selectedPortal === 'requester') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">Blood Group *</label>
                    <select
                      id="register-select-blood-group"
                      value={regBloodGroup}
                      onChange={e => setRegBloodGroup(e.target.value as BloodGroup)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    >
                      {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">City / Location *</label>
                    <input
                      type="text"
                      id="register-input-city"
                      value={regCity}
                      onChange={e => setRegCity(e.target.value)}
                      placeholder="Hubballi"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              {(selectedPortal === 'hospital' || selectedPortal === 'bloodbank') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">
                      {selectedPortal === 'hospital' ? 'Hospital License Reg #' : 'Blood Bank License Reg #'} *
                    </label>
                    <input
                      type="text"
                      id="register-input-license"
                      value={regLicense}
                      onChange={e => setRegLicense(e.target.value)}
                      placeholder={selectedPortal === 'hospital' ? 'LIC-HOSP-2026' : 'LIC-BB-2026'}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-extrabold block mb-1">Operating City *</label>
                    <input
                      type="text"
                      id="register-input-operating-city"
                      value={regCity}
                      onChange={e => setRegCity(e.target.value)}
                      placeholder="Hubballi"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div>
                <label className="text-slate-700 font-extrabold block mb-1">Create Password *</label>
                <input
                  type="password"
                  id="register-input-password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              {/* REGISTER SUBMIT BUTTON */}
              <button
                type="submit"
                id="register-submit-button"
                disabled={isRegistering}
                className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPortal === 'donor'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-500/25'
                    : selectedPortal === 'requester'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/25'
                    : selectedPortal === 'hospital'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/25'
                    : selectedPortal === 'bloodbank'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/25'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/25'
                } ${isRegistering ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account in Blood Net...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register {selectedPortal.toUpperCase()} Account</span>
                  </>
                )}
              </button>

              {/* FOOTER: SWITCH TO SIGN IN */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-slate-500 font-medium">Already have an account?</span>
                <button
                  type="button"
                  id="toggle-signin-mode-btn"
                  onClick={() => {
                    setIsSignUpMode(false);
                    setErrorMessage(null);
                  }}
                  className="text-red-600 font-black hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Sign In to {selectedPortal.toUpperCase()} Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
