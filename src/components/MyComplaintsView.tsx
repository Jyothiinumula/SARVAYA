import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  FileText,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookmarkCheck,
  Building,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { CivicComplaint } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';

export const MyComplaintsView: React.FC = () => {
  const {
    complaints,
    activeFilter,
    setActiveFilter,
    setSelectedComplaint,
    setCurrentView,
    setDraftComplaint,
    deleteDraft,
    isOnline,
    offlineQueueCount,
    syncOfflineQueue,
    isSyncing,
  } = useCivic();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPriorityCardId, setExpandedPriorityCardId] = useState<string | null>(null);

  const togglePriorityExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedPriorityCardId(prev => (prev === id ? null : id));
  };

  // Count metrics
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const overdueCount = complaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated').length;
  const reopenedCount = complaints.filter(c => c.status === 'Reopened').length;
  const draftsCount = complaints.filter(c => c.isDraft).length;
  const outboxCount = complaints.filter(c => c.status === 'Pending Offline Sync').length;

  const filteredComplaints = complaints.filter(item => {
    // Tab filter
    if (activeFilter === 'outbox' && item.status !== 'Pending Offline Sync') return false;
    if (activeFilter === 'drafts' && !item.isDraft) return false;
    if (activeFilter === 'in_progress' && item.status !== 'In Progress' && item.status !== 'Assigned') return false;
    if (activeFilter === 'resolved' && item.status !== 'Resolved' && item.status !== 'Closed') return false;
    if (activeFilter === 'overdue' && item.status !== 'Overdue' && item.status !== 'Escalated') return false;
    if (activeFilter === 'reopened' && item.status !== 'Reopened') return false;
    if (activeFilter === 'submitted' && item.isDraft) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLoc = item.location.address.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchId || matchTitle || matchLoc || matchCat;
    }
    return true;
  });

  const handleOpenDetail = (complaint: CivicComplaint) => {
    if (complaint.isDraft) {
      setDraftComplaint(complaint);
      setCurrentView('capture');
    } else {
      setSelectedComplaint(complaint);
      setCurrentView('complaint-detail');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 dark:bg-red-950/60 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60">
            In Progress
          </span>
        );
      case 'Assigned':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Assigned
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60 flex items-center gap-1">
            <CheckCircle2 size={10} />
            Resolved
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Closed
          </span>
        );
      case 'Overdue':
      case 'Escalated':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/70 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60 animate-pulse flex items-center gap-1">
            <AlertTriangle size={10} />
            {status}
          </span>
        );
      case 'Reopened':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <RotateCcw size={10} />
            Reopened
          </span>
        );
      case 'Draft':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF6EC] dark:bg-amber-950/50 text-[#FF9933] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60">
            Draft
          </span>
        );
      case 'Pending Offline Sync':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
            <WifiOff size={10} />
            Queued Offline
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            My Complaints &amp; Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor resolution progress, SLAs, and verify outcomes
          </p>
        </div>
        <button
          onClick={() => setCurrentView('capture')}
          className="text-xs bg-[#FF9933] hover:bg-[#E68A00] text-[#000080] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition border border-[#000080]/20 active:scale-95"
        >
          + New Report
        </button>
      </div>

      {/* Offline Outbox Action Banner if items pending sync */}
      {outboxCount > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800/70 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <CloudUpload size={16} />
            </div>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                {outboxCount} Offline Grievance{outboxCount > 1 ? 's' : ''} Stored Locally
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400">
                {isOnline
                  ? 'Connection is active. Tap sync to transmit to Municipal Authority.'
                  : 'Cached safely in IndexedDB. Will auto-sync when online.'}
              </span>
            </div>
          </div>
          {isOnline && (
            <button
              onClick={() => syncOfflineQueue()}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-[#FF9933] hover:bg-[#ff8a14] text-[#000080] font-black rounded-xl text-xs flex items-center gap-1 shrink-0 ml-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs (Horizontal scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'all'
              ? 'bg-[#000080] dark:bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All ({totalCount})
        </button>

        {outboxCount > 0 && (
          <button
            onClick={() => setActiveFilter('outbox')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'outbox'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}
          >
            <CloudUpload size={12} />
            <span>Queued ({outboxCount})</span>
          </button>
        )}

        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'in_progress'
              ? 'bg-[#000080] dark:bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          In Progress ({inProgressCount})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'overdue'
              ? 'bg-[#D32F2F] dark:bg-red-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60'
          }`}
        >
          Overdue / Escalated ({overdueCount})
        </button>

        <button
          onClick={() => setActiveFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'resolved'
              ? 'bg-[#138808] dark:bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60'
          }`}
        >
          Resolved ({resolvedCount})
        </button>

        <button
          onClick={() => setActiveFilter('reopened')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'reopened'
              ? 'bg-purple-700 dark:bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}
        >
          Reopened ({reopenedCount})
        </button>

        <button
          onClick={() => setActiveFilter('drafts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeFilter === 'drafts'
              ? 'bg-[#FF9933] dark:bg-amber-600 text-[#000080] dark:text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-[#FFF6EC] dark:hover:bg-slate-700 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60'
          }`}
        >
          Saved Drafts ({draftsCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by ID, keyword, ward, or category..."
          className="w-full text-xs p-2.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No complaints match this filter.</p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#000080] dark:text-blue-300 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredComplaints.map(item => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#000080] dark:hover:border-blue-500 transition-all cursor-pointer space-y-3"
            >
              {/* Header: ID, Category, Priority, Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#000080] dark:text-blue-300 bg-[#EBF0FA] dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-[#B3C6EB] dark:border-blue-800/60">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Photo & Description Row */}
              <div className="flex gap-3">
                {item.photoUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin size={11} className="shrink-0 text-[#138808]" />
                    <span className="truncate">{item.location.address}, {item.location.ward}</span>
                  </div>
                </div>
              </div>

              {/* Expandable SmartPriority Analysis Module */}
              {!item.isDraft && (
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => togglePriorityExpand(e, item.id)}
                    className="flex items-center justify-between w-full text-left py-1 text-xs text-[#000080] dark:text-blue-300 font-bold hover:underline group"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#FF9933] group-hover:rotate-12 transition-transform" />
                      <span>SmartPriority™ Analysis:</span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.priority} Priority • {expandedPriorityCardId === item.id ? 'Hide Breakdown' : 'Explain Why'}
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
              )}

              {/* Footer Meta */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#000080] dark:text-blue-300" />
                  <span>Reported: {item.reportedAt || item.capturedAt}</span>
                </div>

                {item.isDraft ? (
                  <span className="text-[#FF9933] font-bold flex items-center gap-1 text-xs">
                    Resume Draft <ArrowRight size={12} />
                  </span>
                ) : (
                  <span className="text-[#000080] dark:text-blue-300 font-bold flex items-center gap-1 text-xs">
                    View Progress <ChevronRight size={13} className="text-[#FF9933]" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
