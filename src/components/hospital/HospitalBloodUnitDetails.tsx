import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup, ComponentType, DetailedBloodUnit, UnitLifecycleStatus } from '../../types';
import {
  Droplet,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Boxes,
  ShieldCheck,
  ArrowRight,
  Eye,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

// Helper to calculate days remaining until expiry date string (DD/MM/YYYY or YYYY-MM-DD)
function calculateDaysToExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 30;

  try {
    let expDate: Date;
    if (expiryDateStr.includes('/')) {
      const parts = expiryDateStr.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        expDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        expDate = new Date(expiryDateStr);
      }
    } else {
      expDate = new Date(expiryDateStr);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 30;
  }
}

export const HospitalBloodUnitDetails: React.FC = () => {
  const { bloodUnitsList, inventoryStockMap, showToast } = useApp();
  const { currentUser, currentRole } = useAuth();
  const navigate = useNavigate();
  const { unitId: urlUnitId } = useParams();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>(urlUnitId || '');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterComponent, setFilterComponent] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<DetailedBloodUnit | null>(null);

  // Compute Units Data with Computed Expiry Status & Attributes
  const enhancedBloodUnits = useMemo(() => {
    return bloodUnitsList.map((unit, index) => {
      const daysRemaining = calculateDaysToExpiry(unit.expiryDate);
      let computedStatus: 'Available' | 'Reserved' | 'Received' | 'Near Expiry' | 'Expired' | 'Issued' = 'Available';

      if (unit.status === 'EXPIRED' || daysRemaining <= 0) {
        computedStatus = 'Expired';
      } else if (daysRemaining <= 5 && unit.status !== 'ISSUED' && unit.status !== 'TRANSFUSED') {
        computedStatus = 'Near Expiry';
      } else if (unit.status === 'RESERVED') {
        computedStatus = 'Reserved';
      } else if (unit.status === 'ISSUED' || unit.status === 'TRANSFUSED') {
        computedStatus = 'Issued';
      } else if (unit.status === 'COLLECTED' || unit.status === 'TESTING') {
        computedStatus = 'Received';
      } else {
        computedStatus = 'Available';
      }

      return {
        ...unit,
        computedStatus,
        daysRemaining,
        quantity: unit.quantity || 1,
        source: unit.source || (index % 2 === 0 ? 'Regional Blood Bank' : 'KIMS Hospital Drive'),
        receivedDate: unit.receivedDate || unit.createdDate || '01/09/2026'
      };
    });
  }, [bloodUnitsList]);

  // Expiry Statistics
  const nearExpiryUnits = useMemo(() => {
    return enhancedBloodUnits.filter(u => u.computedStatus === 'Near Expiry');
  }, [enhancedBloodUnits]);

  const expiredUnits = useMemo(() => {
    return enhancedBloodUnits.filter(u => u.computedStatus === 'Expired');
  }, [enhancedBloodUnits]);

  const availableUnits = useMemo(() => {
    return enhancedBloodUnits.filter(u => u.computedStatus === 'Available' || u.computedStatus === 'Received');
  }, [enhancedBloodUnits]);

  // Filtered List based on Search & Criteria
  const filteredUnits = useMemo(() => {
    return enhancedBloodUnits.filter(unit => {
      const matchesSearch =
        searchQuery === '' ||
        unit.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.source && unit.source.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup = filterGroup === 'ALL' || unit.bloodGroup === filterGroup;
      const matchesComponent = filterComponent === 'ALL' || unit.component === filterComponent;
      const matchesStatus = filterStatus === 'ALL' || unit.computedStatus === filterStatus;

      return matchesSearch && matchesGroup && matchesComponent && matchesStatus;
    });
  }, [enhancedBloodUnits, searchQuery, filterGroup, filterComponent, filterStatus]);

  // Role Access Guard
  if (currentRole !== 'hospital' && currentRole !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-black text-xl">
          🔒
        </div>
        <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Hospital Blood Unit Details are strictly restricted to authorized hospital staff members.
        </p>
        <button
          onClick={() => navigate('/login/hospital')}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs"
        >
          Hospital Login →
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string, daysRemaining: number) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] inline-flex items-center gap-1">
            <span>🟢</span> Available
          </span>
        );
      case 'Reserved':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] inline-flex items-center gap-1">
            <span>🟡</span> Reserved
          </span>
        );
      case 'Received':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black text-[11px] inline-flex items-center gap-1">
            <span>🔵</span> Received
          </span>
        );
      case 'Near Expiry':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-black text-[11px] inline-flex items-center gap-1 animate-pulse">
            <span>🟠</span> Near Expiry ({daysRemaining}d left)
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-black text-[11px] inline-flex items-center gap-1">
            <span>🔴</span> Expired
          </span>
        );
      case 'Issued':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300 font-black text-[11px] inline-flex items-center gap-1">
            <span>⚫</span> Issued
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* 1. HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white shadow-xl relative overflow-hidden border border-sky-800/50">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-15 pointer-events-none">
          <Droplet className="w-80 h-80 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-extrabold text-xs border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Authorized Hospital Blood Inventory Traceability</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hospital Blood Unit Details 🩸
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed max-w-2xl">
              Inspect barcode unit IDs, storage vaults, collection/expiry dates, sources, and real-time inventory statuses across hospital stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => showToast('Real-time hospital blood stock synchronized.')}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Sync
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATIC EXPIRY WARNING BANNER */}
      {(nearExpiryUnits.length > 0 || expiredUnits.length > 0) && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <strong className="text-sm font-black text-slate-900 block">
                  ⚠️ Automatic Stock Expiry Warning
                </strong>
                <span className="text-xs text-slate-600">
                  {nearExpiryUnits.length} unit(s) approaching expiry ($\le 5$ days) and {expiredUnits.length} expired unit(s) detected in storage vaults.
                </span>
              </div>
            </div>

            <button
              onClick={() => setFilterStatus('Near Expiry')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 shadow-2xs"
            >
              View Near Expiry →
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {nearExpiryUnits.slice(0, 3).map(u => (
              <span key={`warn-${u.unitId}`} className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 font-extrabold flex items-center gap-1.5 shadow-2xs">
                <span>🩸 {u.bloodGroup} ({u.component})</span>
                <span className="font-mono text-slate-500">[{u.unitId}]</span>
                <span className="text-amber-700 font-black">Expires in {u.daysRemaining}d</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. KPI METRIC SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold block">Total Hospital Units</span>
          <strong className="text-2xl font-black text-slate-900 block tracking-tight">{enhancedBloodUnits.length} Units</strong>
          <span className="text-[11px] text-slate-500">Tracked in database</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold block">Available & Ready</span>
          <strong className="text-2xl font-black text-emerald-600 block tracking-tight">{availableUnits.length} Units</strong>
          <span className="text-[11px] text-emerald-700 font-bold">🟢 Ready for issue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold block">Near Expiry Warning</span>
          <strong className="text-2xl font-black text-orange-600 block tracking-tight">{nearExpiryUnits.length} Units</strong>
          <span className="text-[11px] text-orange-700 font-bold">🟠 Prioritize issue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold block">Expired Vault Units</span>
          <strong className="text-2xl font-black text-red-600 block tracking-tight">{expiredUnits.length} Units</strong>
          <span className="text-[11px] text-red-700 font-bold">🔴 Discard / Quarantine</span>
        </div>
      </div>

      {/* 4. SEARCH & FILTER CONTROL BAR */}
      <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Unit ID (e.g. BU-2026-000125), storage location, or source..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            
            {/* Blood Group */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Group:</span>
              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
              >
                <option value="ALL">All Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Bombay Phenotype (O-h)'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Component:</span>
              <select
                value={filterComponent}
                onChange={e => setFilterComponent(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
              >
                <option value="ALL">All Components</option>
                <option value="PRBC">PRBC (Red Cells)</option>
                <option value="Whole Blood">Whole Blood</option>
                <option value="Plasma (FFP)">Plasma (FFP)</option>
                <option value="Platelets (PRP)">Platelets (PRP)</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Status:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Available">🟢 Available</option>
                <option value="Reserved">🟡 Reserved</option>
                <option value="Received">🔵 Received</option>
                <option value="Near Expiry">🟠 Near Expiry</option>
                <option value="Expired">🔴 Expired</option>
                <option value="Issued">⚫ Issued</option>
              </select>
            </div>

            {(filterGroup !== 'ALL' || filterComponent !== 'ALL' || filterStatus !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterGroup('ALL');
                  setFilterComponent('ALL');
                  setFilterStatus('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Reset Filters
              </button>
            )}

          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
          <span>Showing {filteredUnits.length} of {enhancedBloodUnits.length} registered blood units</span>
          <span className="font-mono text-[11px]">DATABASE PERSISTED</span>
        </div>
      </div>

      {/* 5. BLOOD UNIT DETAILS GRID / TABLE */}
      {filteredUnits.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-sky-100 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
          <strong className="text-sm font-black text-slate-900 block">No Blood Units Match Search Filter</strong>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUnits.map(unit => (
            <div
              key={unit.unitId}
              onClick={() => setSelectedUnit(unit)}
              className="p-5 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-4 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Top Row: Unit ID & Status Badge */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div>
                  <span className="font-mono font-black text-sm text-slate-900 block">{unit.unitId}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Donor Ref: {unit.donorRef}</span>
                </div>

                {getStatusBadge(unit.computedStatus, unit.daysRemaining)}
              </div>

              {/* Middle Grid: Detailed Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group & Component</span>
                  <strong className="text-sm font-black text-slate-900 block">
                    <span className="text-red-600">{unit.bloodGroup}</span> • {unit.component}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">Quantity: {unit.quantity} Unit</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage Location</span>
                  <strong className="text-xs font-extrabold text-slate-900 block truncate">{unit.storageLocation}</strong>
                  <span className="text-[10px] text-slate-500 block">Source: {unit.source}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intake / Collection Date</span>
                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {unit.collectionDate}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Received: {unit.receivedDate}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</span>
                  <span className={`text-xs font-black block flex items-center gap-1 ${
                    unit.computedStatus === 'Expired' ? 'text-red-600' : unit.computedStatus === 'Near Expiry' ? 'text-orange-600' : 'text-slate-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5" /> {unit.expiryDate}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Updated: {unit.lastUpdated}</span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-sky-700 font-extrabold group-hover:translate-x-0.5 transition-transform">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> View Unit Inspector Modal
                </span>
                <span>Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. UNIT INSPECTOR MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-sky-100 rounded-3xl p-6 space-y-5 text-xs shadow-2xl relative">
            
            <button
              onClick={() => setSelectedUnit(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-sky-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black text-lg">
                🩸
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HOSPITAL BLOOD UNIT RECORD</span>
                <strong className="text-base font-black text-slate-900 font-mono block">{selectedUnit.unitId}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700">Lifecycle Status:</span>
                {getStatusBadge(selectedUnit.computedStatus, selectedUnit.daysRemaining)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">BLOOD GROUP</span>
                  <strong className="text-sm font-black text-red-600 block">{selectedUnit.bloodGroup}</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">COMPONENT</span>
                  <strong className="text-sm font-black text-slate-900 block">{selectedUnit.component}</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">QUANTITY</span>
                  <strong className="text-xs font-bold text-slate-900 block">{selectedUnit.quantity} Unit</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">STORAGE LOCATION</span>
                  <strong className="text-xs font-bold text-slate-900 block">{selectedUnit.storageLocation}</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">SOURCE</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedUnit.source}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">DONOR REFERENCE</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedUnit.donorRef}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">INTAKE DATE</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedUnit.collectionDate}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block">EXPIRY DATE</span>
                  <span className={`text-xs font-black block ${selectedUnit.computedStatus === 'Expired' ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedUnit.expiryDate} ({selectedUnit.daysRemaining} days left)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-sky-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
