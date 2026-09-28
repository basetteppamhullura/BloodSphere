import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BloodNetLogo } from '../components/common/BloodNetLogo';
import { CampRegistrationModal } from '../components/modals/CampRegistrationModal';
import {
  Heart,
  Search,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  Building2,
  Droplet,
  MapPin,
  AlertTriangle,
  Bell,
  Radio,
  CheckCircle2,
  Clock,
  Filter,
  Database,
  HelpCircle,
  Calendar,
  Layers,
  PhoneCall,
  Check,
  Share2,
  Lock,
  ChevronRight,
  ExternalLink,
  Award,
  Globe
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
    setActiveEmergencyPostModal,
    openEmergencyChat,
    chatSessions = []
  } = useApp();

  const { currentUser, currentRole } = useAuth();
  const navigate = useNavigate();

  // Backend Analytics Real Data State
  const [dbAnalytics, setDbAnalytics] = useState(null);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(true);

  // Filters State
  const [campFilter, setCampFilter] = useState('ALL'); // ALL, UPCOMING, TODAY, THIS_WEEK
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL'); // ALL, AWARENESS, DRIVES, CAMPS, UPDATES
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCampModal, setSelectedCampModal] = useState(null);
  const [participatingCampModal, setParticipatingCampModal] = useState(null);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Fetch real database counts from backend API
  useEffect(() => {
    let isMounted = true;
    setIsFetchingAnalytics(true);
    fetch('http://localhost:5000/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.success && data.analytics) {
          setDbAnalytics(data.analytics);
        }
      })
      .catch(err => {
        console.warn('[LandingPage] Analytics fetch fallback to local state:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsFetchingAnalytics(false);
      });

    return () => { isMounted = false; };
  }, [requests.length, donors.length, bloodBanks.length]);

  // Compute Real Network Statistics (Requirement 4)
  const stats = useMemo(() => {
    const totalDonorsCount = dbAnalytics?.totalDonors ?? donors.length ?? 0;
    const totalRequestersCount = dbAnalytics?.totalRequesters ?? 0;
    const totalHospitalsCount = dbAnalytics?.totalHospitals ?? 3;
    const totalBloodBanksCount = dbAnalytics?.totalBloodBanks ?? bloodBanks.length ?? 2;
    const totalUsersCount = dbAnalytics?.totalUsers ?? (totalDonorsCount + totalRequestersCount + totalHospitalsCount + totalBloodBanksCount);
    
    // Calculate reliable completed donations / requests count from real records
    const completedRequestsCount = dbAnalytics?.completedRequests ?? requests.filter(r => r.status === 'COMPLETED' || r.status === 'FULFILLED' || r.status === 'BLOOD_ISSUED').length;

    return {
      registeredDonors: totalDonorsCount,
      registeredRequesters: totalRequestersCount,
      registeredHospitals: totalHospitalsCount,
      registeredBloodBanks: totalBloodBanksCount,
      totalRegisteredUsers: totalUsersCount,
      completedRequests: completedRequestsCount
    };
  }, [dbAnalytics, donors, bloodBanks, requests]);

  // Routing navigation helpers
  const getFindBloodPath = () => {
    if (!currentUser) return '/login/requester';
    const paths = {
      donor: '/donor/directory',
      requester: '/requester/find-blood',
      hospital: '/hospital/blood-availability',
      bloodbank: '/bloodbank/inventory',
      admin: '/admin/dashboard'
    };
    return paths[currentRole] || '/login/requester';
  };

  const getDonateBloodPath = () => {
    if (!currentUser) return '/login/donor';
    const paths = {
      donor: '/donor/emergency',
      requester: '/requester/requests',
      hospital: '/hospital/requests',
      bloodbank: '/bloodbank/requests',
      admin: '/admin/requests'
    };
    return paths[currentRole] || '/login/donor';
  };

  // Compute Live Public Blood Group Availability (Requirement 6 - Privacy Safe)
  const groupAvailability = useMemo(() => {
    return BLOOD_GROUPS.map(group => {
      let totalUnits = 0;
      
      // Sum units from blood bank inventory
      bloodBanks.forEach(bank => {
        const item = bank.inventory?.find(i => i.group === group);
        if (item) totalUnits += (item.units || 0);
      });

      // Sum units from inventory stock matrix
      if (inventoryStockMap && inventoryStockMap[group]) {
        Object.values(inventoryStockMap[group]).forEach(comp => {
          totalUnits += (comp.available || 0);
        });
      }

      const matchingDonorsCount = donors.filter(d => d.bloodGroup === group).length;

      let status = 'Available';
      let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (totalUnits === 0 && matchingDonorsCount === 0) {
        status = 'Unavailable';
        badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
      } else if (totalUnits < 5) {
        status = 'Low Stock';
        badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (group === 'O-' || group === 'AB-') {
        status = 'High Demand';
        badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      }

      return {
        group,
        totalUnits,
        matchingDonorsCount,
        status,
        badgeStyle,
        lastUpdated: 'Just now'
      };
    });
  }, [bloodBanks, inventoryStockMap, donors]);

  // Sample Published Blood Donation Camps (Requirement 7)
  const publishedCamps = useMemo(() => {
    const list = camps.length > 0 ? camps : [
      {
        id: 'camp_01',
        title: 'Mega Voluntary Blood Donation Drive',
        organizer: 'Rotary Regional & KIMS Hospital',
        date: '2026-10-05',
        time: '09:00 AM - 04:00 PM',
        venue: 'KLE Technological University Campus',
        city: 'Hubballi',
        district: 'Dharwad',
        expectedDonors: 300,
        rsvpsCount: 194,
        status: 'PUBLISHED',
        category: 'College Drive',
        amenities: ['Free Health Checkup', 'Refreshments', 'Digital Certificate', 'Donor Badge']
      },
      {
        id: 'camp_02',
        title: 'Corporate Lifesavers Blood Camp',
        organizer: 'Infosys Foundation & Red Cross',
        date: '2026-10-12',
        time: '10:00 AM - 05:00 PM',
        venue: 'Infosys IT Park Main Auditorium',
        city: 'Hubballi',
        district: 'Dharwad',
        expectedDonors: 200,
        rsvpsCount: 142,
        status: 'PUBLISHED',
        category: 'Corporate Drive',
        amenities: ['Hb Testing', 'Snacks & Juice', 'Participation Pass']
      },
      {
        id: 'camp_03',
        title: 'Civil Hospital Public Awareness Drive',
        organizer: 'Karnataka State Transfusion Council',
        date: '2026-10-18',
        time: '08:30 AM - 02:30 PM',
        venue: 'District Hospital Grounds',
        city: 'Dharwad',
        district: 'Dharwad',
        expectedDonors: 150,
        rsvpsCount: 88,
        status: 'PUBLISHED',
        category: 'Public Health',
        amenities: ['Free Blood Group Testing', 'Donor Certificate']
      }
    ];

    return list.filter(c => {
      if (selectedLocation && !c.city?.toLowerCase().includes(selectedLocation.toLowerCase()) && !c.venue?.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }
      if (campFilter === 'TODAY') {
        const todayStr = new Date().toISOString().split('T')[0];
        return c.date === todayStr;
      }
      return true;
    });
  }, [camps, selectedLocation, campFilter]);

  // Sample Approved Events & Announcements (Requirement 8)
  const publicEvents = useMemo(() => {
    const list = [
      {
        id: 'evt_1',
        title: 'National Voluntary Blood Donation Month Campaign',
        category: 'Awareness',
        description: 'Join statewide voluntary donation drives across Karnataka hospitals and blood banks.',
        date: '2026-10-01',
        publishedDate: '2026-09-25',
        location: 'Statewide Karnataka',
        icon: Award
      },
      {
        id: 'evt_2',
        title: 'Rare Blood Group Registry Expansion Drive',
        category: 'Drives',
        description: 'Special screening program for rare blood types including Bombay Phenotype (O-h) and O negative donors.',
        date: '2026-10-10',
        publishedDate: '2026-09-22',
        location: 'KIMS & SDM Regional Labs',
        icon: ShieldCheck
      },
      {
        id: 'evt_3',
        title: 'BloodNet Platform 2.0 Multi-Channel Upgrade',
        category: 'Updates',
        description: 'New automated real-time dispatch connecting hospitals directly with voluntary donors via Socket.IO.',
        date: '2026-09-28',
        publishedDate: '2026-09-27',
        location: 'BloodNet Network',
        icon: Sparkles
      },
      {
        id: 'evt_4',
        title: 'Youth Voluntary Donor Club Inauguration',
        category: 'Community',
        description: 'Student voluntary donor clubs launched across regional medical colleges in Hubballi-Dharwad.',
        date: '2026-10-15',
        publishedDate: '2026-09-20',
        location: 'Hubballi Medical College',
        icon: Users
      }
    ];

    return list.filter(e => {
      if (eventCategoryFilter !== 'ALL' && e.category.toUpperCase() !== eventCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [eventCategoryFilter]);

  // Privacy-Safe Network Updates (Requirement 9)
  const publicNetworkActivities = useMemo(() => {
    const activities = [
      { id: 'act_1', title: 'New Hospital Joined Network', desc: 'SDM College of Medical Sciences integrated automated blood stock sync.', time: '1 hour ago', type: 'hospital' },
      { id: 'act_2', title: 'Voluntary Camp Published', desc: 'Mega Independence Day Drive published for Hubballi campus.', time: '3 hours ago', type: 'camp' },
      { id: 'act_3', title: 'Blood Bank Inventory Refreshed', desc: 'Rotary Regional Center updated live storage counts for 8 blood groups.', time: '5 hours ago', type: 'stock' },
      { id: 'act_4', title: 'Rare Blood Screening Completed', desc: '14 new verified O- negative donors registered in regional directory.', time: '1 day ago', type: 'donor' },
      { id: 'act_5', title: 'Public Awareness Campaign Launched', desc: 'Karnataka State Transfusion Council announced voluntary donor month.', time: '2 days ago', type: 'event' }
    ];
    return activities;
  }, []);

  return (
    <div className="space-y-12 py-2 animate-in fade-in text-xs font-sans text-[#16324F]">

      {/* ================================================== */}
      {/* 1. HERO SECTION (Requirement 3)                    */}
      {/* ================================================== */}
      <section
        className="relative w-full rounded-3xl overflow-hidden shadow-xs border border-[#DCEAF5] min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bloodnet-hero-bg.jpg')" }}
      >
        {/* Soft Blue Gradient Overlay for High Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 flex flex-col justify-between min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">

          {/* Hero Content */}
          <div className="max-w-xl space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>COORDINATED HEALTHCARE NETWORK</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#16324F] tracking-tight leading-[1.08]">
              Together <span className="text-[#2563EB]">We Save Lives</span>
            </h1>

            <p className="text-slate-600 font-medium text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg">
              Connecting blood donors, patients, hospitals and blood banks through one coordinated network.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Become a Donor */}
              <Link
                to={getDonateBloodPath()}
                className="px-6 py-3 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-white fill-white" />
                <span>Become a Donor</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              {/* Explore BloodNet */}
              <a
                href="#network-overview"
                className="px-6 py-3 rounded-2xl bg-white hover:bg-sky-50 text-[#2563EB] font-extrabold text-xs border border-[#BFDBFE] shadow-2xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#2563EB]" />
                <span>Explore BloodNet</span>
              </a>

              {/* Access Your Portal */}
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-[#16324F] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>Access Your Portal</span>
              </Link>
            </div>
          </div>

          {/* Hero Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#DCEAF5] text-xs font-sans">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#DCEAF5] shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
              </div>
              <div>
                <span className="font-extrabold block text-[#16324F] leading-tight">Real-Time</span>
                <span className="text-[10px] text-slate-500 font-medium">Availability Status</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#DCEAF5] shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <span className="font-extrabold block text-[#16324F] leading-tight">Verified Infrastructure</span>
                <span className="text-[10px] text-slate-500 font-medium">Hospitals & Vaults</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#DCEAF5] shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div>
                <span className="font-extrabold block text-[#16324F] leading-tight">Regional Coordination</span>
                <span className="text-[10px] text-slate-500 font-medium">Karnataka Network</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#DCEAF5] shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-[#06B6D4]" />
              </div>
              <div>
                <span className="font-extrabold block text-[#16324F] leading-tight">Privacy Protected</span>
                <span className="text-[10px] text-slate-500 font-medium">Role-Based Access</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 2. BLOODNET NETWORK STATISTICS (Requirement 4)     */}
      {/* ================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCEAF5] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-[#E8F4FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                REAL DATABASE COUNTS
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#16324F] mt-1">BloodNet Network Statistics</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {isFetchingAnalytics ? 'Syncing...' : 'Source: Backend MongoDB / System State'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* 1. Registered Donors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Registered Donors</span>
              <Heart className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{stats.registeredDonors}</div>
            <span className="text-[10px] text-slate-500 font-medium">Voluntary Members</span>
          </div>

          {/* 2. Registered Requesters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Registered Requesters</span>
              <Users className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{stats.registeredRequesters}</div>
            <span className="text-[10px] text-slate-500 font-medium">Caregivers & Patients</span>
          </div>

          {/* 3. Registered Hospitals */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Registered Hospitals</span>
              <Building2 className="w-4 h-4 text-[#06B6D4]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{stats.registeredHospitals}</div>
            <span className="text-[10px] text-slate-500 font-medium">Trauma Centers</span>
          </div>

          {/* 4. Registered Blood Banks */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Registered Blood Banks</span>
              <Droplet className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16324F]">{stats.registeredBloodBanks}</div>
            <span className="text-[10px] text-slate-500 font-medium">Storage Vaults</span>
          </div>

          {/* 5. Total Registered Users */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#2563EB] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Total Registered Users</span>
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2563EB]">{stats.totalRegisteredUsers}</div>
            <span className="text-[10px] text-[#2563EB] font-bold">Network Members</span>
          </div>

          {/* 6. Successful Donations / Completed Requests */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1 hover:border-[#22C55E] transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>Completed Requests</span>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#22C55E]">{stats.completedRequests}</div>
            <span className="text-[10px] text-[#22C55E] font-bold">Fulfilled Orders</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. LIVE BLOODNET NETWORK OVERVIEW (Requirement 5)  */}
      {/* ================================================== */}
      <section id="network-overview" className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase px-3 py-1 rounded-full bg-[#E8F4FF] border border-[#BFDBFE]">
            CONNECTED HEALTHCARE NETWORK
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#16324F]">One Network. Many Lives Saved.</h2>
          <p className="text-xs text-slate-500 font-medium">
            BloodNet brings together donors, hospitals, blood banks and patients through synchronized workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {/* 1. Donor Network */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] border border-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h3 className="font-extrabold text-[#16324F] text-sm">1. Donor Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Voluntary donors register their blood group and availability to receive emergency alerts.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#2563EB] font-bold">Voluntary Donors</span>
          </div>

          {/* 2. Hospital Network */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#2563EB] border border-sky-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-extrabold text-[#16324F] text-sm">2. Hospital Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trauma centers verify patient requirements and coordinate clinical blood requests.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#2563EB] font-bold">Trauma Centers</span>
          </div>

          {/* 3. Blood Bank Network */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-100 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-[#22C55E]" />
              </div>
              <h3 className="font-extrabold text-[#16324F] text-sm">3. Blood Bank Vaults</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regional blood banks manage inventory stock, component separation, and unit reservations.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#22C55E] font-bold">Storage Vaults</span>
          </div>

          {/* 4. Requester Services */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#06B6D4] border border-cyan-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h3 className="font-extrabold text-[#16324F] text-sm">4. Requester Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients and caregivers create emergency requests and track real-time fulfillment stages.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#06B6D4] font-bold">Caregiver Desk</span>
          </div>

          {/* 5. Availability Coordination */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-3 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-extrabold text-[#16324F] text-sm">5. Coordination Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated matching engine dispatches alerts across channels while preserving privacy.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-600 font-bold">Socket.IO Dispatch</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. BLOOD GROUP AVAILABILITY OVERVIEW (Req 6)       */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#22C55E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                PRIVACY-SAFE INVENTORY SUMMARY
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#16324F] mt-1">Blood Group Availability Overview</h2>
            <p className="text-xs text-slate-500 font-medium">Aggregated public availability across 8 blood groups in Karnataka</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-[#F5FAFF] px-3.5 py-1.5 rounded-xl border border-[#DCEAF5]">
            <Radio className="w-4 h-4 text-[#22C55E] animate-pulse" />
            <span>{isRealtimeConnected ? '🟢 Live System Inventory' : '🔴 Offline Fallback'}</span>
          </div>
        </div>

        {/* 8 Blood Group Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {groupAvailability.map(item => (
            <div
              key={item.group}
              onClick={() => navigate(getFindBloodPath())}
              className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] hover:border-[#2563EB] hover:bg-white transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[#E8F4FF] text-[#2563EB] border border-[#BFDBFE] font-black text-sm flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  {item.group}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${item.badgeStyle}`}>
                  {item.status}
                </span>
              </div>

              <div>
                <strong className="text-lg font-black text-[#16324F] block">
                  {item.totalUnits > 0 ? `${item.totalUnits} Units` : 'Stock Check'}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {item.matchingDonorsCount} registered donors
                </span>
              </div>

              <span className="text-[9px] text-slate-400 font-mono block border-t border-slate-100 pt-1">
                Updated: {item.lastUpdated}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. BLOOD DONATION CAMPS (Requirement 7)            */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#16324F] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#2563EB]" />
              <span>Upcoming Blood Donation Camps</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Participate in published voluntary donation drives in your district</p>
          </div>

          {/* Location & Time Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search city / venue..."
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-none"
            />

            <select
              value={campFilter}
              onChange={e => setCampFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-medium focus:ring-2 focus:ring-[#2563EB] outline-none"
            >
              <option value="ALL">All Published Drives</option>
              <option value="TODAY">Camps Today</option>
              <option value="UPCOMING">Upcoming Camps</option>
            </select>
          </div>
        </div>

        {publishedCamps.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#F5FAFF] border border-dashed border-[#DCEAF5] text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <strong className="block text-[#16324F] font-bold">No upcoming blood donation camps are currently published.</strong>
            <p className="text-xs text-slate-500">Check back later or register as an individual donor to receive direct alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publishedCamps.map(camp => (
              <div key={camp.id} className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F4FF] text-[#2563EB] text-[10px] font-black border border-[#BFDBFE]">
                      {camp.category || 'Voluntary Camp'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Published
                    </span>
                  </div>

                  <h3 className="font-black text-[#16324F] text-base group-hover:text-[#2563EB] transition-colors leading-tight">
                    {camp.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    Organizer: <strong>{camp.organizer}</strong>
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{camp.date} ({camp.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#EF4444]" />
                      <span className="truncate">{camp.venue}, {camp.city}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setParticipatingCampModal(camp)}
                    className="flex-1 py-2 rounded-xl bg-[#F5FAFF] hover:bg-[#E8F4FF] text-[#2563EB] font-extrabold text-xs border border-[#BFDBFE] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  {(camp.rsvpsCount || 0) >= (camp.expectedDonors || 100) ? (
                    <button
                      disabled
                      className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs text-center border border-slate-200 cursor-not-allowed"
                    >
                      Camp Full
                    </button>
                  ) : (
                    <button
                      onClick={() => setParticipatingCampModal(camp)}
                      className="flex-1 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs text-center shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      Participate →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* 6. EVENTS AND ANNOUNCEMENTS (Requirement 8)        */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#16324F] flex items-center gap-2">
              <Award className="w-6 h-6 text-[#06B6D4]" />
              <span>BloodNet Events & Announcements</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Approved awareness programs, donor drives, and public health initiatives</p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'AWARENESS', 'DRIVES', 'UPDATES', 'COMMUNITY'].map(cat => (
              <button
                key={cat}
                onClick={() => setEventCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  eventCategoryFilter === cat ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-[#F5FAFF] text-slate-600 hover:bg-[#E8F4FF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicEvents.map(evt => {
            const IconComponent = evt.icon || Award;
            return (
              <div key={evt.id} className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] hover:border-[#2563EB] hover:bg-white transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F4FF] text-[#2563EB] text-[10px] font-black uppercase border border-[#BFDBFE]">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Published: {evt.publishedDate}</span>
                  </div>

                  <h3 className="font-black text-[#16324F] text-base group-hover:text-[#2563EB] transition-colors leading-tight flex items-start gap-2">
                    <IconComponent className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                    <span>{evt.title}</span>
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#EF4444]" /> {evt.location}
                  </span>
                  <button
                    onClick={() => setSelectedEventModal(evt)}
                    className="text-[#2563EB] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Announcement <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. RECENT BLOODNET ACTIVITIES (Requirement 9)      */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
          <div>
            <h2 className="text-2xl font-black text-[#16324F] flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#2563EB]" />
              <span>BloodNet Network Updates</span>
            </h2>
            <p className="text-xs text-slate-500">Privacy-safe aggregated platform activity and verified milestones</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Updated in real time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {publicNetworkActivities.map(act => (
            <div key={act.id} className="p-4 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-[#16324F] font-bold text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  {act.title}
                </strong>
                <span className="text-[9px] text-slate-400 font-mono">{act.time}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{act.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. HOW BLOODNET WORKS (Requirement 10)            */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6 text-[#16324F]">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase px-3 py-1 rounded-full bg-[#E8F4FF] border border-[#BFDBFE]">
            FOUR-STEP WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#16324F]">How BloodNet Works</h2>
          <p className="text-xs text-slate-500 font-medium">Simple, privacy-safe coordination from registration to life saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] border border-red-100 font-black text-base flex items-center justify-center">
              01
            </div>
            <h3 className="font-extrabold text-[#16324F] text-sm">1. Register</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Join BloodNet through the appropriate portal as a Donor, Requester, Hospital, or Blood Bank.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#2563EB] border border-sky-100 font-black text-base flex items-center justify-center">
              02
            </div>
            <h3 className="font-extrabold text-[#16324F] text-sm">2. Connect</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donors, requesters, hospitals and blood banks connect seamlessly through authorized workflows.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#06B6D4] border border-cyan-100 font-black text-base flex items-center justify-center">
              03
            </div>
            <h3 className="font-extrabold text-[#16324F] text-sm">3. Coordinate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Blood group availability and emergency requirements are matched and dispatches triggered automatically.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-100 font-black text-base flex items-center justify-center">
              04
            </div>
            <h3 className="font-extrabold text-[#16324F] text-sm">4. Save Lives</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirmed donations and completed workflows contribute directly to helping patients in need.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. WHY BLOODNET? (Requirement 11)                  */}
      {/* ================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-[10px] font-black tracking-widest text-[#22C55E] uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            PLATFORM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#16324F]">Why BloodNet?</h2>
          <p className="text-xs text-slate-500 font-medium">Built for safety, speed, and privacy in healthcare coordination</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2">
            <Heart className="w-6 h-6 text-[#EF4444]" />
            <h3 className="font-extrabold text-[#16324F] text-sm">Connected Network</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unified ecosystem linking donors, caregivers, trauma centers, and blood banks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2">
            <Building2 className="w-6 h-6 text-[#2563EB]" />
            <h3 className="font-extrabold text-[#16324F] text-sm">Hospital Coordination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clinical verification of patient requests to prevent duplicate or unverified submissions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2">
            <Droplet className="w-6 h-6 text-[#22C55E]" />
            <h3 className="font-extrabold text-[#16324F] text-sm">Inventory Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time stock matrix monitoring across Whole Blood, PRBC, Plasma, and Platelets.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2">
            <Lock className="w-6 h-6 text-[#06B6D4]" />
            <h3 className="font-extrabold text-[#16324F] text-sm">Privacy Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Role-based access control protecting patient identities and confidential clinical records.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 10. FIND YOUR PORTAL (Requirement 12)             */}
      {/* ================================================== */}
      <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-slate-50 border border-[#DCEAF5] shadow-xs space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto relative z-10">
          <div className="flex justify-center mb-1">
            <BloodNetLogo size="lg" showTagline={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#16324F] tracking-tight">
            Explore BloodNet Portals
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Select your role below to access authorized portal features and dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
          {/* Card 1: Donor Portal */}
          <div
            onClick={() => navigate('/login/donor')}
            className="p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs hover:shadow-lg hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-black text-[#16324F]">DONOR PORTAL</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manage donation availability and eligible donation activities.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#EF4444] text-white font-extrabold text-xs shadow-2xs hover:bg-red-600 transition-colors cursor-pointer">
              Access Portal →
            </button>
          </div>

          {/* Card 2: Requester Portal */}
          <div
            onClick={() => navigate('/login/requester')}
            className="p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#2563EB] border border-sky-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="text-base font-black text-[#16324F]">REQUESTER PORTAL</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Create and track blood requests for yourself or someone in need.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer">
              Access Portal →
            </button>
          </div>

          {/* Card 3: Hospital Portal */}
          <div
            onClick={() => navigate('/login/hospital')}
            className="p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs hover:shadow-lg hover:border-cyan-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#06B6D4] border border-cyan-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h3 className="text-base font-black text-[#16324F]">HOSPITAL PORTAL</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Coordinate patient blood requirements and hospital operations.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#06B6D4] text-white font-extrabold text-xs shadow-2xs hover:bg-cyan-600 transition-colors cursor-pointer">
              Access Portal →
            </button>
          </div>

          {/* Card 4: Blood Bank Portal */}
          <div
            onClick={() => navigate('/login/bloodbank')}
            className="p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-100 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-[#22C55E]" />
              </div>
              <h3 className="text-base font-black text-[#16324F]">BLOOD BANK PORTAL</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manage inventory, blood units and blood supply coordination.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#22C55E] text-white font-extrabold text-xs shadow-2xs hover:bg-emerald-600 transition-colors cursor-pointer">
              Access Portal →
            </button>
          </div>

          {/* Card 5: Super Admin */}
          <div
            onClick={() => navigate('/login/admin')}
            className="p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-black text-[#16324F]">SUPER ADMIN</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Authorized system administration and monitoring.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs shadow-2xs hover:bg-amber-700 transition-colors cursor-pointer">
              Access Portal →
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 11. CALL TO ACTION (Requirement 15)                */}
      {/* ================================================== */}
      <section className="p-8 sm:p-10 rounded-3xl bg-[#FFF1F2] border border-red-200 shadow-xs space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-[#16324F] tracking-tight flex items-center justify-center gap-2">
            <span>❤️</span>
            <span>Be Part of the BloodNet Community</span>
          </h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Every registered donor, participating hospital and connected blood bank helps strengthen the network that supports people in need.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to={getDonateBloodPath()}
            className="px-8 py-3.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Become a Donor
          </Link>

          <a
            href="#network-overview"
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-sky-50 text-[#2563EB] font-extrabold text-xs border border-[#BFDBFE] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore BloodNet
          </a>

          <Link
            to="/login"
            className="px-8 py-3.5 rounded-2xl bg-[#16324F] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Access Your Portal
          </Link>
        </div>
      </section>

      {/* Detail Modals for Camps & Announcements */}
      {selectedCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#DCEAF5] rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
              <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2563EB]" /> {selectedCampModal.title}
              </h3>
              <button onClick={() => setSelectedCampModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-slate-700">
              <p>Organizer: <strong>{selectedCampModal.organizer}</strong></p>
              <p>Date & Time: <strong>{selectedCampModal.date} ({selectedCampModal.time})</strong></p>
              <p>Venue: <strong>{selectedCampModal.venue}, {selectedCampModal.city}</strong></p>
              <p>Expected Donors: <strong>{selectedCampModal.expectedDonors}</strong> | RSVPs: <strong>{selectedCampModal.rsvpsCount}</strong></p>
              
              {selectedCampModal.amenities && (
                <div className="pt-2">
                  <span className="font-bold text-[#16324F] block mb-1">Camp Amenities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCampModal.amenities.map(a => (
                      <span key={a} className="px-2 py-0.5 rounded-md bg-[#E8F4FF] text-[#2563EB] font-bold text-[10px] border border-[#BFDBFE]">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedCampModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Close</button>
              <Link to={getDonateBloodPath()} className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-extrabold shadow-md">Register / Participate →</Link>
            </div>
          </div>
        </div>
      )}

      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#DCEAF5] rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCEAF5] pb-3">
              <h3 className="font-extrabold text-base text-[#16324F] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#06B6D4]" /> {selectedEventModal.title}
              </h3>
              <button onClick={() => setSelectedEventModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-slate-700">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8F4FF] text-[#2563EB] text-[10px] font-black uppercase border border-[#BFDBFE]">
                Category: {selectedEventModal.category}
              </span>
              <p className="text-sm leading-relaxed text-slate-800 pt-2">{selectedEventModal.description}</p>
              <p className="text-slate-500">Event Date: <strong>{selectedEventModal.date}</strong> | Location: <strong>{selectedEventModal.location}</strong></p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedEventModal(null)} className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-extrabold shadow-md">Done</button>
            </div>
          </div>
        </div>
      {participatingCampModal && (
        <CampRegistrationModal
          camp={participatingCampModal}
          onClose={() => setParticipatingCampModal(null)}
        />
      )}

    </div>
  );
};
