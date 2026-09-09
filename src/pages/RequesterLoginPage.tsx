import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

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
      setLoginError('Please enter your email address and password.');
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
    <div className="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-rose-50/30 flex flex-col justify-center items-center overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-300">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black mt-2 shadow-2xs">
            🆘 Patient Requester Login
          </div>
        </div>

        {/* ISOLATED REQUESTER LOGIN FORM CARD */}
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

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-extrabold block mb-1">Email / Mobile Number *</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rohan.deshmukh@example.com"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-extrabold block">Password *</label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset instructions sent to registered email.')}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Requester</span>
                </>
              )}
            </button>
          </form>

          {/* SIGN UP LINK (NAVIGATES TO ISOLATED REQUESTER SIGN UP) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/register/requester')}
              className="text-rose-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Sign Up <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
