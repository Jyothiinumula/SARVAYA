import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Camera,
  FileText,
  MapPin,
  BookmarkCheck,
  ChevronRight,
  Clock,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CivicComplaint } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';

export const HomePage: React.FC = () => {
  const { complaints, hotspots, setCurrentView, setSelectedComplaint, setActiveFilter } = useCivic();
  const [expandedPriorityCardId, setExpandedPriorityCardId] = useState<string | null>(null);

  const togglePriorityExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedPriorityCardId(prev => (prev === id ? null : id));
  };

  const activeComplaints = complaints.filter(c => !c.isDraft);
  const drafts = complaints.filter(c => c.isDraft);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-950/60 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60">
            In Progress
          </span>
        );
      case 'Assigned':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Assigned
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60 flex items-center gap-1">
            <CheckCircle2 size={10} />
            Resolved
          </span>
        );
      case 'Overdue':
      case 'Escalated':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-950/70 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60">
            {status}
          </span>
        );
      case 'Reopened':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Reopened
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const handleOpenDetail = (complaint: CivicComplaint) => {
    setSelectedComplaint(complaint);
    setCurrentView('complaint-detail');
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* 1. HERO SECTION - Ashoka Chakra Blue with Indian Tricolour identity and Saffron action */}
      <section className="rounded-2xl bg-gradient-to-br from-[#000080] via-[#000070] to-[#00005C] text-white p-5 shadow-sm border border-slate-200/40 space-y-3 relative overflow-hidden">
        {/* Subtle decorative Chakra curve */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

        {/* Elegant top Tricolour accent line inside hero */}
        <div className="h-1 w-24 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full" />

        <div>
          {/* Greeting with Saffron civic badge */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-blue-100 font-semibold block">Hello, Jyothi</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF9933]/25 border border-[#FF9933]/50 text-[#FFD4A8] text-[10px] font-extrabold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
              Civic Portal
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug mt-0.5 font-['Plus_Jakarta_Sans']">
            Let's make our communities cleaner, safer and better — together.
          </h2>
          <p className="text-xs text-blue-100 font-normal mt-1 leading-relaxed">
            Report public grievances to the Municipal Corporation of Vizianagaram. Track assigned officers and verify resolution on-site.
          </p>
        </div>

        {/* Large Primary Action: Report a Civic Issue with Saffron prominence */}
        <div className="pt-1">
          <button
            onClick={() => setCurrentView('capture')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E68A00] hover:from-[#ff9224] hover:to-[#d97d00] text-[#000080] font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2.5 transition active:scale-98 border-2 border-white/40"
          >
            <Camera size={18} className="text-[#000080]" />
            <span>Report a Civic Issue</span>
            <span className="ml-1 text-[10px] bg-[#000080] text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
              Quick Report
            </span>
          </button>
        </div>
      </section>

      {/* 2. QUICK ACTIONS SECTION - White cards with Ashoka Blue, Saffron, and India Green highlights */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            Quick Actions
          </h3>
          <span className="text-[11px] text-[#138808] dark:text-emerald-400 font-bold">Civic Services</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Action 1: Report Issue (Saffron Accent) */}
          <div
            onClick={() => setCurrentView('capture')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-[#FF9933] dark:hover:border-[#FF9933] cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-[#FF9933] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#FFD4A8]/40 dark:border-amber-800/40">
              <Camera size={18} />
            </div>
            <div className="mt-2.5">
              <h4 className="font-bold text-[#000080] dark:text-slate-100 text-xs group-hover:text-[#E68A00] transition-colors">
                Report Issue
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Capture • Describe • Submit</p>
            </div>
          </div>

          {/* Action 2: My Complaints (Ashoka Blue Accent) */}
          <div
            onClick={() => {
              setActiveFilter('all');
              setCurrentView('my-complaints');
            }}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-[#000080] dark:hover:border-blue-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-[#B3C6EB]/50 dark:border-blue-800/50">
              <FileText size={18} />
            </div>
            <div className="mt-2.5">
              <h4 className="font-bold text-[#000080] dark:text-slate-100 text-xs group-hover:text-blue-400 transition-colors">
                My Complaints
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Track your reports &amp; SLAs</p>
            </div>
          </div>

          {/* Action 3: Nearby Issues (India Green Accent) */}
          <div
            onClick={() => setCurrentView('nearby-map')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-[#138808] dark:hover:border-emerald-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-[#A6DDA6]/50 dark:border-emerald-800/50">
              <MapPin size={18} />
            </div>
            <div className="mt-2.5">
              <h4 className="font-bold text-[#000080] dark:text-slate-100 text-xs group-hover:text-emerald-400 transition-colors">
                Nearby Issues
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">See problems around you</p>
            </div>
          </div>

          {/* Action 4: Saved Reports / Drafts (Saffron Accent) */}
          <div
            onClick={() => {
              setActiveFilter('drafts');
              setCurrentView('my-complaints');
            }}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-[#FF9933] dark:hover:border-[#FF9933] cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF6EC] dark:bg-amber-950/50 text-[#FF9933] flex items-center justify-center group-hover:scale-105 transition-transform relative border border-[#FFD4A8] dark:border-amber-800/50">
              <BookmarkCheck size={18} />
              {drafts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF9933] text-[#000080] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {drafts.length}
                </span>
              )}
            </div>
            <div className="mt-2.5">
              <h4 className="font-bold text-[#000080] dark:text-slate-100 text-xs group-hover:text-[#FF9933] transition-colors">
                Saved Reports
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {drafts.length > 0 ? `${drafts.length} Saved on-the-go` : 'View saved captured reports'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE CIVIC HOTSPOTS - Clustered intelligence with Saffron highlights */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Flame size={15} className="text-[#FF9933]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
              Active Civic Hotspots ({hotspots.length})
            </h3>
          </div>
          <button
            onClick={() => setCurrentView('nearby-map')}
            className="text-xs text-[#000080] dark:text-blue-300 font-bold hover:underline flex items-center"
          >
            <span>View Map</span>
            <ChevronRight size={14} className="text-[#FF9933]" />
          </button>
        </div>

        <div className="space-y-2">
          {hotspots.map(hotspot => (
            <div
              key={hotspot.id}
              onClick={() => setCurrentView('nearby-map')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 hover:border-[#FF9933] dark:hover:border-[#FF9933] shadow-2xs hover:shadow-xs cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/50 font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-ping" />
                      Civic Hotspot
                    </span>
                    <span className="text-[10px] font-bold text-[#000080] dark:text-blue-300 bg-[#EBF0FA] dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-[#B3C6EB]/60 dark:border-blue-800/60">
                      {hotspot.relatedReportIds.length} Related Reports
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#000080] dark:text-slate-100 leading-tight">
                    {hotspot.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {hotspot.locality}, {hotspot.city}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#000080] dark:text-blue-300 shrink-0 self-center flex items-center">
                  Map <ChevronRight size={13} className="text-[#FF9933]" />
                </span>
              </div>

              <div className="mt-2 p-2 bg-[#FFF6EC] dark:bg-amber-950/30 rounded-xl border border-[#FFD4A8] dark:border-amber-800/40 text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                <span className="font-bold text-[10px] text-[#E68A00] dark:text-[#FF9933] uppercase block">
                  Root Cause Insight:
                </span>
                <span className="italic">{hotspot.possibleRootCause}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. NEARBY CIVIC ISSUES */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#138808]" />
              Nearby Civic Issues
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Recent complaints in Vizianagaram Municipal Corporation</p>
          </div>
          <button
            onClick={() => {
              setActiveFilter('all');
              setCurrentView('my-complaints');
            }}
            className="text-xs text-[#000080] dark:text-blue-300 font-bold hover:underline flex items-center"
          >
            <span>All Issues</span>
            <ChevronRight size={14} className="text-[#FF9933]" />
          </button>
        </div>

        {/* Issue Cards */}
        <div className="space-y-2.5">
          {activeComplaints.slice(0, 3).map(complaint => (
            <div
              key={complaint.id}
              onClick={() => handleOpenDetail(complaint)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-[#000080] dark:hover:border-blue-500 hover:shadow-xs cursor-pointer transition flex gap-3 group"
            >
              {/* Photo Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                <img
                  src={complaint.photoUrl}
                  alt={complaint.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {complaint.hotspotId && (
                  <span className="absolute bottom-1 left-1 bg-[#FF9933] text-[#000080] text-[8px] font-extrabold px-1 py-0.2 rounded shadow-2xs">
                    Hotspot
                  </span>
                )}
              </div>

              {/* Info Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#000080] dark:text-blue-300 uppercase tracking-wide">
                      {complaint.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => togglePriorityExpand(e, complaint.id)}
                        className="hover:opacity-80 transition cursor-pointer"
                        title="Click to view explainable SmartPriority analysis"
                      >
                        {getPriorityBadge(complaint.priority)}
                      </button>
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-[#000080] dark:group-hover:text-blue-400 transition-colors">
                    {complaint.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    <MapPin size={11} className="shrink-0 text-[#138808]" />
                    <span>{complaint.location.address}, {complaint.location.city}</span>
                  </div>
                </div>

                {/* Inline Expandable SmartPriority Analysis Module if toggled */}
                {expandedPriorityCardId === complaint.id && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                    <SmartPriorityAnalysisCard complaint={complaint} defaultExpanded={true} showTitle={false} />
                  </div>
                )}

                <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-[#000080] dark:text-blue-300" />
                    <span>{complaint.reportedAt || complaint.capturedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => togglePriorityExpand(e, complaint.id)}
                      className="text-[#FF9933] hover:text-[#E68A00] font-bold flex items-center gap-0.5 text-[10px]"
                    >
                      <Sparkles size={11} />
                      <span>{expandedPriorityCardId === complaint.id ? 'Hide Priority' : 'Why this Priority?'}</span>
                    </button>
                    <span className="text-[#000080] dark:text-blue-300 font-bold flex items-center text-xs group-hover:translate-x-0.5 transition-transform">
                      Details <ChevronRight size={13} className="text-[#FF9933]" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
