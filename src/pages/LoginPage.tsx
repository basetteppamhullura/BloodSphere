import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Heart, LogIn, ShieldCheck, Mail, Lock, User, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const { login } = useAuth();

  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState<UserRole>('donor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    showToast(`Welcome back! Logged in as ${role.toUpperCase()}`);
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-950">
            <Heart className="w-7 h-7 fill-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to BloodNet</h2>
          <p className="text-xs text-slate-400">Access your donor dashboard, active requests & inventory</p>
        </div>

        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select User Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'donor', label: 'Blood Donor', icon: Heart },
              { id: 'requester', label: 'Requester', icon: User },
              { id: 'hospital', label: 'Hospital Admin', icon: Building2 },
              { id: 'admin', label: 'Super Admin', icon: ShieldCheck }
            ].map(r => {
              const IconComp = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" /> Sign In to Account
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <button
            onClick={() => navigateTo('register')}
            className="text-red-400 font-bold hover:underline"
          >
            Create New Account
          </button>
        </div>

      </div>
    </div>
  );
};
