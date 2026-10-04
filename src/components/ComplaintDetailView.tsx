import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Flame,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { TimelineEvent } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';

export const ComplaintDetailView: React.FC = () => {
  const {
    selectedComplaint,
    setCurrentView,
    verifyComplaint,
    updateComplaintStatus,
    escalateComplaint,
    isOnline,
    syncOfflineQueue,
    isSyncing,
  } = useCivic();

  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyChoice, setVerifyChoice] = useState<'yes' | 'no' | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showDemoControls, setShowDemoControls] = useState(false);
  const [escalationDirective, setEscalationDirective] = useState(
    'Directing immediate emergency deployment of specialized suction pumps and issue of show-cause notice within 24 hours.'
  );

  if (!selectedComplaint) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <p className="text-xs text-slate-500">No complaint selected.</p>
        <button
          onClick={() => setCurrentView('my-complaints')}
          className="text-xs font-bold bg-[#0878C9] text-white px-4 py-2 rounded-xl"
        >
          View All Complaints
        </button>
      </div>
    );
  }

  const c = selectedComplaint;

  const handleConfirmVerifyYes = () => {
    verifyComplaint(c.id, true, verifyFeedback || 'Citizen inspected and confirmed problem resolved satisfactorily.');
    setShowVerifyModal(false);
    setVerifyChoice(null);
  };

  const handleConfirmVerifyNo = () => {
    verifyComplaint(c.id, false, reopenReasonText || 'Citizen inspected and flagged that the civic problem is still active on-ground.');
    setShowVerifyModal(false);
    setVerifyChoice(null);
  };

  const handleSimulateOverdue = () => {
    updateComplaintStatus(c.id, 'Overdue', 'Department breached committed SLA resolution window.');
  };

  const handleSimulateResolved = () => {
    updateComplaintStatus(c.id, 'Resolved', 'Field team reported repairs complete. Dispatched for Citizen Verification.');
  };

  const handleTriggerEscalation = () => {
    escalateComplaint(c.id, escalationDirective);
    setShowEscalationModal(false);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('my-complaints')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        <span className="font-mono text-xs font-bold text-[#000080] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
          {c.id}
        </span>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {c.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  c.priority === 'HIGH'
                    ? 'bg-red-50 dark:bg-red-950/60 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60'
                    : c.priority === 'MEDIUM'
                    ? 'bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60'
                    : 'bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60'
                }`}
              >
                {c.priority} Priority
              </span>
            </div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans'] leading-tight">
              {c.title}
            </h1>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-xl block ${
                c.status === 'Pending Offline Sync'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                  : c.status === 'Resolved'
                  ? 'bg-[#EDF8ED] dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60'
                  : c.status === 'Closed'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : c.status === 'Overdue' || c.status === 'Escalated'
                  ? 'bg-red-50 dark:bg-red-950/70 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60'
                  : c.status === 'Reopened'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                  : 'bg-[#EBF0FA] dark:bg-blue-950/60 text-[#000080] dark:text-blue-300 border border-[#B3C6EB] dark:border-blue-900/60'
              }`}
            >
              {c.status}
            </span>
          </div>
        </div>

        {/* Offline Outbox Notice for this complaint */}
        {c.status === 'Pending Offline Sync' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  Captured Offline (Queued in Local Storage)
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  {isOnline
                    ? 'Internet connection restored! Ready to upload to Municipal Hub.'
                    : 'Media & geotag are securely stored in IndexedDB. Will auto-sync when online.'}
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

        {/* Media / Photo Preview */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
          <img src={c.photoUrl} alt={c.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-2xs">
            <MapPin size={11} className="text-[#138808]" />
            <span>{c.location.address}, {c.location.city || 'Vizianagaram'}</span>
          </div>
        </div>

        {/* Audio Note Transcript if available */}
        {c.audioNote && (
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/70 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <Volume2 size={16} className="text-[#0B5ED7] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[10px] uppercase text-[#0B5ED7] dark:text-blue-400 block">
                Citizen Audio Note ({c.audioNote.duration})
              </span>
              <p className="italic text-slate-700 dark:text-slate-300 mt-0.5">"{c.audioNote.transcript}"</p>
            </div>
          </div>
        )}

        {/* Description & Impact */}
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-1">
          <h4 className="font-bold uppercase text-[10px] tracking-wider text-slate-400 dark:text-slate-500">
            Citizen Grievance Description:
          </h4>
          <p className="leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {c.description}
          </p>
        </div>

        {/* Location & Department Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-[#000080] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                Location
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{c.location.address}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {c.location.landmark} ({c.location.ward}), Vizianagaram
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building size={14} className="text-[#000080] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                Department & Officer
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{c.department}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {c.officerName} ({c.officerContact})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLAINABLE SMARTPRIORITY ANALYSIS MODULE */}
      <SmartPriorityAnalysisCard complaint={c} defaultExpanded={true} />

      {/* SECTION 12: CITIZENVERIFY ACTION CARD */}
      {c.status === 'Resolved' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border-2 border-[#138808] dark:border-emerald-600 shadow-xs space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#138808] dark:text-emerald-400 block">
              Citizen Verification Required
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
              Has this problem actually been resolved?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              The municipal authority has marked this issue as resolved. Please verify the actual location before ticket closure:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setVerifyChoice('yes');
                setShowVerifyModal(true);
              }}
              className="py-2.5 px-3 bg-[#138808] hover:bg-[#0f6b06] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span>YES — Close Complaint</span>
            </button>

            <button
              onClick={() => {
                setVerifyChoice('no');
                setShowVerifyModal(true);
              }}
              className="py-2.5 px-3 bg-[#D32F2F] hover:bg-[#b71c1c] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <X size={16} />
              <span>NO — Reopen Complaint</span>
            </button>
          </div>
        </div>
      )}

      {/* ESCALATION STATUS CARD (When Overdue or Escalated) */}
      {(c.status === 'Overdue' || c.status === 'Escalated') && (
        <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-300 dark:border-red-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-[#D32F2F]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-red-950 dark:text-red-300">
                SLA Overdue — Escalated to Higher Authority
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-[#D32F2F] text-white px-2 py-0.5 rounded">
              OVERDUE
            </span>
          </div>

          <div className="text-xs text-red-950 dark:text-red-200 space-y-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Original Officer:</span>
              <strong className="text-slate-800 dark:text-slate-200">{c.officerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Department:</span>
              <strong className="text-slate-800 dark:text-slate-200">{c.department}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Committed SLA:</span>
              <strong className="text-[#D32F2F] dark:text-red-400">{c.slaDays * 24} Hours (Exceeded)</strong>
            </div>
            {c.escalation?.directiveIssued && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="font-bold text-[#000080] dark:text-blue-300 block text-[11px]">
                  Executive Directive by {c.escalation.higherAuthorityName}:
                </span>
                <p className="italic text-slate-800 dark:text-slate-200 bg-red-50 dark:bg-red-950/40 p-2 rounded mt-1 border border-red-100 dark:border-red-900/40">
                  "{c.escalation.directiveIssued}"
                </p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
            * SARVAYA provides monitoring, visibility and an escalation/accountability trail to ensure timely municipal redressal.
          </p>
        </div>
      )}

      {/* CIVIC HOTSPOT & ROOT CAUSE INSIGHT */}
      {c.possibleRootCause && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-300 dark:border-amber-800/60 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-[#b97816] dark:text-[#FF9933]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-950 dark:text-amber-300 font-['Plus_Jakarta_Sans']">
              Civic Hotspot &amp; Root Cause Insight
            </h3>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
            {c.possibleRootCause}
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
            * Suggested as a Possible Root Cause to help field engineers diagnose connected local defects.
          </p>
        </div>
      )}

      {/* SECTION 9: COMPLAINT PROGRESS TIMELINE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-['Plus_Jakarta_Sans']">
              Complaint Progress Timeline
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Clear accountability trail from citizen report to verification
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
            {c.timelineEvents.length} Steps
          </span>
        </div>

        {/* Visual Progress Steps */}
        <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {c.timelineEvents.map((evt, idx) => (
            <div key={evt.id || idx} className="relative">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                  evt.state === 'completed'
                    ? 'bg-[#138808] text-white'
                    : evt.state === 'current'
                    ? 'bg-[#000080] dark:bg-blue-500 text-white animate-pulse'
                    : evt.state === 'overdue' || evt.state === 'escalated'
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {evt.state === 'completed' ? (
                  <Check size={11} className="stroke-[3]" />
                ) : evt.state === 'overdue' || evt.state === 'escalated' ? (
                  <AlertTriangle size={10} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {evt.step}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{evt.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{evt.title}</h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  By: <strong className="text-slate-700 dark:text-slate-300">{evt.actor}</strong>
                </div>
                {evt.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 leading-relaxed">
                    {evt.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 13: DEMO CONTROLS - Collapsed into a private developer drawer */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 text-xs">
        <button
          type="button"
          onClick={() => setShowDemoControls(!showDemoControls)}
          className="w-full px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sliders size={12} />
            <span>Prototype Testing Controls (Admin)</span>
          </span>
          {showDemoControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDemoControls && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 animate-fadeIn">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Simulate lifecycle states for innovation presentation:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {c.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={handleSimulateResolved}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-left"
                >
                  Simulate "Marked Resolved"
                  <span className="block text-[10px] text-slate-400 font-normal">Triggers CitizenVerify</span>
                </button>
              )}

              {c.status !== 'Overdue' && c.status !== 'Escalated' && (
                <button
                  type="button"
                  onClick={handleSimulateOverdue}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-[#D32F2F] dark:text-red-400 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-left"
                >
                  Simulate "SLA Overdue"
                  <span className="block text-[10px] text-slate-400 font-normal">Triggers Escalation</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CITIZEN VERIFY MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 animate-scaleUp border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                verifyChoice === 'yes' ? 'bg-emerald-100 dark:bg-emerald-950 text-[#138808] dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-[#D32F2F] dark:text-red-400'
              }`}
            >
              {verifyChoice === 'yes' ? <CheckCircle2 size={24} /> : <RotateCcw size={24} />}
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                {verifyChoice === 'yes' ? 'Close Complaint' : 'Reopen Complaint'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {verifyChoice === 'yes'
                  ? 'Confirm that the civic problem has been satisfactorily resolved on-ground.'
                  : 'Specify why this problem is still not resolved so field officers can be re-dispatched.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {verifyChoice === 'yes' ? 'Citizen Feedback (Optional):' : 'Reason for Reopening:'}
              </span>
              <textarea
                rows={3}
                value={verifyChoice === 'yes' ? verifyFeedback : reopenReasonText}
                onChange={e =>
                  verifyChoice === 'yes'
                    ? setVerifyFeedback(e.target.value)
                    : setReopenReasonText(e.target.value)
                }
                placeholder={
                  verifyChoice === 'yes'
                    ? 'e.g. Cleaned properly and drain is flowing freely now.'
                    : 'e.g. Silt still blocking drain entrance; water has not receded.'
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyChoice === 'yes' ? handleConfirmVerifyYes : handleConfirmVerifyNo}
                className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl ${
                  verifyChoice === 'yes'
                    ? 'bg-[#138808] hover:bg-[#0f6b06]'
                    : 'bg-[#D32F2F] hover:bg-[#b71c1c]'
                }`}
              >
                {verifyChoice === 'yes' ? 'Confirm & Close' : 'Reopen Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
