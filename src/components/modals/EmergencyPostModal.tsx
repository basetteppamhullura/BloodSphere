import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, UrgencyLevel } from '../../types';
import {
  AlertTriangle,
  X,
  Send,
  ShieldCheck,
  Calendar,
  Building2,
  MapPin,
  Phone,
  User,
  FileText,
  Clock,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Crosshair,
  Edit2,
  FileCheck
} from 'lucide-react';

export const EmergencyPostModal: React.FC = () => {
  const { activeEmergencyPostModal, setActiveEmergencyPostModal, createEmergencyRequest, bloodBanks } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // 2. Blood Requirement
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [bloodComponent, setBloodComponent] = useState<'Whole Blood' | 'Plasma' | 'Platelets' | 'Red Blood Cells'>('Whole Blood');
  const [reasonCategory, setReasonCategory] = useState<'Surgery' | 'Accident' | 'Childbirth' | 'Cancer Treatment' | 'Thalassemia' | 'Other'>('Surgery');
  const [customReason, setCustomReason] = useState('');

  // 3. Hospital Info
  const [selectedHospital, setSelectedHospital] = useState('KIMS Teaching Hospital');
  const [hospitalAddress, setHospitalAddress] = useState('PB Road, Vidyanagar, Hubballi');
  const [city, setCity] = useState('Hubballi');
  const [wardDept, setWardDept] = useState('ICU Bed 14');
  const [hospitalPhone, setHospitalPhone] = useState('+91 836 2378000');

  // 4. Emergency Details
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [requiredDate, setRequiredDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [requiredTime, setRequiredTime] = useState('10:00 AM');

  // 5. Requester Info
  const [requesterName, setRequesterName] = useState('Dr. Anish K');
  const [relationship, setRelationship] = useState<'Self' | 'Family' | 'Friend' | 'Hospital Staff' | 'Other'>('Family');
  const [requesterPhone, setRequesterPhone] = useState('9876543210');
  const [requesterEmail, setRequesterEmail] = useState('anish@example.com');

  // 6. Location & GPS
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('Dharwad');
  const [pincode, setPincode] = useState('580031');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>({ lat: 15.3688, lng: 75.1274 });
  const [isLocating, setIsLocating] = useState(false);

  // 7. Additional Info & Prescription
  const [doctorName, setDoctorName] = useState('Dr. Mahesh Kulkarni');
  const [medicalNotes, setMedicalNotes] = useState('Emergency trauma surgery requirement following highway collision.');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  if (!activeEmergencyPostModal) return null;

  // Registered Hospital Dropdown Auto-Fill
  const handleHospitalSelect = (hName: string) => {
    setSelectedHospital(hName);
    const matchedBank = bloodBanks.find(b => b.name.toLowerCase().includes(hName.toLowerCase()));
    if (matchedBank) {
      setHospitalAddress(matchedBank.address);
      setCity(matchedBank.city);
      setHospitalPhone(matchedBank.phone);
    }
  };

  // Browser GPS Geolocation Auto-Fill
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          setGpsCoords({ lat: 15.3647, lng: 75.1240 }); // Fallback Hubballi
        }
      );
    }
  };

  // Validation Logic per Step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!patientName.trim()) newErrors.patientName = 'Patient name is required.';
      if (!patientAge || Number(patientAge) <= 0) newErrors.patientAge = 'Valid patient age is required.';
    }

    if (step === 2) {
      if (unitsNeeded < 1) newErrors.unitsNeeded = 'Minimum 1 unit required.';
      if (reasonCategory === 'Other' && !customReason.trim()) newErrors.customReason = 'Please specify reason.';
    }

    if (step === 3) {
      if (!selectedHospital.trim()) newErrors.selectedHospital = 'Hospital name is required.';
      if (!city.trim()) newErrors.city = 'City is required.';
      if (!hospitalPhone.trim()) newErrors.hospitalPhone = 'Hospital contact number is required.';
    }

    if (step === 4) {
      if (!requiredDate) newErrors.requiredDate = 'Required date is required.';
      if (!requiredTime) newErrors.requiredTime = 'Required time is required.';
    }

    if (step === 5) {
      if (!requesterName.trim()) newErrors.requesterName = 'Requester name is required.';
      if (!/^\d{10}$/.test(requesterPhone.trim())) newErrors.requesterPhone = 'Valid 10-digit mobile number required.';
      if (requesterEmail && !/\S+@\S+\.\S+/.test(requesterEmail)) newErrors.requesterEmail = 'Invalid email address.';
    }

    if (step === 6) {
      if (!city.trim()) newErrors.city = 'City is required.';
      if (!/^\d{6}$/.test(pincode.trim())) newErrors.pincode = 'Valid 6-digit pincode required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = () => {
    const finalReason = reasonCategory === 'Other' ? customReason : `${reasonCategory} Requirement`;
    createEmergencyRequest({
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName: selectedHospital,
      city,
      urgency,
      requiredDate,
      contactPerson: requesterName,
      contactPhone: requesterPhone,
      reason: finalReason,
      additionalNotes: `${medicalNotes} (Doctor: ${doctorName || 'N/A'}, Dept: ${wardDept || 'General'})`,
      status: 'PENDING_HOSPITAL_APPROVAL'
    });
    setActiveEmergencyPostModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Create Blood Request Wizard</h3>
              <p className="text-[10px] text-slate-400">Step {currentStep} of 8 — Multi-Section Verification</p>
            </div>
          </div>

          <button onClick={() => setActiveEmergencyPostModal(false)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1-8) */}
        <div className="w-full bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-bold">
          {['Patient', 'Blood', 'Hospital', 'Urgency', 'Requester', 'Location', 'Medical', 'Review'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;

            return (
              <div
                key={label}
                onClick={() => isDone && setCurrentStep(stepNum)}
                className={`flex items-center gap-1 cursor-pointer shrink-0 ${
                  isActive ? 'text-red-500 font-black' : isDone ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                  isActive ? 'bg-red-600 text-white' : isDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? '✓' : stepNum}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Form Body Steps */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* STEP 1: PATIENT INFO */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" /> Section 1: Patient Information
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Deshmukh"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.patientName && <span className="text-[10px] text-red-400 block mt-1">{errors.patientName}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Patient Age *</label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      value={patientAge}
                      onChange={e => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    />
                    {errors.patientAge && <span className="text-[10px] text-red-400 block mt-1">{errors.patientAge}</span>}
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Patient Gender *</label>
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BLOOD REQUIREMENT */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" /> Section 2: Blood Requirement Details
              </h4>

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
                  <label className="text-slate-300 font-bold block mb-1">Number of Units Required *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsNeeded}
                    onChange={e => setUnitsNeeded(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.unitsNeeded && <span className="text-[10px] text-red-400 block mt-1">{errors.unitsNeeded}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Blood Component *</label>
                  <select
                    value={bloodComponent}
                    onChange={e => setBloodComponent(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Plasma">Plasma (FFP)</option>
                    <option value="Platelets">Platelets (PRP)</option>
                    <option value="Red Blood Cells">Red Blood Cells (PRBC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Reason for Requirement *</label>
                  <select
                    value={reasonCategory}
                    onChange={e => setReasonCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Surgery">Surgery</option>
                    <option value="Accident">Accident / Trauma</option>
                    <option value="Childbirth">Childbirth / Obstetrics</option>
                    <option value="Cancer Treatment">Cancer Treatment</option>
                    <option value="Thalassemia">Thalassemia Transfusion</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>
              </div>

              {reasonCategory === 'Other' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Specify Custom Reason *</label>
                  <input
                    type="text"
                    placeholder="Specify medical condition..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.customReason && <span className="text-[10px] text-red-400 block mt-1">{errors.customReason}</span>}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: HOSPITAL DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-500" /> Section 3: Hospital Information
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Hospital Name *</label>
                  <input
                    type="text"
                    list="registered-hospitals"
                    placeholder="Search or type hospital..."
                    value={selectedHospital}
                    onChange={e => handleHospitalSelect(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  <datalist id="registered-hospitals">
                    <option value="KIMS Teaching Hospital" />
                    <option value="SDM Medical College & Hospital" />
                    <option value="Rotary Regional Blood Center" />
                    <option value="Manipal Hospital" />
                    <option value="Tatwadarsha Hospital" />
                  </datalist>
                  {errors.selectedHospital && <span className="text-[10px] text-red-400 block mt-1">{errors.selectedHospital}</span>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Hospital Address</label>
                  <input
                    type="text"
                    value={hospitalAddress}
                    onChange={e => setHospitalAddress(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Department / Ward</label>
                    <input
                      type="text"
                      placeholder="e.g. ICU Bed 14"
                      value={wardDept}
                      onChange={e => setWardDept(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Hospital Phone *</label>
                    <input
                      type="text"
                      value={hospitalPhone}
                      onChange={e => setHospitalPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                    />
                    {errors.hospitalPhone && <span className="text-[10px] text-red-400 block mt-1">{errors.hospitalPhone}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EMERGENCY DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" /> Section 4: Emergency Level & Timeframe
              </h4>

              <div>
                <label className="text-slate-300 font-bold block mb-2">Emergency Urgency Level *</label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setUrgency('CRITICAL')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'CRITICAL'
                        ? 'bg-red-950/80 border-red-600 text-white shadow-lg ring-1 ring-red-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-red-400 block text-xs">Critical</span>
                    <span className="text-[10px] block">Within 2 Hours</span>
                  </div>

                  <div
                    onClick={() => setUrgency('HIGH')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'HIGH'
                        ? 'bg-amber-950/80 border-amber-600 text-white shadow-lg ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-amber-400 block text-xs">Urgent</span>
                    <span className="text-[10px] block">Today</span>
                  </div>

                  <div
                    onClick={() => setUrgency('MODERATE')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'MODERATE'
                        ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-lg ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-emerald-400 block text-xs">Normal</span>
                    <span className="text-[10px] block">Within 24–48 Hours</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Required Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={requiredDate}
                    onChange={e => setRequiredDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.requiredDate && <span className="text-[10px] text-red-400 block mt-1">{errors.requiredDate}</span>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Required Time *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={requiredTime}
                    onChange={e => setRequiredTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.requiredTime && <span className="text-[10px] text-red-400 block mt-1">{errors.requiredTime}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REQUESTER INFO */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" /> Section 5: Requester Information
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Requester Full Name *</label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.requesterName && <span className="text-[10px] text-red-400 block mt-1">{errors.requesterName}</span>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Relationship to Patient *</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Self">Self</option>
                    <option value="Family">Family Member</option>
                    <option value="Friend">Friend</option>
                    <option value="Hospital Staff">Hospital Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={requesterPhone}
                    onChange={e => setRequesterPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.requesterPhone && <span className="text-[10px] text-red-400 block mt-1">{errors.requesterPhone}</span>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={e => setRequesterEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.requesterEmail && <span className="text-[10px] text-red-400 block mt-1">{errors.requesterEmail}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: LOCATION & GPS */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" /> Section 6: Location & GPS Geolocation
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">State *</label>
                  <select
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">District *</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Dharwad">Dharwad</option>
                    <option value="Belagavi">Belagavi</option>
                    <option value="Bengaluru Urban">Bengaluru Urban</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.city && <span className="text-[10px] text-red-400 block mt-1">{errors.city}</span>}
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">6-Digit Pincode *</label>
                  <input
                    type="text"
                    placeholder="580031"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                  {errors.pincode && <span className="text-[10px] text-red-400 block mt-1">{errors.pincode}</span>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Browser GPS Coordinates</span>
                  <span className="text-[11px] text-slate-400">
                    {gpsCoords ? `Lat: ${gpsCoords.lat.toFixed(4)}, Lng: ${gpsCoords.lng.toFixed(4)}` : 'Location not fetched'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4 text-red-400 animate-spin-slow" />
                  {isLocating ? 'Locating...' : 'Use My Current Location'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: MEDICAL NOTES & PRESCRIPTION */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" /> Section 7: Additional Medical Notes & Prescription
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Attending Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Mahesh Kulkarni"
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Medical Notes & Condition Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Additional details regarding patient condition..."
                    value={medicalNotes}
                    onChange={e => setMedicalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Prescription Uploader */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Upload Prescription / Blood Slip (Optional)</label>
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950 text-center space-y-2">
                    {prescriptionFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold text-white truncate max-w-xs">{prescriptionFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrescriptionFile(null)}
                          className="text-red-400 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="font-bold text-slate-300 block text-xs">Click to upload Image or PDF</span>
                        <span className="text-[10px] text-slate-500 block">Max 5MB</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={e => e.target.files?.[0] && setPrescriptionFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: CONFIRMATION SUMMARY */}
          {currentStep === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-300">Confirmation Summary Review</h4>
                  <p className="text-[11px] text-slate-400">Review all details before submitting to hospital approval.</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">1. Patient: {patientName} ({patientAge} yrs, {patientGender})</span>
                  <button onClick={() => setCurrentStep(1)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">2. Blood: {unitsNeeded} Units of {bloodGroup} ({bloodComponent})</span>
                  <button onClick={() => setCurrentStep(2)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">3. Hospital: {selectedHospital}, {city}</span>
                  <button onClick={() => setCurrentStep(3)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">4. Urgency: {urgency} ({requiredDate} at {requiredTime})</span>
                  <button onClick={() => setCurrentStep(4)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">5. Requester: {requesterName} ({relationship}, Phone: {requesterPhone})</span>
                  <button onClick={() => setCurrentStep(5)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">6. Location: {city}, {stateName} (Pincode: {pincode})</span>
                  <button onClick={() => setCurrentStep(6)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">7. File Uploaded: {prescriptionFile ? prescriptionFile.name : 'None attached'}</span>
                  <button onClick={() => setCurrentStep(7)} className="text-red-400 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div />}

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center gap-1"
            >
              Next Section <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-xl shadow-red-950 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Blood Request (Step 1)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
