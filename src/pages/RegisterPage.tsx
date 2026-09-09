import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, BloodGroup } from '../types';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { UserPlus, User, Building2, Droplet, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC<{ forcedPortal?: UserRole }> = ({ forcedPortal }) => {
  const { registerPortalAccount } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ portal?: string }>();

  // Determine fixed portal mode if coming from a portal-specific sign up link
  const detectedPortal: UserRole | undefined =
    forcedPortal ||
    (params.portal as UserRole) ||
    (location.pathname.includes('/register/donor') ? 'donor' : undefined) ||
    (location.pathname.includes('/register/requester') ? 'requester' : undefined) ||
    (location.pathname.includes('/register/hospital') ? 'hospital' : undefined) ||
    (location.pathname.includes('/register/bloodbank') ? 'bloodbank' : undefined);

  const [role, setRole] = useState<UserRole>(detectedPortal || 'donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('Hubballi');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    if (detectedPortal) {
      setRole(detectedPortal);
    }
  }, [detectedPortal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createdAcc = registerPortalAccount({
      name,
      email,
      phone,
      role,
      city,
      licenseNumber: role === 'hospital' || role === 'bloodbank' ? licenseNumber : undefined
    });

    if (createdAcc) {
      showToast(`Account registered successfully for ${name}!`);
      const defaultRolePath: Record<UserRole, string> = {
        donor: '/donor/home',
        requester: '/requester/home',
        hospital: '/hospital/home',
        bloodbank: '/bloodbank/home',
        admin: '/admin/home'
      };
      navigate(defaultRolePath[role] || '/login', { replace: true });
    }
  };

  const getLoginReturnPath = () => {
    if (role === 'donor') return '/login/donor';
    if (role === 'requester') return '/login/requester';
    if (role === 'hospital') return '/login/hospital';
    if (role === 'bloodbank') return '/login/bloodbank';
    return '/login';
  };

  return (
    <div className="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col justify-center items-center overflow-hidden">
      
      {/* FLOATING SUBTLE BACKGROUND ELEMENTS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-300">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-black mt-2 shadow-2xs">
            {role === 'donor' && '❤️ Voluntary Donor Registration'}
            {role === 'requester' && '🆘 Patient Requester Registration'}
            {role === 'hospital' && '🏥 Hospital Facility Registration'}
            {role === 'bloodbank' && '🩸 Blood Bank Registration'}
            {role === 'admin' && '🛡️ Administrator Registration'}
          </div>
        </div>

        {/* REGISTER FORM CARD */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
          
          {/* ONLY SHOW ROLE SELECTOR IF NOT DETECTED FROM PORTAL LINK */}
          {!detectedPortal && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'donor' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                <span>Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('requester')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'requester' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                <span>Requester</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('hospital')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'hospital' ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1" />
                <span>Hospital</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('bloodbank')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'bloodbank' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Droplet className="w-5 h-5 mx-auto mb-1" />
                <span>Blood Bank</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="text-slate-700 font-extrabold block mb-1">
                {role === 'hospital' ? 'Hospital Official Name *' : role === 'bloodbank' ? 'Blood Bank Facility Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'hospital' ? 'e.g. KIMS Teaching Hospital' : 'e.g. Dr. Ananya Sharma'}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-extrabold block mb-1">Official Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-extrabold block mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-extrabold block mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-extrabold block mb-1">City / Region *</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="Hubballi">Hubballi</option>
                  <option value="Dharwad">Dharwad</option>
                  <option value="Belagavi">Belagavi</option>
                  <option value="Bengaluru">Bengaluru</option>
                </select>
              </div>

              {(role === 'donor' || role === 'requester') && (
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-red-500"
                  >
                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Bombay Phenotype (O-h)"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              )}

              {(role === 'hospital' || role === 'bloodbank') && (
                <div>
                  <label className="text-slate-700 font-extrabold block mb-1">Official License Registration Number *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LIC-HUB-4482"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500 font-mono uppercase tracking-wider"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Create {role.toUpperCase()} Account
            </button>

          </form>

          {/* BACK TO PORTAL LOGIN LINK */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate(getLoginReturnPath())}
              className="text-red-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Sign In to {role.toUpperCase()} Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
