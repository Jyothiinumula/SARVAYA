import React from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Sparkles,
  Award,
  Zap,
  Leaf,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const FutureScopeView: React.FC = () => {
  const { setCurrentView } = useCivic();

  const futureModules = [
    {
      title: 'Verified Green Challenges',
      desc: 'Participate in neighborhood cleanups, rainwater pit audits, and tree stewardship drives verified by community ward captains.',
      icon: <Leaf className="text-[#138808]" size={20} />,
      status: 'In Research & Architecture',
    },
    {
      title: 'Civic Green Points & Streaks',
      desc: 'Earn civic reputation tokens for truthful reporting, participating in CitizenVerify, and maintaining consecutive weekly public service streaks.',
      icon: <Zap className="text-[#FF9933]" size={20} />,
      status: 'Planned for Phase 2',
    },
    {
      title: 'Civic Badges & Credentials',
      desc: 'Unlock verifiable digital badges: "Water Guardian", "Clean Ward Sentinel", "Neighborhood First Responder".',
      icon: <Award className="text-[#000080]" size={20} />,
      status: 'Specification Ready',
    },
    {
      title: 'Community Participation & Events',
      desc: 'Organize volunteer park restoration, weekend desilting awareness, and local ward council townhalls.',
      icon: <Users className="text-[#138808]" size={20} />,
      status: 'Community Prototype',
    },
    {
      title: 'Sustainable Action & Impact Tracking',
      desc: 'Calculate tons of diverted waste, liters of saved potable water, and reduction in road hazard response times.',
      icon: <Compass className="text-[#000080]" size={20} />,
      status: 'Metrics Framework',
    },
    {
      title: 'Community Leaderboards',
      desc: 'Ward-level sustainability rankings encouraging friendly civic pride without trivializing genuine municipal grievances.',
      icon: <Trophy className="text-[#E68A00]" size={20} />,
      status: 'Governance Policy Draft',
    },
  ];

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Banner - Prominent India Green and Ashoka Chakra Blue */}
      <div className="bg-gradient-to-br from-[#000080] via-[#0D5C05] to-[#138808] text-white p-5 rounded-3xl shadow-lg border border-white/20 space-y-3 relative overflow-hidden">
        {/* Subtle Indian Tricolour top line */}
        <div className="h-1 w-24 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#FFD4A8] text-xs font-bold backdrop-blur-xs border border-white/20">
          <Sparkles size={14} className="text-[#FF9933]" />
          <span>ROADMAP &amp; FUTURE HORIZONS</span>
        </div>

        <h1 className="text-lg sm:text-xl font-black font-['Plus_Jakarta_Sans'] leading-tight">
          Citizen Sustainability &amp; Gamification Layer
        </h1>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-xs text-slate-100 italic leading-relaxed">
          Future Vision:
          <span className="block font-bold text-white text-sm not-italic mt-0.5">
            “From reporting civic problems to building active and sustainable communities.”
          </span>
        </div>

        <p className="text-xs text-blue-100 leading-relaxed">
          * As specified in SARVAYA Product Architecture: Gamification and social rewards are strictly reserved for future phases. The current core release focuses purely on <strong>Civic Reporting + Intelligence + Accountability</strong>.
        </p>
      </div>

      {/* Future Scope Features Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#138808]" />
            Phase 2 Innovation Modules (Future Scope)
          </h2>
          <span className="text-[10px] font-bold text-[#138808] dark:text-emerald-400 bg-[#EDF8ED] dark:bg-emerald-950/60 border border-[#A6DDA6] dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
            Under Concept Design
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {futureModules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#138808] dark:hover:border-emerald-500 transition space-y-2 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EDF8ED] dark:bg-emerald-950/60 border border-[#A6DDA6]/50 dark:border-emerald-800/60 flex items-center justify-center">
                  {mod.icon}
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <Lock size={9} />
                  {mod.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#000080] dark:text-blue-300 leading-snug">{mod.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Return to Core Feature CTA */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-xs">
        <h4 className="text-xs font-bold text-[#000080] dark:text-blue-300">
          Ready to experience current civic intelligence?
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Test the live civic intelligence pipeline from CivicCapture to CitizenVerify.
        </p>
        <button
          onClick={() => setCurrentView('pipeline-demo')}
          className="px-4 py-2.5 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl shadow-xs transition border-2 border-[#FF9933]"
        >
          Open Intelligence Pipeline Walkthrough
        </button>
      </div>
    </div>
  );
};
