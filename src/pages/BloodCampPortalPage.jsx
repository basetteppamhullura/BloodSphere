import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { OrganizeCampModal } from '../components/camps/OrganizeCampModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Droplet,
  PlusCircle,
  Search,
  Edit,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Eye,
  Info,
  Phone,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Lock,
  Printer
} from 'lucide-react';

export const BloodCampPortalPage = ({ portalType: forcedPortalType }) => {
  const location = useLocation();
  const { currentUser, currentRole } = useAuth();
  const {
    camps = [],
    campRegistrations = [],
    cancelCamp,
    showToast
  } = useApp();

  // Determine portal type: 'Hospital' or 'Blood Bank'
  const isBloodBank = forcedPortalType === 'Blood Bank' ||
    currentRole === 'bloodbank' ||
    location.pathname.includes('/bloodbank');

  const portalType = isBloodBank ? 'Blood Bank' : 'Hospital';

  // Logged-in Organizer Identity
  const currentOrgId = currentUser?.id || currentUser?._id || `org_${portalType.toLowerCase().replace(/\s+/g, '_')}`;
  const currentOrgName = currentUser?.name || currentUser?.organizationName ||
    (isBloodBank ? 'Rotary Regional Blood Center' : 'KIMS Teaching Hospital');

  // Helper to determine if a camp is owned by this authenticated organization
  const isCampOwnedByMe = (camp) => {
    if (!camp) return false;
    if (camp.organizerId && (camp.organizerId === currentOrgId || camp.organizerId === currentUser?.id)) return true;
    
    // Seeded aliases
    if (currentOrgId === 'acc_hosp_001' && (camp.organizerId === 'hosp_kims_hubballi' || camp.organizer?.toLowerCase().includes('kims'))) return true;
    if (currentOrgId === 'acc_bb_001' && (camp.organizerId === 'bb_rotary_hubballi' || camp.organizer?.toLowerCase().includes('rotary'))) return true;

    // Name keyword matching
    const myName = (currentOrgName || '').toLowerCase().trim();
    const campOrg = (camp.organizer || '').toLowerCase().trim();
    if (myName && campOrg) {
      if (myName.includes(campOrg) || campOrg.includes(myName)) return true;
      const myWords = myName.split(/\s+/).filter(w => w.length > 3);
      const campWords = campOrg.split(/\s+/).filter(w => w.length > 3);
      if (myWords.some(w => campWords.includes(w))) return true;
    }

    return false;
  };

  // State
  const [activeTab, setActiveTab] = useState('MY_CAMPS'); // 'MY_CAMPS' | 'ALL_CAMPS'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  
  // Modals state
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [cancellingCamp, setCancellingCamp] = useState(null);
  const [cancelReason, setCancelReason] = useState('Inclement weather / Facility rescheduling');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [viewingParticipantsCamp, setViewingParticipantsCamp] = useState(null);
  const [participantSearch, setParticipantSearch] = useState('');

  // Filtered Camps
  const displayedCamps = useMemo(() => {
    let list = [...camps];

    // Tab Filter
    if (activeTab === 'MY_CAMPS') {
      list = list.filter(isCampOwnedByMe);
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter(c => (c.status || 'PUBLISHED').toUpperCase() === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.venue?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.organizer?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
      );
    }

    // Sort: Nearest upcoming first
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [camps, activeTab, statusFilter, searchQuery, currentOrgId, currentOrgName]);

  // Overall Statistics for this Facility
  const facilityStats = useMemo(() => {
    const myCamps = camps.filter(isCampOwnedByMe);
    const activeUpcoming = myCamps.filter(c => c.status === 'PUBLISHED' || c.status === 'UPCOMING');
    const totalRegistrations = myCamps.reduce((sum, c) => sum + (c.rsvpsCount || 0), 0);
    const totalExpected = myCamps.reduce((sum, c) => sum + (c.expectedDonors || 100), 0);

    return {
      totalCamps: myCamps.length,
      activeUpcoming: activeUpcoming.length,
      totalRegistrations,
      totalExpected
    };
  }, [camps, currentOrgId, currentOrgName]);

  // Handle Cancel Camp
  const handleConfirmCancel = async () => {
    if (!cancellingCamp) return;
    setIsSubmittingCancel(true);
    try {
      const campId = cancellingCamp.id || cancellingCamp.campId;
      const res = await cancelCamp(campId, cancelReason, currentUser);
      if (res?.success) {
        setCancellingCamp(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel camp.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Get registrations for viewing participants modal
  const selectedCampRegistrations = useMemo(() => {
    if (!viewingParticipantsCamp) return [];
    const targetId = viewingParticipantsCamp.id || viewingParticipantsCamp.campId;
    let list = campRegistrations.filter(r => r.campId === targetId);

    if (participantSearch.trim()) {
      const q = participantSearch.trim().toLowerCase();
      list = list.filter(r =>
        r.fullName?.toLowerCase().includes(q) ||
        r.bloodGroup?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.phoneNumber?.includes(q)
      );
    }

    return list;
  }, [viewingParticipantsCamp, campRegistrations, participantSearch]);

  const isHospitalTheme = portalType === 'Hospital';
  const primaryBg = isHospitalTheme ? 'bg-[#2563EB]' : 'bg-emerald-600';
  const primaryText = isHospitalTheme ? 'text-[#2563EB]' : 'text-emerald-600';
  const primaryBorder = isHospitalTheme ? 'border-[#BFDBFE]' : 'border-emerald-200';
  const lightBg = isHospitalTheme ? 'bg-[#E8F4FF]' : 'bg-emerald-50';

  return (
    <div className="space-y-6 text-xs animate-in fade-in max-w-7xl mx-auto pb-16">
      
      {/* 1. TOP HEADER BANNER */}
      <div className={`p-6 sm:p-7 rounded-3xl bg-white border ${primaryBorder} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl ${lightBg} border ${primaryBorder} flex items-center justify-center text-xl shadow-xs shrink-0`}>
              🩸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Blood Donation Camp Management
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isHospitalTheme
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {portalType} Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Organize, edit, publish, and monitor voluntary blood camps connected directly to the BloodNet Home Page in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Organize Camp Primary Action Button */}
        <button
          onClick={() => {
            setEditingCamp(null);
            setIsOrganizeModalOpen(true);
          }}
          className={`px-5 py-3 rounded-2xl ${primaryBg} hover:opacity-90 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Organize Blood Camp</span>
        </button>
      </div>

      {/* 2. AUTHENTICATED ORGANIZER VERIFIED IDENTITY BADGE */}
      <div className={`px-5 py-3 rounded-2xl ${lightBg} border ${primaryBorder} flex flex-wrap items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${primaryText}`} />
          <span className="text-slate-600 font-medium">Authenticated Organizer:</span>
          <strong className="text-slate-900 font-black">{currentOrgName}</strong>
          <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-mono border border-slate-200">
            Account ID: {currentOrgId}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Home Page Real-Time Sync Active
          </span>
        </div>
      </div>

      {/* 3. OPERATIONAL KPI METRICS (4 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Camps Organized</span>
            <Building2 className={`w-4 h-4 ${primaryText}`} />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {facilityStats.totalCamps}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium">By {currentOrgName}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Live / Upcoming</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-emerald-600 block">
            {facilityStats.activeUpcoming}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium">Publicly active on Home</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Registered Donors</span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-[#2563EB] block">
            {facilityStats.totalRegistrations}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium">Real participant registrations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCEAF5] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Expected Donors</span>
            <Droplet className="w-4 h-4 text-rose-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-rose-600 block">
            {facilityStats.totalExpected}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium">Combined collection capacity</span>
        </div>
      </div>

      {/* 4. FILTERS, TABS & SEARCH CONTROLS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Navigation Tabs: My Camps vs All Network Camps */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('MY_CAMPS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'MY_CAMPS'
                ? `${primaryBg} text-white shadow-xs`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            My {portalType}'s Camps ({facilityStats.totalCamps})
          </button>
          <button
            onClick={() => setActiveTab('ALL_CAMPS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'ALL_CAMPS'
                ? `${primaryBg} text-white shadow-xs`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            All Network Camps ({camps.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search camp, venue, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F5FAFF] border border-[#DCEAF5] text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">🟢 Published (Live)</option>
            <option value="UPCOMING">🔵 Upcoming</option>
            <option value="COMPLETED">⚪ Completed</option>
            <option value="CANCELLED">🔴 Cancelled</option>
          </select>
        </div>
      </div>

      {/* 5. CAMPS LISTING */}
      {displayedCamps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-[#DCEAF5] space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <strong className="text-base font-black text-slate-900 block">
            {activeTab === 'MY_CAMPS'
              ? `No blood donation camps organized by ${currentOrgName} yet.`
              : 'No donation camps matching current filter criteria.'}
          </strong>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeTab === 'MY_CAMPS'
              ? 'Click the button below to organize and publish your first blood donation drive. It will appear on the Home Page automatically.'
              : 'Try clearing your search query or selecting a different status filter.'}
          </p>
          {activeTab === 'MY_CAMPS' && (
            <button
              onClick={() => {
                setEditingCamp(null);
                setIsOrganizeModalOpen(true);
              }}
              className={`px-5 py-2.5 rounded-xl ${primaryBg} text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5`}
            >
              <PlusCircle className="w-4 h-4" /> Organize Your First Camp
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedCamps.map(camp => {
            const isOwned = isCampOwnedByMe(camp);
            const isCancelled = camp.status === 'CANCELLED';
            const rsvpsCount = camp.rsvpsCount || 0;
            const expectedDonors = camp.expectedDonors || 100;
            const percentage = Math.min(100, Math.round((rsvpsCount / expectedDonors) * 100));

            return (
              <div
                key={camp.id || camp.campId}
                className={`p-6 rounded-3xl bg-white border shadow-xs transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/20 opacity-90'
                    : isOwned
                    ? 'border-[#BFDBFE]'
                    : 'border-[#DCEAF5]'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Organizer & Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        (camp.organizerType || '').toLowerCase() === 'blood bank'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {camp.organizerType || 'Hospital'}
                      </span>
                      {isOwned ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#E8F4FF] text-[#2563EB] text-[10px] font-black border border-[#BFDBFE]">
                          ★ Managed by You
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> View Only
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      isCancelled
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : camp.status === 'UPCOMING'
                        ? 'bg-sky-100 text-sky-800 border-sky-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {camp.status || 'PUBLISHED'}
                    </span>
                  </div>

                  {/* Title & Organizer Info */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Organized by: <strong className="text-slate-900">{camp.organizer}</strong>
                    </p>
                    {camp.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {camp.description}
                      </p>
                    )}
                  </div>

                  {/* Date, Time & Venue Details */}
                  <div className="p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] space-y-2 text-xs">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span>{camp.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{camp.time || `${camp.startTime || '09:00 AM'} - ${camp.endTime || '04:00 PM'}`}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                      <span className="font-medium">
                        <strong>{camp.venue}</strong>
                        {camp.address ? `, ${camp.address}` : ''}
                        {camp.city ? `, ${camp.city}` : ''}
                        {camp.district ? ` (${camp.district})` : ''}
                        {camp.state ? `, ${camp.state}` : ''}
                        {camp.pincode ? ` - ${camp.pincode}` : ''}
                      </span>
                    </div>

                    {camp.contactPerson && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Contact: <strong>{camp.contactPerson}</strong></span>
                        </span>
                        {camp.contactPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <strong className="font-mono text-slate-800">{camp.contactPhone}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Target Groups */}
                  {camp.targetGroups && camp.targetGroups.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-bold mr-1">Target Groups:</span>
                      {camp.targetGroups.map(grp => (
                        <span key={grp} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-black border border-red-200">
                          {grp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Registered Donors Capacity Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-600 font-bold">
                        Registered Participants: <strong className="text-[#2563EB] font-black text-sm">{rsvpsCount}</strong>
                      </span>
                      <span className="text-slate-500">
                        Expected Capacity: <strong className="text-slate-800 font-bold">{expectedDonors}</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCancelled
                            ? 'bg-slate-400'
                            : percentage >= 100
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* View Registered Donors Button (Available for all camps) */}
                  <button
                    onClick={() => {
                      setParticipantSearch('');
                      setViewingParticipantsCamp(camp);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F5FAFF] hover:bg-[#E8F4FF] text-[#2563EB] font-extrabold text-xs border border-[#BFDBFE] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Participants ({rsvpsCount})</span>
                  </button>

                  {/* Facility Edit & Cancel Actions (Only for owned camps) */}
                  {isOwned && !isCancelled && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCamp(camp);
                          setIsOrganizeModalOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit camp schedule, venue, or description"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setCancellingCamp(camp);
                          setCancelReason('Inclement weather / Facility rescheduling');
                        }}
                        className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Cancel this camp"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {isCancelled && (
                    <span className="text-[11px] text-red-600 font-bold italic py-1 px-2">
                      Cancelled: {camp.cancelReason || 'Cancelled by organizer'}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 6. ORGANIZE / EDIT CAMP MODAL */}
      {isOrganizeModalOpen && (
        <OrganizeCampModal
          isOpen={isOrganizeModalOpen}
          onClose={() => {
            setIsOrganizeModalOpen(false);
            setEditingCamp(null);
          }}
          existingCamp={editingCamp}
          forcedOrganizerType={portalType}
        />
      )}

      {/* 7. CANCEL CONFIRMATION DIALOG MODAL */}
      {cancellingCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#DCEAF5] rounded-3xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Cancel Blood Donation Camp</h3>
                <p className="text-[11px] text-slate-500">This action will immediately update the Home Page.</p>
              </div>
            </div>

            <div className="space-y-2 text-slate-700">
              <p>
                Are you sure you want to cancel: <strong className="text-slate-900">{cancellingCamp.title}</strong>?
              </p>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cancellation Reason:
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Explain why the camp is being cancelled..."
                  className="w-full p-3 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] text-xs font-medium outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingCamp(null)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REGISTERED PARTICIPANTS MODAL (REAL DATABASE DATA) */}
      {viewingParticipantsCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-[#DCEAF5] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#16324F] to-[#2563EB] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0">
                  👥
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    Registered Participants Roster
                  </h3>
                  <p className="text-xs text-sky-100 mt-0.5">
                    {viewingParticipantsCamp.title} • {viewingParticipantsCamp.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingParticipantsCamp(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub-bar: Search & Participant Count */}
            <div className="px-6 py-3 bg-[#F5FAFF] border-b border-[#DCEAF5] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-bold">Total Confirmed Registrations:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white font-mono font-black text-xs">
                  {selectedCampRegistrations.length}
                </span>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search donor, group, city..."
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#DCEAF5] text-xs font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            {/* Participants Table Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {selectedCampRegistrations.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <strong className="text-sm font-bold text-slate-800 block">No Registered Donors Found</strong>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {participantSearch
                      ? 'No participant matches the search query.'
                      : 'Participants who click "Participate" on the Home Page will be recorded here in real time.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[#E8F4FF] text-[#16324F] uppercase text-[10px] font-black tracking-wider border-b border-[#BFDBFE]">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-xl">Participant</th>
                        <th className="py-2.5 px-3">Blood Group</th>
                        <th className="py-2.5 px-3">Age / Gender</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Contact Phone</th>
                        <th className="py-2.5 px-3">Preferred Time</th>
                        <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedCampRegistrations.map((reg) => (
                        <tr key={reg.registrationId || reg._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <strong className="text-slate-900 block font-bold">{reg.fullName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {reg.registrationId}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-black font-mono text-[11px] border border-red-200">
                              {reg.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {reg.age} yrs • {reg.gender}
                          </td>
                          <td className="py-3 px-3">
                            {reg.city}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-900 font-bold">
                            {/* Privacy rules: authorized organizer sees full number */}
                            {reg.phoneNumber}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {reg.preferredTime || 'Any slot'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {reg.registrationStatus || 'REGISTERED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#DCEAF5] flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                Participant data is encrypted and subject to privacy regulations.
              </span>
              <button
                onClick={() => setViewingParticipantsCamp(null)}
                className="px-5 py-2 rounded-xl bg-white border border-[#DCEAF5] hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
