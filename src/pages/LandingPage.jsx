import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import {
    Heart, Search, ShieldCheck, Zap, Users, Activity, ArrowRight,
    Sparkles, Building2, Droplet, MapPin, AlertTriangle, Bell,
    Radio, CheckCircle2, Clock, Filter, Database, HelpCircle,
    ArrowUpRight, RefreshCw, XCircle
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'PRBC (Red Cells)', 'Platelets (PRP)', 'Plasma (FFP)'];

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
        isLoading = false,
        setActiveEmergencyPostModal
    } = useApp();

    const { currentUser, currentRole } = useAuth();
    const navigate = useNavigate();

    // Search Bar State
    const [searchGroup, setSearchGroup] = useState('ALL');
    const [searchComponent, setSearchComponent] = useState('ALL');
    const [searchLocation, setSearchLocation] = useState('');
    const [nearbyCategory, setNearbyCategory] = useState('DONORS'); // DONORS, HOSPITALS, BLOOD_BANKS

    // Error / Retry state
    const [isApiError, setIsApiError] = useState(false);

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

    // Calculate real-time active metrics from real system state
    const activeRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    const activeDonorsCount = donors.filter(d => d.isEligible || d.status === 'ACTIVE' || d.availabilityStatus?.includes('Available')).length || donors.length;
    const bloodBankCount = bloodBanks.length;
    const hospitalCount = new Set(['KIMS Teaching Hospital', 'SDM Medical College & Hospital', 'BVB Trauma Center', ...bloodBanks.map(b => b.name)]).size;

    // Helper to compute inventory per blood group
    const getGroupInventory = (group) => {
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

        let status = 'Unavailable';
        let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (totalUnits > 10) {
            status = 'Available';
            statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (totalUnits > 0) {
            status = 'Low';
            statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (group === 'O-' || group === 'AB-') {
            status = 'Critical';
            statusColor = 'bg-red-50 text-red-700 border-red-200';
        }

        const groupDonorsCount = donors.filter(d => d.bloodGroup === group).length;

        return {
            group,
            totalUnits,
            bloodBankUnits,
            hospitalUnits,
            groupDonorsCount,
            status,
            statusColor
        };
    };

    // Filtered lists for "Blood Available Near You"
    const nearbyDonors = donors.filter(d => {
        if (searchGroup !== 'ALL' && d.bloodGroup !== searchGroup) return false;
        if (searchLocation && !d.city?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
        return true;
    });

    const nearbyHospitals = [
        { name: 'KIMS Teaching Hospital', city: 'Hubballi', availableGroups: ['A+', 'B+', 'O+', 'O-'], units: 28 },
        { name: 'SDM Medical College & Hospital', city: 'Dharwad', availableGroups: ['A-', 'B+', 'AB+', 'O+'], units: 19 },
        { name: 'District Civil Hospital', city: 'Belagavi', availableGroups: ['B-', 'O+', 'A+'], units: 14 }
    ].filter(h => {
        if (searchGroup !== 'ALL' && !h.availableGroups.includes(searchGroup)) return false;
        if (searchLocation && !h.city?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
        return true;
    });

    const nearbyBloodBanksList = bloodBanks.filter(b => {
        if (searchGroup !== 'ALL' && !b.inventory?.some(i => i.group === searchGroup && i.units > 0)) return false;
        if (searchLocation && !b.city?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
        return true;
    });

    // Recent network activities combining event logs, requests, and notifications
    const combinedActivities = [
        ...activityLogs.map(a => ({
            id: a.activityId || Math.random().toString(),
            title: a.action || 'Stock Operation',
            time: `${a.date || 'Today'} ${a.time || ''}`,
            desc: a.details || `${a.bloodGroup || 'Blood'} unit operation logged by ${a.staff || 'Medical Staff'}`
        })),
        ...requests.slice(0, 3).map(r => ({
            id: `req-act-${r.id}`,
            title: `Emergency Request Logged: ${r.bloodGroup || 'Blood'}`,
            time: r.requiredWithin || 'Recently',
            desc: `${r.units || 1} Units needed at ${r.hospitalName || 'Hospital'} (${r.status || 'PENDING'})`
        })),
        ...notifications.slice(0, 3).map(n => ({
            id: `notif-act-${n.id}`,
            title: n.title,
            time: n.time || 'Just now',
            desc: n.message
        }))
    ].slice(0, 6);

    const getRequestBadgeStyle = (priority) => {
        const p = (priority || '').toUpperCase();
        if (p === 'CRITICAL') return 'bg-red-50 text-red-700 border-red-200';
        if (p === 'URGENT') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    };

    return (
        <div className="space-y-10 py-2 animate-in fade-in text-xs font-sans text-slate-800">

            {/* ================================================== */}
            {/* 2. HERO SECTION                                    */}
            {/* ================================================== */}
            <section
                className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-sky-100 min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center bg-cover bg-right sm:bg-center bg-no-repeat"
                style={{ backgroundImage: "url('WhatsApp Image 2026-09-20 at 9.51.40 PMTTT.jpeg')" }}
            >
                {/* Gradient overlay on left for maximum text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent pointer-events-none z-0 sm:from-white/80" />

                {/* Hero Content Container */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 flex flex-col justify-between min-h-[440px] sm:min-h-[500px] lg:min-h-[540px]">

                    {/* Top Left Typography & Call to Actions */}
                    <div className="max-w-xl space-y-4 pt-4 sm:pt-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/90 text-sky-700 border border-sky-200/80 text-[11px] font-extrabold tracking-widest uppercase shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>LIVE PUBLIC NETWORK</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.08]">
                            Together <span className="text-[#DC2626]">We Save Lives</span>
                        </h1>

                        <p className="text-slate-600 font-medium text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg">
                            BloodNet connects donors, requesters, hospitals and blood banks in real time to help people find the blood they need.
                        </p>

                        {/* Primary Action Buttons */}
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
                                <span>Find Blood</span>
                                <ArrowRight className="w-4 h-4 text-[#0284C7]" />
                            </Link>

                            <button
                                onClick={() => setActiveEmergencyPostModal(true)}
                                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span>Emergency Blood Request</span>
                            </button>
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
            {/* 3. LIVE BLOOD AVAILABILITY SECTION                 */}
            {/* ================================================== */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                AUTOMATICALLY UPDATED
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Live Blood Availability</h2>
                        <p className="text-xs text-slate-500 font-medium">Real-time availability across the BloodNet network</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>{isRealtimeConnected ? '🟢 BloodNet Live' : '🔴 Connection Interrupted'}</span>
                    </div>
                </div>

                {/* 8 Blood Group Availability Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {BLOOD_GROUPS.map(g => (
                            <div key={g} className="p-4 rounded-2xl bg-slate-100 animate-pulse h-28" />
                        ))}
                    </div>
                ) : isApiError ? (
                    <div className="p-6 text-center rounded-2xl bg-red-50 border border-red-200 text-red-700 space-y-2">
                        <XCircle className="w-6 h-6 mx-auto text-red-600" />
                        <p className="font-bold">Unable to load live BloodNet data.</p>
                        <button onClick={() => setIsApiError(false)} className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {BLOOD_GROUPS.map(group => {
                            const inv = getGroupInventory(group);
                            return (
                                <div
                                    key={group}
                                    onClick={() => navigate('/hospital/blood-availability')}
                                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="w-9 h-9 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                                            {group}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${inv.statusColor}`}>
                                            {inv.status}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-xl font-black text-slate-900 tracking-tight">
                                            {inv.totalUnits > 0 ? `${inv.totalUnits} Units` : <span className="text-xs font-semibold text-slate-400 italic">No current availability</span>}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                            {inv.groupDonorsCount} registered donors
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>


            {/* ================================================== */}
            {/* 4. URGENT BLOOD REQUESTS SECTION                   */}
            {/* ================================================== */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                            <span>Urgent Blood Requests</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">People currently waiting for blood</p>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-xs">
                        {activeRequests.length} Active Requests
                    </span>
                </div>

                {activeRequests.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                        <p className="font-bold text-slate-800 text-sm">No active emergency blood requests right now.</p>
                        <p className="text-xs text-slate-500">All registered patient requirements have been fulfilled.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeRequests.slice(0, 6).map(req => (
                            <div
                                key={req.id}
                                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getRequestBadgeStyle(req.urgency || req.priority)}`}>
                                            {req.urgency || req.priority || 'CRITICAL'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">ID: {req.id}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-xs">
                                            <span>{req.bloodGroup || 'O+'}</span>
                                            <span className="text-[8px] opacity-90">{req.units || 1} U</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                                                {req.hospitalName || 'KIMS Teaching Hospital'}
                                            </h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{req.city || req.location || 'Hubballi'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Required: {req.requiredWithin || 'Within 2 hours'}</span>
                                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{req.status || 'PENDING'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(getFindBloodPath())}
                                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <span>View Request</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>


            {/* ================================================== */}
            {/* 5. SEARCH / FIND BLOOD & NEARBY BLOOD AVAILABILITY */}
            {/* ================================================== */}
            <section className="space-y-6">

                {/* Prominent Search Bar */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white shadow-md space-y-4 border border-sky-800">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            <Search className="w-5 h-5 text-sky-400" />
                            <span>Find Blood Availability</span>
                        </h2>
                        <p className="text-xs text-slate-300">Search available blood units across Donors, Hospitals and Blood Banks in real time</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        <div>
                            <label className="text-[10px] font-bold text-slate-300 block mb-1">BLOOD GROUP</label>
                            <select
                                value={searchGroup}
                                onChange={(e) => setSearchGroup(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 font-medium text-xs focus:ring-2 focus:ring-sky-400 outline-none"
                            >
                                <option value="ALL">All Blood Groups</option>
                                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-300 block mb-1">COMPONENT</label>
                            <select
                                value={searchComponent}
                                onChange={(e) => setSearchComponent(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 font-medium text-xs focus:ring-2 focus:ring-sky-400 outline-none"
                            >
                                <option value="ALL">All Components</option>
                                {COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-300 block mb-1">CITY / LOCATION</label>
                            <input
                                type="text"
                                placeholder="Enter city (e.g. Hubballi)"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 font-medium text-xs focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => navigate(getFindBloodPath())}
                                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Search className="w-4 h-4" />
                                <span>Search Network</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blood Available Near You Categories */}
                <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-600" />
                                <span>Blood Available Near You</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Categorized breakdown of nearby blood availability</p>
                        </div>

                        {/* 3 Distinct Category Tabs */}
                        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-[11px] font-bold">
                            <button
                                onClick={() => setNearbyCategory('DONORS')}
                                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${nearbyCategory === 'DONORS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Donors ({nearbyDonors.length})
                            </button>
                            <button
                                onClick={() => setNearbyCategory('HOSPITALS')}
                                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${nearbyCategory === 'HOSPITALS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Hospitals ({nearbyHospitals.length})
                            </button>
                            <button
                                onClick={() => setNearbyCategory('BLOOD_BANKS')}
                                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${nearbyCategory === 'BLOOD_BANKS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Blood Banks ({nearbyBloodBanksList.length})
                            </button>
                        </div>
                    </div>

                    {/* DONORS Category View */}
                    {nearbyCategory === 'DONORS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {nearbyDonors.slice(0, 6).map(donor => (
                                <div key={donor.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center">
                                            {donor.bloodGroup}
                                        </div>
                                        <div>
                                            <strong className="text-slate-900 font-bold block">{donor.name}</strong>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" /> {donor.city || 'Hubballi'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        {donor.availabilityStatus || 'Available'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* HOSPITALS Category View */}
                    {nearbyCategory === 'HOSPITALS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {nearbyHospitals.map((h, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <strong className="text-slate-900 font-bold text-xs">{h.name}</strong>
                                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{h.units} Units</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.city}
                                    </p>
                                    <div className="flex gap-1 pt-1">
                                        {h.availableGroups.map(g => (
                                            <span key={g} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-extrabold text-red-600 border border-slate-200">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BLOOD BANKS Category View */}
                    {nearbyCategory === 'BLOOD_BANKS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {nearbyBloodBanksList.slice(0, 6).map(bank => (
                                <div key={bank.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <strong className="text-slate-900 font-bold text-xs">{bank.name}</strong>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            {bank.inventory?.reduce((a, b) => a + (b.units || 0), 0) || 0} Units
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {bank.city}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </section>


            {/* ================================================== */}
            {/* 6. LIVE NETWORK STATISTICS SECTION                 */}
            {/* ================================================== */}
            <section className="space-y-4">
                <div className="text-center space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-sky-700 uppercase px-3 py-1 rounded-full bg-sky-100 border border-sky-200">
                        LIVE BACKEND COUNTS
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">BloodNet Network</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs text-center space-y-1">
                        <span className="text-3xl font-black text-slate-900 block">{activeDonorsCount}</span>
                        <span className="text-xs font-bold text-slate-500">Active Donors</span>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs text-center space-y-1">
                        <span className="text-3xl font-black text-slate-900 block">{hospitalCount}</span>
                        <span className="text-xs font-bold text-slate-500">Verified Hospitals</span>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs text-center space-y-1">
                        <span className="text-3xl font-black text-slate-900 block">{bloodBankCount}</span>
                        <span className="text-xs font-bold text-slate-500">Verified Blood Banks</span>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-xs text-center space-y-1">
                        <span className="text-3xl font-black text-red-600 block">{activeRequests.length}</span>
                        <span className="text-xs font-bold text-slate-500">Active Blood Requests</span>
                    </div>
                </div>
            </section>


            {/* ================================================== */}
            {/* 7. LIVE NETWORK ACTIVITY SECTION                   */}
            {/* ================================================== */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-sky-600" />
                            <span>Live Network Activity</span>
                        </h2>
                        <p className="text-xs text-slate-500">Real system events from the existing BloodNet backend</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Updated just now</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {combinedActivities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic col-span-full py-4 text-center">No recent network activity.</p>
                    ) : (
                        combinedActivities.map(act => (
                            <div key={act.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <strong className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                                        {act.title}
                                    </strong>
                                    <span className="text-[9px] text-slate-400 font-mono">{act.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">{act.desc}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>


            {/* ================================================== */}
            {/* 8. HOW BLOODNET WORKS                              */}
            {/* ================================================== */}
            <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-md space-y-6 border border-slate-700">
                <div className="text-center space-y-1 max-w-xl mx-auto">
                    <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30">
                        AUTOMATED WORKFLOW
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">How BloodNet Works</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <span className="text-2xl font-black text-red-500">01</span>
                        <h3 className="font-bold text-white text-sm">REQUEST</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            A requester or hospital submits a blood requirement into the system.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <span className="text-2xl font-black text-sky-400">02</span>
                        <h3 className="font-bold text-white text-sm">MATCH</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            BloodNet instantly finds matching nearby donors, hospitals and blood banks.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <span className="text-2xl font-black text-emerald-400">03</span>
                        <h3 className="font-bold text-white text-sm">RESPOND</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Available parties accept, reserve units, or respond to emergency alerts.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <span className="text-2xl font-black text-amber-400">04</span>
                        <h3 className="font-bold text-white text-sm">FULFILL</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Blood is reserved, collected, issued, and the emergency request is completed.
                        </p>
                    </div>
                </div>
            </section>


            {/* ================================================== */}
            {/* 9. FOUR CONNECTED PORTALS                          */}
            {/* ================================================== */}
            <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-slate-50 border border-sky-100/90 shadow-xs space-y-6">
                <div className="text-center space-y-1.5 max-w-2xl mx-auto relative z-10">
                    <div className="flex justify-center mb-1">
                        <BloodNetLogo size="lg" showTagline={true} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                        One Network. Four Connected Portals.
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 italic">
                        Select a portal below to access your role-specific dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2 relative z-10">
                    {/* Card 1: Donor Portal */}
                    <div
                        onClick={() => navigate('/login/donor')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/login/donor'); } }}
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
                                Donate blood and respond to eligible requests.
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
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/login/requester'); } }}
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
                                Find blood and manage blood requests.
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
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/login/hospital'); } }}
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
                                Manage patient requests and hospital blood stock.
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
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/login/bloodbank'); } }}
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
                                Manage inventory, blood units and requests.
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
            {/* 10. EMERGENCY CTA SECTION                          */}
            {/* ================================================== */}
            <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-lg space-y-6 text-center">
                <div className="max-w-2xl mx-auto space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Need Blood Urgently?</h2>
                    <p className="text-sm font-medium text-rose-100">
                        Find available blood from donors, hospitals and blood banks connected to BloodNet.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <Link
                        to={getFindBloodPath()}
                        className="px-8 py-3.5 rounded-full bg-white text-red-600 hover:bg-slate-100 font-black text-xs shadow-md transition-all hover:scale-105"
                    >
                        Find Blood Now
                    </Link>

                    <Link
                        to={getDonateBloodPath()}
                        className="px-8 py-3.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-black text-xs shadow-md transition-all hover:scale-105"
                    >
                        Become a Donor
                    </Link>
                </div>
            </section>

        </div>
    );
};
