import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, BloodGroup } from '../types';
import { Heart, UserPlus, ShieldCheck, Mail, Lock, User, MapPin, Phone, Building2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const { login } = useAuth();

  const [role, setRole] = useState<UserRole>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('Hubballi');
  const [aadhaarNo, setAadhaarNo] = useState('8890 4123 9901');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    showToast(`Account registered successfully! Welcome to BloodNet.`);
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Join the BloodNet Network</h2>
          <p className="text-xs text-slate-400">Register as a Voluntary Donor, Requester, or Hospital Admin</p>
        </div>

        {/* Account Role Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Register As:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'donor', label: 'Blood Donor', icon: Heart },
              { id: 'requester', label: 'Requester', icon: User },
              { id: 'hospital', label: 'Hospital Admin', icon: Building2 }
            ].map(r => {
              const IconComp = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Ananya Sharma"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@example.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-red-500"
              >
                {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Hubballi"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Aadhaar / ID No (Verification)</label>
              <input
                type="text"
                value={aadhaarNo}
                onChange={(e) => setAadhaarNo(e.target.value)}
                placeholder="XXXX XXXX XXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" /> Complete Verification & Register
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-red-400 font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
};
