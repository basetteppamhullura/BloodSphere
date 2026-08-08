import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { AlertTriangle, X, Send, Zap, Phone, Building2, User, Droplet, CheckCircle2 } from 'lucide-react';

interface EmergencyQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyQuickModal: React.FC<EmergencyQuickModalProps> = ({ isOpen, onClose }) => {
  const { createEmergencyRequest } = useApp();

  const [patientName, setPatientName] = useState('Emergency Patient');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [locationName, setLocationName] = useState('KIMS Hospital, Hubballi');
  const [contactPhone, setContactPhone] = useState('9876543210');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createEmergencyRequest({
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName: locationName,
      city: 'Hubballi',
      contactPhone,
      contactPerson: 'Urgent Attendant',
      urgency: 'CRITICAL',
      isVerifiedByHospital: true,
      selectedChannels: ['hospital', 'donors', 'bloodbank'],
      reason: 'CRITICAL 1-MINUTE EMERGENCY NEED'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-red-600/80 rounded-3xl overflow-hidden shadow-2xl shadow-red-950 flex flex-col">
        
        {/* Urgent Header */}
        <div className="p-5 bg-gradient-to-r from-red-700 via-rose-700 to-red-900 border-b border-red-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-red-600 font-extrabold flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 fill-red-600 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">1-Minute Emergency Blood Request</h3>
              <p className="text-[11px] text-red-100 font-bold">Instantly Dispatches Hospital + Donors + Blood Banks</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl bg-red-900/60 text-red-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>Emergency Level pre-set to <strong>CRITICAL</strong>. All 3 dispatch channels activated simultaneously upon submit!</span>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Patient Full Name *</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-slate-300 font-bold block mb-1">Units Required *</label>
              <input
                type="number"
                min={1}
                max={10}
                value={unitsNeeded}
                onChange={e => setUnitsNeeded(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Hospital / Location *</label>
            <input
              type="text"
              placeholder="e.g. KIMS Hospital, Hubballi"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Contact Mobile Number *</label>
            <input
              type="text"
              placeholder="9876543210"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-black text-sm shadow-xl shadow-red-950 flex items-center justify-center gap-2 animate-pulse"
          >
            <Zap className="w-5 h-5 fill-white" /> SUBMIT 1-MINUTE EMERGENCY NEED
          </button>

        </form>

      </div>
    </div>
  );
};
