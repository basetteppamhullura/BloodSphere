import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, UrgencyLevel, RequestChannel } from '../../types';
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
  FileCheck,
  KeyRound,
  Check,
  Share2,
  Droplet,
  Users
} from 'lucide-react';

export const EmergencyPostModal: React.FC = () => {
  const {
    activeEmergencyPostModal,
    setActiveEmergencyPostModal,
    createEmergencyRequest,
    bloodBanks,
    verifyPatientCredentials
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi-Channel Selection State (Requires min 1)
  const [selectedChannels, setSelectedChannels] = useState<RequestChannel[]>(['hospital', 'donors']);

  // Patient Verification State
  const [patientIdInput, setPatientIdInput] = useState('BN-HUB-2026-00852');
  const [verificationCodeInput, setVerificationCodeInput] = useState('739241');
  const [isVerified, setIsVerified] = useState(true);
  const [verificationFeedback, setVerificationFeedback] = useState<string>('Patient verified successfully.');

  // 1. Patient Info
  const [patientName, setPatientName] = useState('Rohan Deshmukh');
  const [patientAge, setPatientAge] = useState<number | ''>(34);
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

  // 6. Requester Info
  const [requesterName, setRequesterName] = useState('Dr. Anish K');
  const [relationship, setRelationship] = useState<'Self' | 'Family' | 'Friend' | 'Hospital Staff' | 'Other'>('Family');
  const [requesterPhone, setRequesterPhone] = useState('9876543210');
  const [requesterEmail, setRequesterEmail] = useState('anish@example.com');

  // 7. Location & GPS
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('Dharwad');
  const [pincode, setPincode] = useState('580031');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>({ lat: 15.3688, lng: 75.1274 });
  const [isLocating, setIsLocating] = useState(false);

  // 8. Additional Info & Prescription
  const [doctorName, setDoctorName] = useState('Dr. Mahesh Kulkarni');
  const [medicalNotes, setMedicalNotes] = useState('Emergency trauma surgery requirement following highway collision.');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  if (!activeEmergencyPostModal) return null;

  // Toggle Multi-Channel Selection
  const toggleChannel = (ch: RequestChannel) => {
    setSelectedChannels(prev => {
      if (prev.includes(ch)) {
        const next = prev.filter(c => c !== ch);
        return next;
      } else {
        return [...prev, ch];
      }
    });
  };

  // Patient Credentials Verification Handler
  const handleVerifyCredentials = () => {
    const res = verifyPatientCredentials(patientIdInput, verificationCodeInput, bloodGroup);
    if (res.isValid) {
      setIsVerified(true);
      setVerificationFeedback(res.message);
      if (res.record) {
        setPatientName(res.record.patientName);
        setBloodGroup(res.record.bloodGroup);
        setSelectedHospital(res.record.hospitalName);
      }
    } else {
      setIsVerified(false);
      setVerificationFeedback(res.message);
    }
  };

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
          setGpsCoords({ lat: 15.3647, lng: 75.1240 });
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
      if (!patientIdInput.trim()) newErrors.patientIdInput = 'Patient ID is required.';
      if (!verificationCodeInput.trim()) newErrors.verificationCodeInput = 'Verification code is required.';
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
      if (selectedChannels.length === 0) {
        newErrors.channels = 'Please select at least one dispatch channel (Hospital, Donors, or Blood Banks).';
      }
    }

    if (step === 6) {
      if (!requesterName.trim()) newErrors.requesterName = 'Requester name is required.';
      if (!/^\d{10}$/.test(requesterPhone.trim())) newErrors.requesterPhone = 'Valid 10-digit mobile number required.';
      if (requesterEmail && !/\S+@\S+\.\S+/.test(requesterEmail)) newErrors.requesterEmail = 'Invalid email address.';
    }

    if (step === 7) {
      if (!city.trim()) newErrors.city = 'City is required.';
      if (!/^\d{6}$/.test(pincode.trim())) newErrors.pincode = 'Valid 6-digit pincode required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = () => {
    const finalReason = reasonCategory === 'Other' ? customReason : `${reasonCategory} Requirement`;
    createEmergencyRequest({
      patientName,
      patientAge: Number(patientAge),
      patientGender,
      patientId: patientIdInput,
      verificationCode: verificationCodeInput,
      isVerifiedByHospital: isVerified,
      selectedChannels,
      bloodGroup,
      bloodComponent,
      unitsNeeded,
      hospitalName: selectedHospital,
      city,
      urgency,
      requiredDate,
      requiredTime,
      contactPerson: requesterName,
      contactPhone: requesterPhone,
      contactEmail: requesterEmail,
      relationship,
      reason: finalReason,
      additionalNotes: `${medicalNotes} (Doctor: ${doctorName || 'N/A'}, Dept: ${wardDept || 'General'})`,
      status: isVerified ? 'VERIFIED_SEARCHING_DONORS' : 'PENDING_HOSPITAL_APPROVAL'
    });
    setActiveEmergencyPostModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Decorative Water Bubbles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/40 rounded-full blur-xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-sky-100 flex justify-between items-center bg-gradient-to-r from-sky-50 via-white to-blue-50 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Create Blood Request Wizard</h3>
              <p className="text-[10px] text-slate-500 font-medium">Step {currentStep} of 9 — Multi-Channel Dispatch Grid</p>
            </div>
          </div>

          <button onClick={() => setActiveEmergencyPostModal(false)} className="p-2 rounded-xl bg-sky-50 text-slate-400 hover:text-slate-700 hover:bg-sky-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1-9) */}
        <div className="w-full bg-sky-50/60 px-6 py-3 border-b border-sky-100 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-bold relative z-10">
          {['Patient', 'Blood', 'Hospital', 'Urgency', 'Channels', 'Requester', 'Location', 'Medical', 'Review'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;

            return (
              <div
                key={label}
                onClick={() => isDone && setCurrentStep(stepNum)}
                className={`flex items-center gap-1 cursor-pointer shrink-0 ${
                  isActive ? 'text-red-600 font-black' : isDone ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                  isActive ? 'bg-red-600 text-white shadow-xs' : isDone ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-white text-slate-400 border border-sky-100'
                }`}>
                  {isDone ? '✓' : stepNum}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Form Body Steps */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1 relative z-10">
          
          {/* STEP 1: PATIENT INFO & PRE-VERIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" /> Section 1: Patient Verification & Information
              </h4>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Hospital Patient Verification Credentials (Instant Donor Search):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Patient ID *</label>
                    <input
                      type="text"
                      placeholder="BN-HUB-2026-00852"
                      value={patientIdInput}
                      onChange={e => setPatientIdInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 font-mono shadow-2xs"
                    />
                    {errors.patientIdInput && <span className="text-[10px] text-red-500 block mt-1">{errors.patientIdInput}</span>}
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">6-Digit Verification Code *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="739241"
                        value={verificationCodeInput}
                        onChange={e => setVerificationCodeInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 font-mono shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCredentials}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-4 h-4" /> Verify
                      </button>
                    </div>
                    {errors.verificationCodeInput && <span className="text-[10px] text-red-500 block mt-1">{errors.verificationCodeInput}</span>}
                  </div>
                </div>

                {verificationFeedback && (
                  <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-bold ${
                    isVerified
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{verificationFeedback}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Deshmukh"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.patientName && <span className="text-[10px] text-red-500 block mt-1">{errors.patientName}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Patient Age *</label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      value={patientAge}
                      onChange={e => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                    />
                    {errors.patientAge && <span className="text-[10px] text-red-500 block mt-1">{errors.patientAge}</span>}
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Patient Gender *</label>
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
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
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" /> Section 2: Blood Requirement Details
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs font-bold"
                  >
                    {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Number of Units Required *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsNeeded}
                    onChange={e => setUnitsNeeded(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.unitsNeeded && <span className="text-[10px] text-red-500 block mt-1">{errors.unitsNeeded}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Blood Component *</label>
                  <select
                    value={bloodComponent}
                    onChange={e => setBloodComponent(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Plasma">Plasma (FFP)</option>
                    <option value="Platelets">Platelets (PRP)</option>
                    <option value="Red Blood Cells">Red Blood Cells (PRBC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Reason for Requirement *</label>
                  <select
                    value={reasonCategory}
                    onChange={e => setReasonCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
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
                  <label className="text-slate-700 font-bold block mb-1">Specify Custom Reason *</label>
                  <input
                    type="text"
                    placeholder="Specify medical condition..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.customReason && <span className="text-[10px] text-red-500 block mt-1">{errors.customReason}</span>}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: HOSPITAL DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" /> Section 3: Hospital Information
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Hospital Name *</label>
                  <input
                    type="text"
                    list="registered-hospitals"
                    placeholder="Search or type hospital..."
                    value={selectedHospital}
                    onChange={e => handleHospitalSelect(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  <datalist id="registered-hospitals">
                    <option value="KIMS Teaching Hospital" />
                    <option value="SDM Medical College & Hospital" />
                    <option value="Rotary Regional Blood Center" />
                    <option value="Manipal Hospital" />
                    <option value="Tatwadarsha Hospital" />
                  </datalist>
                  {errors.selectedHospital && <span className="text-[10px] text-red-500 block mt-1">{errors.selectedHospital}</span>}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Hospital Address</label>
                  <input
                    type="text"
                    value={hospitalAddress}
                    onChange={e => setHospitalAddress(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Department / Ward</label>
                    <input
                      type="text"
                      placeholder="e.g. ICU Bed 14"
                      value={wardDept}
                      onChange={e => setWardDept(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Hospital Phone *</label>
                    <input
                      type="text"
                      value={hospitalPhone}
                      onChange={e => setHospitalPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                    />
                    {errors.hospitalPhone && <span className="text-[10px] text-red-500 block mt-1">{errors.hospitalPhone}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EMERGENCY DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> Section 4: Emergency Level & Timeframe
              </h4>

              <div>
                <label className="text-slate-700 font-bold block mb-2">Emergency Urgency Level *</label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setUrgency('CRITICAL')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'CRITICAL'
                        ? 'bg-red-50 border-red-500 text-red-900 shadow-md ring-1 ring-red-400'
                        : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                    }`}
                  >
                    <span className="font-extrabold text-red-600 block text-xs">Critical</span>
                    <span className="text-[10px] block text-slate-500">Within 2 Hours</span>
                  </div>

                  <div
                    onClick={() => setUrgency('HIGH')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'HIGH'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-1 ring-amber-400'
                        : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                    }`}
                  >
                    <span className="font-extrabold text-amber-600 block text-xs">Urgent</span>
                    <span className="text-[10px] block text-slate-500">Today</span>
                  </div>

                  <div
                    onClick={() => setUrgency('MODERATE')}
                    className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                      urgency === 'MODERATE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-1 ring-emerald-400'
                        : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                    }`}
                  >
                    <span className="font-extrabold text-emerald-600 block text-xs">Normal</span>
                    <span className="text-[10px] block text-slate-500">Within 24–48 Hours</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Required Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={requiredDate}
                    onChange={e => setRequiredDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.requiredDate && <span className="text-[10px] text-red-500 block mt-1">{errors.requiredDate}</span>}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Required Time *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={requiredTime}
                    onChange={e => setRequiredTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.requiredTime && <span className="text-[10px] text-red-500 block mt-1">{errors.requiredTime}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SEND REQUEST TO (MULTI-CHANNEL SELECTION) */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-600" /> Section 5: Multi-Channel Dispatch Options
              </h4>
              <p className="text-slate-500 text-[11px]">Select any combination of channels to dispatch your blood request simultaneously.</p>

              {errors.channels && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
                  {errors.channels}
                </div>
              )}

              <div className="space-y-3">
                {/* Hospital Channel */}
                <div
                  onClick={() => toggleChannel('hospital')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedChannels.includes('hospital')
                      ? 'bg-sky-50/80 border-sky-400 text-slate-900 ring-1 ring-sky-300'
                      : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('hospital')}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-sky-600"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-600" /> Hospital Review Channel (Default ON)
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Request goes directly to KIMS hospital medical desk for review and clinical appointment scheduling.
                    </p>
                  </div>
                </div>

                {/* Nearby Donors Channel */}
                <div
                  onClick={() => toggleChannel('donors')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedChannels.includes('donors')
                      ? 'bg-red-50/80 border-red-300 text-slate-900 ring-1 ring-red-300'
                      : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('donors')}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-red-600"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-red-600" /> Direct Nearby Donors Channel
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Notifies eligible matching donors in {city} instantly, independent of hospital approval wait times. Donors can Accept/Decline directly.
                    </p>
                  </div>
                </div>

                {/* Blood Banks Channel */}
                <div
                  onClick={() => toggleChannel('bloodbank')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedChannels.includes('bloodbank')
                      ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 ring-1 ring-emerald-300'
                      : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('bloodbank')}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-emerald-600" /> Blood Bank Inventory Reserve Channel
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Sends direct stock check to regional blood banks in {city} to reserve available {bloodGroup} units instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REQUESTER INFO */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" /> Section 6: Requester Information
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Requester Full Name *</label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.requesterName && <span className="text-[10px] text-red-500 block mt-1">{errors.requesterName}</span>}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Relationship to Patient *</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
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
                  <label className="text-slate-700 font-bold block mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={requesterPhone}
                    onChange={e => setRequesterPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.requesterPhone && <span className="text-[10px] text-red-500 block mt-1">{errors.requesterPhone}</span>}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={e => setRequesterEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.requesterEmail && <span className="text-[10px] text-red-500 block mt-1">{errors.requesterEmail}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: LOCATION & GPS */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" /> Section 7: Location & GPS Geolocation
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">State *</label>
                  <select
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">District *</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  >
                    <option value="Dharwad">Dharwad</option>
                    <option value="Belagavi">Belagavi</option>
                    <option value="Bengaluru Urban">Bengaluru Urban</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.city && <span className="text-[10px] text-red-500 block mt-1">{errors.city}</span>}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">6-Digit Pincode *</label>
                  <input
                    type="text"
                    placeholder="580031"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                  {errors.pincode && <span className="text-[10px] text-red-500 block mt-1">{errors.pincode}</span>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Browser GPS Coordinates</span>
                  <span className="text-[11px] text-slate-500">
                    {gpsCoords ? `Lat: ${gpsCoords.lat.toFixed(4)}, Lng: ${gpsCoords.lng.toFixed(4)}` : 'Location not fetched'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Crosshair className="w-4 h-4 text-red-500 animate-spin-slow" />
                  {isLocating ? 'Locating...' : 'Use My Current Location'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: MEDICAL NOTES & PRESCRIPTION */}
          {currentStep === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" /> Section 8: Additional Medical Notes & Prescription
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Attending Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Mahesh Kulkarni"
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Medical Notes & Condition Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Additional details regarding patient condition..."
                    value={medicalNotes}
                    onChange={e => setMedicalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-sky-200 text-slate-900 focus:border-red-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Upload Prescription / Blood Slip (Optional)</label>
                  <div className="p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 text-center space-y-2">
                    {prescriptionFile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-sky-200 text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-slate-800 truncate max-w-xs">{prescriptionFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrescriptionFile(null)}
                          className="text-red-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1">
                        <Upload className="w-6 h-6 text-sky-500 mx-auto" />
                        <span className="font-bold text-slate-700 block text-xs">Click to upload Image or PDF</span>
                        <span className="text-[10px] text-slate-400 block">Max 5MB</span>
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

          {/* STEP 9: CONFIRMATION SUMMARY */}
          {currentStep === 9 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900">Confirmation Summary Review</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Dispatched channels: <strong>{selectedChannels.map(c => c.toUpperCase()).join(', ')}</strong>
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="space-y-3 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">1. Patient: {patientName} ({patientAge} yrs, {patientGender}) [ID: {patientIdInput}]</span>
                  <button onClick={() => setCurrentStep(1)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">2. Blood: {unitsNeeded} Units of {bloodGroup} ({bloodComponent})</span>
                  <button onClick={() => setCurrentStep(2)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">3. Hospital: {selectedHospital}, {city}</span>
                  <button onClick={() => setCurrentStep(3)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">4. Urgency: {urgency} ({requiredDate} at {requiredTime})</span>
                  <button onClick={() => setCurrentStep(4)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-amber-700">5. Selected Channels: {selectedChannels.map(c => c.toUpperCase()).join(', ')}</span>
                  <button onClick={() => setCurrentStep(5)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">6. Requester: {requesterName} ({relationship}, Phone: {requesterPhone})</span>
                  <button onClick={() => setCurrentStep(6)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                  <span className="font-bold text-slate-800">7. Location: {city}, {stateName} (Pincode: {pincode})</span>
                  <button onClick={() => setCurrentStep(7)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">8. Prescription Attached: {prescriptionFile ? prescriptionFile.name : 'None'}</span>
                  <button onClick={() => setCurrentStep(8)} className="text-red-600 font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className="p-4 border-t border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 flex items-center justify-between relative z-10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 font-bold text-xs border border-sky-200 flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div />}

          {currentStep < 9 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1 transition-all"
            >
              Next Section <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-lg shadow-red-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" /> Dispatch Multi-Channel Request
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
