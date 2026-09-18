import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
  LogIn,
  Building2,
  Droplet,
  Lock,
  AlertCircle,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Heart,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Activity,
  HeartPulse,
  Users,
  Shield
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

  // Determine active portal from prop, route params, or URL path
  const getSelectedPortal = (): PortalType | null => {
    if (initialPortal) return initialPortal;
    const path = location.pathname.toLowerCase();
    if (path === '/login/bloodbank' || path.includes('/bloodbank')) return 'bloodbank';
    if (path === '/login/hospital' || path.includes('/hospital')) return 'hospital';
    if (path === '/login/requester' || path.includes('/requester')) return 'requester';
    if (path === '/login/admin' || path.includes('/admin')) return 'admin';
    if (path === '/login/donor' || path.includes('/donor')) return 'donor';
    if (params.portal && ['donor', 'requester', 'hospital', 'bloodbank', 'admin'].includes(params.portal)) {
      return params.portal as PortalType;
    }
    // If exact /login or root login, return null so portal selection 2x2 grid is displayed
    return null;
  };

  const selectedPortal = getSelectedPortal();

  // Active portal tab when inside a portal (default to 'donor' if inside donor/requester portal)
  const [activePortalTab, setActivePortalTab] = useState<PortalType>(selectedPortal || 'donor');

  // Sub-role toggle for Donor & Requester combined view
  const [donorRequesterSubRole, setDonorRequesterSubRole] = useState<'donor' | 'requester'>(
    selectedPortal === 'requester' ? 'requester' : 'donor'
  );

  // Mode ('signin' | 'signup')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form States
  const [email, setEmail] = useState('');
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

  // Sync credentials when selectedPortal changes
  useEffect(() => {
    const portal = getSelectedPortal();
    if (portal) {
      setActivePortalTab(portal);
      if (portal === 'requester') {
        setDonorRequesterSubRole('requester');
      } else if (portal === 'donor') {
        setDonorRequesterSubRole('donor');
      }
      applyPortalCredentials(portal);
    }
  }, [location.pathname, initialPortal]);

  const applyPortalCredentials = (portal: PortalType) => {
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

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const effectiveRole: UserRole =
      (selectedPortal as UserRole) || (activePortalTab as UserRole);

    if (!email || !password) {
      setLoginError('Please enter your email and password.');
      return;
    }

    if ((effectiveRole === 'hospital' || effectiveRole === 'bloodbank') && !licenseNumber) {
      setLoginError(`Please enter your registered ${effectiveRole === 'hospital' ? 'Hospital' : 'Blood Bank'} License Number.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(
        email,
        effectiveRole,
        (effectiveRole === 'hospital' || effectiveRole === 'bloodbank') ? licenseNumber : undefined
      );
      setIsSubmitting(false);

      if (res.requires2FA) {
        setIs2FAScreen(true);
        showToast(res.message);
      } else if (res.success) {
        showToast(res.message);
        navigate(getDashboardPath(res.userRole || effectiveRole), { replace: true });
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

    const effectiveRole: UserRole =
      (selectedPortal as UserRole) || (activePortalTab as UserRole);

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setLoginError('Please fill in all required registration fields.');
      return;
    }

    if ((effectiveRole === 'hospital' || effectiveRole === 'bloodbank') && !regLicense) {
      setLoginError('License Registration Number is required.');
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      const createdAcc = registerPortalAccount({
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: effectiveRole,
        city: regCity,
        licenseNumber: (effectiveRole === 'hospital' || effectiveRole === 'bloodbank') ? regLicense : undefined
      });
      setIsRegistering(false);

      if (createdAcc) {
        showToast(`Registration successful for ${regName}!`);
        navigate(getDashboardPath(effectiveRole), { replace: true });
      } else {
        setLoginError('Could not complete registration. Please try again.');
      }
    }, 400);
  };

  const currentAttempts = failedAttemptsMap[`${email}_${activePortalTab}`] || 0;

  // 5 Portal Cards Metadata
  const portalCards = [
    {
      id: 'donor',
      title: 'Donor Portal',
      desc: 'Donate blood and help save lives.',
      route: '/login/donor',
      icon: Heart,
      accent: 'red',
      tag: 'Voluntary Donors',
      iconBg: 'bg-red-50 text-red-600 border-red-100',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      cardHover: 'hover:border-red-200 hover:shadow-red-500/5 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/20',
      buttonClasses: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-sm shadow-red-500/20 group-hover:translate-x-0.5'
    },
    {
      id: 'requester',
      title: 'Requester Portal',
      desc: 'Request blood for patients and those in need.',
      route: '/login/requester',
      icon: Users,
      accent: 'rose',
      tag: 'Patient Requesters',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      cardHover: 'hover:border-rose-200 hover:shadow-rose-500/5 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/20',
      buttonClasses: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-sm shadow-rose-500/20 group-hover:translate-x-0.5'
    },
    {
      id: 'hospital',
      title: 'Hospital Portal',
      desc: 'Manage patient blood requests, hospital stock and blood operations.',
      route: '/login/hospital',
      icon: Building2,
      accent: 'blue',
      tag: 'Trauma & Operations',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/60',
      cardHover: 'hover:border-sky-200 hover:shadow-sky-500/5 hover:bg-gradient-to-b hover:from-white hover:to-sky-50/20',
      buttonClasses: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sm shadow-sky-500/20 group-hover:translate-x-0.5'
    },
    {
      id: 'bloodbank',
      title: 'Blood Bank Portal',
      desc: 'Manage blood inventory, requests, blood units and availability.',
      route: '/login/bloodbank',
      icon: Droplet,
      accent: 'green',
      tag: 'Inventory & 2FA',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      cardHover: 'hover:border-emerald-200 hover:shadow-emerald-500/5 hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/20',
      buttonClasses: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-500/20 group-hover:translate-x-0.5'
    },
    {
      id: 'admin',
      title: 'Super Admin',
      desc: 'Manage and monitor the BloodNet system.',
      route: '/login/admin',
      icon: Shield,
      accent: 'amber',
      tag: 'Governance & Security',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/60',
      cardHover: 'hover:border-amber-200 hover:shadow-amber-500/5 hover:bg-gradient-to-b hover:from-white hover:to-amber-50/20',
      buttonClasses: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-sm shadow-amber-500/20 group-hover:translate-x-0.5'
    }
  ];

  return (
    <div className="relative min-h-[90vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 flex flex-col justify-center items-center overflow-hidden">
      
      {/* ================================================== */}
      {/* SUBTLE HEALTHCARE BACKGROUND VISUALS               */}
      {/* ================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Soft Medical Ambient Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-red-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />

        {/* Subtle Background SVG Pattern: Waves, ECG Line, Medical Crosses, Bubbles */}
        <svg
          className="absolute inset-0 w-full h-full text-sky-900/[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
          fill="none"
        >
          {/* Soft Medical Waves */}
          <path
            d="M0,200 C300,160 500,240 800,190 C1000,160 1150,220 1200,200 L1200,800 L0,800 Z"
            fill="currentColor"
            opacity="0.25"
          />

          {/* Subtle ECG Heartbeat Pulse Line */}
          <path
            d="M0,450 L380,450 L400,435 L415,480 L435,390 L455,470 L470,445 L485,450 L1200,450"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            opacity="0.8"
          />

          {/* Very Light Medical Cross Shapes */}
          <g opacity="0.6">
            <path d="M120,120 h40 v-15 h15 v15 h40 v15 h-40 v40 h-15 v-40 h-40 z" fill="currentColor" />
            <path d="M1020,140 h30 v-12 h12 v12 h30 v12 h-30 v30 h-12 v-30 h-30 z" fill="currentColor" />
            <path d="M180,620 h30 v-12 h12 v12 h30 v12 h-30 v30 h-12 v-30 h-30 z" fill="currentColor" />
            <path d="M1060,650 h36 v-14 h14 v14 h36 v14 h-36 v36 h-14 v-36 h-36 z" fill="currentColor" />
          </g>

          {/* Faint Medical Droplets & Bubbles */}
          <circle cx="280" cy="180" r="18" fill="currentColor" opacity="0.4" />
          <circle cx="310" cy="150" r="10" fill="currentColor" opacity="0.3" />
          <circle cx="890" cy="220" r="22" fill="currentColor" opacity="0.3" />
          <circle cx="930" cy="180" r="12" fill="currentColor" opacity="0.4" />
          <circle cx="680" cy="680" r="16" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      {/* ================================================== */}
      {/* MAIN CONTAINER                                     */}
      {/* ================================================== */}
      <div className="w-full max-w-4xl space-y-8 relative z-10 animate-in fade-in duration-300">
        
        {/* ================================================== */}
        {/* VIEW 1: PORTAL LOGIN SELECTION (CARDS GRID)        */}
        {/* Rendered when no individual portal is selected    */}
        {/* ================================================== */}
        {!selectedPortal ? (
          <div className="space-y-8">
            
            {/* BRAND HEADER */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <BloodNetLogo size="lg" showTagline={false} />
              </div>

              {/* Subtitle */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[#0F172A] text-xs font-bold tracking-wide">
                <HeartPulse className="w-3.5 h-3.5 text-red-600" />
                <span>Blood Management System</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight pt-1">
                Select Your Portal to Login
              </h1>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                Choose the appropriate portal to securely access BloodNet.
              </p>
            </div>

            {/* PORTAL CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
              {portalCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    id={`portal-card-${card.id}`}
                    onClick={() => navigate(card.route)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(card.route);
                      }
                    }}
                    className={`group relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 hover:-translate-y-0.5 ${card.cardHover}`}
                    aria-label={`Select ${card.title} to login or sign up`}
                  >
                    {/* Top Row: Medical Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}>
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeBg}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Portal Name & Short Description */}
                    <div className="space-y-1.5">
                      <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-sky-950 transition-colors">
                        {card.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                        {card.tag}
                      </span>

                      <button
                        type="button"
                        tabIndex={-1}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${card.buttonClasses}`}
                      >
                        <span>Login / Sign Up</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUPER ADMIN DESK FOOTER LINK */}
            <div className="text-center pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>BloodNet Multi-Tier Role-Based Security & 2FA Protected</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <button
                type="button"
                onClick={() => navigate('/login/admin')}
                className="text-slate-500 hover:text-amber-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin Portal Sign In →</span>
              </button>
            </div>

          </div>
        ) : (
          /* ================================================== */
          /* VIEW 2: PORTAL LOCK-IN AUTHENTICATION SCREEN       */
          /* Rendered when a specific portal is selected        */
          /* ================================================== */
          <div className="space-y-6">
            
            {/* TOP BAR: BACK TO PORTAL SELECTION & BRAND LOGO */}
            <div className="flex items-center justify-between max-w-xl mx-auto px-1">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer hover:scale-102"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Portal Selection</span>
              </button>

              <Link to="/" className="cursor-pointer">
                <BloodNetLogo size="sm" showTagline={false} />
              </Link>
            </div>

            {/* DEDICATED AUTHENTICATION CARD (LOCKED-IN) */}
            <div className="max-w-xl mx-auto p-7 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden transition-all">
              
              {/* PORTAL HEADER & STATUS */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs ${
                      selectedPortal === 'hospital'
                        ? 'bg-sky-50 text-sky-600 border border-sky-100'
                        : selectedPortal === 'bloodbank'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : selectedPortal === 'admin'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : selectedPortal === 'requester'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                  >
                    {selectedPortal === 'hospital' && <Building2 className="w-6 h-6" />}
                    {selectedPortal === 'bloodbank' && <Droplet className="w-6 h-6" />}
                    {selectedPortal === 'admin' && <Shield className="w-6 h-6" />}
                    {selectedPortal === 'requester' && <Users className="w-6 h-6" />}
                    {selectedPortal === 'donor' && <Heart className="w-6 h-6" />}
                  </div>

                  <div>
                    <h2 className="font-black text-lg sm:text-xl text-[#0F172A] leading-tight">
                      {selectedPortal === 'requester' ? (
                        authMode === 'signin' ? 'Requester Portal Sign In' : 'Requester Account Registration'
                      ) : selectedPortal === 'donor' ? (
                        authMode === 'signin' ? 'Donor Portal Sign In' : 'Donor Account Registration'
                      ) : selectedPortal === 'hospital' ? (
                        authMode === 'signin' ? 'Hospital Portal Sign In' : 'Hospital Account Registration'
                      ) : selectedPortal === 'bloodbank' ? (
                        authMode === 'signin' ? 'Blood Bank Portal Sign In' : 'Blood Bank Account Registration'
                      ) : (
                        'Super Admin Secure Sign In'
                      )}
                    </h2>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedPortal === 'requester'
                        ? 'Request blood for patients and those in need'
                        : selectedPortal === 'donor'
                        ? 'Voluntary blood donors network access'
                        : selectedPortal === 'hospital'
                        ? 'Authorized hospital trauma center access'
                        : selectedPortal === 'bloodbank'
                        ? 'Blood bank inventory operations & units management'
                        : 'National blood network governance & monitoring'}
                    </span>
                  </div>
                </div>

                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  🟢 256-BIT SSL
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
                        {selectedPortal === 'hospital'
                          ? 'Hospital Official Email / ID *'
                          : selectedPortal === 'bloodbank'
                          ? 'Blood Bank ID / Email *'
                          : selectedPortal === 'admin'
                          ? 'Super Admin Email / Username *'
                          : selectedPortal === 'requester'
                          ? 'Requester Registered Email / Phone *'
                          : 'Donor Registered Email / Phone *'}
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          selectedPortal === 'hospital'
                            ? 'admin@kims.edu.in'
                            : selectedPortal === 'bloodbank'
                            ? 'contact@rotaryblood.org'
                            : selectedPortal === 'admin'
                            ? 'admin@bloodnet.gov.in'
                            : selectedPortal === 'requester'
                            ? 'rohan.deshmukh@example.com'
                            : 'ananya.sharma@example.com'
                        }
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-extrabold block">Password *</label>
                        <button
                          type="button"
                          onClick={() => showToast('Password reset instructions dispatched to your registered email.')}
                          className="text-[11px] font-bold text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
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
                    {(selectedPortal === 'hospital' || selectedPortal === 'bloodbank') && (
                      <div className="space-y-1 animate-in fade-in">
                        <label className="text-slate-700 font-extrabold block">
                          {selectedPortal === 'hospital'
                            ? 'Hospital License Registration Number *'
                            : 'Blood Bank License Registration Number *'}
                        </label>
                        <input
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder={selectedPortal === 'hospital' ? 'e.g. LIC-HUB-4482' : 'e.g. LIC-BB-9901'}
                          className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-mono uppercase tracking-wider"
                          required
                        />
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Verified against State Health Authority and NBTC records
                        </span>
                      </div>
                    )}

                    {/* SIGN IN SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedPortal === 'hospital'
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/20'
                          : selectedPortal === 'bloodbank'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/20'
                          : selectedPortal === 'admin'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white shadow-amber-500/20'
                          : selectedPortal === 'requester'
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/20'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-500/20'
                      } ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing in to BloodNet...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>
                            {selectedPortal === 'hospital' && 'Sign In to Hospital Portal'}
                            {selectedPortal === 'bloodbank' && 'Sign In to Blood Bank Portal'}
                            {selectedPortal === 'admin' && 'Sign In to Super Admin Desk'}
                            {selectedPortal === 'donor' && 'Sign In as Voluntary Donor'}
                            {selectedPortal === 'requester' && 'Sign In as Patient Requester'}
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
                          <span>Verify OTP & Open {selectedPortal?.toUpperCase()} Portal</span>
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
                      {selectedPortal === 'hospital'
                        ? 'Hospital Official Name *'
                        : selectedPortal === 'bloodbank'
                        ? 'Blood Bank Center Name *'
                        : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={
                        selectedPortal === 'hospital'
                          ? 'e.g. City General Hospital'
                          : selectedPortal === 'bloodbank'
                          ? 'e.g. Red Cross Blood Center'
                          : 'e.g. Rajesh Kumar'
                      }
                      className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
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
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
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
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* DONOR BLOOD GROUP SELECTION */}
                  {selectedPortal === 'donor' && (
                    <div>
                      <label className="text-slate-700 font-extrabold block mb-1">Blood Group *</label>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value as BloodGroup)}
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
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
                  {(selectedPortal === 'hospital' || selectedPortal === 'bloodbank') && (
                    <div>
                      <label className="text-slate-700 font-extrabold block mb-1">
                        {selectedPortal === 'hospital'
                          ? 'Hospital License Registration Number *'
                          : 'Blood Bank License Registration Number *'}
                      </label>
                      <input
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder={selectedPortal === 'hospital' ? 'LIC-HOSP-XXXX' : 'LIC-BB-XXXX'}
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-mono uppercase"
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
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
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
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className={`w-full py-4 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] ${
                      selectedPortal === 'hospital'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white shadow-sky-500/20'
                        : selectedPortal === 'bloodbank'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/20'
                        : selectedPortal === 'requester'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/20'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-500/20'
                    }`}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {selectedPortal === 'requester'
                            ? 'Register Requester Account'
                            : selectedPortal === 'donor'
                            ? 'Register Donor Account'
                            : `Register ${selectedPortal?.toUpperCase()} Account`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ================================================== */}
              {/* SWITCH BETWEEN SIGN IN AND SIGN UP (IN PLACE)      */}
              {/* ================================================== */}
              {selectedPortal !== 'admin' && (
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {authMode === 'signin' ? (
                    <>
                      <span className="text-slate-500 font-medium">
                        {selectedPortal === 'requester'
                          ? 'Need a new requester account?'
                          : selectedPortal === 'donor'
                          ? 'Need a new donor account?'
                          : 'Need a new portal account?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setLoginError(null);
                        }}
                        className="text-rose-600 hover:text-rose-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {selectedPortal === 'hospital'
                          ? 'Register Hospital Account →'
                          : selectedPortal === 'bloodbank'
                          ? 'Register Blood Bank Account →'
                          : selectedPortal === 'requester'
                          ? 'Register Requester Account →'
                          : 'Register Donor Account →'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 font-medium">
                        {selectedPortal === 'requester'
                          ? 'Already have a requester account?'
                          : 'Already have an account?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setLoginError(null);
                        }}
                        className="text-sky-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ← Back to {selectedPortal === 'requester' ? 'Requester Sign In' : `${selectedPortal?.toUpperCase()} Sign In`}
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
