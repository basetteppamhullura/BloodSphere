import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { Heart, UserPlus, Building2, Droplet, ShieldCheck, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerPortalAccount, login } = useAuth();
  const { navigateTo, showToast } = useApp();

  const [role, setRole] = useState<UserRole>('donor');
  
  // Basic Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('Hubballi');

  // Hospital & Blood Bank Extended Fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('Karnataka');

  const [registrationSubmitted, setRegistrationSubmitted] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = registerPortalAccount({
      role,
      name,
      email,
      phone,
      bloodGroup,
      city,
      licenseNumber,
      contactPerson,
      address,
      state: stateName
    });

    if (role === 'hospital' || role === 'bloodbank') {
      setRegistrationSubmitted(true);
      setSubmittedMessage(`Registration received for ${name}! Account status set to "Pending Verification". Our Super Admin will verify your license (${licenseNumber || 'N/A'}) before activation.`);
    } else {
      login(email, role);
      showToast(`Account created successfully! Welcome to Blood Net.`);
      navigateTo('dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold mx-auto flex items-center justify-center shadow-xl shadow-red-950">
          <Heart className="w-8 h-8 fill-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Blood Net Portal Registration</h2>
        <p className="text-xs text-slate-400">Register your Voluntary Donor, Requester, Hospital or Blood Bank account</p>
      </div>

      {/* Registration Portal Role Choice */}
      <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-4 text-xs font-bold text-slate-400">
        {(['donor', 'requester', 'hospital', 'bloodbank'] as UserRole[]).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setRegistrationSubmitted(false);
            }}
            className={`py-2 rounded-xl capitalize transition-all ${
              role === r ? 'bg-red-600 text-white shadow-md' : 'hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Verification Submitted Banner */}
      {registrationSubmitted ? (
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-800 space-y-4 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-extrabold text-base text-white">Status: Pending Verification</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{submittedMessage}</p>
          
          <button
            onClick={() => navigateTo('login')}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Go to Login Portal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              {role === 'hospital' ? 'Hospital Official Name *' : role === 'bloodbank' ? 'Blood Bank Name *' : 'Full Name *'}
            </label>
            <input
              type="text"
              placeholder={role === 'hospital' ? 'e.g. KIMS Teaching Hospital' : 'e.g. Dr. Ananya Sharma'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          {(role === 'hospital' || role === 'bloodbank') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">License / Reg Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. LIC-HUB-4482"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Mahesh Kulkarni"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Facility Address *</label>
                <input
                  type="text"
                  placeholder="PB Road, Vidyanagar"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            {(role === 'donor' || role === 'requester') && (
              <div>
                <label className="text-slate-300 font-bold block mb-1">Blood Group *</label>
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
            )}

            <div>
              <label className="text-slate-300 font-bold block mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Official Email Address *</label>
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
            <label className="text-slate-300 font-bold block mb-1">Mobile Phone (+91) *</label>
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Register {role.toUpperCase()} Account
          </button>

        </form>
      )}

    </div>
  );
};
