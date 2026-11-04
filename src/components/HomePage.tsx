import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Camera,
  FileText,
  MapPin,
  Building2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  BookmarkCheck,
  TrendingUp,
} from 'lucide-react';
import { CivicComplaint } from '../types';

export const HomePage: React.FC = () => {
  const { complaints, hotspots, setCurrentView, setSelectedComplaint, setActiveFilter } = useCivic();
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'resolved' | 'overdue'>('all');

  const activeComplaints = complaints.filter(c => !c.isDraft);
  const drafts = complaints.filter(c => c.isDraft);
  const overdueCount = activeComplaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated').length;

  const filteredFeed = activeComplaints.filter(c => {
    if (activeTab === 'in_progress') return c.status === 'In Progress' || c.status === 'Assigned';
    if (activeTab === 'resolved') return c.status === 'Resolved' || c.status === 'Closed';
    if (activeTab === 'overdue') return c.status === 'Overdue' || c.status === 'Escalated';
    return true;
  });

  const handleOpenDetail = (complaint: CivicComplaint) => {
    setSelectedComplaint(complaint);
    setCurrentView('complaint-detail');
  };

  const renderStatusIndicator = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>In Progress</span>
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Assigned</span>
          </span>
        );
      case 'Overdue':
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{status === 'Escalated' ? 'Escalated' : 'SLA Overdue'}</span>
          </span>
        );
      case 'Pending Offline Sync':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Queued Offline</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Banner - Clean, calm, and uncluttered */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
            Municipal Grievance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vizianagaram Municipal Corporation · Citizen Reporting &amp; SLA Tracking
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
              {activeComplaints.length}
            </span>
            <span>Active Grievances</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
              {hotspots.length}
            </span>
            <span>Civic Hotspots</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
              {activeComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
            </span>
            <span>Resolved</span>
          </div>
        </div>
      </section>

      {/* 2-Column Clean Modern Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Navigation & 'Report Issue' Action */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Primary Action Card: Report Issue */}
          <div className="p-6 bg-gradient-to-br from-[#000080] to-[#00005C] text-white rounded-2xl shadow-sm border border-blue-900/40 space-y-4">
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Citizen Reporting
              </span>
              <h2 className="text-lg font-bold text-white mt-1 font-['Plus_Jakarta_Sans']">
                Spotted a Civic Problem?
              </h2>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Take a photo and submit your report with GPS coordinates directly to ward engineers.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('capture')}
              className="w-full py-3.5 px-4 bg-[#FF9933] hover:bg-[#E68A00] text-[#000080] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              <Camera size={18} />
              <span>+ Report an Issue</span>
            </button>

            {drafts.length > 0 && (
              <button
                onClick={() => {
                  setActiveFilter('drafts');
                  setCurrentView('my-complaints');
                }}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center justify-between transition cursor-pointer border border-white/10"
              >
                <span className="flex items-center gap-2">
                  <BookmarkCheck size={14} className="text-[#FF9933]" />
                  <span>Resume Saved Draft</span>
                </span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {drafts.length}
                </span>
              </button>
            )}

            <div className="pt-2 border-t border-white/10 text-[11px] text-blue-200">
              Response target: 24 to 48 hours committed SLA
            </div>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2 block">
              Quick Portals
            </span>

            <button
              onClick={() => {
                setActiveFilter('all');
                setCurrentView('my-complaints');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <FileText size={16} className="text-slate-400 group-hover:text-[#000080] dark:group-hover:text-blue-400 transition-colors" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">My Complaints</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">{activeComplaints.length}</span>
            </button>

            <button
              onClick={() => setCurrentView('nearby-map')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-400 group-hover:text-[#000080] dark:group-hover:text-blue-400 transition-colors" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Nearby Map</span>
              </span>
              {hotspots.length > 0 && (
                <span className="text-[11px] font-bold text-[#FF9933] flex items-center gap-1">
                  <Flame size={12} />
                  <span>{hotspots.length} Hotspot</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('authority')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Building2 size={16} className="text-slate-400 group-hover:text-[#000080] dark:group-hover:text-blue-400 transition-colors" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Authority Desk</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => setCurrentView('higher-authority')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <ShieldAlert size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Escalations</span>
              </span>
              {overdueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            <button
              onClick={() => setCurrentView('pipeline-demo')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-slate-400 group-hover:text-[#FF9933] transition-colors" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Pipeline Walkthrough</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          </nav>

          {/* Active Civic Hotspots Notice (Clean, quiet card) */}
          {hotspots.length > 0 && (
            <div
              onClick={() => setCurrentView('nearby-map')}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-[#FF9933]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Active Civic Hotspot
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#000080] dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Map <ChevronRight size={14} />
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {hotspots[0].name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hotspots[0].locality}, Vizianagaram · {hotspots[0].relatedReportIds.length} related complaints clustered
              </p>
            </div>
          )}
        </aside>

        {/* Right Column: Clean, Spacious Complaint Feed Cards */}
        <main className="lg:col-span-8 space-y-5">
          {/* Feed Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                Recent Civic Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Public complaints filed across Vizianagaram Municipal Corporation
              </p>
            </div>

            {/* Segmented Filter Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All ({activeComplaints.length})
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'in_progress'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'resolved'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Resolved
              </button>
              {overdueCount > 0 && (
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    activeTab === 'overdue'
                      ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-red-600/80 hover:text-red-600'
                  }`}
                >
                  Overdue ({overdueCount})
                </button>
              )}
            </div>
          </div>

          {/* Clean Complaint Cards showing only key info (Title, Location, Status, Department) */}
          <div className="space-y-4">
            {filteredFeed.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No grievances currently match this filter.
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="text-xs font-bold text-[#000080] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View all complaints
                </button>
              </div>
            ) : (
              filteredFeed.map(complaint => (
                <article
                  key={complaint.id}
                  onClick={() => handleOpenDetail(complaint)}
                  className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition shadow-xs hover:shadow-sm cursor-pointer space-y-3 group"
                >
                  {/* Top Metadata: Status and Department */}
                  <div className="flex items-center justify-between text-xs">
                    {renderStatusIndicator(complaint.status)}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span>{complaint.department}</span>
                    </div>
                  </div>

                  {/* Main Row: Title & Optional Photo */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#000080] dark:group-hover:text-blue-400 transition-colors">
                        {complaint.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>

                    {complaint.photoUrl && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700">
                        <img
                          src={complaint.photoUrl}
                          alt={complaint.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Location and Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MapPin size={13} className="text-[#138808] shrink-0" />
                      <span>
                        {complaint.location.address}, {complaint.location.ward || complaint.location.city}
                      </span>
                    </div>

                    <span className="font-semibold text-[#000080] dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
