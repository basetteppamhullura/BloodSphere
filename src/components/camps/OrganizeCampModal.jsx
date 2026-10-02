import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Building2, 
  Droplet, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  Phone,
  Mail,
  User,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const OrganizeCampModal = ({ 
  isOpen, 
  onClose, 
  existingCamp = null,
  forcedOrganizerType = null 
}) => {
  const { createCamp, updateCamp, showToast } = useApp();
  const { currentUser, currentRole } = useAuth();

  // Determine Organizer Type from role or forced prop
  const effectiveOrganizerType = forcedOrganizerType || 
    (currentRole === 'bloodbank' ? 'Blood Bank' : 'Hospital');

  // Authenticated Organizer details (cannot be faked)
  const organizerId = currentUser?.id || currentUser?._id || `org_${currentRole || 'hospital'}`;
  const organizerName = currentUser?.name || currentUser?.organizationName || 
    (effectiveOrganizerType === 'Hospital' ? 'KIMS Teaching Hospital' : 'Rotary Central Blood Bank');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Date & Time
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');

  // Location
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hubballi');
  const [district, setDistrict] = useState('Dharwad');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('580021');

  // Donation info
  const [targetGroups, setTargetGroups] = useState(BLOOD_GROUPS);
  const [expectedDonors, setExpectedDonors] = useState(100);
  const [availableSlots, setAvailableSlots] = useState(100);
  const [instructions, setInstructions] = useState('Please bring a valid photo ID. Have a light meal prior to donation. Ensure you are well hydrated.');
  const [eligibilityInfo, setEligibilityInfo] = useState('Age 18-65 years, weight 45kg+, Hb >= 12.5 g/dL. No donation in last 3 months.');
  const [notes, setNotes] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/bloodnet-hero-bg.jpg');
  const [status, setStatus] = useState('PUBLISHED');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize or prefill fields
  useEffect(() => {
    if (existingCamp) {
      setTitle(existingCamp.title || '');
      setDescription(existingCamp.description || '');
      setContactPerson(existingCamp.contactPerson || '');
      setContactPhone(existingCamp.contactPhone || '');
      setContactEmail(existingCamp.contactEmail || '');
      setDate(existingCamp.date || '');
      setStartTime(existingCamp.startTime || '09:00 AM');
      setEndTime(existingCamp.endTime || '04:00 PM');
      setVenue(existingCamp.venue || '');
      setAddress(existingCamp.address || '');
      setCity(existingCamp.city || 'Hubballi');
      setDistrict(existingCamp.district || 'Dharwad');
      setState(existingCamp.state || 'Karnataka');
      setPincode(existingCamp.pincode || '');
      setTargetGroups(existingCamp.targetGroups?.length ? existingCamp.targetGroups : BLOOD_GROUPS);
      setExpectedDonors(existingCamp.expectedDonors || 100);
      setAvailableSlots(existingCamp.availableSlots || existingCamp.expectedDonors || 100);
      setInstructions(existingCamp.instructions || '');
      setEligibilityInfo(existingCamp.eligibilityInfo || '');
      setNotes(existingCamp.notes || '');
      setBannerUrl(existingCamp.bannerUrl || '/bloodnet-hero-bg.jpg');
      setStatus(existingCamp.status || 'PUBLISHED');
    } else {
      // Default future date (10 days from today)
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const defaultDateStr = future.toISOString().split('T')[0];

      setTitle(`${organizerName} Community Blood Donation Drive`);
      setDescription(`Voluntary blood collection camp organized by ${organizerName} to replenish essential blood stocks and support regional emergency care.`);
      setContactPerson(currentUser?.contactPerson || currentUser?.name || 'Blood Bank Officer');
      setContactPhone(currentUser?.phone || currentUser?.mobile || '9845012345');
      setContactEmail(currentUser?.email || 'drives@bloodnet.org');
      setDate(defaultDateStr);
      setStartTime('09:00 AM');
      setEndTime('04:30 PM');
      setVenue(effectiveOrganizerType === 'Hospital' ? `${organizerName} Main Auditorium` : 'Town Hall Community Center');
      setCity(currentUser?.city || 'Hubballi');
      setDistrict('Dharwad');
      setState('Karnataka');
      setPincode('580021');
      setTargetGroups(BLOOD_GROUPS);
      setExpectedDonors(120);
      setAvailableSlots(120);
      setStatus('PUBLISHED');
    }
    setErrors({});
  }, [existingCamp, isOpen, currentUser, organizerName, effectiveOrganizerType]);

  if (!isOpen) return null;

  const toggleGroup = (grp) => {
    if (targetGroups.includes(grp)) {
      if (targetGroups.length === 1) return; // keep at least one
      setTargetGroups(prev => prev.filter(g => g !== grp));
    } else {
      setTargetGroups(prev => [...prev, grp]);
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Camp Name is required.';
    if (!date) errs.date = 'Camp Date is required.';
    if (!venue.trim()) errs.venue = 'Venue name is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 10) {
      errs.contactPhone = 'Please enter a valid 10-digit contact number.';
    }
    if (expectedDonors < 10) errs.expectedDonors = 'Expected donors should be at least 10.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      organizerType: effectiveOrganizerType,
      organizerId,
      organizer: organizerName,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      date,
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`,
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      targetGroups,
      expectedDonors: Number(expectedDonors),
      availableSlots: Number(availableSlots || expectedDonors),
      instructions: instructions.trim(),
      eligibilityInfo: eligibilityInfo.trim(),
      notes: notes.trim(),
      bannerUrl,
      status,
      category: `${effectiveOrganizerType} Drive`
    };

    try {
      if (existingCamp) {
        const campId = existingCamp.id || existingCamp.campId;
        const res = await updateCamp(campId, payload, currentUser);
        if (res.success) {
          onClose();
        }
      } else {
        const res = await createCamp(payload);
        if (res.success) {
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Error saving camp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-[#DCEAF5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#16324F] to-[#2563EB] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0">
              🩸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {existingCamp ? 'Edit Blood Donation Camp' : 'Organize Blood Donation Camp'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase border border-white/30">
                  {effectiveOrganizerType} Portal
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                Saved directly to database & automatically published to BloodNet Home Page in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authenticated Organization Banner (Requirement 4) */}
        <div className="px-6 py-3 bg-[#E8F4FF] border-b border-[#BFDBFE] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span className="text-slate-600 font-medium">Logged-in Verified Organizer:</span>
            <strong className="text-[#16324F] font-black">{organizerName}</strong>
            <span className="px-2 py-0.5 rounded-md bg-white text-[#2563EB] text-[10px] font-bold border border-[#BFDBFE]">
              {effectiveOrganizerType} ID: {organizerId}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Direct Database Link
          </span>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">

          {/* 1. CAMP INFORMATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#16324F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>1. Camp Information</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Camp Name / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., KIMS Mega Voluntary Blood Drive 2026"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB] ${
                  errors.title ? 'border-red-500 bg-red-50/50' : 'border-[#DCEAF5] bg-[#F5FAFF]'
                }`}
              />
              {errors.title && <span className="text-red-500 text-[10px] font-bold mt-0.5 block">{errors.title}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Camp Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of the donation camp goals, purpose, and special causes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Organizer Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Person</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="Doctor / Coordinator"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB] ${
                      errors.contactPhone ? 'border-red-500 bg-red-50/50' : 'border-[#DCEAF5] bg-[#F5FAFF]'
                    }`}
                  />
                </div>
                {errors.contactPhone && <span className="text-red-500 text-[10px] font-bold mt-0.5 block">{errors.contactPhone}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="email@organization.org"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. DATE & TIME */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#16324F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>2. Date & Time Schedule</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Camp Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB] ${
                      errors.date ? 'border-red-500 bg-red-50/50' : 'border-[#DCEAF5] bg-[#F5FAFF]'
                    }`}
                  />
                </div>
                {errors.date && <span className="text-red-500 text-[10px] font-bold mt-0.5 block">{errors.date}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. LOCATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#16324F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>3. Location & Venue</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="e.g. Auditorium / Main Campus Hall"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB] ${
                      errors.venue ? 'border-red-500 bg-red-50/50' : 'border-[#DCEAF5] bg-[#F5FAFF]'
                    }`}
                  />
                </div>
                {errors.venue && <span className="text-red-500 text-[10px] font-bold mt-0.5 block">{errors.venue}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Street / Area Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Vidyanagar Main Road"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Hubballi"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    errors.city ? 'border-red-500 bg-red-50/50' : 'border-[#DCEAF5] bg-[#F5FAFF]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Dharwad"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="Karnataka"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="580021"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* 4. BLOOD DONATION INFORMATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#16324F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>4. Blood Donation Targets & Groups</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Target / Preferred Blood Groups (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map(grp => {
                  const isSelected = targetGroups.includes(grp);
                  return (
                    <button
                      type="button"
                      key={grp}
                      onClick={() => toggleGroup(grp)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#EF4444] text-white border-red-600 shadow-xs scale-105'
                          : 'bg-[#F5FAFF] text-slate-600 border-[#DCEAF5] hover:bg-slate-100'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Expected Donors <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={expectedDonors}
                    onChange={e => {
                      setExpectedDonors(e.target.value);
                      setAvailableSlots(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Available Slots</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={availableSlots}
                  onChange={e => setAvailableSlots(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="PUBLISHED">🟢 PUBLISHED (Public on Home)</option>
                  <option value="UPCOMING">🟡 UPCOMING (Scheduled)</option>
                  <option value="DRAFT">⚪ DRAFT (Saved internally)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. INSTRUCTIONS & NOTES */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#16324F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>5. Donor Instructions & Eligibility Guidelines</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Instructions for Donors</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={2}
                  value={eligibilityInfo}
                  onChange={e => setEligibilityInfo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-[#DCEAF5] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#DCEAF5] hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingCamp ? 'Update Camp Details' : 'Publish Donation Camp →'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
