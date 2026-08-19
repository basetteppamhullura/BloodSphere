import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { Droplet, LogIn, Lock, AlertCircle } from 'lucide-react';

export const BloodBankLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('contact@rotaryblood.org');
  const [password, setPassword] = useState('••••••••');
  const [licenseNumber, setLicenseNumber] = useState('LIC-BB-9901');

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email, 'bloodbank', licenseNumber);
    if (res.success) {
      showToast(res.message);
      navigate('/bloodbank/dashboard', { replace: true });
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold mt-2">
          <Droplet className="w-4 h-4 text-emerald-600" /> Blood Bank Operational Portal
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1">Blood Bank Email *</label>
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
            <label className="text-slate-700 font-bold block mb-1">Blood Bank License Number *</label>
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
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4" /> Log In to Blood Bank Portal
          </button>
        </form>

      </div>

    </div>
  );
};
