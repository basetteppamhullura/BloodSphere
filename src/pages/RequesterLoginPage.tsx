import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, ArrowLeft, Users } from 'lucide-react';

export const RequesterLoginPage: React.FC = () => {
  const { login, failedAttemptsMap } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rohan.deshmukh@example.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, 'requester');
      setIsSubmitting(false);

      if (res.success) {
        showToast(res.message);
        navigate('/requester/home', { replace: true });
      } else {
        setLoginError(res.message);
      }
    }, 400);
  };

  const attempts = failedAttemptsMap[`${email}_requester`] || 0;

  return (
    <div className="relative min-h-[90vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 flex flex-col justify-center items-center overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl space-y-6 relative z-10 animate-in fade-in duration-300">
        
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

        {/* DEDICATED REQUESTER AUTHENTICATION CARD */}
        <div className="max-w-xl mx-auto p-7 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* PORTAL HEADER & STATUS */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs bg-rose-50 text-rose-600 border border-rose-100">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-black text-lg sm:text-xl text-[#0F172A] leading-tight">
                  Requester Portal Sign In
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  Request blood for patients and those in need
                </span>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              🟢 256-BIT SSL
            </span>
          </div>

          {/* FAILED ATTEMPTS WARNING */}
          {attempts > 0 && attempts < 5 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Warning: {attempts} failed attempt(s). Account locks automatically after 5 failed attempts.</span>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-extrabold block mb-1">Requester Registered Email / Phone *</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan.deshmukh@example.com"
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

            {/* SIGN IN SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-xs shadow-md bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in to BloodNet...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Patient Requester</span>
                </>
              )}
            </button>
          </form>

          {/* REGISTRATION LINK */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Need a new requester account?</span>
            <button
              type="button"
              onClick={() => navigate('/register/requester')}
              className="text-rose-600 hover:text-rose-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Register Requester Account →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

