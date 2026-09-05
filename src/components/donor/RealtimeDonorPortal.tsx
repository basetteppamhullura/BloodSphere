import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { checkDonorEligibility } from '../../utils/matchingEngine';
import {
  ShieldAlert,
  Heart,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
  Calendar,
  AlertCircle,
  Check,
  X,
  Droplet,
  ShieldCheck,
  Trophy,
  Activity,
  FileText,
  Send,
  Download
} from 'lucide-react';

export const RealtimeDonorPortal: React.FC = () => {
  const {
    requests,
    donors,
    donorRespondToRequest,
    toggleDonorAvailability,
    openEmergencyChat,
    leaderboard,
    scheduleDonationAppointment,
    showToast
  } = useApp();

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'tracking' | 'appointments' | 'impact' | 'history'>('requests');

  // Find active donor object or fallback
  const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];

  // Donor eligibility check
  const eligibility = checkDonorEligibility(loggedInDonor);

  // 1. Nearby Emergency Requests matching blood group (or universal O-)
  const incomingRequests = requests.filter(r => {
    if (r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED') return false;
    return r.bloodGroup === loggedInDonor.bloodGroup || loggedInDonor.bloodGroup === 'O-';
  });

  // 2. Tracked Requests (where donor clicked "I Can Donate")
  const acceptedRequests = requests.filter(r => {
    return (r.donorResponses || []).some(resp => resp.donorId === loggedInDonor.id && resp.status === 'ACCEPTED');
  });

  // Metrics calculations
  const totalDonations = loggedInDonor.totalDonations || 3;
  const livesSaved = totalDonations * 3;
  const bloodVolumeMl = totalDonations * 450;
  const donorPoints = loggedInDonor.points || (totalDonations * 150);

  // Mock appointments for tracking
  const appointments = [
    {
      id: 'APT-1092',
      centerName: 'KIMS Teaching Hospital Blood Center',
      city: 'Hubballi',
      date: '2026-09-12',
      timeSlot: '10:30 AM - 11:30 AM',
      type: 'Voluntary Whole Blood Donation',
      status: 'CONFIRMED',
      qrPassCode: 'PASS-KM9210'
    },
    {
      id: 'APT-1045',
      centerName: 'Rotary Club Regional Blood Camp',
      city: 'Dharwad',
      date: '2026-08-15',
      timeSlot: '02:00 PM - 03:00 PM',
      type: 'Platelet Single Donor Apheresis',
      status: 'COMPLETED',
      qrPassCode: 'PASS-RC4512'
    }
  ];

  // Verified Donation History
  const donationHistory = [
    {
      id: 'DON-8910',
      date: '2026-06-10',
      center: 'KIMS Regional Transfusion Desk, Hubballi',
      type: 'Whole Blood (PRBC)',
      volume: '450 mL',
      status: 'VERIFIED & ISSUED',
      impactNotes: 'Transfused to ICU Emergency Patient',
      certId: 'CERT-2026-8910'
    },
    {
      id: 'DON-7621',
      date: '2026-03-04',
      center: 'SDM Medical Center Storage Unit, Dharwad',
      type: 'Platelet Concentrate',
      volume: '350 mL',
      status: 'VERIFIED & ISSUED',
      impactNotes: 'Transfused to Dengue Critical Patient',
      certId: 'CERT-2026-7621'
    },
    {
      id: 'DON-5412',
      date: '2025-11-20',
      center: 'Rotary Blood Bank, Hubballi',
      type: 'Whole Blood (PRBC)',
      volume: '450 mL',
      status: 'VERIFIED & ISSUED',
      impactNotes: 'Transfused to Surgery Patient',
      certId: 'CERT-2025-5412'
    }
  ];

  return (
    <div className="space-y-6 text-xs animate-in fade-in max-w-6xl mx-auto pb-16">
      
      {/* 1. DONOR DASHBOARD HEADER & AVAILABILITY STATUS (Feature 4) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-2xl flex flex-col items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
              <span>{loggedInDonor.bloodGroup}</span>
              <span className="text-[9px] font-bold uppercase opacity-90">Donor</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{loggedInDonor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Lifesaver
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {loggedInDonor.city}, Karnataka • Emergency Alert System Online
              </p>
            </div>
          </div>

          {/* DONOR AVAILABILITY STATUS DROPDOWN (Feature 4) */}
          <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-0.5">Live Availability Status</span>
              <select
                value={loggedInDonor.availabilityStatus || 'AVAILABLE'}
                onChange={e => toggleDonorAvailability(loggedInDonor.id, e.target.value as any, loggedInDonor.emergencyAlertsEnabled)}
                className="bg-white text-slate-900 font-extrabold text-xs p-1.5 rounded-xl border border-sky-200 focus:outline-none cursor-pointer"
              >
                <option value="AVAILABLE" className="text-emerald-600 font-bold">🟢 AVAILABLE FOR EMERGENCY</option>
                <option value="TEMPORARILY UNAVAILABLE" className="text-amber-600 font-bold">🟡 TEMPORARILY UNAVAILABLE</option>
                <option value="NOT AVAILABLE" className="text-red-600 font-bold">🔴 NOT AVAILABLE</option>
              </select>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Total Verified Donations</span>
            <strong className="text-xl text-slate-900 font-black block">{totalDonations} Completed</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-sans block mb-1">Lives Saved</span>
            <strong className="text-xl text-emerald-700 font-black block">{livesSaved} Lives</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] text-slate-500 font-sans block mb-1">Next Eligible Date</span>
            <strong className="text-xs text-emerald-600 font-bold block mt-1">{loggedInDonor.nextEligibleDate || 'Eligible Now'}</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
            <span className="text-[10px] text-red-600 font-sans block mb-1">Nearby Emergency Alerts</span>
            <strong className="text-xl text-red-600 font-black block">{incomingRequests.length} Active</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-sans block mb-1">Accepted Commitments</span>
            <strong className="text-xl text-indigo-700 font-black block">{acceptedRequests.length} Commitments</strong>
          </div>
        </div>
      </div>

      {/* 2. EMERGENCY BLOOD ALERTS BANNER (Feature 5) */}
      {incomingRequests.some(r => r.urgency === 'CRITICAL') && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-white fill-red-500 animate-pulse shrink-0" />
            <div>
              <strong className="text-sm font-black uppercase tracking-wider block">🚨 CRITICAL EMERGENCY TRAUMA ALERT</strong>
              <p className="text-xs text-red-100 mt-0.5">
                Urgent blood request ({incomingRequests.find(r => r.urgency === 'CRITICAL')?.bloodGroup}) requires immediate response within 2 hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="px-5 py-2.5 rounded-2xl bg-white text-red-700 font-black text-xs hover:bg-red-50 shadow-md shrink-0 transition-all hover:scale-105"
          >
            Respond Now
          </button>
        </div>
      )}

      {/* 3. 5-TAB FEATURE NAVIGATION BAR */}
      <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap gap-2 text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Zap className="w-4 h-4" /> <span>Nearby Blood Requests ({incomingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Activity className="w-4 h-4" /> <span>Request Tracking ({acceptedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Calendar className="w-4 h-4" /> <span>Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'impact'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <Trophy className="w-4 h-4" /> <span>Impact & Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-red-600 text-white font-black shadow-sm'
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          <FileText className="w-4 h-4" /> <span>Donation History</span>
        </button>
      </div>

      {/* TAB 1: NEARBY BLOOD REQUESTS (Feature 1) */}
      {activeTab === 'requests' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" /> Live Nearby Emergency Requests Feed
              </h3>
              <p className="text-slate-500 text-[11px]">Real-time push alerts matched to your blood group ({loggedInDonor.bloodGroup}) in {loggedInDonor.city}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black border border-red-200">
              {incomingRequests.length} Active Requests
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="p-10 rounded-2xl bg-sky-50/40 border border-sky-100 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <strong className="block text-slate-900 font-black text-sm">No Active Emergency Requests Right Now</strong>
              <p className="text-xs max-w-md mx-auto">No emergency requests match your blood group in your area right now. We will notify you immediately when a patient requires blood.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map(req => {
                const myResp = (req.donorResponses || []).find(r => r.donorId === loggedInDonor.id);
                const isAccepted = myResp?.status === 'ACCEPTED';
                const isDeclined = myResp?.status === 'DECLINED';

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-3xl border-2 transition-all space-y-4 shadow-sm ${
                      req.urgency === 'CRITICAL' ? 'border-red-300 bg-red-50/30 ring-1 ring-red-300' : 'border-sky-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-sky-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
                          <span>{req.bloodGroup}</span>
                          <span className="text-[9px] opacity-90">{req.bloodComponent || 'PRBC'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[10px] uppercase border border-red-200">
                              🚨 {req.urgency}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">ID: {req.id}</span>
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900 mt-0.5">{req.patientName}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-red-500" /> {req.hospitalName}, {req.city}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {req.unitsNeeded} Units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-sky-50/50 p-3 rounded-2xl border border-sky-100 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 font-sans block">Required Within</span>
                        <strong className="text-amber-600 font-bold">{req.requiredTime || 'Within 2 Hours'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-sans block">Confirmed Donors</span>
                        <strong className="text-emerald-600 font-bold">{req.confirmedUnits || 0} / {req.unitsNeeded} Units</strong>
                      </div>
                    </div>

                    {/* ACTION BUTTONS WITH "I CAN DONATE" (Feature 2) */}
                    <div className="pt-1">
                      {isAccepted ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                          <span>✅ Response Recorded: "I Can Donate"</span>
                          <button
                            onClick={() => openEmergencyChat(req.id, loggedInDonor.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all hover:scale-105"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                          </button>
                        </div>
                      ) : isDeclined ? (
                        <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-bold text-center">
                          ℹ️ You declined this request.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              donorRespondToRequest(req.id, loggedInDonor.id, 'ACCEPTED');
                              showToast(`Response recorded: "I Can Donate" for request ${req.id}!`);
                            }}
                            className="py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> I CAN DONATE
                          </button>

                          <button
                            onClick={() => {
                              donorRespondToRequest(req.id, loggedInDonor.id, 'DECLINED');
                              showToast(`Declined request ${req.id}.`);
                            }}
                            className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <X className="w-4 h-4" /> DECLINE
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DONATION REQUEST TRACKING (Feature 2) */}
      {activeTab === 'tracking' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Active Donation Request Tracking
              </h3>
              <p className="text-slate-500 text-[11px]">Track real-time status of emergency requests where you committed "I Can Donate"</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black border border-indigo-200">
              {acceptedRequests.length} Active Commitments
            </span>
          </div>

          {acceptedRequests.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 space-y-2">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <strong className="block text-slate-900 font-bold">No Active Commitments Tracked</strong>
              <p className="text-xs">When you click "I Can Donate" on an emergency request, your commitment will be tracked live here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedRequests.map(req => (
                <div key={req.id} className="p-5 rounded-3xl bg-white border border-indigo-100 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                          🩸 {req.bloodGroup}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900">{req.patientName}</h4>
                        <span className="text-xs font-mono text-slate-400">Request ID: {req.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Hospital: <strong>{req.hospitalName}</strong> ({req.city}) • Contact: {req.contactPerson} ({req.maskedPhone || req.contactPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                        Response Recorded: "I Can Donate"
                      </span>
                      <button
                        onClick={() => openEmergencyChat(req.id, loggedInDonor.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" /> Live Chat
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Hospital verification pending. Your donation will only be marked as COMPLETED after blood collection is verified by hospital staff.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DONATION APPOINTMENT TRACKING (Feature 7) */}
      {activeTab === 'appointments' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" /> Donation Appointment & Camp Schedule Tracking
              </h3>
              <p className="text-slate-500 text-[11px]">Manage scheduled donation slots at regional hospitals & mobile blood camps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map(apt => (
              <div key={apt.id} className="p-5 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-xs">
                <div className="flex items-start justify-between border-b border-sky-100 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                      Status: {apt.status}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 mt-1">{apt.centerName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> {apt.city}, Karnataka
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                    {apt.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-sky-50/50 p-3 rounded-2xl border border-sky-100">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Date & Time Slot</span>
                    <strong className="text-slate-900 font-bold block">{apt.date}</strong>
                    <span className="text-emerald-700 text-[11px] block">{apt.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Donation Type</span>
                    <strong className="text-slate-900 font-bold block">{apt.type}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">Fast-Track Pass: <strong>{apt.qrPassCode}</strong></span>
                  <button
                    onClick={() => showToast(`Appointment ${apt.id} verified at ${apt.centerName}`)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-xs"
                  >
                    View Directions & Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DONATION IMPACT & MILESTONES (Feature 6) */}
      {activeTab === 'impact' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm">
          <div className="border-b border-sky-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Lifesaver Impact & Milestone Badges
            </h3>
            <p className="text-slate-500 text-[11px]">Visual representation of your contributions and earned recognition badges</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md space-y-1">
              <span className="text-xs text-emerald-100 font-sans uppercase font-bold block">Estimated Lives Saved</span>
              <strong className="text-4xl font-black block tracking-tight">{livesSaved}</strong>
              <p className="text-[11px] text-emerald-100 font-sans mt-2">Every whole blood unit can save up to 3 emergency lives.</p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-md space-y-1">
              <span className="text-xs text-red-100 font-sans uppercase font-bold block">Total Volume Donated</span>
              <strong className="text-4xl font-black block tracking-tight">{bloodVolumeMl} mL</strong>
              <p className="text-[11px] text-red-100 font-sans mt-2">Aggregated total across {totalDonations} verified blood collections.</p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md space-y-1">
              <span className="text-xs text-amber-100 font-sans uppercase font-bold block">Lifesaver Reward Points</span>
              <strong className="text-4xl font-black block tracking-tight">{donorPoints} Pts</strong>
              <p className="text-[11px] text-amber-100 font-sans mt-2">Ranked #4 on Karnataka Regional Leaderboard.</p>
            </div>
          </div>

          {/* BADGES GRID */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm text-slate-900">Earned Recognition Badges</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5">
                <Award className="w-8 h-8 text-amber-600 mx-auto" />
                <strong className="text-xs font-black text-amber-900 block">Bronze Hero</strong>
                <span className="text-[10px] text-amber-700 block font-mono">1st Donation Completed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-center space-y-1.5">
                <Award className="w-8 h-8 text-slate-600 mx-auto" />
                <strong className="text-xs font-black text-slate-900 block">Silver Savior</strong>
                <span className="text-[10px] text-slate-600 block font-mono">3+ Donations Completed</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-300 text-center space-y-1.5 opacity-60">
                <Award className="w-8 h-8 text-yellow-600 mx-auto" />
                <strong className="text-xs font-black text-slate-700 block">Gold Lifesaver</strong>
                <span className="text-[10px] text-slate-500 block font-mono">5 Donations Needed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5 opacity-40">
                <Award className="w-8 h-8 text-indigo-400 mx-auto" />
                <strong className="text-xs font-black text-slate-500 block">Platinum Guardian</strong>
                <span className="text-[10px] text-slate-400 block font-mono">10 Donations Needed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DONATION HISTORY (Feature 3) */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> Verified Donation History Log
              </h3>
              <p className="text-slate-500 text-[11px]">Official medical record of all verified blood donations completed by you</p>
            </div>
          </div>

          <div className="divide-y divide-sky-100">
            {donationHistory.map(item => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">
                      {item.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">{item.id}</span>
                    <span className="text-slate-400 text-xs">• {item.date}</span>
                  </div>
                  <strong className="text-sm font-black text-slate-900 block">{item.center}</strong>
                  <p className="text-xs text-slate-500">
                    Component: <strong>{item.type}</strong> ({item.volume}) • Impact: <span className="text-emerald-700 font-bold">{item.impactNotes}</span>
                  </p>
                </div>

                <button
                  onClick={() => showToast(`Downloaded Official Donation Certificate ${item.certId}`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4 text-slate-600" /> Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
