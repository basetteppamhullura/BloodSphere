import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, UrgencyLevel } from '../../types';
import { X, PlusCircle, Sparkles, Send } from 'lucide-react';

export const EmergencyPostModal: React.FC = () => {
  const { activeEmergencyPostModal, setActiveEmergencyPostModal, createEmergencyRequest } = useApp();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [hospitalName, setHospitalName] = useState('KIMS Hospital Hubballi');
  const [city, setCity] = useState('Hubballi');
  const [reason, setReason] = useState('');

  if (!activeEmergencyPostModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyRequest({
      patientName,
      bloodGroup,
      unitsNeeded,
      urgency,
      hospitalName,
      city,
      reason
    });
    setActiveEmergencyPostModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-sm text-white">Post Emergency Blood Need</h3>
          </div>

          <button onClick={() => setActiveEmergencyPostModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-bold block mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Rohan Deshmukh"
              required
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Required Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
              >
                {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Units Needed</label>
              <input
                type="number"
                min={1}
                max={10}
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Hospital Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MODERATE">MODERATE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Medical Reason / Context</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Emergency trauma surgery ICU bed 14..."
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Publish Emergency Post
          </button>
        </form>

      </div>
    </div>
  );
};
