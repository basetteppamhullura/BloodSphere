import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { Heart, UserPlus, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [role, setRole] = useState<UserRole>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('Hubballi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    showToast(`Account registered successfully! Welcome to BloodSphere.`);
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-red-950">
          <Heart className="w-8 h-8 fill-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Join the BloodSphere Network</h2>
        <p className="text-xs text-slate-400">Register as a voluntary donor, hospital desk, or requester</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        
        <div>
          <label className="text-slate-300 font-bold block mb-1">Register As</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['donor', 'requester', 'hospital'] as UserRole[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-1.5 rounded-lg font-bold capitalize transition-all ${
                  role === r ? 'bg-red-600 text-white' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Full Name / Hospital Name</label>
          <input
            type="text"
            placeholder="e.g. Dr. Ananya Sharma"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            >
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">City / Region</label>
            <input
              type="text"
              placeholder="e.g. Hubballi"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Email Address</label>
          <input
            type="email"
            placeholder="ananya@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">Mobile Phone (+91)</label>
          <input
            type="text"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Create BloodSphere Account
        </button>

      </form>

    </div>
  );
};
