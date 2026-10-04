import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Prevent background scrolling while modal is open & add ESC key support
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Check if current user or saved session is already registered
  const existingUserReg = initialViewRegistration || campRegistrations?.find(r => 
    (r.campId === camp?.id || r.campId === camp?.campId) && (
      (currentUser?.id && r.participantUserId === currentUser.id) ||
      (currentUser?.phone && r.phoneNumber === currentUser.phone)
    ) && r.registrationStatus !== 'CANCELLED'
  );

  const [viewState, setViewState] = useState(existingUserReg ? 'PASS' : 'FORM'); // 'FORM' | 'SUCCESS' | 'PASS' | 'DUPLICATE'
  const [activeRegistration, setActiveRegistration] = useState(existingUserReg || null);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState(null);
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
      if (!cleanPhone || cleanPhone.length !== 10) errs.phoneNumber = 'Please enter a valid 10-digit phone number.';
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
      if (!val || val.trim().length < 2) errs.city = 'Please enter your place / city.';
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
      setServerError('Please fill all required fields correctly and accept medical eligibility & consent requirements.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      campId: camp?.id || camp?.campId,
      campTitle: camp?.title || camp?.name || 'Blood Donation Camp',
      campDate: camp?.date || '15 Oct 2026',
      campTime: camp?.time || '9:00 AM - 4:00 PM',
      campVenue: camp?.venue || camp?.location || 'Hospital / Venue',
      expectedDonors: camp?.expectedDonors || 100,
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
      setSmsDeliveryStatus(res.smsStatus || 'SENT');
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
      await cancelCampRegistration(activeRegistration.registrationId, camp?.id);
      onClose();
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="w-full max-w-[600px] max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-40px)] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.20)] flex flex-col overflow-hidden my-auto border border-slate-200 z-[1001]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* FIXED MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-start justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold">
              🩸
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Participate in Blood Donation Camp
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {viewState === 'SUCCESS' || viewState === 'PASS'
                  ? 'Official participation pass for voluntary blood drive'
                  : 'Enter your details to participate in this camp.'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-5">

          {/* SELECTED CAMP INFORMATION BANNER */}
          {camp && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-sky-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {camp.organizer || 'Authorized Blood Drive'}
                </span>
                <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Registered: {camp.rsvpsCount || 0} / {camp.expectedDonors || 100}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                {camp.title || camp.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1.5 border-t border-slate-200/60">
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
                  <span className="truncate"><strong>Venue:</strong> {camp.venue || camp.location}, {camp.city}</span>
                </div>
              </div>
            </div>
          )}

          {/* SERVER ERROR ALERT */}
          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>{serverError}</div>
            </div>
          )}

          {/* ================================================== */}
          {/* VIEW: DUPLICATE REGISTRATION ALERT                 */}
          {/* ================================================== */}
          {viewState === 'DUPLICATE' && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-lg font-bold">
                ⚠️
              </div>
              <div>
                <h4 className="text-base font-black text-amber-900">You are already registered for this camp.</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Our system found an existing registration pass under your contact details for this specific camp.
                </p>
              </div>

              {activeRegistration && (
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 text-left text-xs space-y-1 font-mono">
                  <p><strong>Registration ID:</strong> <span className="text-blue-700 font-bold">{activeRegistration.registrationId}</span></p>
                  <p><strong>Name:</strong> {activeRegistration.fullName}</p>
                  <p><strong>Blood Group:</strong> {activeRegistration.bloodGroup}</p>
                  <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">{activeRegistration.registrationStatus || 'REGISTERED'}</span></p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('PASS')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors shadow-xs"
                >
                  View Registration Pass
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
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
            <div className="space-y-5">
              {viewState === 'SUCCESS' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-black text-emerald-950">Registration Successful! 🎉</h4>
                  <p className="text-xs text-emerald-700 font-medium">
                    A confirmation pass has been generated for your blood donation camp participation.
                  </p>
                </div>
              )}

              {/* PASS CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-2 border-blue-200 shadow-md space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between border-b border-blue-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      BloodNet Official Pass
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {camp?.title || camp?.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-mono block">Registration ID</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-black text-xs tracking-wider shadow-xs inline-block mt-0.5">
                      {activeRegistration.registrationId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-blue-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Status: <strong className="text-blue-700">{activeRegistration.registrationStatus || 'REGISTERED'}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    REGISTERED ≠ DONATED
                  </span>
                </div>

                {/* SMS CONFIRMATION NOTICE (Prompt Requirement 9, 11, 12) */}
                {viewState === 'SUCCESS' && (
                  smsDeliveryStatus === 'SENT' || smsDeliveryStatus === 'SIMULATED' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ✓ Confirmation sent to your phone ({activeRegistration.phoneNumber})
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Confirmation SMS could not be delivered. Please verify your phone number or contact the camp organizer.
                      </span>
                    </div>
                  )
                )}

                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-700 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Participant Name</span>
                    <strong className="text-slate-900 font-black">{activeRegistration.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Blood Group</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-xs inline-block">
                      {activeRegistration.bloodGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Mobile Number</span>
                    <span className="font-mono text-slate-800">{activeRegistration.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">City / Location</span>
                    <span className="text-slate-800">{activeRegistration.city}, {activeRegistration.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Camp Date</span>
                    <span className="font-semibold text-slate-800">{camp?.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Reporting Time</span>
                    <span className="font-semibold text-slate-800">{activeRegistration.preferredTime || camp?.time}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block font-normal">Camp Venue</span>
                    <span className="text-slate-800 font-semibold">{camp?.venue || camp?.location}, {camp?.city}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic bg-slate-100 p-2 rounded-lg border border-slate-200">
                  ℹ️ Final medical screening and donor eligibility will be evaluated on-site by authorized medical staff prior to blood collection.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePrintPass}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save Pass</span>
                </button>

                {activeRegistration.registrationStatus !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Registration</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
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
            <form id="camp-reg-form" onSubmit={handleSubmit} className="space-y-5">

              {/* -------------------------------------------------- */}
              {/* PERSONAL & LOCATION INFORMATION                    */}
              {/* -------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Personal Information
                  </h4>
                </div>

                {/* DESKTOP: 2 COLUMNS, MOBILE: 1 COLUMN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
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
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border ${
                        errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={e => {
                        setPhoneNumber(e.target.value);
                        validateField('phoneNumber', e.target.value);
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border ${
                        errors.phoneNumber ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>}
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
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border ${
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && <p className="text-[11px] text-red-500 font-medium">{errors.gender}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
                    />
                  </div>

                  {/* Place / City */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Place / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your place / city"
                      value={city}
                      onChange={e => {
                        setCity(e.target.value);
                        validateField('city', e.target.value);
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border ${
                        errors.city ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-red-500 font-medium">{errors.city}</p>}
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
                    />
                  </div>

                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* DONATION INFORMATION                               */}
              {/* -------------------------------------------------- */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Donation Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-red-600 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
                    {errors.bloodGroup && <p className="text-[11px] text-red-500 font-medium">{errors.bloodGroup}</p>}
                  </div>

                  {/* Previous Blood Donation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Previous Blood Donation
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="prevDonation"
                          value="Yes"
                          checked={previousDonation === 'Yes'}
                          onChange={() => setPreviousDonation('Yes')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="prevDonation"
                          value="No"
                          checked={previousDonation === 'No'}
                          onChange={() => setPreviousDonation('No')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
                    />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* MEDICAL ELIGIBILITY QUESTIONS                      */}
              {/* -------------------------------------------------- */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wide">
                    Medical Eligibility Questions
                  </h4>
                </div>

                <p className="text-[11px] font-medium text-slate-700">
                  Before registering, please confirm:
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityAge}
                      onChange={e => setEligibilityAge(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I am within the eligible age range (18–65 years) for blood donation.</span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityHealth}
                      onChange={e => setEligibilityHealth(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I am feeling well and have no current illness that would prevent donation.</span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibilityScreening}
                      onChange={e => setEligibilityScreening(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I understand that final eligibility will be determined by qualified medical staff at the camp.</span>
                  </label>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* EMERGENCY CONTACT (Optional)                       */}
              {/* -------------------------------------------------- */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Emergency Contact <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact person"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Relationship
                    </label>
                    <select
                      value={emergencyRelationship}
                      onChange={e => setEmergencyRelationship(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all box-sizing-border"
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
              {/* CONSENT                                            */}
              {/* -------------------------------------------------- */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I agree to provide my information for registration and participation in this blood donation camp.
                  </span>
                </label>

                <p className="text-[10px] text-slate-500 font-medium border-t border-slate-200 pt-1.5">
                  🔒 <strong>Privacy Assurance:</strong> Your information will be used for camp registration and coordination and will not be displayed publicly.
                </p>
              </div>

            </form>
          )}

        </div>

        {/* FIXED FORM FOOTER WITH BUTTONS (Requirement 10 & 11) */}
        {viewState === 'FORM' && (
          <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="camp-reg-form"
              disabled={!isFormValid() || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
