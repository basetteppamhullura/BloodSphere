import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { LogIn, User, AlertCircle } from 'lucide-react';

export const DonorRequesterLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('ananya.sharma@example.com');
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
      if (selectedRole === 'donor') {
        navigate('/donor/home', { replace: true });
      } else {
        navigate('/requester/home', { replace: true });
      }
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Donor & Requester Access</h2>
        <p className="text-xs text-slate-500">Log in to manage emergency blood requests and voluntary donations</p>
      </div>

      {/* Login Card */}
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-lg space-y-5">
        
        {/* Role Toggle Pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-sky-50 border border-sky-100 font-extrabold text-xs">
          <button
            type="button"
            onClick={() => handleRoleToggle('donor')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              selectedRole === 'donor' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ❤️ Voluntary Donor
          </button>

          <button
            type="button"
            onClick={() => handleRoleToggle('requester')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              selectedRole === 'requester' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🆘 Patient Requester
          </button>
        </div>

        {loginError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
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

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4" /> Log In as {selectedRole === 'donor' ? 'Donor' : 'Requester'}
          </button>
        </form>

      </div>

    </div>
  );
};
