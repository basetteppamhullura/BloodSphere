import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { UserPlus, User, Building2, Droplet, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [role, setRole] = useState<UserRole>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('Hubballi');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = register({
      name,
      email,
      phone,
      password,
      role,
      bloodGroup: role === 'donor' || role === 'requester' ? bloodGroup : undefined,
      city,
      licenseNumber: role === 'hospital' || role === 'bloodbank' ? licenseNumber : undefined
    });

    if (res.success) {
      showToast(res.message);
      navigateTo('dashboard');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BloodNetLogo size="lg" showTagline={true} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Join the Real-Time Blood Network</h2>
        <p className="text-xs text-slate-500">Register as a Voluntary Donor, Patient Requester, Hospital, or Blood Bank</p>
      </div>

      {/* Register Form Card */}
      <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-lg space-y-5">
        
        {/* Role Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'donor' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            <span>Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('requester')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'requester' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            <span>Requester</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'hospital' ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Building2 className="w-5 h-5 mx-auto mb-1" />
            <span>Hospital</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('bloodbank')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'bloodbank' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Droplet className="w-5 h-5 mx-auto mb-1" />
            <span>Blood Bank</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="text-slate-700 font-bold block mb-1">Full Name / Facility Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Ananya Sharma or Hubballi City Hospital"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="text-slate-700 font-bold block mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-bold block mb-1">City / Region *</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="Hubballi">Hubballi</option>
                <option value="Dharwad">Dharwad</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>

            {(role === 'donor' || role === 'requester') && (
              <div>
                <label className="text-slate-700 font-bold block mb-1">Blood Group *</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                >
                  {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Bombay Phenotype (O-h)"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            )}

            {(role === 'hospital' || role === 'bloodbank') && (
              <div>
                <label className="text-slate-700 font-bold block mb-1">Official License Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="e.g. LIC-HUB-4482"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" /> Create Blood Net Account
          </button>

        </form>

      </div>

    </div>
  );
};
