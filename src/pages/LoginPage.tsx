import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Heart, LogIn, ShieldCheck, User, Building2, Droplet, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('••••••••');

  const demoAccounts: { role: UserRole; name: string; email: string; desc: string }[] = [
    { role: 'donor', name: 'Dr. Ananya Sharma', email: 'ananya.sharma@example.com', desc: 'Registered O- Donor' },
    { role: 'requester', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@example.com', desc: 'Patient Attendant' },
    { role: 'hospital', name: 'KIMS Hospital Admin', email: 'admin@kims.edu.in', desc: 'Verified Hospital Desk' },
    { role: 'bloodbank', name: 'Rotary Blood Center', email: 'contact@rotaryblood.org', desc: 'Blood Inventory Mgr' },
    { role: 'admin', name: 'National Super Admin', email: 'admin@bloodnet.gov.in', desc: 'System Moderator' }
  ];

  const handleRoleSelect = (acc: typeof demoAccounts[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedRole);
    showToast(`Logged in successfully as ${selectedRole.toUpperCase()}!`);
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-red-950">
          <Heart className="w-8 h-8 fill-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Login to BloodSphere</h2>
        <p className="text-xs text-slate-400">Select your role perspective to access your dedicated dashboard</p>
      </div>

      {/* Demo Account Quick Selector */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Role Demo Account (1-Click Login):
        </span>

        <div className="space-y-1.5">
          {demoAccounts.map(acc => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleRoleSelect(acc)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                selectedRole === acc.role
                  ? 'bg-red-950/60 border-red-700 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="font-bold block capitalize text-slate-200">{acc.name} ({acc.role})</span>
                <span className="text-[10px] text-slate-500">{acc.desc}</span>
              </div>
              {selectedRole === acc.role && <ShieldCheck className="w-4 h-4 text-red-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div>
          <label className="text-slate-300 font-bold block mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Password</label>
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
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Enter Dashboard as {selectedRole.toUpperCase()}
        </button>
      </form>

    </div>
  );
};
