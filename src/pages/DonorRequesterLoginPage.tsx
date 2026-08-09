import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { Heart, User, LogIn, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export const DonorRequesterLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    if (role === 'donor') setEmail('ananya.sharma@example.com');
    if (role === 'requester') setEmail('rohan.deshmukh@example.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email, selectedRole);
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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-red-950">
          <Heart className="w-8 h-8 fill-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Donor & Requester Login</h2>
        <p className="text-xs text-slate-400">URL Route: <code className="text-red-400 font-mono">/login/donor-requester</code></p>
      </div>

      {/* Role Toggle Selector */}
      <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 text-xs">
        <button
          type="button"
          onClick={() => handleRoleToggle('donor')}
          className={`py-2.5 rounded-xl font-extrabold transition-all ${
            selectedRole === 'donor' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🩸 Voluntary Donor
        </button>
        <button
          type="button"
          onClick={() => handleRoleToggle('requester')}
          className={`py-2.5 rounded-xl font-extrabold transition-all ${
            selectedRole === 'requester' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🆘 Patient Requester
        </button>
      </div>

      {loginError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold">
          {loginError}
        </div>
      )}

      {/* Standalone Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div>
          <label className="text-slate-300 font-bold block mb-1">Mobile Number or Email Address *</label>
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Enter Portal as {selectedRole.toUpperCase()}
        </button>

        <div className="pt-2 text-center text-slate-400">
          <p>
            Need an account?{' '}
            <button type="button" onClick={() => navigateTo('register')} className="text-red-400 font-bold underline">
              Register New Public Account
            </button>
          </p>
        </div>
      </form>

    </div>
  );
};
