import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, UrgencyLevel } from '../../types';
import { AlertTriangle, X, Send, ShieldCheck, Calendar, Building2, MapPin, Phone, User, FileText } from 'lucide-react';

export const EmergencyPostModal: React.FC = () => {
  const { activeEmergencyPostModal, setActiveEmergencyPostModal, createEmergencyRequest } = useApp();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [hospitalName, setHospitalName] = useState('KIMS Teaching Hospital');
  const [city, setCity] = useState('Hubballi');
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [requiredDate, setRequiredDate] = useState('2026-08-06');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!activeEmergencyPostModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyRequest({
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      city,
      urgency,
      requiredDate,
      contactPerson,
      contactPhone,
      reason,
      additionalNotes,
      status: 'PENDING_HOSPITAL_APPROVAL' // Step 1 Status
    });
    setActiveEmergencyPostModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Create Emergency Blood Request</h3>
              <p className="text-[10px] text-slate-400">Step 1: Submitted for Hospital Verification</p>
            </div>
          </div>

          <button onClick={() => setActiveEmergencyPostModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Patient Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Deshmukh"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Blood Group Required</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Units Required</label>
              <input
                type="number"
                min={1}
                max={10}
                value={unitsNeeded}
                onChange={e => setUnitsNeeded(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Urgency Level</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Immediate)</option>
                <option value="HIGH">HIGH (&lt; 12 Hours)</option>
                <option value="MODERATE">MODERATE (Scheduled)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Required Date</label>
              <input
                type="date"
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Hospital Name</label>
              <input
                type="text"
                placeholder="e.g. KIMS Teaching Hospital"
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">City / Region</label>
              <input
                type="text"
                placeholder="e.g. Hubballi"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Attendant Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Anish / Mahesh Devi"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Contact Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Medical Reason</label>
            <input
              type="text"
              placeholder="e.g. Emergency Trauma Surgery, Cardiac Bypass"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. ICU Bed 14. Doctor in charge Dr. Mahesh."
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-[10px] text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Request will be set to <strong>Pending Hospital Approval</strong>. Only verified hospital staff can approve it for public donor matching.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveEmergencyPostModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg shadow-red-950 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Submit Request (Step 1)
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
