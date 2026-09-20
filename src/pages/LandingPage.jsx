import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { checkDonorEligibility } from '../utils/matchingEngine';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { Heart, Search, ShieldCheck, Zap, Users, Activity, ArrowRight, Sparkles, Building2, Droplet, MapPin, AlertTriangle, Bell, Hospital } from 'lucide-react';

export const LandingPage = () => {
    const { setActiveEmergencyPostModal, requests, donors, camps, bloodBanks, notifications } = useApp();
    const { currentUser, currentRole } = useAuth();
    const navigate = useNavigate();

    // Find active donor profile
    const loggedInDonor = donors.find(d => d.email === currentUser?.email || d.id === currentUser?.id) || donors[0];
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

    // Compute live metrics
    const activeNearbyRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    const nearbyCampsCount = camps.length;

    // Compute live blood shortage alerts from blood banks inventory
    const shortageAlerts = [];
    bloodBanks.forEach(bank => {
        bank.inventory.forEach(item => {
            if (item.units <= (item.minThreshold || 5)) {
                shortageAlerts.push({
                    bankName: bank.name,
                    group: item.group,
                    units: item.units
                });
            }
        });
    });

    return (
        <div className="space-y-8 py-2 animate-in fade-in text-xs">

            {/* ================================================== */}
            {/* 1. BLOODNET HERO BANNER SECTION (MATCHES SCREENSHOT) */}
            {/* ================================================== */}
            <section
                className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-sky-100 min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/bloodnet-hero-bg.jpg')" }}
            >
                {/* Gradient overlay on left side for maximum readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none z-0" />

                {/* Hero Content Container */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 flex flex-col justify-between min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">

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
            {/* 2. BLOODNET PORTAL SELECTION CARDS                 */}
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
            {/* 3. REAL-TIME DONOR STATUS SUMMARY CARD             */}
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
                                <MapPin className="w-3.5 h-3.5 text-red-500" /> Location: {loggedInDonor.city}, Karnataka
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
                        <strong className="text-lg text-red-600 font-black">{activeNearbyRequests.length} Requests</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                        <span className="text-[10px] text-slate-500 font-sans block mb-1">Nearby Blood Camps</span>
                        <strong className="text-lg text-amber-600 font-black">{nearbyCampsCount} Camps</strong>
                    </div>
                </div>
            </div>

            {/* ================================================== */}
            {/* 4. SHORTAGE ALERTS & REAL-TIME NOTIFICATIONS       */}
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
