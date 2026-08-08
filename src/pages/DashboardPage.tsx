import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonRow } from '../components/common/Skeleton';
import { BloodGroup } from '../types';
import { RequesterActionHub } from '../components/requester/RequesterActionHub';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Calendar,
  Award,
  ChevronRight,
  TrendingUp,
  XCircle,
  Check,
  FileText,
  MapPin,
  Phone,
  Droplet,
  Download,
  UserCheck,
  RefreshCw,
  KeyRound,
  Copy,
  Ban,
  ShieldAlert,
  Share2,
  CheckSquare,
  RotateCcw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    isLoading,
    requests,
    approveRequestByHospital,
    rejectRequestByHospital,
    donorAcceptRequest,
    donorDeclineRequest,
    scheduleDonationAppointment,
    markDonationCompleted,
    approveBloodBankReservation,
    createEmergencyRequest,
    bloodBanks,
    updateInventoryStock,
    donors,
    createPatientVerification,
    setActiveEmergencyPostModal,
    showToast
  } = useApp();

  const { currentRole, currentUser, portalAccounts, updateAccountStatusByAdmin } = useAuth();

  // Schedule Modal State
  const [scheduleModalReqId, setScheduleModalReqId] = useState<string | null>(null);
  const [schDate, setSchDate] = useState<string>('2026-08-08');
  const [schTime, setSchTime] = useState<string>('10:00 AM');
  const [schVenue, setSchVenue] = useState<string>('KIMS Hospital Blood Bank Unit');

  // Hospital Verification Generator Form State
  const [pvPatientName, setPvPatientName] = useState('Rohan Deshmukh');
  const [pvBloodGroup, setPvBloodGroup] = useState<BloodGroup>('O-');
  const [pvHospitalName, setPvHospitalName] = useState('KIMS Teaching Hospital');
  const [generatedPv, setGeneratedPv] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonRow />
        <SkeletonCard />
      </div>
    );
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleModalReqId) {
      scheduleDonationAppointment(scheduleModalReqId, schDate, schTime, schVenue);
      setScheduleModalReqId(null);
    }
  };

  const handleGeneratePvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createPatientVerification(pvPatientName, pvBloodGroup, pvHospitalName);
    setGeneratedPv(created);
  };

  // 1-Click Request Reorder Handler
  const handleReorderRequest = (req: any) => {
    createEmergencyRequest({
      patientName: req.patientName,
      patientAge: req.patientAge,
      patientGender: req.patientGender,
      bloodGroup: req.bloodGroup,
      unitsNeeded: req.unitsNeeded,
      hospitalName: req.hospitalName,
      city: req.city,
      contactPerson: req.contactPerson,
      contactPhone: req.contactPhone,
      selectedChannels: req.selectedChannels || ['hospital', 'donors', 'bloodbank'],
      reason: `REORDERED: ${req.reason}`
    });
    showToast(`Request for ${req.patientName} reordered with 1-click!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Banner & Role Perspective Pill */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/60 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-red-500">Sphere</span> Dashboard
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-950 text-red-300 border border-red-800 uppercase tracking-wider">
              {currentRole} Mode Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Multi-Channel Grid • Hubballi-Dharwad Regional Network
          </p>
        </div>

        <button
          onClick={() => setActiveEmergencyPostModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Create Blood Request
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. REQUESTER DASHBOARD VIEW                           */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'requester' && (
        <div className="space-y-8">
          
          {/* Guided Action Hub (3 Tiles: Emergency, Find Hospital, Find Blood Bank) */}
          <RequesterActionHub />

          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" /> My Multi-Channel Requests & Pipeline Tracker
            </h3>
            <span className="text-xs text-slate-400">Total Requests: {requests.length}</span>
          </div>

          <div className="space-y-6">
            {requests.map(req => {
              const channels = req.selectedChannels || ['hospital', 'donors'];

              return (
                <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {req.bloodGroup}
                        </span>
                        <h4 className="font-extrabold text-base text-white">{req.patientName}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-amber-400 border border-slate-700">
                          {req.unitsNeeded} Units Required
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                          ID: {req.patientId || 'BN-HUB-2026-00852'}
                        </span>
                      </div>

                      {/* Multi-Channel Tags */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-bold text-slate-400">Sent to:</span>
                        {channels.map(ch => (
                          <span
                            key={ch}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              ch === 'hospital'
                                ? 'bg-blue-950 text-blue-300 border-blue-800'
                                : ch === 'donors'
                                ? 'bg-red-950 text-red-300 border-red-800'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        Hospital: <strong>{req.hospitalName}</strong>, {req.city} • Required Date: <strong>{req.requiredDate || 'Immediate'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorderRequest(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border border-slate-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reorder Request
                      </button>

                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shrink-0 ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : req.status === 'APPOINTMENT_SCHEDULED'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : req.status === 'DONOR_CONFIRMED'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        Overall: {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Channel Mini Status Tracker Cards */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Multi-Channel Parallel Status Tracker:
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {channels.includes('hospital') && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-blue-400" /> Hospital Review
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.fulfilledChannel === 'bloodbank'
                              ? 'bg-slate-800 text-slate-500'
                              : req.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}>
                            {req.fulfilledChannel === 'bloodbank' ? 'Fulfilled via Blood Bank — Closed' : req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}

                      {channels.includes('donors') && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-red-500" /> Direct Donors
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.fulfilledChannel === 'bloodbank'
                              ? 'bg-slate-800 text-slate-500'
                              : req.status === 'DONOR_CONFIRMED'
                              ? 'bg-blue-950 text-blue-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}>
                            {req.fulfilledChannel === 'bloodbank' ? 'Fulfilled via Blood Bank — Closed' : req.assignedDonorName ? `Accepted: ${req.assignedDonorName}` : 'Searching Donors'}
                          </span>
                        </div>
                      )}

                      {channels.includes('bloodbank') && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Droplet className="w-4 h-4 text-emerald-400" /> Blood Bank Stock
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.fulfilledChannel === 'bloodbank'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300'
                          }`}>
                            {req.fulfilledChannel === 'bloodbank' ? 'Stock Reserved & Fulfilled' : 'Stock Check Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmed Appointment Box */}
                  {req.appointmentDetails && (
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/80 space-y-2 text-xs">
                      <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Confirmed Donation Appointment:
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                        <div>Date: <strong className="text-white">{req.appointmentDetails.date}</strong></div>
                        <div>Time: <strong className="text-white">{req.appointmentDetails.time}</strong></div>
                        <div>Venue: <strong className="text-white">{req.appointmentDetails.venue}</strong></div>
                        <div>Donor: <strong className="text-amber-400">{req.appointmentDetails.assignedDonorName}</strong></div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. HOSPITAL DASHBOARD VIEW                            */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'hospital' && (
        <div className="space-y-6">
          
          {/* Hospital Patient Verification Generator Tool */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">Generate Patient Verification Record (Pre-Approval Code)</h3>
              </div>
              <span className="text-[10px] text-slate-400">Hospital Pre-Verification Desk</span>
            </div>

            <form onSubmit={handleGeneratePvSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={pvPatientName}
                  onChange={e => setPvPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Required Blood Group</label>
                <select
                  value={pvBloodGroup}
                  onChange={e => setPvBloodGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Phenotype (O-h)'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Hospital Unit</label>
                <input
                  type="text"
                  value={pvHospitalName}
                  onChange={e => setPvHospitalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" /> Generate Credentials
              </button>
            </form>

            {generatedPv && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 flex items-center justify-between text-slate-200">
                <div>
                  <span className="font-extrabold text-amber-300 block text-sm">Pre-Verification Credentials Generated:</span>
                  <div className="flex items-center gap-4 mt-1 font-mono text-xs">
                    <span>Patient ID: <strong className="text-white bg-slate-950 px-2 py-0.5 rounded">{generatedPv.patientId}</strong></span>
                    <span>Verification Code: <strong className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded">{generatedPv.verificationCode}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Patient ID: ${generatedPv.patientId}, Verification Code: ${generatedPv.verificationCode}`);
                    showToast('Credentials copied to clipboard!');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" /> Active Hospital Blood Requests Queue ({requests.length})
            </h3>
            <span className="text-xs text-slate-400">KIMS Regional Desk</span>
          </div>

          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                        {req.bloodGroup}
                      </span>
                      <h4 className="font-extrabold text-base text-white">{req.patientName}</h4>
                      <span className="text-xs text-slate-400">({req.unitsNeeded} Units needed)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Requester: <strong>{req.contactPerson} ({req.maskedPhone})</strong> • Hospital: <strong>{req.hospitalName}</strong>
                    </p>
                  </div>

                  {req.status === 'DONOR_CONFIRMED' && (
                    <button
                      onClick={() => setScheduleModalReqId(req.id)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" /> Schedule Appointment
                    </button>
                  )}

                  {req.status === 'APPOINTMENT_SCHEDULED' && (
                    <button
                      onClick={() => markDonationCompleted(req.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Donation Completed
                    </button>
                  )}

                  {req.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed & Stocked
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. DONOR DASHBOARD VIEW                               */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'donor' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Donations</span>
              <span className="text-2xl font-black text-white block">{currentUser?.totalDonations || 7}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Reward Points</span>
              <span className="text-2xl font-black text-amber-400 block">{currentUser?.points || 1250} pts</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Donation Streak</span>
              <span className="text-2xl font-black text-rose-500 block">🔥 {currentUser?.streak || 4}x</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Eligibility Status</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">Eligible to Donate</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Distance-Ranked Emergency Requests ({currentUser?.bloodGroup || 'O-'})
            </h3>

            <div className="space-y-4">
              {requests.map((req, idx) => {
                const isDirectDonorReq = req.selectedChannels?.includes('donors');
                const distances = ['3.2 km away', '7.8 km away', '14.5 km away', '22.0 km away'];
                const distTag = distances[idx % distances.length];

                return (
                  <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                            {req.bloodGroup}
                          </span>
                          <h4 className="font-extrabold text-base text-white">{req.patientName}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-emerald-400 border border-slate-800">
                            📍 {distTag}
                          </span>
                          {isDirectDonorReq && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                              Direct Requester Alert
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Hospital: <strong>{req.hospitalName}</strong> • Reason: {req.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => donorAcceptRequest(req.id, currentUser?.id || 'usr_donor_001')}
                          className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Accept & Confirm
                        </button>

                        <button
                          onClick={() => donorDeclineRequest(req.id, currentUser?.id || 'usr_donor_001')}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs border border-slate-700"
                        >
                          Decline
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. BLOOD BANK DASHBOARD VIEW                          */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'bloodbank' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-500" /> Regional Blood Stock & Inventory Reserve Desk
            </h3>
            <span className="text-xs text-slate-400">KIMS Regional Center</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" /> Direct Blood Bank Stock Reservation Queue
            </h4>

            <div className="space-y-3 text-xs">
              {requests.filter(r => r.selectedChannels?.includes('bloodbank')).map(req => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                        {req.bloodGroup}
                      </span>
                      <span className="font-extrabold text-white text-sm">{req.patientName}</span>
                      <span className="text-slate-400">({req.unitsNeeded} Units)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Hospital: {req.hospitalName} • Requester: {req.contactPerson} ({req.contactPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.fulfilledChannel === 'bloodbank' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Stock Reserved
                      </span>
                    ) : (
                      <button
                        onClick={() => approveBloodBankReservation(req.id, bloodBanks[0].id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Approve & Reserve Stock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bloodBanks.map(bank => (
              <div key={bank.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-base text-white">{bank.name}</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {bank.inventory.map(item => (
                    <div key={item.group} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <span className="font-extrabold text-red-400 text-sm">{item.group}</span>
                      <span className="text-lg font-black text-white">{item.units} Units</span>
                      
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => updateInventoryStock(bank.id, item.group, 1)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => updateInventoryStock(bank.id, item.group, -1)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. ADMIN DASHBOARD VIEW                               */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'admin' && (
        <div className="space-y-6">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Super Admin Network Control & License Verification Desk
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Total Registered Accounts</span>
              <span className="text-2xl font-black text-white block mt-1">{portalAccounts.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Verified Hospitals</span>
              <span className="text-2xl font-black text-blue-400 block mt-1">
                {portalAccounts.filter(a => a.role === 'hospital' && a.status === 'Verified').length + 42}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Active Blood Banks</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">
                {portalAccounts.filter(a => a.role === 'bloodbank' && a.status === 'Verified').length + 18}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Pending License Verifications</span>
              <span className="text-2xl font-black text-amber-400 block mt-1">
                {portalAccounts.filter(a => a.status === 'Pending Verification').length}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Hospital & Blood Bank License Verification Queue
            </h4>

            <div className="space-y-3 text-xs">
              {portalAccounts.map(acc => (
                <div key={acc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{acc.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                        {acc.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        acc.status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : acc.status === 'Pending Verification'
                          ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                          : 'bg-red-950 text-red-300 border-red-800'
                      }`}>
                        {acc.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Email: <strong>{acc.email}</strong> • Phone: {acc.phone} • License: <strong className="text-amber-400">{acc.licenseNumber || 'N/A'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {acc.status !== 'Verified' && (
                      <button
                        onClick={() => {
                          updateAccountStatusByAdmin(acc.id, 'Verified');
                          showToast(`Approved ${acc.name}! Account is now Verified.`);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Approve License
                      </button>
                    )}

                    {acc.status !== 'Disabled' && (
                      <button
                        onClick={() => {
                          updateAccountStatusByAdmin(acc.id, 'Disabled');
                          showToast(`Disabled ${acc.name}. Account access revoked.`);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs border border-slate-700 flex items-center gap-1"
                      >
                        <Ban className="w-4 h-4" /> Disable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Schedule Appointment Modal */}
      {scheduleModalReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Schedule Donation Appointment</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={schDate}
                  onChange={e => setSchDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Appointment Time</label>
                <input
                  type="text"
                  value={schTime}
                  onChange={e => setSchTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hospital Venue</label>
                <input
                  type="text"
                  value={schVenue}
                  onChange={e => setSchVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalReqId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
