import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
  LogIn,
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
  ShieldCheck,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  FileText
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
  const params = useParams<{ portal?: string }>();

  // Determine initial active portal from prop, route params, or URL path
  const getInitialPortal = (): PortalType => {
    if (initialPortal) return initialPortal;
    const path = location.pathname.toLowerCase();
    if (path.includes('/login/bloodbank') || path.includes('/bloodbank')) return 'bloodbank';
    if (path.includes('/login/hospital') || path.includes('/hospital')) return 'hospital';
    if (path.includes('/login/requester') || path.includes('/requester')) return 'requester';
    if (path.includes('/login/admin') || path.includes('/admin')) return 'admin';
    if (path.includes('/login/donor') || path.includes('/donor')) return 'donor';
    if (params.portal && ['donor', 'requester', 'hospital', 'bloodbank', 'admin'].includes(params.portal)) {
      return params.portal as PortalType;
    }
    return 'donor';
  };

  // Section 1: Active portal state
  const [activePortalTab, setActivePortalTab] = useState<PortalType>(getInitialPortal());

  // Section 2: Mode ('signin' | 'signup')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form States
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 2FA OTP State
  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Sign Up Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regCity, setRegCity] = useState('Hubballi');
  const [regLicense, setRegLicense] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Synchronize credentials when portal tab changes
  const applyPortalCredentials = (portal: PortalType) => {
    setActivePortalTab(portal);
    setLoginError(null);
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

  const handlePortalSelect = (portal: PortalType) => {
    applyPortalCredentials(portal);
  };

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter your email and password.');
      return;
    }

    if ((activePortalTab === 'hospital' || activePortalTab === 'bloodbank') && !licenseNumber) {
      setLoginError(`Please enter your registered ${activePortalTab === 'hospital' ? 'Hospital' : 'Blood Bank'} License Number.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(
        email,
        activePortalTab as UserRole,
        (activePortalTab === 'hospital' || activePortalTab === 'bloodbank') ? licenseNumber : undefined
      );
      setIsSubmitting(false);

      if (res.requires2FA) {
        setIs2FAScreen(true);
        showToast(res.message);
      } else if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || (activePortalTab as UserRole)), { replace: true });
      } else {
        setLoginError(res.message);
      }
    }, 400);
  };

  // Handle 2FA OTP verification
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
        navigate(getDashboardPath(res.userRole || (activePortalTab as UserRole)), { replace: true });
      } else {
        setLoginError(res.message || 'Invalid OTP code. Please try again.');
      }
    }, 400);
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    setIsResendingOtp(true);
    setLoginError(null);
    setTimeout(() => {
      setIsResendingOtp(false);
      showToast('A new 6-digit 2FA OTP has been dispatched to your authorized device.');
    }, 500);
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setLoginError('Please fill in all required registration fields.');
      return;
    }

    if ((activePortalTab === 'hospital' || activePortalTab === 'bloodbank') && !regLicense) {
      setLoginError('License Registration Number is required.');
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      const createdAcc = registerPortalAccount({
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: activePortalTab as UserRole,
        city: regCity,
        licenseNumber: (activePortalTab === 'hospital' || activePortalTab === 'bloodbank') ? regLicense : undefined
      });
      setIsRegistering(false);

      if (createdAcc) {
        showToast(`Registration successful for ${regName}!`);
        navigate(getDashboardPath(activePortalTab as UserRole), { replace: true });
      } else {
        setLoginError('Could not complete registration. Please try again.');
      }
    }, 400);
  };

  const currentAttempts = failedAttemptsMap[`${email}_${activePortalTab}`] || 0;

  // Portal button metadata
  const portalList: { id: PortalType; label: string; icon: string; desc: string; color: string; activeClasses: string }[] = [
    {
      id: 'donor',
      label: 'Donor',
      icon: '❤️',
      desc: 'Donate blood & respond to emergency requests',
      color: 'red',
      activeClasses: 'bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-600 shadow-lg shadow-red-500/25 ring-2 ring-red-400'
    },
    {
      id: 'requester',
      label: 'Requester',
      icon: '🆘',
      desc: 'Create & track patient emergency blood requests',
      color: 'rose',
      activeClasses: 'bg-gradient-to-br from-rose-600 to-pink-700 text-white border-rose-600 shadow-lg shadow-rose-500/25 ring-2 ring-rose-400'
    },
    {
      id: 'hospital',
      label: 'Hospital',
      icon: '🏥',
      desc: 'Manage patient requests & hospital blood stock',
      color: 'sky',
      activeClasses: 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-600 shadow-lg shadow-sky-500/25 ring-2 ring-sky-400'
    },
    {
      id: 'bloodbank',
      label: 'Blood Bank',
      icon: '🩸',
      desc: 'Manage inventory, blood units & 2FA access',
      color: 'emerald',
      activeClasses: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
    },
    {
      id: 'admin',
      label: 'Super Admin',
      icon: '🛡️',
      desc: 'System-wide control, approvals & monitoring',
      color: 'slate',
      activeClasses: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-lg shadow-slate-900/25 ring-2 ring-slate-600'
    }
  ];

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col justify-center items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10 animate-in fade-in duration-300">
        {/* ================================================== */}
        {/* BRAND TITLE & HEADER                               */}
        {/* ================================================== */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Blood Net Portal Access
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto">
            Choose your dedicated portal to continue
          </p>
        </div>

        {/* ================================================== */}
        {/* SECTION 1: PERMANENT TOP PORTAL SELECTION BUTTONS  */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {portalList.map((p) => {
            const isActive = activePortalTab === p.id;
            return (
              <button
                key={p.id}
                type="button"
                id={`portal-btn-${p.id}`}
                onClick={() => handlePortalSelect(p.id)}
                className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isActive
                    ? p.activeClasses
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.icon}
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <strong className="font-extrabold text-sm block">
                    {p.label}
                  </strong>
                  <p
                    className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${
                      isActive ? 'text-white/90' : 'text-slate-500'
                    }`}
                  >
                    {p.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================== */}
        {/* SECTION 2: SELECTED PORTAL LOGIN / SIGN UP BELOW   */}
        {/* ONLY ONE CARD/FORM IS RENDERED CONDITIONALLY       */}
        {/* ================================================== */}
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 relative overflow-hidden transition-all">
          {/* HEADER BADGE FOR THE CURRENTLY SELECTED PORTAL */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
                  activePortalTab === 'donor'
                    ? 'bg-red-100 text-red-700'
                    : activePortalTab === 'requester'
                    ? 'bg-rose-100 text-rose-700'
                    : activePortalTab === 'hospital'
                    ? 'bg-sky-100 text-sky-700'
                    : activePortalTab === 'bloodbank'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {activePortalTab === 'donor' && '❤️'}
                {activePortalTab === 'requester' && '🆘'}
                {activePortalTab === 'hospital' && '🏥'}
                {activePortalTab === 'bloodbank' && '🩸'}
                {activePortalTab === 'admin' && '🛡️'}
              </span>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {authMode === 'signin' ? (
                    <>
                      {activePortalTab === 'donor' && 'Voluntary Donor Sign In'}
                      {activePortalTab === 'requester' && 'Requester Sign In'}
                      {activePortalTab === 'hospital' && 'Hospital Sign In'}
                      {activePortalTab === 'bloodbank' && 'Blood Bank Sign In'}
                      {activePortalTab === 'admin' && 'Super Admin Sign In'}
                    </>
                  ) : (
                    <>
                      {activePortalTab === 'donor' && 'Register Voluntary Donor Account'}
                      {activePortalTab === 'requester' && 'Register Requester Account'}
                      {activePortalTab === 'hospital' && 'Register Hospital Facility Account'}
                      {activePortalTab === 'bloodbank' && 'Register Blood Bank Facility Account'}
                      {activePortalTab === 'admin' && 'Register Administrator Account'}
                    </>
                  )}
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  {authMode === 'signin'
                    ? 'Authenticated securely with Blood Net backend & role verification'
                    : 'Create verified portal credentials'}
                </span>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              🟢 SECURE SSL
            </span>
          </div>

          {/* FAILED ATTEMPTS WARNING */}
          {currentAttempts > 0 && currentAttempts < 5 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Warning: {currentAttempts} failed attempt(s). Account locks automatically after 5 failed attempts.
              </span>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* ================================================== */}
          {/* AUTHENTICATION CONTENT (SIGN IN vs SIGN UP vs OTP) */}
          {/* ================================================== */}

          {authMode === 'signin' ? (
            !is2FAScreen ? (
              /* STANDARD SIGN IN FORM FOR SELECTED PORTAL */
              <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">
                    {activePortalTab === 'donor' && 'Registered Email Address / Phone *'}
                    {activePortalTab === 'requester' && 'Registered Email / Phone *'}
                    {activePortalTab === 'hospital' && 'Hospital Email / ID *'}
                    {activePortalTab === 'bloodbank' && 'Blood Bank ID / Email *'}
                    {activePortalTab === 'admin' && 'Admin Email / Username *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activePortalTab === 'hospital'
                          ? 'admin@kims.edu.in'
                          : activePortalTab === 'bloodbank'
                          ? 'contact@rotaryblood.org'
                          : activePortalTab === 'admin'
                          ? 'admin@bloodnet.gov.in'
                          : activePortalTab === 'requester'
                          ? 'rohan.deshmukh@example.com'
                          : 'ananya.sharma@example.com'
                      }
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-extrabold block">Password *</label>
                    <button
                      type="button"
                      onClick={() => showToast('Password reset instructions dispatched to your registered email.')}
                      className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* HOSPITAL / BLOOD BANK LICENSE REGISTRATION NUMBER */}
                {(activePortalTab === 'hospital' || activePortalTab === 'bloodbank') && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="text-slate-700 font-extrabold block">
                      {activePortalTab === 'hospital'
                        ? 'Hospital License Registration Number *'
                        : 'Blood Bank License Registration Number *'}
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder={activePortalTab === 'hospital' ? 'e.g. LIC-HUB-4482' : 'e.g. LIC-BB-9901'}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-mono uppercase"
                      required
                    />
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Verified against State Health Authority records
                    </span>
                  </div>
                )}

                {/* SIGN IN SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activePortalTab === 'hospital'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/20'
                      : activePortalTab === 'bloodbank'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/20'
                      : activePortalTab === 'admin'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                      : activePortalTab === 'requester'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/20'
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
                      <span>
                        {activePortalTab === 'donor' && 'Sign In to DONOR Portal'}
                        {activePortalTab === 'requester' && 'Sign In to REQUESTER Portal'}
                        {activePortalTab === 'hospital' && 'Sign In to HOSPITAL Portal'}
                        {activePortalTab === 'bloodbank' && 'Sign In to BLOOD BANK'}
                        {activePortalTab === 'admin' && 'Sign In to SUPER ADMIN'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* 2FA OTP SCREEN (HOSPITAL / BLOOD BANK) */
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-1">
                  <KeyRound className="w-8 h-8 text-sky-600 mx-auto" />
                  <strong className="block text-slate-900 font-extrabold text-sm">
                    Two-Factor Authentication (2FA) Required
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Enter the 6-digit OTP code dispatched to your registered authorization device.
                  </p>
                </div>

                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Enter 6-Digit OTP Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-xl tracking-widest focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FAScreen(false);
                      setLoginError(null);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back to Credentials
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendingOtp}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResendingOtp ? 'animate-spin' : ''}`} />
                    Resend 2FA Code
                  </button>
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
                      <span>Verify OTP & Open {activePortalTab.toUpperCase()} Portal</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            /* ================================================== */
            /* PORTAL-SPECIFIC REGISTRATION / SIGN UP FORM        */
            /* ================================================== */
            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs animate-in fade-in">
              <div>
                <label className="text-slate-700 font-extrabold block mb-1">
                  {activePortalTab === 'hospital'
                    ? 'Hospital Official Name *'
                    : activePortalTab === 'bloodbank'
                    ? 'Blood Bank Center Name *'
                    : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={
                    activePortalTab === 'hospital'
                      ? 'e.g. City General Hospital'
                      : activePortalTab === 'bloodbank'
                      ? 'e.g. Red Cross Blood Center'
                      : 'e.g. Rajesh Kumar'
                  }
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* DONOR BLOOD GROUP SELECTION */}
              {activePortalTab === 'donor' && (
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Blood Group *</label>
                  <select
                    value={regBloodGroup}
                    onChange={(e) => setRegBloodGroup(e.target.value as BloodGroup)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                  >
                    {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* HOSPITAL / BLOOD BANK LICENSE REGISTRATION NUMBER */}
              {(activePortalTab === 'hospital' || activePortalTab === 'bloodbank') && (
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">
                    {activePortalTab === 'hospital'
                      ? 'Hospital License Number *'
                      : 'Blood Bank License Number *'}
                  </label>
                  <input
                    type="text"
                    value={regLicense}
                    onChange={(e) => setRegLicense(e.target.value)}
                    placeholder={activePortalTab === 'hospital' ? 'LIC-HOSP-XXXX' : 'LIC-BB-XXXX'}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all font-mono uppercase"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">City / Region *</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Hubballi"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Password *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Register {activePortalTab.toUpperCase()} Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================== */}
          {/* SWITCH BETWEEN SIGN IN AND SIGN UP (IN PLACE)      */}
          {/* ================================================== */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {authMode === 'signin' ? (
              <>
                <span className="text-slate-500 font-medium">Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setLoginError(null);
                  }}
                  className="text-red-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Register {activePortalTab === 'donor' && 'Donor Account'}
                  {activePortalTab === 'requester' && 'Requester Account'}
                  {activePortalTab === 'hospital' && 'Hospital Account'}
                  {activePortalTab === 'bloodbank' && 'Blood Bank Account'}
                  {activePortalTab === 'admin' && 'Portal Account'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="text-slate-500 font-medium">Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setLoginError(null);
                  }}
                  className="text-red-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to {activePortalTab.toUpperCase()} Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
