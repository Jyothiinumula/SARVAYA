import React from 'react';
import {
  X,
  HelpCircle,
  Camera,
  BookmarkCheck,
  Search,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpAndHowToUseModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="p-4 bg-[#000080] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Subtle Indian Tricolour top line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <HelpCircle size={18} className="text-[#FF9933]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-['Plus_Jakarta_Sans']">
                Help &amp; How to Use SARVAYA
              </h3>
              <p className="text-[11px] text-blue-100">
                Citizen Guide to Civic Grievance &amp; Accountability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-200">
          {/* Section 1: How to report a problem */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#0B5ED7] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Camera size={14} />
              </div>
              <span>1. How to Report a Problem</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Tap the large blue <strong>Report a Civic Issue</strong> button. You can choose to:
              take a photo directly with your camera, save it for later, or choose an existing photo from your phone's gallery. Add a short description, confirm the locality, and tap Submit.
            </p>
          </div>

          {/* Section 2: How Capture Now, Submit Later works with Saffron accent */}
          <div className="bg-orange-50/70 dark:bg-orange-950/30 p-3.5 rounded-2xl border border-orange-200 dark:border-orange-900/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-orange-950 dark:text-orange-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-[#E65100] dark:text-orange-400 flex items-center justify-center shrink-0">
                <BookmarkCheck size={14} />
              </div>
              <span>2. How "Capture Now, Submit Later" Works</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              If you see a pothole or overflow while commuting and don't have time to write details immediately, select <strong>Capture Now, Submit Later</strong>. Your photo and GPS location will be safely saved in <strong>Saved Reports</strong>. You can open it later at home, add description or voice notes, and submit.
            </p>
          </div>

          {/* Section 3: How to check complaint status */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#0A3A6B] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Search size={14} />
              </div>
              <span>3. How to Check Complaint Status</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Go to <strong>My Complaints</strong> from the bottom bar. Every complaint shows its assigned department, designated field officer, and department-defined resolution deadline (SLA). Tap any complaint card to view its complete progress timeline.
            </p>
          </div>

          {/* Section 4: How escalation works */}
          <div className="bg-red-50/70 dark:bg-red-950/30 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-950 dark:text-red-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/80 text-[#D32F2F] dark:text-red-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={14} />
              </div>
              <span>4. How Escalation Works</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Every department has a specific resolution timeline (e.g. 24 hours for water supply leakage, 48 hours for road repairs). If an officer fails to resolve the issue within the allotted time, SARVAYA automatically marks the ticket as <strong>OVERDUE</strong> and escalates it to the <strong>Municipal Commissioner &amp; Higher Authority Grievance Cell</strong> for review and binding directives.
            </p>
          </div>

          {/* Section 5: How Citizen Verification works */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#138808] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <span>5. How Citizen Verification (CitizenVerify) Works</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              When an authority marks a problem as resolved, SARVAYA does <strong>NOT</strong> automatically close it. You, the citizen, must inspect the location and confirm:
              <br />
              • <strong>YES — Close Complaint</strong> if the work is completed satisfactorily.
              <br />
              • <strong>NO — Reopen Complaint</strong> if the problem is still not resolved on-ground.
            </p>
          </div>

          {/* Section 6: Simple explanation of SARVAYA intelligence process */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#071E3D] dark:text-blue-200 text-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#0B5ED7] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Cpu size={14} />
              </div>
              <span>6. The SARVAYA Intelligence Process</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              SARVAYA organizes unstructured citizen reports into structured civic complaints, evaluates priority based on public health and safety impact, identifies geographic <strong>Civic Hotspots</strong> where multiple citizens report connected problems (e.g. waterlogging + blocked drain), suggests possible root causes, and routes them to the right municipal division.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0B5ED7] hover:bg-[#094bb0] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
