import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, Check, Phone, X, ArrowRightLeft, CheckCircle2, RadioTower, MessageSquare, Search, Eye } from 'lucide-react';
const REGIONAL_TARGETS = [
    { name: 'KIMS Teaching Hospital', city: 'Hubballi', region: 'Hubballi-Dharwad' },
    { name: 'SDM Medical Center', city: 'Dharwad', region: 'Hubballi-Dharwad' },
    { name: 'Hubballi Regional Blood Bank', city: 'Hubballi', region: 'Hubballi-Dharwad' },
    { name: 'Belagavi District Civil Hospital', city: 'Belagavi', region: 'Belagavi Division' },
    { name: 'City Central Blood Transfusion Bank', city: 'Bengaluru', region: 'Bengaluru Division' }
];
export const HospitalEmergencyBoard = () => {
    const { requests, approveRequestByHospital, acceptBloodRequest, rejectBloodRequest, redirectBloodRequest, openEmergencyChat, showToast } = useApp();
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    // Modal States
    const [viewingReq, setViewingReq] = useState(null);
    const [rejectingReq, setRejectingReq] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('Stock temporarily depleted at ICU blood counter');
    const [redirectingReq, setRedirectingReq] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('Hubballi-Dharwad');
    const [selectedTargetCenter, setSelectedTargetCenter] = useState('SDM Medical Center');
    const [redirectReason, setRedirectReason] = useState('Stock unavailable at current hospital desk - Redirecting to partner facility');
    // Filter and sort requests
    const filteredRequests = requests.filter((r) => {
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'PENDING' && (r.status !== 'PENDING_HOSPITAL_APPROVAL' && r.status !== 'VERIFIED_SEARCHING_DONORS' && r.status !== 'PENDING'))
                return false;
            if (statusFilter === 'ACCEPTED' && (r.status !== 'APPROVED' && r.status !== 'BLOOD_SECURED'))
                return false;
            if (statusFilter === 'REJECTED' && r.status !== 'REJECTED')
                return false;
            if (statusFilter === 'REDIRECTED' && !r.trendingReason?.includes('Redirected'))
                return false;
            if (statusFilter === 'COMPLETED' && r.status !== 'COMPLETED')
                return false;
        }
        if (priorityFilter !== 'ALL' && r.urgency !== priorityFilter)
            return false;
        if (departmentFilter !== 'ALL') {
            const dept = (r.wardDept || 'Emergency').toLowerCase();
            if (!dept.includes(departmentFilter.toLowerCase()))
                return false;
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return (r.id.toLowerCase().includes(q) ||
                r.patientName.toLowerCase().includes(q) ||
                r.bloodGroup.toLowerCase().includes(q) ||
                (r.bloodComponent && r.bloodComponent.toLowerCase().includes(q)) ||
                (r.contactPerson && r.contactPerson.toLowerCase().includes(q)));
        }
        return true;
    }).sort((a, b) => {
        if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL')
            return -1;
        if (a.urgency !== 'CRITICAL' && b.urgency === 'CRITICAL')
            return 1;
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!rejectingReq)
            return;
        rejectBloodRequest(rejectingReq.id, rejectingReq.hospitalName || 'KIMS Teaching Hospital', rejectionReason);
        setRejectingReq(null);
    };
    const handleConfirmRedirect = (e) => {
        e.preventDefault();
        if (!redirectingReq)
            return;
        const targetObj = REGIONAL_TARGETS.find(t => t.name === selectedTargetCenter);
        const targetCity = targetObj ? targetObj.city : 'Hubballi';
        redirectBloodRequest(redirectingReq.id, redirectingReq.hospitalName || 'KIMS Teaching Hospital', selectedTargetCenter, targetCity, redirectReason);
        setRedirectingReq(null);
    };
    const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;
    return (<div className="space-y-6 text-xs animate-in fade-in w-full max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldAlert className="w-6 h-6 text-[#EF4444] animate-pulse"/>
            <h2 className="text-2xl font-black text-[#16324F] tracking-tight">Incoming Patient Blood Requests Queue</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] uppercase tracking-wider">
              LIVE CLINICAL TRIAGE
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Review, approve, reject, or redirect incoming patient blood requests with instant real-time sync across BloodNet
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-4 py-2 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-right">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">Active Critical Cases</span>
            <span className="text-xl font-black text-[#DC2626]">{criticalCount} Critical</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="p-4 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3"/>
            <input type="text" placeholder="Search Request ID, patient, blood group, ward..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] text-[#16324F] font-bold text-xs focus:outline-none focus:border-[#2563EB]"/>
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] text-[#16324F] font-extrabold text-xs cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="ACCEPTED">Accepted / Reserved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REDIRECTED">Redirected</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="p-2.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] text-[#16324F] font-extrabold text-xs cursor-pointer">
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical (2 Hours)</option>
            <option value="HIGH">High Priority</option>
            <option value="MODERATE">Moderate Priority</option>
          </select>

          <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="p-2.5 rounded-2xl bg-[#F5FAFF] border border-[#DCEAF5] text-[#16324F] font-extrabold text-xs cursor-pointer">
            <option value="ALL">All Departments</option>
            <option value="Emergency">Emergency</option>
            <option value="ICU">ICU</option>
            <option value="Surgery">Surgery</option>
            <option value="Maternity">Maternity</option>
            <option value="General Ward">General Ward</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-[#64748B] font-bold">
          Showing {filteredRequests.length} Requests
        </span>
      </div>

      {/* 3. REQUEST CARDS QUEUE */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (<div className="p-12 rounded-3xl bg-white border border-[#DCEAF5] shadow-xs text-center space-y-2">
            <Check className="w-10 h-10 text-[#22C55E] mx-auto"/>
            <h3 className="font-extrabold text-base text-[#16324F]">No Matching Blood Requests Found</h3>
            <p className="text-xs text-[#64748B]">All matching patient requests have been processed or cleared.</p>
          </div>) : (filteredRequests.map(req => {
            const isApproved = req.status === 'APPROVED' || req.status === 'BLOOD_SECURED';
            const isRejected = req.status === 'REJECTED';
            const isRedirected = req.trendingReason?.includes('Redirected');
            return (<div key={req.id} className={`p-6 rounded-3xl bg-white border border-[#DCEAF5] space-y-4 shadow-xs transition-all hover:shadow-md ${req.urgency === 'CRITICAL'
                    ? 'border-l-4 border-l-[#EF4444]'
                    : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCEAF5] pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] font-extrabold text-xs">
                        🩸 {req.bloodGroup} ({req.bloodComponent || 'PRBC'})
                      </span>
                      <h3 className="font-extrabold text-base text-[#16324F]">{req.patientName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] uppercase">
                        Urgency: {req.urgency}
                      </span>
                      <span className="text-xs font-mono text-[#94A3B8] font-bold">Request ID: {req.id}</span>
                      {(() => {
                    const rawStatus = req.channelStatuses?.hospitalStatus || (isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING'));
                    const hospStatus = rawStatus === 'APPROVED' ? 'APPROVED' : (rawStatus === 'REJECTED' ? 'REJECTED' : 'PENDING');
                    return (<span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${hospStatus === 'APPROVED'
                            ? 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]'
                            : hospStatus === 'REJECTED'
                                ? 'bg-[#FFF1F2] text-[#DC2626] border-[#FECDD3]'
                                : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'}`}>
                            <span>{hospStatus === 'APPROVED' ? '🟢' : hospStatus === 'REJECTED' ? '🔴' : '🟡'}</span>
                            <span>Hospital: {hospStatus}</span>
                          </span>);
                })()}
                    </div>

                    <p className="text-xs text-[#64748B] mt-1">
                      Department / Ward: <strong>{req.wardDept || 'Emergency ICU'}</strong> • Required: <strong>{req.unitsNeeded} units</strong> • Need by: {req.requiredDate || 'Immediate'} {req.requiredTime || ''}
                    </p>
                    {isRedirected && (<p className="text-xs text-[#2563EB] font-bold mt-1 flex items-center gap-1">
                        <RadioTower className="w-3.5 h-3.5"/> {req.trendingReason}
                      </p>)}
                    {isRejected && (<p className="text-xs text-[#DC2626] font-bold mt-1">
                        ❌ Rejection Reason: "{req.channelStatuses?.hospitalRejectionReason || req.additionalNotes || 'Stock unavailable'}"
                      </p>)}
                  </div>

                  {/* WORKFLOW ACTIONS FOR HOSPITAL STAFF */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button onClick={() => setViewingReq(req)} className="px-3.5 py-2.5 rounded-2xl bg-[#F5FAFF] hover:bg-[#E8F4FF] text-[#16324F] border border-[#DCEAF5] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors">
                      <Eye className="w-4 h-4 text-[#2563EB]"/> View Details
                    </button>

                    {!isApproved && !isRejected && (<>
                        <button onClick={() => acceptBloodRequest(req.id, req.hospitalName || 'KIMS Teaching Hospital')} className="px-4 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                          <Check className="w-4 h-4"/> Approve
                        </button>

                        <button onClick={() => setRedirectingReq(req)} className="px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                          <ArrowRightLeft className="w-4 h-4"/> Redirect
                        </button>

                        <button onClick={() => setRejectingReq(req)} className="px-3.5 py-2.5 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#DC2626] font-extrabold text-xs border border-[#FECDD3] transition-all cursor-pointer">
                          <X className="w-4 h-4 inline"/> Reject
                        </button>
                      </>)}

                    {isApproved && (<div className="flex items-center gap-2 flex-wrap">
                        <div className="px-3 py-2 rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] font-black text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]"/> Stock Reserved
                        </div>
                        <button onClick={() => openEmergencyChat(req.id)} className="px-4 py-2.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                          <MessageSquare className="w-4 h-4"/> 💬 Chat with Requester
                        </button>
                      </div>)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B] font-mono">
                  <div>Requester: <strong>{req.contactPerson} ({req.maskedPhone || req.contactPhone})</strong></div>
                  <a href={`tel:${req.contactPhone}`} className="text-[#2563EB] font-bold hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5"/> Call Requester ({req.contactPhone})
                  </a>
                </div>
              </div>);
        }))}
      </div>

      {/* VIEW REQUEST DETAILS MODAL (REQUIREMENT 3) */}
      {viewingReq && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-sky-100 rounded-3xl p-6 space-y-5 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewingReq(null)} className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
              <X className="w-4 h-4"/>
            </button>

            <div className="flex items-center gap-3 border-b border-sky-100 pb-3">
              <span className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 font-black text-sm flex items-center justify-center">
                {viewingReq.bloodGroup}
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Request Information • {viewingReq.id}
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Priority: {viewingReq.urgency} • Created: {viewingReq.requestedAt}
                </span>
              </div>
            </div>

            {/* SECTION 1: PATIENT REQUIREMENT */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                1. Patient Requirement
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                <div><span className="text-slate-400 font-sans block">Patient Name</span><strong>{viewingReq.patientName}</strong></div>
                <div><span className="text-slate-400 font-sans block">Blood Group</span><strong className="text-red-600">{viewingReq.bloodGroup}</strong></div>
                <div><span className="text-slate-400 font-sans block">Component</span><strong>{viewingReq.bloodComponent || 'PRBC'}</strong></div>
                <div><span className="text-slate-400 font-sans block">Units Needed</span><strong>{viewingReq.unitsNeeded} Units</strong></div>
                <div><span className="text-slate-400 font-sans block">Need Date</span><strong>{viewingReq.requiredDate || 'Immediate'}</strong></div>
                <div><span className="text-slate-400 font-sans block">Reason</span><strong className="font-sans">{viewingReq.reason}</strong></div>
              </div>
            </div>

            {/* SECTION 2: HOSPITAL INFORMATION */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                2. Hospital Information
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                <div><span className="text-slate-400 font-sans block">Hospital</span><strong>{viewingReq.hospitalName}</strong></div>
                <div><span className="text-slate-400 font-sans block">Department / Ward</span><strong>{viewingReq.wardDept || 'Emergency ICU'}</strong></div>
                <div><span className="text-slate-400 font-sans block">Doctor In-Charge</span><strong>{viewingReq.doctorName || 'Dr. Mahesh Kulkarni'}</strong></div>
              </div>
            </div>

            {/* SECTION 3: REQUESTER INFORMATION */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                3. Requester Information
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                <div><span className="text-slate-400 font-sans block">Contact Person</span><strong>{viewingReq.contactPerson}</strong></div>
                <div><span className="text-slate-400 font-sans block">Relationship</span><strong>{viewingReq.relationship || 'Caregiver'}</strong></div>
                <div><span className="text-slate-400 font-sans block">Phone</span><strong>{viewingReq.contactPhone}</strong></div>
              </div>
            </div>

            {/* SECTION 4: TIMELINE */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                4. Request Timeline
              </strong>
              <div className="relative pl-5 space-y-3 border-l-2 border-sky-300 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">{viewingReq.requestedAt}</span>: Requester Created Blood Request
                </div>
                <div>
                  <span className="text-slate-400">10:03 AM</span>: Routed to Hospital Triage Queue
                </div>
                {viewingReq.status === 'APPROVED' && (<div>
                    <span className="text-emerald-700 font-bold">10:05 AM</span>: Hospital Approved & Reserved Stock
                  </div>)}
                {viewingReq.status === 'REJECTED' && (<div>
                    <span className="text-red-700 font-bold">10:06 AM</span>: Hospital Rejected (Reason: {viewingReq.additionalNotes})
                  </div>)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setViewingReq(null)} className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>)}

      {/* REJECTION MODAL */}
      {rejectingReq && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button onClick={() => setRejectingReq(null)} className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
              <X className="w-4 h-4"/>
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600"/> Reject Blood Request
            </h3>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request {rejectingReq.id} • {rejectingReq.patientName}
              </span>
              <span className="text-red-800 font-bold block">
                🩸 {rejectingReq.bloodGroup} ({rejectingReq.unitsNeeded} Units)
              </span>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Rejection Reason *</label>
                <textarea rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500" required/>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRejectingReq(null)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold shadow-sm hover:bg-red-700 cursor-pointer">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* REDIRECT MODAL */}
      {redirectingReq && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative">
            <button onClick={() => setRedirectingReq(null)} className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
              <X className="w-4 h-4"/>
            </button>

            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-600"/> Redirect Emergency Blood Request
            </h3>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
              <span className="font-black text-slate-900 block text-sm">
                Request {redirectingReq.id} • {redirectingReq.patientName}
              </span>
              <span className="text-sky-800 font-bold block">
                🩸 {redirectingReq.bloodGroup} ({redirectingReq.unitsNeeded} Units required)
              </span>
            </div>

            <form onSubmit={handleConfirmRedirect} className="space-y-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Target Healthcare Facility *</label>
                <select value={selectedTargetCenter} onChange={e => setSelectedTargetCenter(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer">
                  {REGIONAL_TARGETS.map(t => (<option key={t.name} value={t.name}>
                      {t.name} ({t.city})
                    </option>))}
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Redirection Rationale *</label>
                <textarea rows={2} value={redirectReason} onChange={e => setRedirectReason(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" required/>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRedirectingReq(null)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-extrabold shadow-sm hover:bg-sky-700 cursor-pointer">
                  Confirm Redirection
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
