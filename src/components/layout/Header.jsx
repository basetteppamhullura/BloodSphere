import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodNetLogo } from '../common/BloodNetLogo';
import {
  Home,
  Heart,
  Users,
  Building2,
  Droplet,
  Shield,
  PlusCircle,
  User,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  LogOut,
  LayoutGrid,
  Lock,
  CheckCircle2,
  Bell
} from 'lucide-react';

export const Header = () => {
    const {
        setActiveEmergencyPostModal,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        chatSessions,
        openEmergencyChat,
        showToast,
        notifications
    } = useApp();

    const { currentRole, currentUser, logout, switchRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const portalRef = useRef(null);
    const profileRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (portalRef.current && !portalRef.current.contains(event.target)) {
                setIsPortalDropdownOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Compute dynamic unread emergency chat count
    const activeChats = (chatSessions || []).filter(s => s.status === 'active');
    const unreadChatCount = activeChats.reduce((sum, s) => {
        if (currentRole === 'requester') return sum + (s.unreadCountRequester || 0);
        if (currentRole === 'donor') return sum + (s.unreadCountDonor || 0);
        return sum + (s.unreadCountRequester || 0) + (s.unreadCountDonor || 0);
    }, 0);
    const chatBadgeCount = unreadChatCount > 0 ? unreadChatCount : (activeChats.length > 0 ? activeChats.length : 0);
    const unreadNotifCount = (notifications || []).filter(n => !n.read).length;

    const handleEmergencyChatClick = () => {
        if (activeChats.length > 0) {
            openEmergencyChat(activeChats[0].requestId);
        } else if (chatSessions && chatSessions.length > 0) {
            openEmergencyChat(chatSessions[0].requestId);
        } else {
            showToast('No active emergency chats at this moment.');
        }
    };

    const handleLogout = () => {
        const roleBeforeLogout = currentRole;
        logout();
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        const loginPaths = {
            donor: '/login',
            requester: '/login',
            hospital: '/login/hospital',
            bloodbank: '/login/bloodbank',
            admin: '/login/admin'
        };
        navigate(loginPaths[roleBeforeLogout] || '/login', { replace: true });
    };

    // Determine active portal state based on route
    const isPathActive = (type) => {
        const path = location.pathname;
        if (type === 'home') {
            return path === '/' || path === `/${currentRole}/home`;
        }
        if (type === 'donor') {
            return path.startsWith('/donor') || path === '/login/donor';
        }
        if (type === 'requester') {
            return path.startsWith('/requester') || path === '/login/requester';
        }
        if (type === 'hospital') {
            return path.startsWith('/hospital') || path === '/login/hospital';
        }
        if (type === 'bloodbank') {
            return path.startsWith('/bloodbank') || path === '/login/bloodbank';
        }
        if (type === 'admin') {
            return path.startsWith('/admin') || path === '/login/admin';
        }
        return false;
    };

    // Role display formatter
    const formatRoleName = (role) => {
        switch (role) {
            case 'donor': return 'DONOR';
            case 'requester': return 'REQUESTER';
            case 'hospital': return 'HOSPITAL';
            case 'bloodbank': return 'BLOOD BANK';
            case 'admin': return 'SUPER ADMIN';
            default: return (role || 'GUEST').toUpperCase();
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'donor': return 'bg-red-50 text-red-700 border-red-200';
            case 'requester': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'hospital': return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'bloodbank': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'admin': return 'bg-amber-50 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Portal link generator
    const getPortalUrl = (portalKey) => {
        if (!currentUser) {
            return `/login/${portalKey}`;
        }
        // If logged in as admin, admin can switch to any portal view
        if (currentRole === 'admin') {
            return `/${portalKey}/home`;
        }
        // If logged in as specific role, that role's home
        if (currentRole === portalKey) {
            return `/${portalKey}/home`;
        }
        // Otherwise login for that specific portal
        return `/login/${portalKey}`;
    };

    // Profile link generator
    const getProfileUrl = () => {
        if (!currentUser) return '/login';
        switch (currentRole) {
            case 'donor': return '/donor/profile';
            case 'requester': return '/requester/profile';
            case 'hospital': return '/hospital/dashboard';
            case 'bloodbank': return '/bloodbank/settings';
            case 'admin': return '/admin/settings';
            default: return '/donor/profile';
        }
    };

    // Portals definition for Portal Access Dropdown
    const portalItems = [
        { key: 'donor', label: 'Donor Portal', path: getPortalUrl('donor'), icon: Heart, iconColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
        { key: 'requester', label: 'Requester Portal', path: getPortalUrl('requester'), icon: Users, iconColor: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
        { key: 'hospital', label: 'Hospital Portal', path: getPortalUrl('hospital'), icon: Building2, iconColor: 'text-sky-600', bgColor: 'bg-sky-50', borderColor: 'border-sky-100' },
        { key: 'bloodbank', label: 'Blood Bank Portal', path: getPortalUrl('bloodbank'), icon: Droplet, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
        { key: 'admin', label: 'Super Admin', path: getPortalUrl('admin'), icon: Shield, iconColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-sky-100/90 shadow-2xs relative">
            {/* Subtle background healthcare graphics */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25 z-0">
                <div className="absolute -top-10 left-1/4 w-80 h-32 bg-sky-100/50 rounded-full blur-2xl"/>
                <div className="absolute -top-10 right-1/4 w-72 h-32 bg-red-100/30 rounded-full blur-2xl"/>
                {/* Micro Heartbeat ECG SVG */}
                <svg className="absolute bottom-1 left-0 right-0 w-full h-3 text-sky-300/40" viewBox="0 0 1200 20" fill="none" preserveAspectRatio="none">
                    <path d="M0,10 L300,10 L310,2 L320,18 L330,5 L340,15 L350,10 L700,10 L710,2 L720,18 L730,5 L740,15 L750,10 L1200,10" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>

            {/* Main Header Container */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 relative z-10">

                {/* ================================================== */}
                {/* 1. LEFT SIDE — BRAND LOGO & NAME                   */}
                {/* ================================================== */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Mobile Menu Button Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="xl:hidden p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer"
                        title="Toggle Menu"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5 text-sky-700" /> : <Menu className="w-5 h-5 text-sky-700" />}
                    </button>

                    {/* BloodNet Logo */}
                    <Link to="/" className="cursor-pointer flex items-center group py-1">
                        <BloodNetLogo size="md" showTagline={true} />
                    </Link>
                </div>

                {/* ================================================== */}
                {/* 2. CENTER — MAIN PORTAL NAVIGATION LINKS          */}
                {/* ================================================== */}
                <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    {/* Home Link */}
                    <Link
                        to="/"
                        className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            isPathActive('home')
                                ? 'bg-[#E0F2FE] text-[#0369A1] font-extrabold border border-[#BAE6FD] shadow-2xs'
                                : 'hover:bg-slate-100/90 text-slate-700 hover:text-slate-900'
                        }`}
                    >
                        <Home className={`w-4 h-4 ${isPathActive('home') ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                        <span>Home</span>
                    </Link>

                    {/* Donor Portal Link */}
                    <Link
                        to={getPortalUrl('donor')}
                        className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            isPathActive('donor')
                                ? 'bg-red-50 text-red-700 font-extrabold border border-red-200 shadow-2xs'
                                : 'hover:bg-red-50/70 text-slate-700 hover:text-red-700'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isPathActive('donor') ? 'text-red-600 fill-red-600' : 'text-red-500'}`} />
                        <span>Donor Portal</span>
                    </Link>

                    {/* Requester Portal Link */}
                    <Link
                        to={getPortalUrl('requester')}
                        className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            isPathActive('requester')
                                ? 'bg-rose-50 text-rose-700 font-extrabold border border-rose-200 shadow-2xs'
                                : 'hover:bg-rose-50/70 text-slate-700 hover:text-rose-700'
                        }`}
                    >
                        <Users className={`w-4 h-4 ${isPathActive('requester') ? 'text-rose-600' : 'text-rose-500'}`} />
                        <span>Requester Portal</span>
                    </Link>

                    {/* Hospital Portal Link */}
                    <Link
                        to={getPortalUrl('hospital')}
                        className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            isPathActive('hospital')
                                ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-200 shadow-2xs'
                                : 'hover:bg-sky-50/70 text-slate-700 hover:text-sky-700'
                        }`}
                    >
                        <Building2 className={`w-4 h-4 ${isPathActive('hospital') ? 'text-sky-600' : 'text-sky-500'}`} />
                        <span>Hospital Portal</span>
                    </Link>

                    {/* Blood Bank Portal Link */}
                    <Link
                        to={getPortalUrl('bloodbank')}
                        className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            isPathActive('bloodbank')
                                ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-2xs'
                                : 'hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700'
                        }`}
                    >
                        <Droplet className={`w-4 h-4 ${isPathActive('bloodbank') ? 'text-emerald-600' : 'text-emerald-500'}`} />
                        <span>Blood Bank Portal</span>
                    </Link>
                </nav>

                {/* ================================================== */}
                {/* 3. RIGHT SIDE — ACTIONS & USER PROFILE            */}
                {/* ================================================== */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">

                    {/* 3.1 EMERGENCY CHAT BUTTON */}
                    <button
                        type="button"
                        onClick={handleEmergencyChatClick}
                        className="px-3.5 py-2 rounded-full bg-white hover:bg-red-50/80 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
                        title="Open Private Emergency Chat"
                    >
                        <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="hidden md:inline whitespace-nowrap">Emergency Chat</span>
                        {chatBadgeCount > 0 && (
                            <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-2xs animate-pulse">
                                {chatBadgeCount}
                            </span>
                        )}
                    </button>

                    {/* 3.2 POST EMERGENCY NEED BUTTON */}
                    <button
                        type="button"
                        onClick={() => setActiveEmergencyPostModal(true)}
                        className="px-3.5 sm:px-4 py-2 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
                        title="Create an emergency blood request"
                    >
                        <PlusCircle className="w-4 h-4 text-white shrink-0" />
                        <span className="hidden sm:inline whitespace-nowrap">Post Emergency Need</span>
                        <span className="inline sm:hidden whitespace-nowrap">Post Need</span>
                    </button>

                    {/* 3.3 PORTAL ACCESS DROPDOWN */}
                    <div className="relative shrink-0" ref={portalRef}>
                        <button
                            type="button"
                            onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                            className="px-3 sm:px-3.5 py-2 rounded-full bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            aria-expanded={isPortalDropdownOpen}
                            aria-haspopup="true"
                            title="View accessible portals"
                        >
                            <LayoutGrid className="w-4 h-4 text-[#0284C7] shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Portal Access</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[#0284C7] transition-transform duration-200 ${isPortalDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Portal Access Dropdown Menu */}
                        {isPortalDropdownOpen && (
                            <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-white border border-sky-100 shadow-xl p-2.5 z-50 space-y-1.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                                    <span>Portal Access</span>
                                    {currentUser ? (
                                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${getRoleBadgeStyle(currentRole)}`}>
                                            {formatRoleName(currentRole)}
                                        </span>
                                    ) : (
                                        <span className="text-sky-600 font-bold">Public View</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {portalItems.map((item) => {
                                        const IconComp = item.icon;
                                        const isCurrentActive = isPathActive(item.key);
                                        const isRoleAllowed = !currentUser || currentRole === 'admin' || currentRole === item.key;

                                        return (
                                            <Link
                                                key={item.key}
                                                to={item.path}
                                                onClick={() => {
                                                    if (currentUser && currentRole === 'admin') {
                                                        switchRole(item.key);
                                                    }
                                                    setIsPortalDropdownOpen(false);
                                                }}
                                                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                                                    isCurrentActive
                                                        ? 'bg-sky-50/90 border border-sky-200'
                                                        : 'hover:bg-slate-50 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${item.bgColor} ${item.iconColor} border ${item.borderColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold block text-slate-900 leading-tight">
                                                            {item.label}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {isRoleAllowed ? (isCurrentActive ? 'Active Portal' : 'Authorized Access') : 'Role Restricted'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isCurrentActive ? (
                                                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                                                ) : (!isRoleAllowed ? (
                                                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                ) : null)}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3.4 USER PROFILE & LOGOUT CONTROL */}
                    {currentUser ? (
                        <div className="relative shrink-0" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                                aria-expanded={isProfileDropdownOpen}
                                aria-haspopup="true"
                            >
                                {/* User Avatar Circle */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 to-slate-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-sky-400 shadow-2xs">
                                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                </div>

                                {/* User Details (Name & Role Badge) */}
                                <div className="hidden lg:flex flex-col text-left max-w-[140px]">
                                    <span className="font-bold text-xs text-slate-900 truncate leading-tight" title={currentUser.name}>
                                        {currentUser.name}
                                    </span>
                                    <span className="text-[9px] font-extrabold uppercase text-sky-700 tracking-wider">
                                        {formatRoleName(currentRole)}
                                    </span>
                                </div>

                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden lg:block transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Profile Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white border border-sky-100 shadow-xl p-2.5 z-50 space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Profile Summary Header */}
                                    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="font-bold text-slate-900 truncate text-sm">
                                            {currentUser.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                                            {currentUser.email || 'authenticated_user@bloodnet.org'}
                                        </div>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${getRoleBadgeStyle(currentRole)}`}>
                                                {formatRoleName(currentRole)}
                                            </span>
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Active
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="space-y-1">
                                        <Link
                                            to={getProfileUrl()}
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-800 font-bold flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <User className="w-4 h-4 text-sky-600" />
                                                <span>View Profile & Portal</span>
                                            </div>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                handleEmergencyChatClick();
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-slate-800 font-bold flex items-center justify-between transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <MessageSquare className="w-4 h-4 text-red-600" />
                                                <span>Emergency Chat</span>
                                            </div>
                                            {chatBadgeCount > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                                                    {chatBadgeCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    <hr className="border-slate-100 my-1" />

                                    {/* Logout Button */}
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 text-red-600" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
                        >
                            Sign In
                        </Link>
                    )}

                </div>
            </div>

            {/* Subtle light-blue medical accent bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-sky-400/20 via-sky-500/40 to-red-500/30"/>

            {/* ================================================== */}
            {/* 4. MOBILE / COMPACT MENU DRAWER OVERLAY            */}
            {/* ================================================== */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-sky-100 shadow-xl px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* User Info Header on Mobile */}
                    {currentUser && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sky-700 text-white font-black text-sm flex items-center justify-center border border-sky-400 shadow-2xs">
                                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-900">
                                        {currentUser.name}
                                    </div>
                                    <div className="text-xs text-sky-800 font-extrabold uppercase">
                                        {formatRoleName(currentRole)}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-xl bg-white text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                    {/* Navigation Portal Links */}
                    <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Main Portals
                        </div>
                        <Link
                            to="/"
                            className={`p-2.5 rounded-xl flex items-center gap-3 font-bold text-xs ${
                                isPathActive('home') ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Home className="w-4 h-4 text-sky-600" />
                            <span>Home</span>
                        </Link>
                        <Link
                            to={getPortalUrl('donor')}
                            className={`p-2.5 rounded-xl flex items-center gap-3 font-bold text-xs ${
                                isPathActive('donor') ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Heart className="w-4 h-4 text-red-600" />
                            <span>Donor Portal</span>
                        </Link>
                        <Link
                            to={getPortalUrl('requester')}
                            className={`p-2.5 rounded-xl flex items-center gap-3 font-bold text-xs ${
                                isPathActive('requester') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Users className="w-4 h-4 text-rose-600" />
                            <span>Requester Portal</span>
                        </Link>
                        <Link
                            to={getPortalUrl('hospital')}
                            className={`p-2.5 rounded-xl flex items-center gap-3 font-bold text-xs ${
                                isPathActive('hospital') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>Hospital Portal</span>
                        </Link>
                        <Link
                            to={getPortalUrl('bloodbank')}
                            className={`p-2.5 rounded-xl flex items-center gap-3 font-bold text-xs ${
                                isPathActive('bloodbank') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Droplet className="w-4 h-4 text-emerald-600" />
                            <span>Blood Bank Portal</span>
                        </Link>
                    </div>

                    {/* Quick Emergency Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleEmergencyChatClick();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-red-600" />
                                <span>Emergency Chat</span>
                            </div>
                            {chatBadgeCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                                    {chatBadgeCount} unread
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setActiveEmergencyPostModal(true);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4 text-white" />
                            <span>Post Emergency Need</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};
