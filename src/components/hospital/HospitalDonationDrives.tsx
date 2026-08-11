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
  const { showToast } = useApp();

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
    showToast(`Recorded intake of +5 units for drive ${driveId}! Stock updated.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in text-xs">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" /> Hospital Donation Drive Campaign Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize donation camps, track registered donors, and convert intake directly into stock
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create Donation Drive
        </button>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drives.map(drive => (
          <div key={drive.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                  drive.status === 'Active Today'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse'
                    : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                }`}>
                  {drive.status}
                </span>
                <h3 className="font-extrabold text-base text-white mt-1">{drive.title}</h3>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-300">
              <div>📍 Location: <strong className="text-white">{drive.location}, {drive.city}</strong></div>
              <div>📅 Date & Time: <strong className="text-amber-400">{drive.date} ({drive.time})</strong></div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-slate-400 font-bold">Target Groups:</span>
                {drive.targetGroups.map(grp => (
                  <span key={grp} className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-extrabold text-[10px]">
                    {grp}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Target Units</span>
                <strong className="text-sm text-white">{drive.targetUnits}u</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Registered Donors</span>
                <strong className="text-sm text-blue-400">{drive.registeredCount}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Units Collected</span>
                <strong className="text-sm text-emerald-400">{drive.unitsCollected}u</strong>
              </div>
            </div>

            <button
              onClick={() => handleRecordIntake(drive.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Droplet className="w-4 h-4" /> Record Drive Intake (+5 Units to Stock)
            </button>
          </div>
        ))}
      </div>

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-600 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Create New Hospital Donation Drive</h3>
            
            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Drive Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Time *</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Units *</label>
                <input
                  type="number"
                  value={newTargetUnits}
                  onChange={e => setNewTargetUnits(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
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
