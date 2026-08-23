import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { Calendar, Users, PlusCircle, CheckCircle2, MapPin, Sparkles, Droplet } from 'lucide-react';

interface DriveCampaign {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  targetUnits: number;
  registeredCount: number;
  unitsCollected: number;
  status: 'Upcoming' | 'Active Today' | 'Completed';
  targetGroups: BloodGroup[];
}

export const HospitalDonationDrives: React.FC = () => {
  const { intakeBloodUnit, showToast } = useApp();

  const [drives, setDrives] = useState<DriveCampaign[]>([
    {
      id: 'drv_001',
      title: 'Rotary KIMS Mega Blood Drive 2026',
      date: '2026-08-15',
      time: '09:00 AM - 04:00 PM',
      location: 'KIMS Medical Auditorium, Vidyanagar',
      city: 'Hubballi',
      targetUnits: 150,
      registeredCount: 84,
      unitsCollected: 45,
      status: 'Active Today',
      targetGroups: ['O-', 'O+', 'A-', 'B-']
    },
    {
      id: 'drv_002',
      title: 'Dharwad Campus Blood Donation Drive',
      date: '2026-08-22',
      time: '10:00 AM - 03:00 PM',
      location: 'SDM Campus Ground',
      city: 'Dharwad',
      targetUnits: 100,
      registeredCount: 38,
      unitsCollected: 0,
      status: 'Upcoming',
      targetGroups: ['A+', 'B+', 'AB+']
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('World Donor Day Special Drive');
  const [newDate, setNewDate] = useState<string>('2026-08-28');
  const [newTime, setNewTime] = useState<string>('09:00 AM - 02:00 PM');
  const [newLocation, setNewLocation] = useState<string>('Vidyanagar Community Center');
  const [newTargetUnits, setNewTargetUnits] = useState<number>(80);

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const created: DriveCampaign = {
      id: `drv_${Date.now().toString().slice(-4)}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      location: newLocation,
      city: 'Hubballi',
      targetUnits: newTargetUnits,
      registeredCount: 0,
      unitsCollected: 0,
      status: 'Upcoming',
      targetGroups: ['O-', 'O+', 'A+', 'B+']
    };

    setDrives(prev => [created, ...prev]);
    setShowCreateModal(false);
    showToast(`Published new donation drive: "${newTitle}"!`);
  };

  const handleRecordIntake = (driveId: string) => {
    setDrives(prev =>
      prev.map(d => (d.id === driveId ? { ...d, unitsCollected: d.unitsCollected + 5 } : d))
    );
    intakeBloodUnit({ bloodGroup: 'O+', component: 'Whole Blood', donorRef: `Drive ${driveId}` }, 'Hospital Staff');
    showToast(`Recorded intake of +5 units for drive ${driveId}! Stock updated.`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Donation Drive Campaign Manager</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
              REAL-TIME CAMPAIGNS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Organize donation camps, track registered donors, and convert intake directly into stock</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create Donation Drive
        </button>
      </div>

      {/* 2. DRIVES LIST (VERTICAL STACK OF CARDS) */}
      <div className="space-y-4">
        {drives.map(drive => (
          <div key={drive.id} className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  drive.status === 'Active Today'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  {drive.status}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{drive.title}</h3>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-600 font-mono">
              <div>📍 Location: <strong className="text-slate-900">{drive.location}, {drive.city}</strong></div>
              <div>📅 Date & Time: <strong className="text-amber-700">{drive.date} ({drive.time})</strong></div>
              <div className="flex items-center gap-1.5 pt-1 font-sans">
                <span className="text-slate-500 font-bold">Target Groups:</span>
                {drive.targetGroups.map(grp => (
                  <span key={grp} className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[10px] border border-red-200">
                    {grp}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-sky-100 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Target Units</span>
                <strong className="text-base text-slate-900">{drive.targetUnits}u</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Registered Donors</span>
                <strong className="text-base text-sky-700">{drive.registeredCount}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Units Collected</span>
                <strong className="text-base text-emerald-700">{drive.unitsCollected}u</strong>
              </div>
            </div>

            <button
              onClick={() => handleRecordIntake(drive.id)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <Droplet className="w-4 h-4" /> Record Drive Intake (+5 Units to Vault Stock)
            </button>
          </div>
        ))}
      </div>

      {/* CREATE DRIVE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create New Hospital Donation Drive</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>
            
            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Drive Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Time *</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Target Units *</label>
                <input
                  type="number"
                  value={newTargetUnits}
                  onChange={e => setNewTargetUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
                  Publish Donation Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
