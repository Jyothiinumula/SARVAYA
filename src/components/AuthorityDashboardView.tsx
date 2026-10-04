import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCcw,
  Flame,
  UserCheck,
  Search,
  ChevronRight,
  Filter,
  ShieldAlert,
  ArrowRight,
  Edit3,
  MapPin,
  Calendar,
  RefreshCw,
  User,
  Inbox,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { CivicComplaint, ComplaintStatus } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';
import { CityResolutionAnalytics } from './CityResolutionAnalytics';

export const AuthorityDashboardView: React.FC = () => {
  const {
    complaints,
    hotspots,
    updateComplaintStatus,
    escalateComplaint,
    setSelectedComplaint,
    setCurrentView,
    syncWithCentralDB,
    isServerConnected,
  } = useCivic();

  const [dashboardMode, setDashboardMode] = useState<'queue' | 'analytics'>('queue');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'high_priority' | 'in_progress' | 'overdue' | 'resolved' | 'reopened'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [actionModalComplaint, setActionModalComplaint] = useState<CivicComplaint | null>(null);
  const [expandedPriorityCardId, setExpandedPriorityCardId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');

  const togglePriorityExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedPriorityCardId(prev => (prev === id ? null : id));
  };
  const [actionNotes, setActionNotes] = useState('');
  const [assignedOfficerInput, setAssignedOfficerInput] = useState('');
  const [assignedDepartmentInput, setAssignedDepartmentInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const validComplaints = complaints.filter(c => !c.isDraft);

  // Metrics
  const totalReports = validComplaints.length;
  const newCount = validComplaints.filter(c => c.status === 'New').length;
  const highPriorityCount = validComplaints.filter(c => c.priority === 'HIGH').length;
  const inProgressCount = validComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const overdueCount = validComplaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated').length;
  const resolvedCount = validComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const reopenedCount = validComplaints.filter(c => c.status === 'Reopened').length;

  // Filter complaints
  const filteredList = validComplaints.filter(c => {
    if (activeTab === 'new' && c.status !== 'New') return false;
    if (activeTab === 'high_priority' && c.priority !== 'HIGH') return false;
    if (activeTab === 'in_progress' && c.status !== 'In Progress' && c.status !== 'Assigned') return false;
    if (activeTab === 'overdue' && c.status !== 'Overdue' && c.status !== 'Escalated') return false;
    if (activeTab === 'resolved' && c.status !== 'Resolved' && c.status !== 'Closed') return false;
    if (activeTab === 'reopened' && c.status !== 'Reopened') return false;

    if (departmentFilter !== 'All' && c.department !== departmentFilter) return false;

    return true;
  });

  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const sortedList = [...filteredList].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    if (pDiff !== 0) return pDiff;
    const scoreB = b.smartPriority?.score || 0;
    const scoreA = a.smartPriority?.score || 0;
    return scoreB - scoreA;
  });

  const handleOpenActionModal = (c: CivicComplaint) => {
    setActionModalComplaint(c);
    setNewStatus(c.status === 'New' ? 'Assigned' : c.status);
    setAssignedOfficerInput(c.officerName || 'Er. M. S. Reddy (Ward Engineer)');
    setAssignedDepartmentInput(c.department);
    setActionNotes('');
  };

  const handleSaveAction = () => {
    if (!actionModalComplaint) return;
    updateComplaintStatus(
      actionModalComplaint.id,
      newStatus,
      actionNotes || `Work order updated to ${newStatus}.`,
      assignedOfficerInput,
      assignedDepartmentInput
    );
    setActionModalComplaint(null);
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncWithCentralDB();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#000080] text-white p-4 rounded-2xl shadow-sm space-y-1 border border-white/20 relative overflow-hidden">
        {/* Subtle Indian Tricolour accent bar */}
        <div className="h-1 w-20 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-1.5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-[#000080] flex items-center justify-center shadow-xs">
              <Building2 size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Authority &amp; Field Operations Desk</h1>
              <p className="text-[11px] text-blue-100">
                Municipal Ward Officers &amp; Department Engineers Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 text-xs flex items-center gap-1 transition"
              title="Refresh shared complaints from database"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline text-[11px]">Sync</span>
            </button>
            <button
              onClick={() => setCurrentView('higher-authority')}
              className="text-[11px] font-bold text-red-200 hover:text-white bg-red-900/60 px-2.5 py-1 rounded-lg border border-red-700 transition flex items-center gap-1"
            >
              <ShieldAlert size={12} />
              <span>Escalation Docket</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS GRID (With Indian Tricolour highlights: Saffron for New, India Green for Resolved) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'all'
              ? 'bg-[#000080] text-white border-[#000080]'
              : 'bg-white dark:bg-slate-900 text-[#000080] dark:text-blue-300 border-slate-200 dark:border-slate-800 hover:border-[#000080]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
            Total Reports
          </span>
          <span className="text-xl font-black">{totalReports}</span>
        </div>

        {/* NEW COMPLAINTS TAB - Prominent Saffron */}
        <div
          onClick={() => setActiveTab('new')}
          className={`p-3 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
            activeTab === 'new'
              ? 'bg-[#FF9933] text-[#000080] border-[#FF9933] font-extrabold shadow-xs'
              : 'bg-[#FFF6EC] dark:bg-amber-950/40 text-[#E68A00] dark:text-amber-400 border-[#FFD4A8] dark:border-amber-800/60 hover:border-[#FF9933]'
          }`}
        >
          {newCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
          )}
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#E68A00] dark:text-amber-400 block">
            New Complaints
          </span>
          <span className="text-xl font-black text-[#000080] dark:text-amber-300">{newCount}</span>
        </div>

        <div
          onClick={() => setActiveTab('high_priority')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'high_priority'
              ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
            High Priority
          </span>
          <span className="text-xl font-black text-[#D32F2F] dark:text-red-400">
            {highPriorityCount}
          </span>
        </div>

        <div
          onClick={() => setActiveTab('in_progress')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'in_progress'
              ? 'bg-[#000080] text-white border-[#000080]'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-[#000080]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
            In Progress
          </span>
          <span className="text-xl font-black text-[#000080] dark:text-blue-400">{inProgressCount}</span>
        </div>

        <div
          onClick={() => setActiveTab('overdue')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'overdue'
              ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D32F2F] dark:text-red-400 block">
            Overdue
          </span>
          <span className="text-xl font-black text-[#D32F2F] dark:text-red-400">{overdueCount}</span>
        </div>

        {/* RESOLVED TAB - Prominent India Green */}
        <div
          onClick={() => setActiveTab('resolved')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'resolved'
              ? 'bg-[#138808] text-white border-[#138808] shadow-xs'
              : 'bg-[#EDF8ED] dark:bg-emerald-950/40 text-[#138808] dark:text-emerald-400 border-[#A6DDA6] dark:border-emerald-800/60 hover:border-[#138808]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
            Resolved
          </span>
          <span className="text-xl font-black text-[#138808] dark:text-emerald-400">{resolvedCount}</span>
        </div>

        <div
          onClick={() => setActiveTab('reopened')}
          className={`p-3 rounded-2xl border cursor-pointer transition ${
            activeTab === 'reopened'
              ? 'bg-purple-700 text-white border-purple-700'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
            Reopened
          </span>
          <span className="text-xl font-black text-purple-700 dark:text-purple-400">{reopenedCount}</span>
        </div>
      </div>

      {/* OPERATIONS VIEW MODE SELECTOR (Work Orders vs City Resolution Analytics) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setDashboardMode('queue')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            dashboardMode === 'queue'
              ? 'bg-white dark:bg-slate-900 text-[#000080] dark:text-blue-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Inbox size={14} />
          <span>Work Orders Dispatch ({sortedList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardMode('analytics')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            dashboardMode === 'analytics'
              ? 'bg-[#000080] dark:bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <TrendingUp size={14} className={dashboardMode === 'analytics' ? 'text-[#FF9933]' : ''} />
          <span>Resolution Trends &amp; Analytics</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF9933]/20 text-[#FF9933] font-black hidden sm:inline">
            Recharts
          </span>
        </button>
      </div>

      {dashboardMode === 'analytics' ? (
        <CityResolutionAnalytics />
      ) : (
        <>
          {/* Quick Analytics Snapshot strip while in Queue view */}
          <div
            onClick={() => setDashboardMode('analytics')}
            className="p-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/70 dark:from-slate-900 dark:via-blue-950/40 dark:to-emerald-950/30 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 flex items-center justify-between cursor-pointer hover:border-[#000080] dark:hover:border-blue-500 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#000080] text-white flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 size={16} className="text-[#FF9933]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#000080] dark:text-blue-300">
                    City-Wide Resolution Velocity
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#138808]/15 text-[#138808] dark:text-emerald-400">
                    {totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0}% Cleared
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daily intake vs clearance trends, department SLAs &amp; ward volume breakdown
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#000080] dark:text-blue-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
              <span className="hidden sm:inline">Open Charts</span>
              <ChevronRight size={14} />
            </span>
          </div>

          {/* CIVICHOTSPOT INTELLIGENCE VIEW (Required by Section 14) */}
          <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/30 dark:to-amber-950/30 rounded-2xl p-4 border border-red-200 dark:border-red-900/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-950 dark:text-red-200 uppercase tracking-wide">
            <Flame size={16} className="text-[#D64545] dark:text-red-400" />
            <span>Civic Hotspots Requiring Coordinated Action</span>
          </div>
          <span className="text-[10px] bg-red-200/80 dark:bg-red-900/60 text-red-900 dark:text-red-200 font-bold px-2 py-0.5 rounded-full">
            {hotspots.length} Clusters Active
          </span>
        </div>

        <div className="space-y-2">
          {hotspots.slice(0, 2).map(h => (
            <div
              key={h.id}
              className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-200/70 dark:border-red-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{h.name}</span>
                  <span className="text-[10px] font-bold text-[#D64545] dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded border border-red-200 dark:border-red-900/50">
                    {h.relatedReportIds.length} Related Reports
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Area: <strong className="text-slate-700 dark:text-slate-200">{h.locality}</strong> • Dept:{' '}
                  <strong className="text-slate-700 dark:text-slate-200">{h.department}</strong>
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-300 italic mt-0.5 font-medium">
                  {h.possibleRootCause}
                </p>
              </div>

              <button
                onClick={() => setCurrentView('nearby-map')}
                className="text-xs font-bold text-[#0878C9] dark:text-blue-400 hover:underline flex items-center shrink-0 self-end sm:self-center"
              >
                <span>Inspect Cluster</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLAINTS DISPATCH TABLE / CARDS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Plus_Jakarta_Sans']">
              Department Work Orders &amp; Field Queue ({sortedList.length})
            </h3>
            {activeTab === 'new' && (
              <span className="bg-[#0B5ED7] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                New Submissions
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Tap action to update status</span>
        </div>

        {/* Dynamic Priority Principle Banner */}
        <div className="bg-[#FFF6EC] dark:bg-amber-950/30 border border-[#FFD4A8] dark:border-amber-800/50 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#000080] dark:text-amber-200">
          <Scale size={16} className="text-[#FF9933] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-[#E68A00] dark:text-amber-400 block text-[11px] uppercase tracking-wide">
              SmartPriority Dynamic Impact Ordering
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-snug">
              Work orders are prioritized by <strong>potential civic impact and urgency</strong> (safety risk, people affected, duration, public health, recurrence, location sensitivity) — NOT simply by the chronological order in which complaints were submitted.
            </p>
          </div>
        </div>

        {sortedList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <Inbox size={20} />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No complaints in this category.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When citizens submit reports from any phone, they will immediately appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedList.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-extrabold text-[#0878C9] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => togglePriorityExpand(e, item.id)}
                        className="cursor-pointer hover:opacity-80 transition"
                        title="Click to view explainable SmartPriority analysis"
                      >
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                            item.priority === 'HIGH'
                              ? 'bg-red-100 dark:bg-red-950/60 text-[#D64545] dark:text-red-400'
                              : item.priority === 'MEDIUM'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-[#b97816] dark:text-amber-400'
                              : 'bg-teal-100 dark:bg-teal-950/60 text-[#087F8C] dark:text-teal-400'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </button>
                      {item.status === 'New' && (
                        <span className="bg-[#FF671F] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg block ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#2E9B63] dark:text-emerald-400'
                          : item.status === 'Overdue' || item.status === 'Escalated'
                          ? 'bg-red-100 dark:bg-red-950/60 text-[#D64545] dark:text-red-400 animate-pulse'
                          : item.status === 'Reopened'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                          : item.status === 'New'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-[#0B5ED7] dark:text-blue-300 font-bold'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-[#0878C9] dark:text-blue-400'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      SLA: {item.slaDays * 24}h
                    </span>
                  </div>
                </div>

                {/* Complaint Details: Photo, Problem Description, Submitter */}
                <div className="flex gap-3 items-start">
                  {item.photoUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <User size={11} className="text-slate-400" />
                        {item.citizenInfo?.name || 'Citizen (Mobile App)'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        {item.reportedAt || item.capturedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Officer metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block flex items-center gap-1">
                      <MapPin size={10} className="text-[#138808]" />
                      Location:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                      {item.location.address}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {item.location.ward}, {item.location.city || 'Vizianagaram'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                      Assigned Department / Officer:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                      {item.department}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Officer: {item.officerName || 'Pending Assignment'}
                    </span>
                  </div>
                </div>

                {/* Escalation Status if flagged */}
                {(item.status === 'Escalated' || item.escalation?.isEscalated) && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-[#D64545] shrink-0" />
                    <span className="font-bold text-[11px]">
                      Escalated to Joint Municipal Commissioner review.
                    </span>
                  </div>
                )}

                {/* Expandable SmartPriority Analysis Module */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => togglePriorityExpand(e, item.id)}
                    className="flex items-center justify-between w-full text-left py-1 text-xs text-[#000080] dark:text-blue-400 font-bold hover:underline"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#FF9933]" />
                      <span>SmartPriority™ Explanation:</span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.priority} Priority • {expandedPriorityCardId === item.id ? 'Hide Analysis' : 'Explain Why'}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-[#FF9933] flex items-center gap-0.5">
                      {expandedPriorityCardId === item.id ? (
                        <>Collapse <ChevronUp size={13} /></>
                      ) : (
                        <>Explain <ChevronDown size={13} /></>
                      )}
                    </span>
                  </button>

                  {expandedPriorityCardId === item.id && (
                    <div className="mt-2 animate-fadeIn">
                      <SmartPriorityAnalysisCard complaint={item} defaultExpanded={true} showTitle={false} />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedComplaint(item);
                      setCurrentView('complaint-detail');
                    }}
                    className="text-xs font-bold text-[#0878C9] dark:text-blue-400 hover:underline"
                  >
                    View Citizen Complaint Detail
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#000080] hover:bg-[#000060] text-white rounded-xl font-bold text-xs transition border border-[#FF9933]/30"
                  >
                    <Edit3 size={12} className="text-[#FF9933]" />
                    <span>
                      {item.status === 'New' ? 'Assign & Update' : 'Update Work Order'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* AUTHORITY ACTION MODAL (Assign department, officer, Update status, Add notes) */}
      {actionModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 animate-scaleUp border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-[#000080] dark:text-blue-400 font-bold">
                {actionModalComplaint.id}
              </span>
              <h3 className="font-extrabold text-base text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
                Update Field Work Order
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{actionModalComplaint.title}</p>
            </div>

            {/* SmartPriority AI Insight in Modal */}
            <div className="p-2.5 bg-gradient-to-r from-[#000080]/5 via-[#FF9933]/10 to-[#138808]/5 dark:from-blue-950/30 dark:via-amber-950/30 dark:to-emerald-950/30 rounded-xl border-l-4 border-[#000080] dark:border-blue-400 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 block flex items-center gap-1">
                <Sparkles size={12} className="text-[#FF9933]" />
                SmartPriority Assessment: {actionModalComplaint.priority}
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic mt-0.5">
                "{actionModalComplaint.smartPriority?.aiRecommendation || actionModalComplaint.priorityFactors?.aiRecommendation || 'Assessed by 6 civic impact factors.'}"
              </p>
            </div>

            {/* Department Assignment */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Assigned Department:
              </label>
              <select
                value={assignedDepartmentInput}
                onChange={e => setAssignedDepartmentInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#000080]"
              >
                <option value="Drainage & Sanitation (Municipal Corporation of Vizianagaram)">
                  Drainage &amp; Sanitation
                </option>
                <option value="Roads & Infrastructure (Municipal Corporation of Vizianagaram)">
                  Roads &amp; Infrastructure
                </option>
                <option value="Water Supply & Bulk Distribution (Vizianagaram Municipal Corp)">
                  Water Supply &amp; Bulk Distribution
                </option>
                <option value="Electrical & Street Lighting Wing (Vizianagaram Municipal Corp)">
                  Electrical &amp; Street Lighting
                </option>
                <option value="Public Health & Vector Control Wing (Vizianagaram)">
                  Public Health &amp; Vector Control
                </option>
              </select>
            </div>

            {/* Officer Assignment */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Assign / Reassign Officer:
              </label>
              <input
                type="text"
                value={assignedOfficerInput}
                onChange={e => setAssignedOfficerInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#000080]"
              />
            </div>

            {/* Status Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Change Status:
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#000080] font-medium"
              >
                <option value="New">New (Unassigned)</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress (Field Team Active)</option>
                <option value="Resolved">Mark Resolved (Dispatches for Citizen Verification)</option>
                <option value="Overdue">Flag as Overdue</option>
                <option value="Escalated">Escalated to Higher Authority</option>
              </select>
            </div>

            {/* Action Taken Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Action Taken / Field Remarks:
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="Describe equipment deployed, work done, or reason for delay..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#000080]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActionModalComplaint(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAction}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#FF9933] to-[#E68A00] hover:from-[#ff9224] hover:to-[#d97d00] text-[#000080] font-extrabold text-xs rounded-xl shadow-xs border border-[#000080]/20"
              >
                Save Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
