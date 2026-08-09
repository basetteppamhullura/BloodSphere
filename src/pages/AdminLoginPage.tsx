import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, LogIn, ShieldAlert } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [email, setEmail] = useState('admin@bloodnet.gov.in');
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email, 'admin');
    if (res.success) {
      showToast(res.message);
      navigateTo('dashboard');
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Route Badge */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-amber-950">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h2>
        <div className="flex items-center justify-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 uppercase flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Private System Control
          </span>
          <code className="text-xs text-amber-400 font-mono">/login/admin</code>
        </div>
      </div>

      {loginError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div>
          <label className="text-slate-300 font-bold block mb-1">Super Admin Credential Email *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Enter Super Admin Control Panel
        </button>

        <p className="text-[11px] text-slate-400 text-center pt-2">
          Private access portal for system administrators only.
        </p>
      </form>

    </div>
  );
};
