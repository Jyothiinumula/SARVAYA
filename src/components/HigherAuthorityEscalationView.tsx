import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ShieldAlert,
  AlertTriangle,
  Building,
  User,
  Clock,
  Flame,
  ArrowRight,
  Send,
  UserCheck,
  FileCheck2,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { CivicComplaint } from '../types';

export const HigherAuthorityEscalationView: React.FC = () => {
  const { complaints, hotspots, escalateComplaint, setSelectedComplaint, setCurrentView } = useCivic();

  const [selectedCase, setSelectedCase] = useState<CivicComplaint | null>(null);
  const [directiveText, setDirectiveText] = useState('');
  const [reassignedOfficerName, setReassignedOfficerName] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const validComplaints = complaints.filter(c => !c.isDraft);

  // Key metrics required by Section 15
  const overdueIssues = validComplaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated');
  const highPriorityOverdue = overdueIssues.filter(c => c.priority === 'HIGH');
  const escalatedCases = validComplaints.filter(c => c.escalation?.isEscalated);

  // Department-wise pending summary
  const deptCounts: Record<string, { total: number; overdue: number }> = {};
  validComplaints.forEach(c => {
    if (!deptCounts[c.department]) {
      deptCounts[c.department] = { total: 0, overdue: 0 };
    }
    deptCounts[c.department].total += 1;
    if (c.status === 'Overdue' || c.status === 'Escalated') {
      deptCounts[c.department].overdue += 1;
    }
  });

  const handleIssueExecutiveDirective = (c: CivicComplaint) => {
    setSelectedCase(c);
    setDirectiveText(
      `Executive Directive: Immediate 24-hr emergency mobilization ordered under supervision of Superintending Engineer. Contractor penalty applicable for delayed execution.`
    );
    setReassignedOfficerName(c.officerName);
  };

  const handleExecuteAction = (actionType: 'directive' | 'reassign' | 'further') => {
    if (!selectedCase) return;

    let finalDirective = directiveText;
    if (actionType === 'reassign') {
      finalDirective = `Officer Reassigned to: ${reassignedOfficerName}. Work must be completed on war-footing within 24 hours.`;
    } else if (actionType === 'further') {
      finalDirective = `Escalated to State Municipal Administration Directorate & Vigilance Commissioner for formal disciplinary audit.`;
    }

    escalateComplaint(selectedCase.id, finalDirective, reassignedOfficerName);
    setActionSuccessMessage(`Executive Action executed for ${selectedCase.id}: ${finalDirective}`);
    setSelectedCase(null);

    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#000080] text-white p-4 rounded-2xl shadow-md border-b-2 border-[#FF9933] relative overflow-hidden">
        {/* Subtle Indian Tricolour accent bar */}
        <div className="h-1 w-20 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-1.5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-inner">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                Higher Authority Escalation Desk
              </h1>
              <p className="text-[11px] text-blue-100">
                Joint Municipal Commissioner & District Grievance Vigilance Cell
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#FF9933]/25 text-[#FFD4A8] px-2 py-0.5 rounded-full border border-[#FF9933]/40">
            Accountability Tier-2
          </span>
        </div>

        <div className="mt-3 p-2 bg-white/10 rounded-xl text-[11px] text-slate-100 leading-relaxed border border-white/10">
          <strong>Institutional Governance Mandate:</strong> SARVAYA monitors public grievance SLAs. When deadlines are breached, issues surface here for executive directives, reassignment, or vigilance escalation.
        </div>
      </div>

      {/* Resolution Trends & Statistics Direct Link */}
      <div
        onClick={() => setCurrentView('authority')}
        className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#000080] dark:hover:border-blue-500 shadow-2xs transition group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#000080] text-white flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp size={16} className="text-[#FF9933]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#000080] dark:text-blue-300">
                City-Wide Resolution Trends &amp; Recharts Analytics
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#138808]/15 text-[#138808] dark:text-emerald-400">
                Live Data
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inspect velocity curves, SLA compliance ratios, and departmental intake on Authority Desk
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#000080] dark:text-blue-300 group-hover:translate-x-0.5 transition-transform" />
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-[#EDF8ED] border border-[#A6DDA6] rounded-xl text-xs text-[#138808] font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-[#138808] shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* 5 KEY STATS (Required by Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-[#D64545] dark:text-red-400 block">
            Overdue Issues
          </span>
          <span className="text-xl font-black text-[#D64545] dark:text-red-400">{overdueIssues.length}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">SLA window crossed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-red-300 dark:border-red-800/70 shadow-xs bg-red-50/30 dark:bg-red-950/20">
          <span className="text-[10px] font-extrabold uppercase text-[#D64545] dark:text-red-400 block">
            High Priority Overdue
          </span>
          <span className="text-xl font-black text-[#D64545] dark:text-red-400">{highPriorityOverdue.length}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Critical hazard risk</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block">
            Escalated Cases
          </span>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{escalatedCases.length}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Under executive docket</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-[#b97816] dark:text-amber-400 block">
            Recurring Hotspots
          </span>
          <span className="text-xl font-black text-[#b97816] dark:text-amber-400">{hotspots.length}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Multi-complaint zones</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase text-[#0878C9] dark:text-blue-400 block">
            Department Jurisdictions
          </span>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{Object.keys(deptCounts).length}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Monitored divisions</span>
        </div>
      </div>

      {/* DEPARTMENT-WISE PENDING BREAKDOWN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Plus_Jakarta_Sans']">
          Department-Wise Pending Issues & Overdue Breaches
        </h3>

        <div className="space-y-1.5 text-xs">
          {Object.entries(deptCounts).map(([dept, data]) => (
            <div
              key={dept}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{dept}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total Active Cases: <strong>{data.total}</strong>
                </span>
              </div>

              <div className="text-right">
                {data.overdue > 0 ? (
                  <span className="text-[11px] font-bold text-[#D64545] dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle size={11} />
                    {data.overdue} Overdue
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#2E9B63] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    SLA Compliant
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESCALATED ISSUES AUDIT & ACTIONS (Required by Section 15) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D64545] dark:text-red-400 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <ShieldAlert size={15} />
            <span>Escalated & Overdue Case Files ({overdueIssues.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Executive Authority Actions</span>
        </div>

        {overdueIssues.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            No issues currently overdue or escalated. All municipal teams are within SLA.
          </div>
        ) : (
          overdueIssues.map(issue => (
            <div
              key={issue.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border-2 border-red-200 dark:border-red-900/60 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#D64545] dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                      {issue.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      {issue.category}
                    </span>
                    <span className="text-[9px] font-extrabold bg-[#D64545] text-white px-1.5 py-0.2 rounded-full">
                      {issue.priority} PRIORITY
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {issue.title}
                  </h4>
                </div>

                <span className="text-xs font-extrabold bg-red-100 dark:bg-red-950/60 text-[#D64545] dark:text-red-400 px-2 py-1 rounded-xl shrink-0 animate-pulse">
                  {issue.status}
                </span>
              </div>

              {/* Detail fields required by Section 15 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                    Responsible Department:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{issue.department}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                    Original Officer:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {issue.escalation?.originalOfficer || issue.officerName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                    Committed Timeline / SLA:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {issue.slaDays * 24} Hours (Target: {issue.targetResolutionDate})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#D64545] dark:text-red-400 uppercase block">
                    Overdue Duration:
                  </span>
                  <span className="font-bold text-[#D64545] dark:text-red-400">
                    {issue.escalation?.overdueDuration || 'Overdue past standard SLA'}
                  </span>
                </div>

                <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                    Reason / Overdue Status:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {issue.escalation?.reason ||
                      'Standard resolution timeline exceeded without completed field work.'}
                  </span>
                </div>

                {issue.escalation?.directiveIssued && (
                  <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span className="text-[10px] font-bold text-[#12304A] dark:text-blue-300 uppercase block">
                      Active Higher Authority Directive:
                    </span>
                    <p className="italic text-slate-900 dark:text-slate-100 font-medium bg-red-50 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-900/60 mt-0.5">
                      "{issue.escalation.directiveIssued}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons required by Section 15 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setSelectedComplaint(issue);
                    setCurrentView('complaint-detail');
                  }}
                  className="text-xs font-bold text-[#0878C9] dark:text-blue-400 hover:underline"
                >
                  Review Case History
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleIssueExecutiveDirective(issue)}
                    className="px-2.5 py-1.5 bg-[#D64545] hover:bg-[#b83838] text-white rounded-xl font-bold text-xs shadow-xs transition"
                  >
                    Take Action / Issue Directive
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EXECUTIVE DIRECTIVE MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 animate-scaleUp border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-[#D64545] dark:text-red-400 font-bold">
                {selectedCase.id}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                Higher Authority Intervention
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCase.title}</p>
            </div>

            {/* Directive Text */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Executive Directive:
              </label>
              <textarea
                rows={3}
                value={directiveText}
                onChange={e => setDirectiveText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#D64545]"
              />
            </div>

            {/* Reassign Officer */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Reassign Officer (Optional):
              </label>
              <input
                type="text"
                value={reassignedOfficerName}
                onChange={e => setReassignedOfficerName(e.target.value)}
                placeholder="e.g. Superintending Engineer V. Reddy"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#D64545]"
              />
            </div>

            {/* Actions required by Section 15 */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleExecuteAction('directive')}
                className="w-full py-2.5 bg-[#D64545] hover:bg-[#b83838] text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                1. Issue Binding Directive
              </button>

              <button
                onClick={() => handleExecuteAction('reassign')}
                className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition"
              >
                2. Reassign to Special Task Force
              </button>

              <button
                onClick={() => handleExecuteAction('further')}
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition"
              >
                3. Escalate Further to State Vigilance
              </button>

              <button
                onClick={() => setSelectedCase(null)}
                className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
