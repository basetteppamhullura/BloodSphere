import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
    Heart, Search, ShieldCheck, Zap, Users, Activity, ArrowRight,
    Sparkles, Building2, Droplet, MapPin, AlertTriangle, Bell,
    Hospital, RefreshCw, Radio, CheckCircle2, Clock, Filter, Database
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const LandingPage = () => {
    const {
        requests = [],
        donors = [],
        camps = [],
        bloodBanks = [],
        notifications = [],
        activityLogs = [],
        inventoryStockMap = {},
        isRealtimeConnected = true,
        connectionStatus = 'ONLINE',
        setActiveEmergencyPostModal
    } = useApp();

    const { currentUser, currentRole } = useAuth();
    const navigate = useNavigate();

    const [sourceFilter, setSourceFilter] = useState('ALL'); // ALL, DONORS, HOSPITALS, BLOOD_BANKS

    // Find active donor profile
    const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0] || {
        id: 'D-1001',
        name: 'Guest User',
        bloodGroup: 'O+',
        city: 'Hubballi',
        isEligible: true,
        availabilityStatus: '🟢 Available'
    };
    const eligibility = checkDonorEligibility(loggedInDonor);

    const getFindBloodPath = () => {
        if (!currentUser) return '/login';
        const paths = {
            donor: '/donor/directory',
            requester: '/requester/find-blood',
            hospital: '/hospital/blood-availability',
            bloodbank: '/bloodbank/inventory',
            admin: '/admin/dashboard'
        };
        return paths[currentRole] || '/login';
    };

    const getDonateBloodPath = () => {
        if (!currentUser) return '/login';
        const paths = {
            donor: '/donor/emergency',
            requester: '/requester/requests',
            hospital: '/hospital/requests',
            bloodbank: '/bloodbank/requests',
            admin: '/admin/requests'
        };
        return paths[currentRole] || '/login';
    };

    // Compute live metrics from real state
    const activeRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    const activeDonorsCount = donors.filter(d => d.isEligible || d.status === 'ACTIVE' || d.availabilityStatus?.includes('Available')).length || donors.length;
    const bloodBankCount = bloodBanks.length;
    const hospitalCount = new Set(['KIMS Teaching Hospital', 'SDM Medical College & Hospital', 'BVB Trauma Center', ...bloodBanks.map(b => b.name)]).size;
    const nearbyCampsCount = camps.length;

    // Helper to calculate real-time inventory by blood group
    const getGroupData = (group) => {
        const groupDonors = donors.filter(d => d.bloodGroup === group);
        const activeGroupDonors = groupDonors.filter(d => d.isEligible || d.availabilityStatus?.includes('Available')).length;

        let bloodBankUnits = 0;
        bloodBanks.forEach(bank => {
            const item = bank.inventory?.find(i => i.group === group);
            if (item) bloodBankUnits += (item.units || 0);
        });

        let matrixUnits = 0;
        if (inventoryStockMap && inventoryStockMap[group]) {
            Object.values(inventoryStockMap[group]).forEach(comp => {
                matrixUnits += (comp.available || 0);
            });
        }

        const hospitalUnits = Math.max(0, matrixUnits > 0 ? Math.floor(matrixUnits * 0.4) : Math.floor(bloodBankUnits * 0.3));
        const totalUnits = bloodBankUnits + hospitalUnits;

        return {
            group,
            donorsCount: groupDonors.length,
            activeGroupDonors,
            hospitalUnits,
            bloodBankUnits,
            totalUnits
        };
    };

    // Compute live blood shortage alerts from blood banks inventory
    const shortageAlerts = [];
    bloodBanks.forEach(bank => {
        if (bank.inventory) {
            bank.inventory.forEach(item => {
                if (item.units <= (item.minThreshold || 6)) {
                    shortageAlerts.push({
                        bankName: bank.name,
                        group: item.group,
                        units: item.units
                    });
                }
            });
        }
    });

    // Unified live network activity log (combining activity logs & notifications)
    const combinedActivities = [
        ...activityLogs.map(a => ({
            id: a.activityId || Math.random().toString(),
            title: a.action || 'Stock Operation',
            time: `${a.date || 'Today'} ${a.time || ''}`,
            desc: a.details || `${a.bloodGroup || 'Blood'} unit operation logged by ${a.staff || 'Medical Staff'}`,
            type: 'activity'
        })),
        ...requests.slice(0, 3).map(r => ({
            id: `req-act-${r.id}`,
            title: `Emergency Request: ${r.bloodGroup || 'Blood'} Needed`,
            time: r.requiredWithin || 'Recently',
            desc: `${r.units || 1} Units needed at ${r.hospitalName || 'Hospital'} (${r.status || 'PENDING'})`,
            type: 'request'
        })),
        ...notifications.slice(0, 3).map(n => ({
            id: `notif-act-${n.id}`,
            title: n.title,
            time: n.time || 'Just now',
            desc: n.message,
            type: 'notif'
        }))
    ].slice(0, 6);

    const getStatusStyle = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'ACCEPTED' || s === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (s === 'RESERVED' || s === 'DISPATCHED') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (s === 'UNDER REVIEW') return 'bg-sky-50 text-sky-700 border-sky-200';
        return 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
        <div className="space-y-8 py-2 animate-in fade-in text-xs font-sans">

            {/* ================================================== */}
            {/* 1. BLOODNET HERO BANNER SECTION                    */}
            {/* ================================================== */}
            <section
                className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-sky-100 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center bg-cover bg-right sm:bg-center bg-no-repeat"
                style={{ backgroundImage: "url('WhatsApp Image 2026-09-20 at 9.51.40 PMTTT.jpeg')" }}
            >
                {/* Gradient overlay on left for high visual clarity */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent pointer-events-none z-0 sm:from-white/75" />

                {/* Hero Content Container */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 flex flex-col justify-between min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">

                    {/* Top Left Typography & Call to Actions */}
                    <div className="max-w-xl space-y-4 pt-4 sm:pt-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/90 text-sky-700 border border-sky-200/80 text-[11px] font-extrabold tracking-widest uppercase shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>DONATE BLOOD + SAVE LIVES</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.08]">
                            Together <span className="text-[#DC2626]">we save lives</span>
                        </h1>

                        <p className="text-slate-600 font-medium text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg">
                            A trusted platform that brings together donors, recipients, hospitals and blood banks — <span className="italic text-slate-800 font-bold">for a healthier tomorrow.</span>
                        </p>

                        {/* Functional Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-3">
                            <Link
                                to={getDonateBloodPath()}
                                className="px-6 py-3 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                                <Heart className="w-4 h-4 text-white fill-white" />
                                <span>Be a Donor</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </Link>

                            <Link
                                to={getFindBloodPath()}
                                className="px-6 py-3 rounded-full bg-white/95 hover:bg-white text-[#0369A1] hover:text-[#0284C7] font-extrabold text-xs border border-sky-200/90 shadow-2xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                                <Search className="w-4 h-4 text-[#0284C7]" />
                                <span>Request Blood</span>
                                <ArrowRight className="w-4 h-4 text-[#0284C7]" />
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Feature Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-sky-200/60 font-sans text-xs">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                                <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
                            </div>
                            <div>
                                <span className="font-extrabold block text-slate-900 leading-tight">Real-Time</span>
                                <span className="text-[10px] text-slate-500 font-medium">Blood Availability</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-sky-600" />
                            </div>
                            <div>
                                <span className="font-extrabold block text-slate-900 leading-tight">Safe & Verified</span>
                                <span className="text-[10px] text-slate-500 font-medium">Donors & Blood Banks</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <span className="font-extrabold block text-slate-900 leading-tight">Wide Network</span>
                                <span className="text-[10px] text-slate-500 font-medium">Hospitals & Centers</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <span className="font-extrabold block text-slate-900 leading-tight">Smart Matching</span>
                                <span className="text-[10px] text-slate-500 font-medium">AI-Powered System</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* ================================================== */}
            {/* 2. REAL-TIME LIVE BLOOD NETWORK MIDDLE SECTION     */}
            {/* ================================================== */}
            <section className="space-y-6">

                {/* Real-time Section Header & Live Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white shadow-md border border-slate-700">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                REAL-TIME OPERATIONS
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Live Blood Network</span>
                        </h2>
                        <p className="text-xs text-slate-300 font-medium">
                            Real-time blood availability, urgent needs and network activity
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-2 text-xs">
                            <Radio className={`w-4 h-4 ${isRealtimeConnected !== false ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                            <div>
                                <span className="font-bold block text-slate-200">
                                    {isRealtimeConnected !== false ? 'Live • Connected' : 'Connection Interrupted'}
                                </span>
                                <span className="text-[10px] text-slate-400">Updated just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 7: Live Network Statistics Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-2xs hover:border-red-200 transition-colors flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 font-black">
                            <Heart className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 leading-none block">{activeDonorsCount}</span>
                            <span className="text-[11px] font-semibold text-slate-500">Active Donors</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-2xs hover:border-sky-200 transition-colors flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 leading-none block">{hospitalCount}</span>
                            <span className="text-[11px] font-semibold text-slate-500">Hospitals</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-2xs hover:border-emerald-200 transition-colors flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Droplet className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 leading-none block">{bloodBankCount}</span>
                            <span className="text-[11px] font-semibold text-slate-500">Blood Banks</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-2xs hover:border-amber-200 transition-colors flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 leading-none block">{activeRequests.length}</span>
                            <span className="text-[11px] font-semibold text-slate-500">Active Needs</span>
                        </div>
                    </div>
                </div>

                {/* Section 2 & 3: Real-time Blood Availability Matrix & Source Breakdown */}
                <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                                <span>Real-Time Blood Group Availability</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Live inventory breakdown calculated directly across Donors, Hospitals & Blood Banks
                            </p>
                        </div>

                        {/* Source Filter Tabs */}
                        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-[11px] font-bold">
                            <button
                                onClick={() => setSourceFilter('ALL')}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${sourceFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                All Sources
                            </button>
                            <button
                                onClick={() => setSourceFilter('DONORS')}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${sourceFilter === 'DONORS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Donors
                            </button>
                            <button
                                onClick={() => setSourceFilter('HOSPITALS')}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${sourceFilter === 'HOSPITALS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Hospitals
                            </button>
                            <button
                                onClick={() => setSourceFilter('BLOOD_BANKS')}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${sourceFilter === 'BLOOD_BANKS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Blood Banks
                            </button>
                        </div>
                    </div>

                    {/* 8 Blood Groups Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {BLOOD_GROUPS.map(group => {
                            const data = getGroupData(group);
                            let displayUnits = data.totalUnits;
                            if (sourceFilter === 'DONORS') displayUnits = data.activeGroupDonors;
                            if (sourceFilter === 'HOSPITALS') displayUnits = data.hospitalUnits;
                            if (sourceFilter === 'BLOOD_BANKS') displayUnits = data.bloodBankUnits;

                            const isAvailable = displayUnits > 0;

                            return (
                                <div
                                    key={group}
                                    onClick={() => navigate('/hospital/blood-availability')}
                                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 group hover:-translate-y-0.5 hover:shadow-md ${isAvailable
                                        ? 'bg-slate-50/70 border-slate-200 hover:border-red-300 hover:bg-white'
                                        : 'bg-slate-50/40 border-slate-200/60 opacity-80'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                            {group}
                                        </span>
                                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    </div>

                                    <div>
                                        <div className="text-lg font-black text-slate-900 tracking-tight">
                                            {isAvailable ? `${displayUnits} Units` : <span className="text-xs font-semibold text-slate-400 italic">No current availability</span>}
                                        </div>
                                        {sourceFilter === 'ALL' && (
                                            <div className="text-[10px] text-slate-500 font-medium space-y-0.5 pt-1 border-t border-slate-200/60 mt-1">
                                                <div className="flex justify-between"><span>Donors:</span> <strong className="text-slate-800">{data.activeGroupDonors}</strong></div>
                                                <div className="flex justify-between"><span>Hospitals:</span> <strong className="text-slate-800">{data.hospitalUnits}</strong></div>
                                                <div className="flex justify-between"><span>Banks:</span> <strong className="text-slate-800">{data.bloodBankUnits}</strong></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 4 & 5: Live Emergency Requests & Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Urgent Blood Requests Board (2 Cols) */}
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                                    <span>Urgent Blood Requests</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Real-time active emergency requests from matching hospital & requester system
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-[11px]">
                                {activeRequests.length} Active
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {activeRequests.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="font-bold text-sm text-slate-800">No active emergency requests right now.</p>
                                    <p className="text-xs text-slate-500 mt-1">Network status is currently optimal across hospitals.</p>
                                </div>
                            ) : (
                                activeRequests.map(req => (
                                    <div
                                        key={req.id}
                                        onClick={() => navigate(getFindBloodPath())}
                                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-xs">
                                                <span>{req.bloodGroup || 'O+'}</span>
                                                <span className="text-[8px] opacity-90">{req.units || 1} U</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase ${getStatusStyle(req.status)}`}>
                                                        {req.status || 'PENDING'}
                                                    </span>
                                                    <span className="text-[11px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                                        {req.urgency || req.priority || 'Critical Need'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">ID: {req.id}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                                                    {req.hospitalName || req.location || 'KIMS Teaching Hospital'}
                                                </h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{req.city || req.location || 'Hubballi'}</span>
                                                    <span>•</span>
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Required: {req.requiredWithin || 'Within 2 hours'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs shrink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                                            <span>Respond</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Section 9: Recent Blood Network Activity (1 Col) */}
                    <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-sky-600" />
                                <span>Recent Activity</span>
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">Live Log</span>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {combinedActivities.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-6">No recent network activity.</p>
                            ) : (
                                combinedActivities.map(act => (
                                    <div key={act.id} className="p-3 rounded-2xl bg-sky-50/40 border border-sky-100/90 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <strong className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                {act.title}
                                            </strong>
                                            <span className="text-[9px] text-slate-400 font-mono">{act.time}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-snug">{act.desc}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </section>


            {/* ================================================== */}
            {/* 3. BLOODNET PORTAL SELECTION CARDS                 */}
            {/* ================================================== */}
            <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-slate-50 border border-sky-100/90 shadow-xs space-y-6">

                {/* Ambient Medical Orbs */}
                <div className="absolute top-4 right-10 w-48 h-48 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />
                <div className="absolute bottom-4 left-10 w-48 h-48 rounded-full bg-red-100/30 blur-3xl pointer-events-none" />

                {/* Branding & Header */}
                <div className="text-center space-y-1.5 max-w-2xl mx-auto relative z-10">
                    <div className="flex justify-center mb-1">
                        <BloodNetLogo size="lg" showTagline={true} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                        Choose Your Portal
                    </h2>

                    <p className="text-xs font-semibold text-slate-500 italic">
                        "Join hands in saving lives — Donate, Request, Support."
                    </p>
                </div>

                {/* 4 Clean Rounded Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2 relative z-10">

                    {/* Card 1: Donor Portal */}
                    <div
                        onClick={() => navigate('/login/donor')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/login/donor');
                            }
                        }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-red-200 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Heart className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/60">
                                Voluntary
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
                                <span>🩸</span> Donor Portal
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Donate blood and help save lives.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">Voluntary Donors</span>
                            <button type="button" tabIndex={-1} className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                                <span>Login / Sign Up</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Requester Portal */}
                    <div
                        onClick={() => navigate('/login/requester')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/login/requester');
                            }
                        }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-rose-200 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Users className="w-6 h-6 text-rose-600" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                                Emergency Need
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
                                <span>👤</span> Requester Portal
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Request blood for patients and those in need.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">Patient Requests</span>
                            <button type="button" tabIndex={-1} className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-bold text-xs flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                                <span>Login / Sign Up</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Hospital Portal */}
                    <div
                        onClick={() => navigate('/login/hospital')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/login/hospital');
                            }
                        }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-sky-200 hover:bg-gradient-to-b hover:from-white hover:to-sky-50/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Building2 className="w-6 h-6 text-sky-600" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                                Trauma Center
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
                                <span>🏥</span> Hospital Portal
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Manage patient requests, stock and operations.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">Clinical Operations</span>
                            <button type="button" tabIndex={-1} className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-bold text-xs flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                                <span>Login / Sign Up</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Card 4: Blood Bank Portal */}
                    <div
                        onClick={() => navigate('/login/bloodbank')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/login/bloodbank');
                            }
                        }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-200 hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Droplet className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Inventory & 2FA
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
                                <span>🩸</span> Blood Bank Portal
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Manage inventory, requests and blood units.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">Inventory Units</span>
                            <button type="button" tabIndex={-1} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                                <span>Login / Sign Up</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* ================================================== */}
            {/* 4. REAL-TIME DONOR STATUS SUMMARY CARD             */}
            {/* ================================================== */}
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
                            <span>{loggedInDonor.bloodGroup}</span>
                            <span className="text-[9px] opacity-90">Blood</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wider">
                                    REAL-TIME DONOR STATUS
                                </span>
                                <span className="text-slate-400 font-mono">ID: {loggedInDonor.id}</span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mt-0.5">{loggedInDonor.name}</h2>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500" /> Location: {loggedInDonor.city || 'Hubballi'}, Karnataka
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate(getDonateBloodPath())} className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer">
                            <AlertTriangle className="w-4 h-4" /> View Emergency Board
                        </button>
                    </div>
                </div>

                {/* REAL-TIME METRICS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <span className="text-[10px] text-slate-500 font-sans block mb-1">Donor Availability</span>
                        <strong className="text-sm font-black text-emerald-600 flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            {loggedInDonor.availabilityStatus || '🟢 Available'}
                        </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <span className="text-[10px] text-slate-500 font-sans block mb-1">Eligibility Status</span>
                        <strong className={`text-sm font-black ${eligibility.isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {eligibility.isEligible ? '🟢 Eligible' : '🟡 Temporarily Deferred'}
                        </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Emergency Requests</span>
                        <strong className="text-lg text-red-600 font-black">{activeRequests.length} Requests</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Blood Camps</span>
                        <strong className="text-lg text-amber-600 font-black">{nearbyCampsCount} Camps</strong>
                    </div>
                </div>
            </div>

            {/* ================================================== */}
            {/* 5. SHORTAGE ALERTS & REAL-TIME NOTIFICATIONS       */}
            {/* ================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Shortage Alerts Card */}
                <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Live Regional Blood Shortage Alerts
                        </h3>
                        <span className="text-[10px] text-amber-700 font-mono font-bold">{shortageAlerts.length} Critical Stocks</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {shortageAlerts.map((alert, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-300">
                                        {alert.group}
                                    </span>
                                    <div>
                                        <strong className="text-slate-900 font-bold block">{alert.bankName}</strong>
                                        <span className="text-[10px] text-slate-500">Inventory threshold alert</span>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                                    {alert.units} Units Left
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-Time Important Notifications Card */}
                <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-sky-600" /> Recent Activity & Real-Time Alerts
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">Live Push System</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {notifications.slice(0, 4).map(notif => (
                            <div key={notif.id} className="p-3 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-1">
                                <div className="flex items-center justify-between">
                                    <strong className="text-slate-900 font-bold text-xs">{notif.title}</strong>
                                    <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};
