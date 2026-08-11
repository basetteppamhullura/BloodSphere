import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonRow } from '../components/common/Skeleton';
import { BloodGroup } from '../types';
import { RequesterActionHub } from '../components/requester/RequesterActionHub';
import { HospitalHomeLanding } from '../components/hospital/HospitalHomeLanding';
import { HospitalMonitorDesk } from '../components/hospital/HospitalMonitorDesk';
import { HospitalEmergencyBoard } from '../components/hospital/HospitalEmergencyBoard';
import { HospitalInterCitySupply } from '../components/hospital/HospitalInterCitySupply';
import { HospitalDonationDrives } from '../components/hospital/HospitalDonationDrives';
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
  RotateCcw,
  Unlock,
  Radio,
  Sliders,
  Truck,
  Home
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
    setActiveEmergencyPostModal,
    showToast
  } = useApp();

  const {
    currentRole,
    currentUser,
    portalAccounts,
    updateAccountStatusByAdmin,
    unifiedPerspective,
    setUnifiedPerspective,
    unlockAccountByAdmin,
    failedAttemptsMap
  } = useAuth();

  // Active Sub View Tab for Hospital Perspective
  const [hospitalSubView, setHospitalSubView] = useState<'landing' | 'overview' | 'emergency_board' | 'inter_city' | 'blood_banks' | 'drives'>('landing');

  const [scheduleModalReqId, setScheduleModalReqId] = useState<string | null>(null);
  const [schDate, setSchDate] = useState<string>('2026-08-08');
  const [schTime, setSchTime] = useState<string>('10:00 AM');
  const [schVenue, setSchVenue] = useState<string>('KIMS Hospital Blood Bank Unit');

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

  const isPublicUser = currentRole === 'donor' || currentRole === 'requester';

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Banner & Perspective Toggle Pill */}
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

        {/* Perspective Controls / Actions */}
        {isPublicUser ? (
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setUnifiedPerspective('donor')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                unifiedPerspective === 'donor'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🩸 Donor View
            </button>
            <button
              onClick={() => setUnifiedPerspective('requester')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                unifiedPerspective === 'requester'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🆘 Requester View
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveEmergencyPostModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" /> Create Blood Request
            </button>
          </div>
        )}
      </div>

      {/* Hospital Perspective Navigation Bar */}
      {currentRole === 'hospital' && (
        <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-extrabold">
          <button
            onClick={() => setHospitalSubView('landing')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'landing' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" /> Home Landing
          </button>

          <button
            onClick={() => setHospitalSubView('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'overview' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Dashboard Overview
          </button>
          
          <button
            onClick={() => setHospitalSubView('emergency_board')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'emergency_board' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Emergency Board
          </button>

          <button
            onClick={() => setHospitalSubView('inter_city')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'inter_city' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Inter-City Supply
          </button>

          <button
            onClick={() => setHospitalSubView('blood_banks')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'blood_banks' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4" /> Blood Banks & Stock
          </button>

          <button
            onClick={() => setHospitalSubView('drives')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              hospitalSubView === 'drives' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> Donation Drives
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. UNIFIED PUBLIC USER VIEW — REQUESTER PERSPECTIVE   */}
      {/* ---------------------------------------------------- */}
      {isPublicUser && unifiedPerspective === 'requester' && (
        <div className="space-y-8">
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

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. UNIFIED PUBLIC USER VIEW — DONOR PERSPECTIVE       */}
      {/* ---------------------------------------------------- */}
      {isPublicUser && unifiedPerspective === 'donor' && (
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
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. HOSPITAL PERSPECTIVE FULL DASHBOARD SUITE        */}
      {/* ---------------------------------------------------- */}
      {currentRole === 'hospital' && (
        <div className="space-y-6">
          {hospitalSubView === 'landing' && <HospitalHomeLanding onNavigateToTab={(t) => setHospitalSubView(t)} />}
          {hospitalSubView === 'overview' && <HospitalMonitorDesk />}
          {hospitalSubView === 'emergency_board' && <HospitalEmergencyBoard />}
          {hospitalSubView === 'inter_city' && <HospitalInterCitySupply />}
          {hospitalSubView === 'drives' && <HospitalDonationDrives />}
          {hospitalSubView === 'blood_banks' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-400" /> Connected Regional Blood Bank Inventories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bloodBanks.map(bank => (
                  <div key={bank.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-white text-sm">{bank.name}</h4>
                    <p className="text-slate-400">{bank.address}, {bank.city} • Phone: {bank.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
