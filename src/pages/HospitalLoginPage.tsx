import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { Building2, LogIn, Eye, EyeOff, AlertCircle, KeyRound, Check, Loader2, ArrowRight } from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const { login, verifyTwoFactorOtp, failedAttemptsMap } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@kims.edu.in');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-HUB-4482');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [is2FAScreen, setIs2FAScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('778899');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password || !licenseNumber) {
      setLoginError('Please enter email, password, and Hospital License Registration Number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, 'hospital', licenseNumber);
      setIsSubmitting(false);

      if (res.requires2FA) {
        setIs2FAScreen(true);
        showToast(res.message);
      } else if (res.success) {
        showToast(res.message);
        navigate('/hospital/home', { replace: true });
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
        navigate('/hospital/home', { replace: true });
      } else {
        setLoginError(res.message);
      }
    }, 400);
  };

  const attempts = failedAttemptsMap[`${email}_hospital`] || 0;

  return (
    <div className="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-sky-50/30 flex flex-col justify-center items-center overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-300">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-xs font-black mt-2 shadow-2xs">
            🏥 Hospital Trauma Center Login
          </div>
        </div>

        {/* ISOLATED HOSPITAL LOGIN FORM CARD */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
          
          {attempts > 0 && attempts < 5 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Warning: {attempts} failed attempt(s). Account locks after 5 attempts.</span>
            </div>
          )}

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {!is2FAScreen ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-extrabold block mb-1">Hospital Official Email / ID *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@kims.edu.in"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-extrabold block">Password *</label>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset instructions sent to hospital administrator.')}
                    className="text-[11px] font-bold text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-extrabold block mb-1">Hospital License Registration Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="LIC-HUB-4482"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 focus:bg-white font-mono uppercase tracking-wider transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating Hospital Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Hospital</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-1">
                <KeyRound className="w-8 h-8 text-sky-600 mx-auto" />
                <strong className="block text-slate-900 font-extrabold text-sm">Two-Factor Authentication (2FA)</strong>
                <p className="text-[11px] text-slate-600">Enter the 6-digit OTP code sent to your hospital authorization device.</p>
              </div>

              <div>
                <label className="text-slate-700 font-extrabold block mb-1">6-Digit OTP Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-center text-xl tracking-widest focus:outline-none focus:border-sky-500"
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
                    <span>Verifying 2FA OTP...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify 2FA & Open Hospital Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP LINK (NAVIGATES TO ISOLATED HOSPITAL SIGN UP) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Don't have a hospital account?</span>
            <button
              type="button"
              onClick={() => navigate('/register/hospital')}
              className="text-sky-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Sign Up <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
