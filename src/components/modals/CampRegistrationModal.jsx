import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Heart, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Trash2, 
  Building2, 
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const CampRegistrationModal = ({ camp, onClose, initialViewRegistration = null }) => {
  const { registerForCamp, cancelCampRegistration, campRegistrations } = useApp();
  const { currentUser } = useAuth();

  // Check if current user or saved session is already registered
  const existingUserReg = initialViewRegistration || campRegistrations?.find(r => 
    r.campId === camp.id && (
      (currentUser?.id && r.participantUserId === currentUser.id) ||
      (currentUser?.phone && r.phoneNumber === currentUser.phone)
    ) && r.registrationStatus !== 'CANCELLED'
  );

  const [viewState, setViewState] = useState(existingUserReg ? 'PASS' : 'FORM'); // 'FORM' | 'SUCCESS' | 'PASS' | 'DUPLICATE'
  const [activeRegistration, setActiveRegistration] = useState(existingUserReg || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [age, setAge] = useState(currentUser?.age ? String(currentUser.age) : '24');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  
  // Location
  const [city, setCity] = useState(camp?.city || 'Bengaluru');
  const [district, setDistrict] = useState(camp?.city || 'Bengaluru Urban');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');

  // Donation Information
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O+');
  const [previousDonation, setPreviousDonation] = useState('Yes');
  const [lastDonationDate, setLastDonationDate] = useState('2025-11-10');
  const [preferredTime, setPreferredTime] = useState(camp?.time ? camp.time.split('-')[0].trim() : '09:00 AM');

  // Medical Eligibility
  const [eligibilityAge, setEligibilityAge] = useState(false);
  const [eligibilityHealth, setEligibilityHealth] = useState(false);
  const [eligibilityScreening, setEligibilityScreening] = useState(false);

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Parent');

  // Consent
  const [consent, setConsent] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

  const validateField = (field, val) => {
    let errs = { ...errors };
    if (field === 'fullName') {
      if (!val || val.trim().length < 2) errs.fullName = 'Please enter your full name.';
      else delete errs.fullName;
    }
    if (field === 'phoneNumber') {
      const cleanPhone = val.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) errs.phoneNumber = 'Please enter a valid 10-digit mobile number.';
      else delete errs.phoneNumber;
    }
    if (field === 'age') {
      const ageNum = parseInt(val, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) errs.age = 'Please enter a valid age between 18 and 65.';
      else delete errs.age;
    }
    if (field === 'gender') {
      if (!val) errs.gender = 'Please select your gender.';
      else delete errs.gender;
    }
    if (field === 'city') {
      if (!val || val.trim().length < 2) errs.city = 'Please enter your city/place.';
      else delete errs.city;
    }
    if (field === 'bloodGroup') {
      if (!val) errs.bloodGroup = 'Please select your blood group.';
      else delete errs.bloodGroup;
    }
    setErrors(errs);
  };

  const isFormValid = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const ageNum = parseInt(age, 10);
    return (
      fullName.trim().length >= 2 &&
      cleanPhone.length === 10 &&
      !isNaN(ageNum) && ageNum >= 18 && ageNum <= 65 &&
      gender &&
      city.trim().length >= 2 &&
      bloodGroup &&
      eligibilityAge &&
      eligibilityHealth &&
      eligibilityScreening &&
      consent
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!isFormValid()) {
      setServerError('Please fix all highlighted errors and accept medical eligibility & consent requirements.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      campId: camp.id,
      participantUserId: currentUser?.id || null,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      email: email.trim(),
      age: parseInt(age, 10),
      gender,
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      bloodGroup,
      previousDonation,
      lastDonationDate: previousDonation === 'Yes' ? lastDonationDate : '',
      preferredTime,
      emergencyContact: emergencyName ? {
        name: emergencyName.trim(),
        phone: emergencyPhone.replace(/\D/g, ''),
        relationship: emergencyRelationship
      } : null,
      eligibilityConfirmed: true,
      consent: true
    };

    const res = await registerForCamp(payload);
    setIsSubmitting(false);

    if (res.success) {
      setActiveRegistration(res.registration);
      setViewState('SUCCESS');
    } else if (res.isDuplicate) {
      setActiveRegistration(res.registration);
      setViewState('DUPLICATE');
    } else {
      setServerError(res.message || 'Failed to register for camp. Please try again.');
    }
  };

  const handleCancelRegistration = async () => {
    if (!activeRegistration) return;
    if (window.confirm(`Are you sure you want to cancel registration ${activeRegistration.registrationId}?`)) {
      await cancelCampRegistration(activeRegistration.registrationId, camp.id);
      onClose();
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl w-full max-w-2xl overflow-hidden my-8 transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl">
              🩸
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {viewState === 'SUCCESS' ? 'Registration Successful! 🎉' : 
                 viewState === 'DUPLICATE' ? 'Already Registered' :
                 viewState === 'PASS' ? 'Blood Donation Camp Registration Pass' :
                 'Register for Blood Donation Camp'}
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {viewState === 'SUCCESS' || viewState === 'PASS' 
                  ? 'Official participation pass for voluntary blood drive'
                  : 'Enter your details to participate in this blood donation camp.'}
              </p>
            </div>
          </div>
        </div>

        {/* SELECTED CAMP INFORMATION HEADER CARD (Prompt Requirement 1 & 3) */}
        <div className="p-4 bg-slate-50 border-b border-sky-100">
          <div className="p-4 rounded-2xl bg-white border border-sky-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {camp.organizer || 'Authorized Medical Drive'}
              </span>
              <span className="text-[11px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Registered: {camp.rsvpsCount || 0} / {camp.expectedDonors || 100}
              </span>
            </div>

            <h3 className="font-black text-slate-900 text-base leading-snug">
              {camp.title || camp.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>Date:</strong> {camp.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>Time:</strong> {camp.time}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate"><strong>Venue:</strong> {camp.venue}, {camp.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY AREA */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

          {/* SERVER ERROR ALERT */}
          {serverError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>{serverError}</div>
            </div>
          )}

          {/* ================================================== */}
          {/* VIEW: DUPLICATE REGISTRATION ALERT                 */}
          {/* ================================================== */}
          {viewState === 'DUPLICATE' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h4 className="text-lg font-black text-amber-900">You are already registered for this camp.</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Our system found an existing registration pass under your contact details for this specific blood donation drive.
                </p>
              </div>

              {activeRegistration && (
                <div className="p-4 rounded-xl bg-white border border-amber-200 text-left text-xs space-y-1 font-mono">
                  <p><strong>Registration ID:</strong> <span className="text-blue-700 font-bold">{activeRegistration.registrationId}</span></p>
                  <p><strong>Name:</strong> {activeRegistration.fullName}</p>
                  <p><strong>Blood Group:</strong> {activeRegistration.bloodGroup}</p>
                  <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">{activeRegistration.registrationStatus || 'REGISTERED'}</span></p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewState('PASS')}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors shadow-xs"
                >
                  View Registration Pass
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* VIEW: SUCCESS / REGISTRATION PASS                  */}
          {/* ================================================== */}
          {(viewState === 'SUCCESS' || viewState === 'PASS') && activeRegistration && (
            <div className="space-y-6 printable-pass">
              {viewState === 'SUCCESS' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-black text-emerald-950">Registration Complete!</h4>
                  <p className="text-xs text-emerald-700 font-medium">
                    A confirmation pass has been issued for your participation.
                  </p>
                </div>
              )}

              {/* PASS CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-2 border-blue-200 shadow-md space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

                {/* PASS HEADER */}
                <div className="flex items-start justify-between border-b border-blue-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      BloodNet Official Pass
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-0.5">
                      {camp.title || camp.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Registration ID</span>
                    <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-sm tracking-wider shadow-xs inline-block mt-0.5">
                      {activeRegistration.registrationId}
                    </span>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-blue-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Status: <strong className="text-blue-700">{activeRegistration.registrationStatus || 'REGISTERED'}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    REGISTERED ≠ DONATED
                  </span>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">Participant Name</span>
                    <strong className="text-slate-900 text-sm font-black">{activeRegistration.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">Blood Group</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-700 font-black text-sm inline-block">
                      {activeRegistration.bloodGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">Mobile Number</span>
                    <span className="font-mono text-slate-800">{activeRegistration.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">City / Location</span>
                    <span className="text-slate-800">{activeRegistration.city}, {activeRegistration.state}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">Camp Date</span>
                    <span className="font-semibold text-slate-800">{camp.date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-normal">Reporting Time</span>
                    <span className="font-semibold text-slate-800">{activeRegistration.preferredTime || camp.time}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-400 block font-normal">Camp Venue</span>
                    <span className="text-slate-800 font-semibold">{camp.venue}, {camp.city}</span>
                  </div>
                </div>

                {/* MEDICAL NOTE */}
                <p className="text-[10px] text-slate-500 italic bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  ℹ️ Final medical screening and donor eligibility will be evaluated on-site by authorized medical staff prior to blood collection.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintPass}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Pass</span>
                </button>

                {activeRegistration.registrationStatus !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Registration</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* VIEW: REGISTRATION FORM                            */}
          {/* ================================================== */}
          {viewState === 'FORM' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* -------------------------------------------------- */}
              {/* SECTION 1: PERSONAL INFORMATION                    */}
              {/* -------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Personal Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        validateField('fullName', e.target.value);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all ${
                        errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={e => {
                        setPhoneNumber(e.target.value);
                        validateField('phoneNumber', e.target.value);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all ${
                        errors.phoneNumber ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Age (18 - 65)"
                      min={18}
                      max={65}
                      value={age}
                      onChange={e => {
                        setAge(e.target.value);
                        validateField('age', e.target.value);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all ${
                        errors.age ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.age && <p className="text-[11px] text-red-500 font-medium">{errors.age}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={e => {
                        setGender(e.target.value);
                        validateField('gender', e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* SECTION 2: LOCATION INFORMATION                    */}
              {/* -------------------------------------------------- */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Location Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Place / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={city}
                      onChange={e => {
                        setCity(e.target.value);
                        validateField('city', e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      District
                    </label>
                    <input
                      type="text"
                      placeholder="Enter district"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* SECTION 3: DONATION INFORMATION                    */}
              {/* -------------------------------------------------- */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Donation Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={e => {
                        setBloodGroup(e.target.value);
                        validateField('bloodGroup', e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-red-600 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Previous Blood Donation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Previous Blood Donation
                    </label>
                    <div className="flex items-center gap-4 pt-1.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="prevDonation"
                          value="Yes"
                          checked={previousDonation === 'Yes'}
                          onChange={() => setPreviousDonation('Yes')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="prevDonation"
                          value="No"
                          checked={previousDonation === 'No'}
                          onChange={() => setPreviousDonation('No')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Last Donation Date */}
                  {previousDonation === 'Yes' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Last Donation Date
                      </label>
                      <input
                        type="date"
                        value={lastDonationDate}
                        onChange={e => setLastDonationDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Preferred Time */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Preferred Donation Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      value={preferredTime}
                      onChange={e => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* SECTION 4: MEDICAL ELIGIBILITY QUESTIONS           */}
              {/* -------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wide">
                    Medical Eligibility Questions
                  </h4>
                </div>

                <p className="text-xs font-medium text-slate-700">
                  Before registering, please confirm:
                </p>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityAge}
                      onChange={e => setEligibilityAge(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I am within the eligible age range (18–65 years) for blood donation.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityHealth}
                      onChange={e => setEligibilityHealth(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I am feeling well and have no current illness that would prevent donation.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityScreening}
                      onChange={e => setEligibilityScreening(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I understand that final eligibility will be determined by qualified medical staff at the camp.</span>
                  </label>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* SECTION 5: EMERGENCY CONTACT (Optional)            */}
              {/* -------------------------------------------------- */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Emergency Contact <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact person"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      maxLength={10}
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Relationship
                    </label>
                    <select
                      value={emergencyRelationship}
                      onChange={e => setEmergencyRelationship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    >
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother/Sister">Brother/Sister</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* SECTION 6: CONSENT & SUBMIT                        */}
              {/* -------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I agree to provide my information for registration and participation in this blood donation camp.
                  </span>
                </label>

                <p className="text-[11px] text-slate-500 font-medium border-t border-slate-200 pt-2">
                  🔒 <strong>Privacy Assurance:</strong> Your information will be used for camp registration and coordination and will not be displayed publicly.
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isFormValid() && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering Participant...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      <span>Register for Camp</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
